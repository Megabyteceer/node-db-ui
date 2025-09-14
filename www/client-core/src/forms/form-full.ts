import { FieldWrap } from '../fields/field-wrap';
import { CLIENT_SIDE_FORM_EVENTS, deleteRecord, getItem, goBack, isRecordRestrictedForDeletion, L, n2mValuesEqual, removeItem, renderIcon, setItem, submitRecord } from '../utils';
import { FormEventProcessingMixins } from './event-processing-mixins';
import { FormTab } from './form-tab';
/// #if DEBUG
import { NodeAdmin } from '../admin/admin-control';
import { FieldAdmin } from '../admin/field-admin';
/// #endif

import type { FieldDesc, LookupValue, RecId, RecordData, RecordDataWriteDraftable, RecordSubmitResult, RecordSubmitResultNewRecord } from '../bs-utils';
import { PRIVILEGES_MASK, STATUS } from '../bs-utils';
import { HotkeyButton } from '../components/hotkey-button';
import { LoadingIndicator } from '../loading-indicator';
import { R } from '../r';
import { iAdmin, User } from '../user';

import { h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import { LeftBar } from '../left-bar';

const sortEntries = (a: [string, any], b: [string, any]) => {
	return a[0] > b[0] ? 1 : -1;
};
const linkerEntriesFilter = (entry: [string, any]) => {
	return typeof entry[1] === 'object';
};
const entryToKey = (entry: [string, any]) => {
	const val = entry[1];
	return entry[0] + '=' + val.id;
};

async function callForEachField(fieldRefs: KeyedMap<FieldWrap>, data: KeyedMap<any>, functionName: string) {
	for (const k of Object.keys(fieldRefs)) {
		const f = fieldRefs[k];
		if (!(f instanceof FieldWrap)) {
			continue;
		}
		const field = f.fieldRef as KeyedMap<any>;
		if (field[functionName]) {
			const fieldName = f.props.field!.fieldName;
			const newValue = await field[functionName]();
			if (typeof newValue !== 'undefined' && f.props.initialValue !== newValue) {
				data[fieldName] = newValue;
			}
		}
	}
}

class FormFull<FieldsNames extends string = string> extends FormEventProcessingMixins<FieldsNames> {
	backupInterval = 0;

	constructor(props: any) {
		super(props);
		this.currentData = Object.assign({}, props.filters, props.initialData);
		this.saveClick = this.saveClick.bind(this);
		this.tryBackupData = this.tryBackupData.bind(this);
	}

	tryBackupData() {
		if (!this.currentData.id && !this.props.inlineEditable && this.editable) {
			this.prepareToBackup();
			setItem(this._getBackupKey(), this.currentData);
		}
	}

	_getBackupKey() {
		return 'backup_for_node:' + User.currentUserData!.id + ':' + this.props.node.id + ':' + Object.entries(this.props.filters!).filter(linkerEntriesFilter).sort(sortEntries).map(entryToKey).join();
	}

	componentDidMount() {
		super.componentDidMount();
		this.recoveryBackupIfNeed();
		this.onShow();

		if (this.props.overrideOrderData! >= 0) {
			if (this.hasField('order' as any)) {
				this.hideField('order' as any);
			}
		}

		window.addEventListener('unload', this.tryBackupData);
		this.backupInterval = window.setInterval(this.tryBackupData, 15000);
		if (this.props.isRootForm) {
			LeftBar.refreshLeftBarActive();
		}
	}

	recoveryBackupIfNeed() {
		if (!this.currentData.id && !this.props.inlineEditable) {
			const backup = getItem(this._getBackupKey());
			if (backup) {
				this.currentData = Object.assign(backup, this.filters);
				this.resendDataToFields();
			}
		}
	}

	prepareToBackup() {
		const fields = this.props.node.fields!;
		for (const field of fields!) {
			if (field.fieldType === FIELD_TYPE.LOOKUP_1_TO_N && this.isFieldVisibleByFormViewMask(field)) {
				this.currentData[field.fieldName] = this.getField(field.fieldName as FieldsNames).getBackupData();
			}
		}
	}

	deleteBackup() {
		removeItem(this._getBackupKey());
	}

	componentWillUnmount() {
		window.removeEventListener('unload', this.tryBackupData);
		this.tryBackupData();
		clearInterval(this.backupInterval);
	}

	resendDataToFields() {
		if (this.props.editable) {
			for (const k in this.fieldsRefs) {
				const f = this.fieldsRefs[k];
				if (this.currentData.hasOwnProperty(k)) {
					f.setValue(this.currentData[k]);
				}
			}
		}
	}

	forceBouncingTimeout() {
		for (const k in this.fieldsRefs) {
			const f = this.fieldsRefs[k];
			if (!(f instanceof FieldWrap)) {
				continue;
			}
			if (f.forceBouncingTimeout) {
				f.forceBouncingTimeout();
			}
		}
	}

	async saveForm(): Promise<boolean | undefined> {
		if (this.props.editable) {
			return this.saveClick('keepStatus');
		}
	}

	async validate(): Promise<boolean> {
		this.formIsValid = true;
		if (await this.onSave()) {
			this.formIsValid = false;
			return false;
		}

		for (const k in this.fieldsRefs) {
			const fieldWrapperRef = this.fieldsRefs[k];
			if (!(fieldWrapperRef instanceof FieldWrap)) {
				continue;
			}
			const field = fieldWrapperRef.props.field!;

			if (this.props.overrideOrderData! >= 0 && field.fieldName === 'order') {
				this.currentData[field.fieldName] = this.props.overrideOrderData;
			}

			if (fieldWrapperRef.fieldRef.isRequired() && fieldWrapperRef.isEmpty()) {
				this.fieldAlert(field.fieldName as FieldsNames, L('REQUIRED_FLD'), false, this.formIsValid);
				this.formIsValid = false;
			} else {
				this.fieldAlert(field.fieldName as FieldsNames);
				const isValid = await this.checkUniqueValue(field, !fieldWrapperRef.isEmpty() && this.currentData[field.fieldName]);
				const isValid2 = await fieldWrapperRef.checkValidityBeforeSave(this.formIsValid);
				if (!isValid || !isValid2) {
					this.formIsValid = false;
				}
			}
		}
		return this.formIsValid;
	}

	async saveClick(isDraft?: boolean | 'keepStatus'): Promise<boolean | undefined> {
		LoadingIndicator.instance!.show();

		const ret = this.saveClickInner(isDraft)
		/// #if DEBUG
			/*
			/// #endif
			.catch((er) => {
				console.log('invalid form.');
				console.dir(er);
			})
			// */
			.finally(() => {
				LoadingIndicator.instance!.hide();
			});
		return ret;
	}

	async saveClickInner(isDraft?: boolean | 'keepStatus'): Promise<boolean | undefined> {
		this.isPreventCloseFormAfterSave = false;
		this.forceBouncingTimeout();
		const data: RecordDataWriteDraftable = {};

		if (isDraft !== 'keepStatus') {
			if ((this.props.initialData as RecordData).isP || !(this.props.initialData as RecordData).id) {
				if (isDraft === true) {
					if ((this.props.initialData as RecordData).status !== 2) {
						data.status = STATUS.DRAFT;
					}
				} else {
					if ((this.props.initialData as RecordData).status !== 1) {
						data.status = STATUS.PUBLIC;
					}
				}
			}
		}

		if (!(await this.validate())) {
			return true;
		}

		for (const k in this.fieldsRefs) {
			const fieldRef = this.fieldsRefs[k];
			if (!(fieldRef instanceof FieldWrap)) {
				continue;
			}
			const field = fieldRef.props.field!;

			const val = this.currentData[field.fieldName];

			if (field.sendToServer) {
				if (field.fieldType === FIELD_TYPE.LOOKUP_N_TO_M) {
					if (!n2mValuesEqual((this.props.initialData as KeyedMap<any>)[field.fieldName], val)) {
						(data as KeyedMap<any>)[field.fieldName] = (val as LookupValue[]).map(v => v.id);
					}
				} else if (field.fieldType === FIELD_TYPE.LOOKUP) {
					let cVal = val;
					let iVal = (this.props.initialData as KeyedMap<any>)[field.fieldName];

					if (cVal && cVal.id) {
						cVal = cVal.id;
					}

					if (iVal && iVal.id) {
						iVal = iVal.id;
					}

					if (cVal !== iVal) {
						(data as KeyedMap<any>)[field.fieldName] = val;
					}
				} else if (val && val._isAMomentObject) {
					if (!val.isSame((this.props.initialData as KeyedMap<any>)[field.fieldName])) {
						(data as KeyedMap<any>)[field.fieldName] = val;
					}
				} else {
					if ((this.props.initialData as KeyedMap<any>)[field.fieldName] != val) {
						(data as KeyedMap<any>)[field.fieldName] = val;
					}
				}
			}
		}

		await callForEachField(this.fieldsRefs, data, 'beforeSave');
		if (this.invalidAlertInOnSaveHandler) {
			return;
		}

		if (Object.keys(data).length > 0) {
			const submitResult: RecordSubmitResult | RecordSubmitResultNewRecord = await submitRecord(this.props.node.id, data, this.props.initialData ? (this.props.initialData as RecordData).id : undefined);
			const recId: RecId | undefined = (submitResult as RecordSubmitResultNewRecord).recId;
			if (!recId) {
				// save error
				return;
			}
			this.isDataModified = false;
			this.recId = recId;
			if (!this.currentData.hasOwnProperty('id')) {
				this.currentData.id = recId;
				(this.props.initialData as RecordData).id = recId;
			}
			this.deleteBackup();
			// renew current data
			this.currentData = Object.assign(this.currentData, data);
			// renew initial data;
			globals.Stage.dataDidModified(this.currentData as RecordData);

			for (const k in data) {
				const val = (data as KeyedMap<any>)[k];
				if (typeof val === 'object') {
					if (!Object.keys(val).length) {
						(this.props.initialData as KeyedMap<any>)[k] = undefined;
					} else if (val._isAMomentObject) {
						(this.props.initialData as KeyedMap<any>)[k] = val.clone();
					} else if (Array.isArray(val)) {
						(this.props.initialData as KeyedMap<any>)[k] = val.concat();
					} else {
						(this.props.initialData as KeyedMap<any>)[k] = Object.assign({}, val);
					}
				} else {
					(this.props.initialData as KeyedMap<any>)[k] = val;
				}
			}
			await callForEachField(this.fieldsRefs, data, 'afterSave');

			await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_AFTER_SAVE, submitResult);
		} else {
			this.isDataModified = false;
			await callForEachField(this.fieldsRefs, data, 'afterSave');
		}

		if (!this.isPreventCloseFormAfterSave) {
			if (this.isSubForm()) {
				this.props.parentForm!.valueSelected(this.currentData as RecordData, true);
			} else {
				this.cancelClick();
			}
		}
	}

	isFieldVisibleByFormViewMask(field: FieldDesc) {
		return (this.props.editable ? field.show & 1 : field.show & 4) > 0;
	}

	render() {
		const node = this.props.node;
		if (!node) {
			return R.div({ className: 'field-lookup-loading-icon-container' }, renderIcon('cog fa-spin fa-2x'));
		}

		let tabs: FormTab[];
		let fields = [] as FieldWrap[];
		const data = this.currentData;
		const nodeFields = node.fields;

		let className = 'form form-full form-node-' + node.id + ' form-rec-' + this.recId;
		if (this.props.isCompact) {
			className += ' form-compact';
		}

		if (this.props.editable) {
			className += ' form-edit';
		}

		const forcedValues = this.props.filters!;
		let currentTab: FormTab;
		let currentTabName!: string;

		for (const field of nodeFields!) {
			if (this.isFieldVisibleByFormViewMask(field)) {
				const ref = (ref: FieldWrap) => {
					if (ref) {
						this.fieldsRefs[field.fieldName] = ref;
					} else {
						delete this.fieldsRefs[field.fieldName];
					}
				};

				if (field.fieldType === FIELD_TYPE.TAB && field.maxLength === 0 && !this.isSubForm()) {
					// tab
					let isDefaultTab;
					if (!tabs!) {
						tabs = [];
						isDefaultTab = true;
					} else {
						isDefaultTab = false;
						fields = [];
					}

					let tabVisible;
					if (this.filters.hasOwnProperty('tab')) {
						tabVisible = this.filters.tab === field.fieldName;
					} else {
						tabVisible = isDefaultTab;
					}

					currentTabName = field.fieldName;
					currentTab = h(FormTab, {
						key: field.id,
						ref,
						title: field.name,
						visible: tabVisible || this.showAllDebug || this.showAllTabs,
						/// #if DEBUG
						highlightFrame: this.showAllDebug,
						/// #endif
						field,
						form: this,
						fields
					});
					tabs.push(currentTab);
				} else if (this.props.editable || data[field.fieldName] || !field.storeInDb || field.fieldType === FIELD_TYPE.LOOKUP_1_TO_N || field.fieldType >= 100) {
					const tf = h(FieldWrap, {
						ref,
						key: field.id,
						field,
						initialValue: data[field.fieldName],
						form: this,
						parentTabName: currentTabName,
						isEdit: this.props.editable,
						isCompact: this.props.isCompact,
						hidden: this.hiddenFields.hasOwnProperty(field.fieldNamePure!) || forcedValues.hasOwnProperty(field.fieldNamePure!),
						fieldDisabled: this.isFieldDisabled(field.fieldNamePure as FieldsNames) || forcedValues.hasOwnProperty(field.fieldNamePure!)
					});

					fields.push(tf);
				}
			}
		}

		const isMainTab = !this.filters.tab || tabs![0].props.field.fieldName === this.filters.tab;

		if (this.props.isCompact) {
			fields.sort((a, b) => {
				const alow = a.props.field!.fieldType === FIELD_TYPE.LOOKUP_1_TO_N || a.props.field!.fieldType === FIELD_TYPE.LOOKUP_N_TO_M || a.props.field!.fieldType === FIELD_TYPE.BOOL;
				const blow = b.props.field!.fieldType === FIELD_TYPE.LOOKUP_1_TO_N || b.props.field!.fieldType === FIELD_TYPE.LOOKUP_N_TO_M || b.props.field!.fieldType === FIELD_TYPE.BOOL;
				if (alow !== blow) {
					if (alow) {
						return 1;
					} else {
						return -1;
					}
				}
				const pa = a.props.field!.lang;
				const pb = b.props.field!.lang;

				if (pa !== pb) {
					if (!pa) return -1;
					if (!pb) return 1;
					if (pa && pa > pb) return 1;
					if (pa && pa < pb) return -1;
				}
				return a.props.field!.index! - b.props.field!.index!;
			});
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
		const isRestricted = isRecordRestrictedForDeletion(node.id, data.id);
		if (!this.props.inlineEditable) {
			if (data.isD && isMainTab && !this.props.preventDeleteButton) {
				deleteButton = R.button(
					{
						className: isRestricted ? 'restricted clickable danger-button delete-button' : 'clickable danger-button delete-button',
						onClick: async () => {
							if (await deleteRecord(data.name, node.id, data.id)) {
								if (this.isSubForm()) {
									this.props.parentForm!.valueSelected();
								} else {
									goBack(true);
								}
							}
						},
						title: L('DELETE')
					},
					renderIcon('trash'),
					this.isSubForm() ? '' : L('DELETE')
				);
			}

			const saveButtonLabel = node.storeForms ? (this.isSubForm() ? '' : this.saveButtonTitle || L('SAVE')) : node.matchName;

			if (this.props.editable) {
				if (!node.draftable || !isMainTab || this.disableDrafting || (data.id && !data.isP) || !(node.privileges & PRIVILEGES_MASK.PUBLISH)) {
					saveButton = R.button(
						{
							className: 'clickable success-button save-btn',
							onClick: this.saveClick,
							title: saveButtonLabel
						},
						this.isSubForm() ? renderIcon('check') : renderIcon(node.storeForms ? 'floppy-o' : node.icon!),
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
					this.header ||
					this.state.header ||
					R.span(
						null,
						node.icon ? renderIcon(node.icon) : undefined,
						this.recId === 'new'
							? (node.storeForms ? L('CREATE') + ' ' : undefined, node.creationName || node.singleName)
							: this.state.data
								? (this.state.data as RecordData).name
								: (this.props.initialData as RecordData).name
					);
				header = R.h4({ className: 'form-header' }, headerContent);
			}

			if (!this.isCancelButtonHidden) {
				if (this.props.editable) {
					closeButton = h(HotkeyButton, {
						hotkey: 27,
						className: 'clickable default-button',
						onClick: this.cancelClick,
						title: L('CANCEL'),
						label: R.span(null, renderIcon('caret-left'), this.isSubForm() ? '' : L('CANCEL'))
					});
				} else {
					closeButton = h(HotkeyButton, {
						hotkey: 27,
						className: 'clickable default-button',
						onClick: this.cancelClick,
						label: R.span(null, renderIcon('caret-left'), this.isSubForm() ? '' : L('BACK'))
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

		let tabsHeader;
		if (tabs! && tabs.length > 1) {
			tabsHeader = R.div(
				{ className: 'header-tabs' },
				tabs.map((tab) => {
					const tabField: FieldDesc = tab.props.field;
					return this.isFieldVisible(tabField.fieldName)
						? R.span(
							{ key: tabField.fieldName, className: 'header-tab-wrap' },
							R.span(
								{
									className: tab.props.visible ? 'tab-header-button tab-header-button-active not-clickable' : 'tab-header-button tab-header-button-inactive clickable',
									onClick: tab.props.visible
										? undefined
										: () => {
											this.setFormFilter('tab', tabField.fieldName);
										}
								},
								renderIcon(tabField.icon),
								tabField.name
							),
							/// #if DEBUG
							h(FieldAdmin, { field: tabField, form: this })
							/// #endif
						)
						: undefined;
				})
			);
		}

		return R.div(
			{ className },
			/// #if DEBUG
			nodeAdmin,
			/// #endif
			closeSubFormButton,
			header,
			tabsHeader,
			tabs! || fields,
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

export { FormFull };
