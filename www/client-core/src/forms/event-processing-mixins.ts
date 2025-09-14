import { render, type ComponentChild } from 'preact';
import { E, FIELD_TYPE } from '../../../../types/generated';
import { assert, throwError, validateFieldName } from '../assert';
import type { BoolNum, FieldDesc, GetRecordsFilter, RecordData } from '../bs-utils';
import { clientHandlers, type Handler } from '../events-handle';
import type { FieldWrap__olf } from '../fields/field-wrap';
import { CLIENT_SIDE_FORM_EVENTS, consoleLog, getData, L } from '../utils';
import { BaseForm__olf } from './base-form';

class FormEventProcessingMixins__olf<FieldsNames extends string> extends BaseForm__olf {
	/** true if form opened for new record creation */
	isNewRecord?: boolean;
	/** true if form opened for editing existing form */
	isUpdateRecord?: boolean;

	saveButtonTitle?: string;
	isCancelButtonHidden?: boolean;

	currentData!: KeyedMap<any>;

	/// #if DEBUG
	/** show all fields for debug purposes (hidden and field of another tabs) */
	showAllDebug = false;
	/// #endif

	showAllTabs = false;

	/** set *true* - to make drafting buttons invisible. It is still possible do draft/publish records via api. */
	disableDrafting = false;

	/** contains validate() result */
	formIsValid = false;

	currentTabName: string | null;

	invalidAlertInOnSaveHandler = false;

	private disabledFields: { [key: string]: 1 | null };

	/** dont close form after it is saved */
	isPreventCloseFormAfterSave?: boolean;

	hiddenFields: { [key: string]: BoolNum };

	constructor(props: any) {
		super(props);
		this.recId = (this.props.initialData as RecordData).id || 'new';
		this.currentData = null!;
		this.hiddenFields = {};
		this.disabledFields = {};
		this.currentTabName = null;
	}

	componentDidMount() {
		this.callOnTabShowEvent(this.props.filters!.tab!);
	}

	isFieldVisibleByFormViewMask(_field: FieldDesc) {
		return true;
	}

	setSaveButtonTitle(txt?: string) {
		this.saveButtonTitle = txt;
		this.forceUpdate();
	}

	hideCancelButton() {
		this.isCancelButtonHidden = true;
		this.forceUpdate();
	}

	callOnTabShowEvent(tabNameToShow: string) {
		if (this.currentTabName !== tabNameToShow) {
			this.currentTabName = tabNameToShow;
			let field;
			const nodeFields = this.props.node.fields!;
			for (const f of nodeFields) {
				if (this.isFieldVisibleByFormViewMask(f)) {
					if (f.fieldType === FIELD_TYPE.TAB && f.maxLength === 0) {
						// tab
						if (tabNameToShow === f.fieldName || !tabNameToShow) {
							field = f;
							break;
						}
					}
				}
			}

			if (field) {
				this.processFieldEvent(field, false, false);
			}
		}
	}

	hasField(fieldName: FieldsNames) {
		validateFieldName(fieldName);
		return this.fieldsRefs.hasOwnProperty(fieldName);
	}

	getField(fieldName: FieldsNames): FieldWrap__olf {
		validateFieldName(fieldName);
		if (!this.hasField(fieldName)) {
			throwError('Unknown field: ' + fieldName);
		}
		return this.fieldsRefs[fieldName];
	}

	setFieldLabel(fieldName: FieldsNames, label?: string) {
		validateFieldName(fieldName);
		this.getField(fieldName).setLabel(label);
	}

	hideField(...fieldsNames: FieldsNames[]) {
		for (const fieldName of fieldsNames) {
			validateFieldName(fieldName);
			if (this.hiddenFields[fieldName] !== 1) {
				this.hiddenFields[fieldName] = 1;
				const f = this.getField(fieldName);
				if (f) {
					f.hide();
				}
				if (f.props.field!.fieldType === FIELD_TYPE.TAB) {
					this.forceUpdate();
				}
			}
		}
		this.refreshLeftBar();
	}

	showField(...fieldsNames: FieldsNames[]) {
		for (const fieldName of fieldsNames) {
			validateFieldName(fieldName);
			if (this.hiddenFields[fieldName] === 1) {
				delete this.hiddenFields[fieldName];
				const f = this.getField(fieldName);
				if (f) {
					f.show();
				}
			}
		}
		this.refreshLeftBar();
	}

	isFieldVisible(fieldName: string) {
		validateFieldName(fieldName);
		return this.hiddenFields[fieldName] !== 1;
	}

	hideFooter() {
		this.setState({ footerHidden: true });
	}

	showFooter() {
		this.setState({ footerHidden: false });
	}

	disableField(fieldName: FieldsNames) {
		validateFieldName(fieldName);
		if (this.disabledFields[fieldName] !== 1) {
			this.disabledFields[fieldName] = 1;
			const f = this.getField(fieldName);
			if (!f) {
				throw new Error('unknown field "' + fieldName + '"');
			}
			f.disable();
		}
	}

	enableField(fieldName: FieldsNames) {
		validateFieldName(fieldName);
		if (this.disabledFields[fieldName] === 1) {
			delete this.disabledFields[fieldName];
			this.getField(fieldName).enable();
		}
	}

	makeFieldRequired(fieldName: FieldsNames, required = true) {
		validateFieldName(fieldName);
		this.getField(fieldName).makeFieldRequired(required);
	}

	isFieldDisabled(fieldName: FieldsNames) {
		validateFieldName(fieldName);
		return this.disabledFields[fieldName] === 1;
	}

	addLookupFilters(fieldName: FieldsNames, filtersObjOrName: GetRecordsFilter): void;
	addLookupFilters(fieldName: FieldsNames, filtersObjOrName: string, val: any): void;
	addLookupFilters(fieldName: FieldsNames, filtersObjOrName: string | GetRecordsFilter, val?: any): void {
		this.getField(fieldName).setLookupFilter(filtersObjOrName, val);
	}

	async setFieldValue(fieldName: FieldsNames, val: any, isUserAction = false) {
		const f = this.getField(fieldName);
		if (!f) {
			return; // prevent crash on unmount values debouncing
		}
		const field = f.props.field!;

		if (this.currentData[fieldName as string] !== val) {
			if (!isUserAction) {
				f.setValue(val);
			}
			if (isUserAction) {
				this.isDataModified = true;
				if (this.isSubForm()) {
					this.props.parentForm!.props.form.isDataModified = true;
				}
			}
			const prev_value = this.currentData[fieldName as string];
			this.currentData[fieldName as string] = val;

			await this.processFieldEvent(field, val, isUserAction, prev_value);

			this.checkUniqueValue(field, val);
		}
	};

	fieldValue(fieldName: string) {
		validateFieldName(fieldName);
		return this.currentData[fieldName as string];
	};

	focusField(fieldName: FieldsNames) {
		this.getField(fieldName).focus();
	}

	async onShow() {
		this.header = '';
		this.currentTabName = null;
		this.hiddenFields = {};
		this.disabledFields = {};
		await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_LOAD);
		this.refreshLeftBar();

		for (const k in this.fieldsRefs) {
			const f = this.fieldsRefs[k];
			if (
				f.props.field!.fieldType !== FIELD_TYPE.BUTTON &&
				f.props.field!.fieldType !== FIELD_TYPE.TAB
			) {
				await this.processFieldEvent(f.props.field!, (this.fieldValue as any)(f.props.field!.fieldName), false);
			}
		}

		const hdr = this.header;
		if ((this.state.header || '') != hdr) {
			this.setState({ header: hdr });
		}

		if (this.props.filters && this.props.filters.tab) {
			this.callOnTabShowEvent(this.props.filters.tab);
		}
	}

	getFieldDomElement(fieldName: FieldsNames): HTMLDivElement {
		const formElement = this.base as HTMLDialogElement;
		return formElement.querySelector(
			'.field-container-id-' + this.getField(fieldName).props.field!.id
		) as HTMLDivElement;
	}

	renderToField(fieldName: FieldsNames, containerClassName: string, reactContent: ComponentChild) {
		const el = this.getFieldDomElement(fieldName);
		let container = el.querySelector('.' + containerClassName);
		if (!container) {
			container = document.createElement('SPAN');
			container.className = containerClassName;
			el.appendChild(container);
		}
		render(reactContent, container);
	}

	saveClick(_isDraft?: boolean | 'keepStatus'): Promise<boolean | undefined> {
		throw new Error('should be implemented in child class');
	}

	save() {
		this.saveClick();
	}

	refreshLeftBar() {
		this.forceUpdate();
	}

	async checkUniqueValue(field: FieldDesc, val: any) {
		if (field.unique && val) {
			const data = await getData(
				'api/uniqueCheck',
				{
					fieldId: field.id,
					nodeId: field.node!.id,
					recId: this.recId !== 'new' && this.recId,
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
		}
		return true;
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

	async onSave() {
		/// #if DEBUG
		consoleLog('onSave ' + this.props.node.tableName + ': ' + (this.props.initialData as RecordData).id);
		/// #endif

		for (const fieldName in this.fieldsRefs) {
			this.fieldAlert(fieldName as FieldsNames); // hide all alerts
		}

		this.invalidAlertInOnSaveHandler = false;
		const onSaveRes = await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_SAVE);
		return onSaveRes || this.invalidAlertInOnSaveHandler;
	}

	fieldAlert(fieldName: FieldsNames, text: string = '', isSuccess?: boolean, focus: boolean = !isSuccess) {
		assert(fieldName, 'fieldName expected');
		const f = this.getField(fieldName);
		if (f) {
			if (typeof isSuccess === 'undefined') {
				isSuccess = !text;
			}
			if (f.fieldAlert) {
				f.fieldAlert(text, isSuccess, focus);
			}
			if (!isSuccess) {
				this.invalidAlertInOnSaveHandler = true;
			}
		}
	}

	_getFormEventHandler(eventName: CLIENT_SIDE_FORM_EVENTS) {
		const name = (E as KeyedMap<any>)[this.props.node.tableName!][eventName];
		return this._getEventHandlers(name);
	}

	_getFieldEventHandlers(field: FieldDesc) {
		const name =
			this.props.node.tableName +
			',' +
			field.fieldName +
			'.' +
			((field.fieldType === FIELD_TYPE.BUTTON || field.fieldType === FIELD_TYPE.TAB) ?
				CLIENT_SIDE_FORM_EVENTS.ON_FIELD_CLICK :
				CLIENT_SIDE_FORM_EVENTS.ON_FIELD_CHANGE);
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

	async processEvent(handlers: Handler[] | undefined, ...args: any[]) {
		if (handlers) {
			for (const handler of handlers) {
				this.recId = (this.props.initialData as RecordData).id || 'new';
				this.isUpdateRecord = this.props.editable;
				if (this.isUpdateRecord) {
					this.isNewRecord = !(this.props.initialData as RecordData).hasOwnProperty('id');
					if (this.isNewRecord) {
						this.isUpdateRecord = false;
					}
				}
				if (await handler(this, ...args)) {
					return true;
				}
			}
		}
	}
}

export { FormEventProcessingMixins__olf };
