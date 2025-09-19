import { h, render, type ComponentChild, type ComponentChildren, type ComponentProps } from 'preact';
import { E, FIELD_TYPE, type NODE_ID } from '../../../types/generated';
import { globals } from '../../../types/globals';
import { NodeAdmin } from './admin/admin-control';
import { FieldAdmin } from './admin/field-admin';
import { assert, throwError } from './assert';
import type BaseField from './base-field';
import type { BaseFieldProps } from './base-field';
import { normalizeCSSName, PRIVILEGES_MASK, STATUS, VIEW_MASK, type FormControlFilters, type FormFilters, type GetRecordsFilter, type LookupValue, type RecId, type RecordData, type RecordDataWriteDraftable, type RecordsData, type RecordsDataOrdered, type RecordSubmitResult, type RecordSubmitResultNewRecord } from './bs-utils';
import { HotkeyButton } from './components/hotkey-button';
import { Select } from './components/select';
import { NEW_RECORD, SAVE_REJECTED } from './consts';
import { clientHandlers, type Handler } from './events-handle';

import type BaseLookupField from './fields/base-lookup-field';
import FormNode, { type FormNodeProps, type FormNodeState } from './form-node';

import { type TabFieldProps } from './form-tab';
import { LeftBar } from './left-bar';
import { LoadingIndicator } from './loading-indicator';
import { R } from './r';
import { renderItemsButtons } from './render-items-buttons';
import { iAdmin, User } from './user';
import { CLIENT_SIDE_FORM_EVENTS, deleteRecordClient, getClassForField, getData, getItem, getListRenderer, getNodeIfPresentOnClient, getRecordsClient, goBack, isAutoFocus, isPresentListRenderer, isRecordRestrictedForDeletion, L, n2mValuesEqual, removeItem, renderIcon, setItem, showPrompt, sp, submitRecord, UID, updateHashLocation } from './utils';

export interface FormProps extends FormNodeProps {
	nodeId: NODE_ID;
	recId?: RecId | typeof NEW_RECORD;
	formData?: RecordData;
	listData?: RecordsData;
	isLookup?: boolean;
	isCompact?: boolean;
	isRootForm?: boolean;
	isPreventCloseFormAfterSave?: boolean;
	hideSearch?: boolean;
	preventDeleteButton?: boolean;
	hideControls?: boolean;
	viewMask?: VIEW_MASK;
	inlineEditable?: boolean;
	askToSaveParentBeforeCreation?: boolean;
	editable?: boolean;
	filters: FormFilters;
	onDelete?: () => void;
	overrideOrderData?: number;
	isListItemView?: boolean;
}

export interface FormState extends FormNodeState {
	header?: ComponentChild;
	hideControls?: ComponentChild;
	hideSearch?: boolean;
	isCancelButtonHidden?: boolean;
	footerHidden?: boolean;
}

export default class Form<
	FieldsNames extends string = string,
	T1 extends FormProps = FormProps,
	T2 extends FormState = FormState>
	extends FormNode<T1, T2> {

	formFilters!: FormFilters;
	private disabledFields = {} as { [key: string]: boolean };
	private hiddenFields = {} as { [key: string]: boolean };
	formData?: RecordData & { [key in FieldsNames]: any };
	savedFormData?: RecordData & { [key in FieldsNames]: any };
	listData?: RecordsData;
	isPreventCloseFormAfterSave? = false;
	nodeDesc!: NodeDesc;

	viewMask!: VIEW_MASK;

	get nodeId() {
		return this.nodeDesc.id;
	}

	get isList() {
		return !this.formData;
	}

	private fieldsByName = {} as KeyedMap<BaseField>;
	private allFields: BaseField[] = [];

	private className!: string;

	recId: RecId | typeof NEW_RECORD | undefined;

	isDataModified = false;

	/// #if DEBUG
	_isUnmounted = false;
	/// #endif

	constructor(props: FormProps) {
		super(props as any);
		this.isPreventCloseFormAfterSave = props.isPreventCloseFormAfterSave;
		this.recId = this.props.formData?.id || props.recId;

		this.formData = props.formData as any;
		this.listData = props.listData;

		this.formFilters = props.filters;

		this.applyNodeDesc(getNodeIfPresentOnClient(props.nodeId!));

		this.viewMask = props.viewMask || (props.editable ? VIEW_MASK.EDITABLE : ((this.isList || props.isListItemView) ? VIEW_MASK.LIST : VIEW_MASK.READONLY));
		if (!props.parentForm) {
			this.recoveryBackupIfNeed();
		}
		if (!this.formData && this.recId === NEW_RECORD) {
			this.formData = {} as any;
		}

		this.savedFormData = this.formData && JSON.parse(JSON.stringify(this.formData));

		this.cancelClick = this.cancelClick.bind(this);
		this.saveClick = this.saveClick.bind(this);
	}

	private applyNodeDesc(nodeDesc?: NodeDesc) {
		if (nodeDesc) {
			this.nodeDesc = nodeDesc;
			/// #if DEBUG
			// @ts-ignore
			this.___NODE = nodeDesc;

			/// #endif
			this.className = 'form form-full form-node-' + normalizeCSSName(nodeDesc.tableName!);
			if (this.props.overrideOrderData! >= 0) {
				this.hiddenFields['order'] = true;
			}
		}
	}

	backupInterval = 0;
	tryBackupData() {
		if (this.recId === NEW_RECORD && !this.isList && this.props.editable && !this.props.parentForm) {
			this.prepareToBackup();
			setItem(this._getBackupKey(), this.formData!);
		}
	}

	_getBackupKey() {
		return 'backup_for_node:' + User.currentUserData!.id + ':' + this.nodeDesc.id + ':' + Object.entries(this.props.filters!).sort(sortEntries).map(entryToKey).join();
	}

	private canProcessEvents() {
		return !this.isList && !this.props.isListItemView;
	}

	async onShow() {
		if (!this.formData && !this.listData) {
			setTimeout(() => {
				this.refreshData();
			}, 1);
			return;
		}
		if (this.canProcessEvents()) {
			await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_LOAD);
			for (const f of this.allFields) {
				if (
					f.props.fieldDesc!.fieldType !== FIELD_TYPE.BUTTON &&
					f.props.fieldDesc!.fieldType !== FIELD_TYPE.TAB
				) {
					await this.processFieldEvent(f.props.fieldDesc!, (this.fieldValue as any)(f.props.fieldDesc!.fieldName), false);
				}
			}
		}
	}

	componentDidMount() {
		this.onShow();
		window.addEventListener('unload', this.tryBackupData);
		this.backupInterval = window.setInterval(this.tryBackupData, 15000);
		if (this.props.isRootForm) {
			LeftBar.refreshLeftBarActive();
		}
	}

	recoveryBackupIfNeed() {
		if (this.recId === NEW_RECORD && this.isList) {
			const backup = getItem(this._getBackupKey());
			if (backup) {
				this.formData = Object.assign(backup, this.formFilters);
			}
		}
	}

	prepareToBackup() {
		this.forceBouncingTimeout();
	}

	deleteBackup() {
		removeItem(this._getBackupKey());
	}

	componentWillUnmount() {
		/// #if DEBUG
		this._isUnmounted = true;
		/// #endif
		window.removeEventListener('unload', this.tryBackupData);
		this.tryBackupData();
		clearInterval(this.backupInterval);
	}

	saveForm(): Promise<typeof SAVE_REJECTED | undefined> | undefined {
		if (this.props.editable) {
			return this.saveClick('keepStatus');
		}
	}

	getDataToSend(isDraft?: boolean | 'keepStatus') {
		const dataToSend: RecordDataWriteDraftable = {};
		if (isDraft !== 'keepStatus') {
			if ((this.formData as RecordData).isP || !(this.formData as RecordData).id) {
				if (isDraft === true) {
					if ((this.formData as RecordData).status !== STATUS.DRAFT) {
						dataToSend.status = STATUS.DRAFT;
					}
				} else {
					if ((this.formData as RecordData).status !== STATUS.PUBLIC) {
						dataToSend.status = STATUS.PUBLIC;
					}
				}
			}
		}
		for (const fieldRef of this.allFields) {
			const field = fieldRef.props.fieldDesc;

			const val = (this.formData as KeyedMap<any>)[field.fieldName];
			const savedVal = (this.savedFormData as KeyedMap<any>)[field.fieldName];

			if (field.sendToServer && this.isFieldVisibleByFormViewMask(field, VIEW_MASK.EDITABLE)) {
				if (field.fieldType === FIELD_TYPE.LOOKUP_N_TO_M) {
					if (!n2mValuesEqual(savedVal, val)) {
						(dataToSend as KeyedMap<any>)[field.fieldName] = (val as LookupValue[]).map(v => v.id);
					}
				} else if (field.fieldType === FIELD_TYPE.LOOKUP) {
					let cVal = val;
					let iVal = savedVal;

					if (typeof cVal?.id === 'number') {
						cVal = cVal.id;
					}

					if (typeof iVal?.id === 'number') {
						iVal = iVal.id;
					}

					if (cVal !== iVal) {
						(dataToSend as KeyedMap<any>)[field.fieldName] = val;
					}
				} else if (val && val._isAMomentObject) {
					if (!val.isSame(savedVal)) {
						(dataToSend as KeyedMap<any>)[field.fieldName] = val;
					}
				} else {
					if (savedVal != val) {
						(dataToSend as KeyedMap<any>)[field.fieldName] = val;
					}
				}
			}
		}
		return dataToSend;
	}

	async saveClick(isDraft?: boolean | 'keepStatus'): Promise<typeof SAVE_REJECTED | undefined> {
		LoadingIndicator.instance!.show();
		await this.forceBouncingTimeout();
		if (this.isAsyncInProgress()) {
			await this.waitForAsyncFinish();
		}
		await this.beforeSave();
		if (this.canProcessEvents()) {
			await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_SAVE);
		}
		if (this.isAsyncInProgress()) {
			await this.waitForAsyncFinish();
		}
		const ret = this.isValid();
		if (ret !== SAVE_REJECTED) {
			const dataToSend = this.getDataToSend(isDraft);
			if (Object.keys(dataToSend).length > 0) {
				const submitResult: RecordSubmitResult | RecordSubmitResultNewRecord = await submitRecord(this.nodeId, dataToSend, this.formData!.id);
				const recId: RecId | undefined = (submitResult as RecordSubmitResultNewRecord).recId;
				if (!recId) {
				// save error
					return;
				}
				this.isDataModified = false;
				this.recId = recId;
				if (!this.formData!.hasOwnProperty('id')) {
					this.formData!.id = recId;
				}
				this.deleteBackup();
				Object.assign(this.formData!, dataToSend);
				Object.assign(this.savedFormData!, dataToSend);

				await this.afterSave();

				if (this.canProcessEvents()) {
					await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_AFTER_SAVE, submitResult);
				}
			} else {

				await this.afterSave();

				this.isDataModified = false;
			}
			if (!this.isPreventCloseFormAfterSave) {
				if (this.props.parentForm) {
					(this.props.parent as BaseLookupField).valueSelected(this.formData, true);
				} else {
					this.cancelClick();
				}
			}
		}
		LoadingIndicator.instance!.hide();
		return ret;
	}

	/// #if DEBUG
	componentWillReceiveProps(props: FormProps): void {
		assert(props.nodeId === this.props.nodeId, 'Form can not change nodeId');
	}
	/// #endif

	isFieldVisibleByFormViewMask(field: FieldDesc, viewMask = this.viewMask) {
		return (field.show & viewMask);
	}

	_registerField(field: BaseField) {
		this.fieldsByName[field.props.fieldDesc.fieldName] = field;
		this.allFields.push(field);
	}

	render(): ComponentChildren {
		if (this.props.isListItemView) {
			return this.renderAsListItem();
		}
		let className = this.className;
		if (this.recId) {
			className += ' form-rec-' + this.recId;
		}
		if (this.props.isCompact) {
			className += ' form-compact';
		}
		if (this.formData) {
			return this.renderForm(className);
		} else if (this.listData) {
			return this.renderList(className);
		}
		return R.div({ className }, renderIcon('cog fa-spin'));

	}

	hasField(fieldName: FieldsNames) {
		return this.fieldsByName.hasOwnProperty(fieldName);
	}

	makeFieldRequired(fieldName: FieldsNames, required = true) {
		this.getField(fieldName).makeFieldRequired(required);
	}

	getField(fieldName: FieldsNames): BaseField {
		if (!this.hasField(fieldName)) {
			throwError('Unknown field: ' + fieldName);
		}
		return this.fieldsByName[fieldName];
	}

	fieldValue(fieldName: FieldsNames) {
		return (this.formData as KeyedMap<any>)[fieldName];
	};

	setFieldValue(fieldName: FieldsNames, val: any, isUserAction = false) {
		const f = this.getField(fieldName);
		assert(f, 'unmounted value debouncing?');
		const fieldDesc = f.props.fieldDesc;

		assert(this.formData, 'not proper form type (List?)');

		if ((this.formData as KeyedMap<any>)[fieldName] !== val) {
			if (!isUserAction) {
				f.setValue(val);
			}
			if (isUserAction) {
				this.invalidateData();
			}
			const prev_value = (this.formData as KeyedMap<any>)[fieldName];
			(this.formData as KeyedMap<any>)[fieldName as string] = val;

			this.processFieldEvent(fieldDesc, val, isUserAction, prev_value).then(() => {
				this.checkUniqueValue(fieldDesc, val);
			});
		}
	};

	fieldAlert(fieldName: FieldsNames, text: string = '', isSuccess?: boolean, focus: boolean = !isSuccess, source?: string) {
		assert(fieldName, 'fieldName expected');
		const f = this.getField(fieldName);

		if (typeof isSuccess === 'undefined') {
			isSuccess = !text;
		}
		f.alert(text, isSuccess, focus, source);
	}

	hideField(...fieldsNames: FieldsNames[]) {
		for (const fieldName of fieldsNames) {
			if (!this.hiddenFields[fieldName]) {
				this.hiddenFields[fieldName] = true;
				const f = this.getField(fieldName);
				if (f) {
					f.hide();
				}
				if (f.props.fieldDesc!.fieldType === FIELD_TYPE.TAB) {
					this.forceUpdate();
				}
			}
		}
	}

	showField(...fieldsNames: FieldsNames[]) {
		for (const fieldName of fieldsNames) {
			if (this.hiddenFields[fieldName]) {
				this.hiddenFields[fieldName] = false;
				const f = this.getField(fieldName);
				if (f) {
					f.show();
					if (f.props.fieldDesc!.fieldType === FIELD_TYPE.TAB) {
						this.forceUpdate();
					}
				}
			}
		}
	}

	disableField(fieldName: FieldsNames) {
		if (!this.disabledFields[fieldName]) {
			this.disabledFields[fieldName] = true;
			const f = this.getField(fieldName);
			f.disable();
		}
	}

	enableField(fieldName: FieldsNames) {
		if (this.disabledFields[fieldName]) {
			this.disabledFields[fieldName] = false;
			this.getField(fieldName).enable();
		}
	}

	addLookupFilters(fieldName: FieldsNames, filtersObjOrName: GetRecordsFilter): void;
	addLookupFilters(fieldName: FieldsNames, filtersObjOrName: string, val: any): void;
	addLookupFilters(fieldName: FieldsNames, filtersObjOrName: string | GetRecordsFilter, val?: any): void {
		(this.getField(fieldName) as BaseLookupField).setLookupFilter(filtersObjOrName, val);
	}

	isFieldVisible(fieldName: string) {
		return !this.hiddenFields[fieldName];
	}

	hideCancelButton() {
		this.setState({ isCancelButtonHidden: true });
	}

	hideFooter() {
		this.setState({ footerHidden: true });
	}

	showFooter() {
		this.setState({ footerHidden: false });
	}

	isFieldEmpty(fieldName: FieldsNames) {
		const v = this.fieldValue(fieldName);
		if (Array.isArray(v)) {
			return v.length === 0;
		}
		if (v) {
			return false;
		}
		return this.getField(fieldName).isEmpty();
	}

	private async checkUniqueValue(field: FieldDesc, val: any) {
		if (field.unique && val) {
			this.asyncOpsInProgress++;
			const data = await getData(
				'api/uniqueCheck',
				{
					fieldId: field.id,
					nodeId: field.node!.id,
					recId: this.recId !== NEW_RECORD && this.recId,
					val
				},
				undefined,
				true
			);
			if (!data) {
				this.fieldAlert(field.fieldName as FieldsNames, L('VALUE_EXISTS'), false, true);
				return false;
			} else {
				this.fieldAlert(field.fieldName as FieldsNames, undefined, true);
			}
			this.asyncOpsInProgress--;
		}
		return true;
	}

	_getFormEventHandler(eventName: CLIENT_SIDE_FORM_EVENTS) {
		const name = (E as KeyedMap<any>)[this.nodeDesc.tableName!][eventName];
		return this._getEventHandlers(name);
	}

	_getFieldEventHandlers(field: FieldDesc) {
		const name = (E as KeyedMap<any>)[this.nodeDesc.tableName!][field.fieldName][((field.fieldType === FIELD_TYPE.BUTTON || field.fieldType === FIELD_TYPE.TAB) ?
			CLIENT_SIDE_FORM_EVENTS.ON_FIELD_CLICK :
			CLIENT_SIDE_FORM_EVENTS.ON_FIELD_CHANGE)];
		return this._getEventHandlers(name);
	}

	_getEventHandlers(name: string): Handler[] | undefined {
		return clientHandlers.get(name);
	}

	processFieldEvent(field: FieldDesc, value: any, isUserAction?: boolean, prev_val?: any) {
		return this.processEvent(this._getFieldEventHandlers(field), value, isUserAction, prev_val);
	}

	processFormEvent(eventName: CLIENT_SIDE_FORM_EVENTS, ...args: any[]) {
		return this.processEvent(this._getFormEventHandler(eventName), ...args);
	}

	renderToField(fieldName: FieldsNames, containerClassName: string, reactContent: ComponentChild) {
		const el = this.getField(fieldName).getDomElement();
		let container = el.querySelector('.' + containerClassName);
		if (!container) {
			container = document.createElement('SPAN');
			container.className = containerClassName;
			el.appendChild(container);
		}
		render(reactContent, container);
	}

	isUpdateRecord = false;
	isNewRecord = false;

	async processEvent(handlers: Handler[] | undefined, ...args: any[]) {
		if (handlers) {
			for (const handler of handlers) {
				this.isUpdateRecord = !!this.props.editable;
				if (this.isUpdateRecord) {
					this.isNewRecord = this.recId === NEW_RECORD;
					if (this.isNewRecord) {
						this.isUpdateRecord = false;
					}
				}
				this.asyncOpsInProgress++;
				const ret = await handler(this, ...args);
				assert(!this._isUnmounted, 'Form unmounted before asyncFinish');
				this.asyncOpsInProgress--;
				if (ret) {
					return true; // break on first true event
				}
			}
		}
	}

	private renderList(className: string): ComponentChildren {
		if (this.props.editable) {
			return this.renderEditableList(className);
		} else {
			return this.renderReadOnlyList(className);
		}
	}

	getParentLookupField(): BaseLookupField | undefined {
		return (this.parentForm?.parent || this.parent) as BaseLookupField;
	}

	private isCustomListRendering() {
		return (
			!this.props.filters?.noCustomList &&
			!this.props.parent &&
			isPresentListRenderer(this.nodeId)
		);
	}

	setFormFilter(name: string, val: string) {
		if ((this.formFilters as KeyedMap<string>)[name] !== val) {
			(this.formFilters as KeyedMap<string>)[name] = val;
			this.forceUpdate();
			if (!this.parentForm) {
				updateHashLocation(true);
			}
			return true;
		}
	}

	async refreshData() {
		assert(this.isList, 'refreshData has sense for list form only.');
		if (!this.props.parent) {
			updateHashLocation();
		}

		if (this.props.editable) {
			this.formFilters.p = '*';
		}

		// TODO: Понять почему рефреш листа дает другой вьюмаск. this.state.viewMask отличается от того что в кастом вью
		const data = await getRecordsClient(
			this.props.nodeId || this.nodeId,
			undefined,
			this.formFilters,
			this.props.editable,
			this.viewMask,
			this.isCustomListRendering()
		);

		const sorting = data.items.length && data.items[0].hasOwnProperty('order');
		if (sorting) {
			data.items.sort(sortByOrder as any);
		}
		if (!this.nodeDesc) {
			this.applyNodeDesc(getNodeIfPresentOnClient(this.props.nodeId!));
		}

		this.listData = data;
		this.forceUpdate();
	}

	private searchTimeout = 0;

	clearSearch() {
		this.setSearchInputValue();
		if (this.changeFilter('s')) {
			if (this.formFilters.p !== '*') {
				this.changeFilter('p');
			}
			this.refreshData();
		}
	}

	clearSearchInterval() {
		if (this.searchTimeout) {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = 0;
		}
	}

	hideControls() {
		this.setState({ hideControls: true });
	}

	setSearchInputValue(v?: string) {
		if (this.searchInput) {
			if (!v) {
				v = '';
			}
			this.searchInput.value = v;
			this.clearSearchInterval();
		}
	}

	callOnTabShowEvent(_value: any) {
		debugger;
	}

	changeFilter(name: string, value?: any, refresh?: boolean) {
		if (name === 'tab') {
			this.callOnTabShowEvent(value);
		}

		const oldValue = (this.formFilters as KeyedMap<any>)[name];

		if (oldValue !== 0 && value !== 0) {
			if (!oldValue && !value) return;
		}

		if (oldValue !== value) {
			if (typeof value === 'undefined') {
				delete (this.formFilters as KeyedMap<any>)[name];
			} else {
				(this.formFilters as KeyedMap<any>)[name] = value;
			}
			if (refresh) {
				this.refreshData();
			}
			return true;
		}
		return false;
	}

	changeSearch(event: InputEvent) {
		const val = (event.target as HTMLInputElement).value;
		this.clearSearchInterval();
		this.searchTimeout = window.setTimeout(() => {
			this.searchTimeout = 0;
			if (this.changeFilter('s', val)) {
				if (this.formFilters.p !== '*') {
					this.changeFilter('p');
				}
				this.refreshData();
			}
		}, 500);
	}

	private searchInput!: HTMLInputElement;

	renderReadOnlyList(className: string) {
		const node = this.nodeDesc;
		const data = this.listData!;
		const filters = this.formFilters;
		let header;
		let createButton;

		if (
			node.privileges & PRIVILEGES_MASK.CREATE
		) {
			if (this.props.isLookup) {
				createButton = R.button(
					{
						className: 'clickable create-button',
						onClick: async () => {
							if (this.props.askToSaveParentBeforeCreation) {
								await this.getParentLookupField()!.saveParentFormBeforeCreation();
							}
							this.getParentLookupField()!.toggleCreateDialogue(NEW_RECORD);
						}
					},
					renderIcon('plus'),
					' ' + L('CREATE') + ' ' + (node.creationName || node.singleName)
				);
			} else {
				createButton = R.button(
					{
						className: 'clickable create-button',
						onClick: () => {
							globals.Stage.showForm(node.id, NEW_RECORD, filters, true);
						}
					},
					renderIcon('plus'),
					' ' + L('CREATE') + ' ' + (node.creationName || node.singleName)
				);
			}
		}

		let searchPanel;

		if (
			!this.props.hideSearch &&
			!this.state.hideSearch &&
			(filters.s || data.items.length > 2)
		) {
			searchPanel = R.div(
				{ className: 'list-search' },
				R.input({
					ref: (input: HTMLInputElement) => {
						this.searchInput = input;
					},
					autoFocus: isAutoFocus(),
					className: 'list-search-input',
					placeholder: L('SEARCH_LIST'),
					onInput: this.changeSearch,
					defaultValue: filters.s
				}),
				filters?.s ? R.a(
					{
						className: 'clickable tool-btn default-btn search-clear-btn',
						onClick: (e) => {
							this.clearSearch();
							sp(e);
						}
					},
					R.h2(null, '×')
				) : undefined
			);
		}

		let filtersPanel;
		if (node.filtersList && node.filtersList.length > 1) {
			const options = node.filtersList;
			filtersPanel = R.div(
				{
					className: 'filter-select'
				},
				h(Select, {
					options,
					defaultValue: node.defaultFilterId
						? node.filters![filters.filterId || node.defaultFilterId.id].name
						: undefined,
					onInput: (val) => {
						this.changeFilter('filterId', parseInt(val), true);
					}
				})
			);
		}

		if (createButton || searchPanel || filtersPanel) {
			header = R.div(
				{ className: 'list-header' },
				createButton || R.span(),
				R.div({ className: 'list-header-right-area' }, searchPanel, filtersPanel)
			);
		}

		let body;
		if (data.total > 0 || this.isCustomListRendering()) {
			if (this.isCustomListRendering()) {
				body = getListRenderer(node.id)(node, this.listData!.items, this.refreshData);
			}
			if (!body) {
				const tableHeader = [];
				node.fields!.forEach((field) => {
					/// #if DEBUG
					let fieldAdmin;
					if (iAdmin()) {
						fieldAdmin = h(FieldAdmin, { field, form: this });
					}
					/// #endif

					let rowHeader;
					if (field.forSearch === 1 && (data.total > 1 || filters.s)) {
						rowHeader = R.span(
							{
								className:
									(filters.o === field.id) ? 'clickable list-row-header-sorting' : 'clickable',
								onClick: () => {
									if (filters.o === field.id) {
										this.changeFilter('r', filters.r ? undefined : 1, true);
									} else {
										this.changeFilter('o', field.id, true);
									}
								}
							},
							renderIcon(field.icon),
							field.name,
							renderIcon(!filters.r && filters.o === field.id ? 'caret-up' : 'caret-down')
						);
					} else {
						rowHeader = R.span(null, renderIcon(field.icon), field.name);
					}

					if (this.isFieldVisibleByFormViewMask(field, this.props.viewMask || VIEW_MASK.LIST)) {
						tableHeader.push(
							R.td(
								{
									key: field.id,
									className:
										field.fieldType === FIELD_TYPE.NUMBER
											? 'list-row-header list-row-header-num'
											: 'list-row-header'
								},
								rowHeader,
								/// #if DEBUG
								fieldAdmin
								/// #endif
							)
						);
					}
				});
				tableHeader.push(R.td({ key: 'holder', className: 'list-row-header' }, ' '));

				const hideControls =
					this.props.hideControls ||
					this.state.hideControls;

				const lines = data.items.map((item) => {
					return h(Form, {
						nodeId: this.props.nodeId,
						parentForm: this,
						key: Math.random() + '_' + item.id,
						parent: this,
						viewMask: this.props.viewMask,
						filters: {},
						hideControls: hideControls,
						formData: item,
						isListItemView: true
					} as FormProps);
				});

				body = R.table(
					{ className: 'list-table' },
					R.thead(null, R.tr(null, tableHeader)),
					R.tbody({ className: 'list-body' }, lines)
				);
			}
		} else if (!this.getParentLookupField()) {
			let t1, t2;
			if (filters.s) {
				t1 = L('NO_RESULTS', filters.s);
				t2 = '';
			} else if (createButton) {
				t1 = L('PUSH_CREATE', node.creationName || node.singleName);
				t2 = L(this.props.isCompact ? 'TO_CONTINUE' : 'TO_START');
			} else {
				t1 = L('LIST_EMPTY');
			}

			let emptyIcon;
			if (node.icon) {
				emptyIcon = renderIcon(
					(node.icon || 'plus') + ((this.props.isCompact ? ' fa-3x' : ' fa-5x') + ' list-empty-icon')
				);
			}

			body = R.div({ className: 'list-empty' }, emptyIcon, R.div(null, t1), R.div(null, t2));
		}

		const pages = [];
		let recPerPage;
		if (this.formFilters?.n) {
			recPerPage = this.formFilters.n;
		}

		const totalPages = Math.ceil(data.total / (recPerPage || node.recPerPage!));
		const curPage = parseInt(filters.p as string) || 0;

		const pageNumbers = { 0: 1, 1: 1, 2: 1 } as KeyedMap<number>;

		let p;
		for (p = 0; p <= 2; p++) {
			pageNumbers[curPage + p] = 1;
			pageNumbers[curPage - p] = 1;
			pageNumbers[totalPages - 1 - p] = 1;
		}
		let prevP = -1;
		for (p in pageNumbers) {
			p = parseInt(p);
			if (p >= 0 && p < totalPages) {
				if (p - prevP !== 1) {
					pages.push(R.span({ key: 'dots' + p }, ' ... '));
				}
				prevP = p;
				pages.push(createPageButton(this, p, p === curPage));
			}
		}

		let paginator;
		if (pages.length > 1) {
			paginator = R.span({ className: 'list-paginator-items' }, pages);
		}

		let footer;
		let paginatorText = L('SHOWED_LIST', data.items.length).replace('%', data.total.toString());

		if (this.formFilters.s) {
			paginatorText += L('SEARCH_RESULTS', this.formFilters.s);
		}

		if (data.items.length > 0) {
			if (data.items.length < data.total) {
				footer = R.span({ className: 'list-paginator' }, paginatorText, paginator);
			} else {
				footer = R.span({ className: 'list-paginator' }, L('TOTAL_IN_LIST', data.items.length));
			}
		}
		/// #if DEBUG
		let nodeAdmin;
		if (iAdmin()) {
			nodeAdmin = h(NodeAdmin, { form: this });
		}
		/// #endif

		let title;
		if (!this.props.isCompact) {
			const header = this.state.header;
			if (header) {
				title = R.h4({ className: 'form-header' }, header);
			}
		}

		return R.div(
			{ className: className + ' list-container' },
			/// #if DEBUG
			nodeAdmin,
			/// #endif
			title,
			header,
			footer,
			body,
			data.items.length > 5 ? footer : undefined
		);
	}

	renderEditableList(className: string) {
		const swapItems = (itemNum: number, prevItemNum: number) => {
			(this.children[itemNum] as Form).setFieldValue('order', prevItemNum);
			(data.items[itemNum] as KeyedMap<any>).order = prevItemNum;
			(this.children[itemNum] as Form).saveClick();
			(this.children[prevItemNum] as Form).setFieldValue('order', itemNum);
			(data.items[prevItemNum] as KeyedMap<any>).order = itemNum;
			(this.children[prevItemNum] as Form).saveClick();
			const t = data.items[itemNum];
			data.items[itemNum] = data.items[prevItemNum];
			data.items[prevItemNum] = t;
			const c = this.children[itemNum];
			this.children[itemNum] = this.children[prevItemNum];
			this.children[prevItemNum] = c;
			this.forceUpdate();
		};
		const node = this.nodeDesc;
		const data = this.listData!;
		const filters = this.formFilters;
		const lines = [];
		if (data?.items.length > 0) {
			const sorting = data.items[0].hasOwnProperty('order');
			for (let i = 0; i < data.items.length; i++) {

				const itemNum = i;
				const itemData = data.items[i];
				const isRestricted = isRecordRestrictedForDeletion(node.id, itemData.id!);
				if (!itemData.__deleted_901d123f) {
					const buttons = [];

					buttons.push(
						R.button(
							{
								className: isRestricted
									? 'clickable tool-btn danger-btn restricted'
									: 'clickable tool-btn danger-btn',
								title: L('DELETE'),
								key: 'b' + UID(itemData),
								onClick: async () => {
									await deleteRecordClient(itemData.name, node.id, 0, !itemData.id, () => {
										itemData.__deleted_901d123f = true;
										const formI = (this.children as Form[]).findIndex(f => f.formData === itemData);
										assert(formI >= 0, 'cant find item form');
										this.children.splice(formI, 1);
										this.forceUpdate();
									});
								}
							},
							renderIcon('times')
						)
					);

					if (sorting) {
						let prevItemNum!: number;
						let nexItemNum!: number;
						for (let j = itemNum - 1; j >= 0; j--) {
							if (!data.items[j].__deleted_901d123f) {
								prevItemNum = j;
								break;
							}
						}

						for (let j = itemNum + 1; j < data.items.length; j++) {
							if (!data.items[j].__deleted_901d123f) {
								nexItemNum = j;
								break;
							}
						}

						buttons.push(
							R.button(
								{
									className: (typeof prevItemNum === 'number') ? 'clickable tool-btn edit-btn' : 'clickable tool-btn edit-btn disabled',
									title: L('MOVE_UP'),
									key: 'bu' + UID(itemData),
									onClick: (typeof prevItemNum === 'number') ? () => {
										swapItems(itemNum, prevItemNum);
									} : undefined
								},
								renderIcon('arrow-up')
							)
						);

						buttons.push(
							R.button(
								{
									className: (typeof nexItemNum === 'number') ? 'clickable tool-btn edit-btn' : 'clickable tool-btn edit-btn disabled',
									title: L('MOVE_DOWN'),
									key: 'bd' + UID(itemData),
									onClick: (typeof nexItemNum === 'number') ? () => {
										swapItems(itemNum, nexItemNum);
									} : undefined
								},
								renderIcon('arrow-down')
							)
						);

					}

					lines.push(
						R.div(
							{
								key: UID(itemData),
								className: 'inline-editable-item inline-editable-item-rec-id-' + itemData.id
							},
							h(Form, {
								nodeId: this.props.nodeId,
								inlineEditable: true,
								editable: true,
								formData: itemData,
								isCompact: true,
								isPreventCloseFormAfterSave: true,
								filters: filters,
								parent: this,
								parentForm: this,
								overrideOrderData: sorting ? itemNum : -1
							} as FormProps),
							R.span({ key: UID(itemData) + 'buttons', className: 'buttons' }, buttons)
						)
					);
				}

			}
		}
		/// #if DEBUG
		let nodeAdmin;
		if (iAdmin()) {
			nodeAdmin = h(NodeAdmin, { form: this });
		}
		/// #endif

		let createBtn;
		if (node.privileges & PRIVILEGES_MASK.CREATE) {
			createBtn = R.div(
				null,
				R.button(
					{
						title: L('ADD', node.creationName || node.singleName),
						className: 'clickable tool-btn create-btn',
						onClick: () => {
							(data as RecordsDataOrdered).items.push({ name: '', order: this.parent!.children[0].children.length });
							this.forceUpdate();
						}
					},
					renderIcon('plus')
				)
			);
		}

		return R.div(
			{ className: className + ' editable-list' },
			/// #if DEBUG
			nodeAdmin,
			/// #endif
			lines,
			createBtn
		);
	}

	async cancelClick() {
		this.forceBouncingTimeout();
		if (this.isAsyncInProgress()) {
			await this.waitForAsyncFinish();
		}
		if (this.isDataModified) {
			const answer = await showPrompt(L('FORM_IS_MODIFIED'), L('KEEP_EDITING'), L('LEAVE_WITHOUT_SAVING'), undefined, undefined, undefined, true);
			if (answer) {
				return;
			}
		}
		goBack();
	}

	isFieldDisabled(fieldName: FieldsNames) {
		return this.disabledFields[fieldName];
	}

	saveButtonTitle?: string;

	setSaveButtonTitle(txt?: string) {
		this.saveButtonTitle = txt;
		this.forceUpdate();
	}

	setFieldLabel(fieldName: FieldsNames, label?: string) {
		this.getField(fieldName).setLabel(label);
	}

	setHeader(header: ComponentChild) {
		this.setState({ header });
	}

	renderAsListItem() {
		const fields = [];
		const data = this.formData!;
		const nodeFields = this.nodeDesc.fields;
		for (const field of nodeFields!) {
			if (this.isFieldVisibleByFormViewMask(field)) {
				let className = 'form-item-row';
				if (field.fieldType === FIELD_TYPE.NUMBER) {
					className += ' form-item-row-num';
				} else if (
					field.fieldType !== FIELD_TYPE.TEXT &&
					field.fieldType !== FIELD_TYPE.HTML_EDITOR &&
					field.fieldType !== FIELD_TYPE.LOOKUP
				) {
					className += ' form-item-row-misc';
				}

				fields.push(
					R.td(
						{ key: field.id, className },
						h(getClassForField(field.fieldType), {
							hideControls: this.props.hideControls,
							key: field.fieldName,
							fieldDesc: field,
							initialValue: (data as KeyedMap<any>)[field.fieldName],
							parentForm: this,
							isCompact: true
						} as BaseFieldProps)
					)
				);
			}
		}

		const itemProps: ComponentProps<any> = {};
		itemProps.className = 'list-item list-item-id-' + data.id;
		if (this.nodeDesc.draftable && (data as RecordDataWriteDraftable).status !== 1) {
			itemProps.className += ' list-item-draft';
		}

		if (this.getParentLookupField()) {
			itemProps.title = L('SELECT');
			itemProps.className += ' clickable';
			itemProps.onClick = () => {
				this.getParentLookupField()!.valueSelected(data);
			};
		}

		let buttons;
		if (!this.props.hideControls && !this.state.hideControls) {
			buttons = renderItemsButtons(this.nodeDesc, data, (this.parent as Form).refreshData, this);
		}

		fields.push(
			R.td(
				{ key: 'b', className: 'form-item-row form-item-row-buttons' },
				buttons
			)
		);

		return R.tr(itemProps, fields);
	}

	renderField(fieldDesc: FieldDesc, parent: FormNode = this) {
		if (this.isFieldVisibleByFormViewMask(fieldDesc)) {
			if (this.props.editable) {
				return h(getClassForField(fieldDesc.fieldType), {
					hideControls: this.props.hideControls,
					key: fieldDesc.id,
					fieldDesc,
					initialValue: (this.formData as KeyedMap<any>)[fieldDesc.fieldName],
					parentForm: this,
					parent,
					isEdit: this.props.editable,
					isCompact: this.props.isCompact,
					fieldHidden: this.hiddenFields.hasOwnProperty(fieldDesc.fieldNamePure!) || this.formFilters.hasOwnProperty(fieldDesc.fieldNamePure!),
					fieldDisabled: this.isFieldDisabled(fieldDesc.fieldNamePure as FieldsNames) || this.formFilters.hasOwnProperty(fieldDesc.fieldNamePure!)
				} as BaseFieldProps);
			}
		}
	}

	private renderForm(className: string): ComponentChildren {
		const nodeDesc = this.nodeDesc;

		let fields = [] as ComponentChildren[];
		const data = this.formData!;
		const nodeFields = nodeDesc.fields!;

		if (this.props.editable) {
			className += ' form-edit';
		}

		let tabsHeader;

		if (nodeDesc.tabs && !this.props.isCompact) {
			tabsHeader = R.div(
				{ className: 'header-tabs' },
				nodeDesc.tabs.map((tabField: FieldDesc, tabNum) => {

					const active = this.formFilters.hasOwnProperty('tab') ?
						((this.formFilters as FormControlFilters).tab === tabField.fieldName) : !tabNum;
					const props = {
						parentForm: this,
						parent: this,
						fieldDesc: tabField,
						hideControls: this.props.hideControls,
						initialValue: undefined,
						active
					} as TabFieldProps;

					fields.push(h(globals.FormTabContent, props));

					return h(globals.TabField, props);

				}));

		} else {
			for (const fieldDesc of nodeFields) {
				const tf = this.renderField(fieldDesc);
				if (tf) {
					fields.push(tf);
				}
			}
		}

		let closeSubFormButton;
		let closeButton;
		let header;

		let deleteButton;
		let saveButton;
		let draftButton;
		/// #if DEBUG
		let nodeAdmin;
		/// #endif
		const isRestricted = isRecordRestrictedForDeletion(nodeDesc.id, data.id);
		if (!this.props.inlineEditable) {
			if (data.isD && !this.props.preventDeleteButton) {
				deleteButton = R.button(
					{
						className: isRestricted ? 'restricted clickable danger-button delete-button' : 'clickable danger-button delete-button',
						onClick: async () => {
							if (await deleteRecordClient(data.name, nodeDesc.id, data.id!)) {
								if (this.props.onDelete) {
									this.props.onDelete();
								} else {
									goBack(true);
								}
							}
						},
						title: L('DELETE')
					},
					renderIcon('trash'),
					this.props.isCompact ? '' : L('DELETE')
				);
			}

			const saveButtonLabel = nodeDesc.storeForms ? (this.props.isCompact ? '' : this.saveButtonTitle || L('SAVE')) : nodeDesc.matchName;

			if (this.props.editable) {
				if (!nodeDesc.draftable || (data.id && !data.isP) || !(nodeDesc.privileges & PRIVILEGES_MASK.PUBLISH)) {
					saveButton = R.button(
						{
							className: 'clickable success-button save-btn',
							onClick: this.saveClick,
							title: saveButtonLabel
						},
						this.props.isCompact ? renderIcon('check') : renderIcon(nodeDesc.storeForms ? 'floppy-o' : nodeDesc.icon!),
						saveButtonLabel
					);
				} else {
					if (data.status === 1) {
						draftButton = R.button(
							{
								className: isRestricted ? 'clickable default-button unpublish-button restricted' : 'clickable default-button unpublish-button',
								onClick: () => {
									this.saveClick(true);
								},
								title: L('UNPUBLISH')
							},
							L('UNPUBLISH')
						);
						saveButton = R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick }, saveButtonLabel);
					} else {
						draftButton = R.button(
							{
								className: 'clickable default-button publish-button',
								onClick: () => {
									this.saveClick(true);
								},
								title: L('SAVE_TEMPLATE')
							},
							L('SAVE_TEMPLATE')
						);
						saveButton = R.button(
							{
								className: 'clickable success-button save-btn',
								onClick: this.saveClick,
								title: L('PUBLISH')
							},
							L('PUBLISH')
						);
					}
				}
			}
			/// #if DEBUG
			if (iAdmin()) {
				nodeAdmin = h(NodeAdmin, { form: this });
			}
			/// #endif
			if (!this.props.isCompact) {
				const headerContent =
					this.state.header ||
					R.span(
						null,
						nodeDesc.icon ? renderIcon(nodeDesc.icon) : undefined,
						this.recId === NEW_RECORD
							? (nodeDesc.storeForms ? L('CREATE') + ' ' : undefined, nodeDesc.creationName || nodeDesc.singleName)
							: this.formData!.name
					);
				header = R.h4({ className: 'form-header' }, headerContent);
			}

			if (!this.state.isCancelButtonHidden) {
				if (this.props.editable) {
					closeButton = h(HotkeyButton, {
						hotkey: 27,
						className: 'clickable default-button',
						onClick: this.cancelClick,
						title: L('CANCEL'),
						label: R.span(null, renderIcon('caret-left'), this.props.isCompact ? '' : L('CANCEL'))
					});
				} else {
					closeButton = h(HotkeyButton, {
						hotkey: 27,
						className: 'clickable default-button',
						onClick: this.cancelClick,
						label: R.span(null, renderIcon('caret-left'), this.props.isCompact ? '' : L('BACK'))
					});
				}

				closeSubFormButton = R.div({ className: 'close-popup-wrap' }, R.button(
					{
						className: 'clickable tool-btn danger-btn close-popup-button',
						title: L('CLOSE'),
						onClick: this.cancelClick
					},
					renderIcon('times')
				));
			}
		}

		return R.div(
			{ className },
			/// #if DEBUG
			nodeAdmin,
			/// #endif
			closeSubFormButton,
			header,
			tabsHeader,
			fields,
			R.div(
				{
					className: this.state.footerHidden || this.props.inlineEditable ? 'form-footer hidden' : 'form-footer'
				},
				deleteButton,
				draftButton,
				saveButton,
				closeButton
			)
		);
	}
}

function createPageButton(form: Form, page: number, isActive: boolean) {
	if (isActive) {
		return R.button({ key: page, className: 'page-btn page-btn-active' }, page + 1);
	}
	return R.button(
		{
			key: page,
			className: 'clickable page-btn',
			onClick: () => {
				form.changeFilter('p', page, true);
			}
		},
		page + 1
	);
}

const sortByOrder = (a: { order: number }, b: { order: number }) => {
	return a.order - b.order;
};

const sortEntries = (a: [string, any], b: [string, any]) => {
	return a[0] > b[0] ? 1 : -1;
};

const entryToKey = (entry: [string, any]) => {
	const val = entry[1];
	return entry[0] + '=' + val.id;
};
