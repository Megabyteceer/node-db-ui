
import { FieldWrap } from "../fields/field-wrap";
import { CLIENT_SIDE_FORM_EVENTS, deleteRecord, getCaptchaToken, getItem, goBack, isRecordRestrictedForDeletion, L, n2mValuesEqual, removeItem, renderIcon, setItem, submitRecord } from "../utils";
import { FormTab } from "./form-tab";
import { FormEventProcessingMixins } from "./event-processing-mixins";
/// #if DEBUG
import { NodeAdmin } from "../admin/admin-control";
import { FieldAdmin } from "../admin/field-admin";
/// #endif

import { LoadingIndicator } from "../loading-indicator";
import { R } from "../r";
import { FIELD_TYPE, PRIVILEGES_MASK, RecordData, FieldDesc, RecordSubmitResult } from "../bs-utils";
import React from "react";
import { iAdmin, User } from "../user";
import { HotkeyButton } from "../components/hotkey-button";

import { LeftBar } from "../left-bar";

const sortEntries = (a, b) => {
	return (a[0] > b[0]) ? 1 : -1;
}
const linkerEntriesFilter = (entry) => {
	return typeof entry[1] === 'object';
}
const entryToKey = (entry) => {
	const val = entry[1];
	return entry[0] + '=' + val.id;
}

async function callForEachField(fieldRefs, data, functionName) {
	for(let k of Object.keys(fieldRefs)) {
		let f = fieldRefs[k];
		if(!(f instanceof FieldWrap)) {
			continue;
		}
		if(f.fieldRef[functionName]) {
			var fieldName = f.props.field.fieldName;
			let newValue = await f.fieldRef[functionName]();
			if((typeof newValue !== 'undefined') && (f.props.initialValue !== newValue)) {
				data[fieldName] = newValue;
			}
		}
	}
}

class FormFull extends FormEventProcessingMixins {

	backupInterval: NodeJS.Timeout;

	constructor(props) {
		super(props);
		this.currentData = Object.assign({}, props.filters, props.initialData);
		this.saveClick = this.saveClick.bind(this);

		this.showAllDebug = false;
		this.disableDrafting = false;

		this.tryBackupData = this.tryBackupData.bind(this);
	}

	tryBackupData() {
		if(!this.currentData.id && !this.props.inlineEditable && this.editable) {
			this.prepareToBackup();
			setItem(this._getBackupKey(), this.currentData);
		}
	}

	_getBackupKey() {
		return 'backup_for_node:' + User.currentUserData.id + ':' + this.props.node.id + ':' + Object.entries(this.props.filters).filter(linkerEntriesFilter).sort(sortEntries).map(entryToKey).join();
	}

	componentDidMount() {
		super.componentDidMount();
		this.recoveryBackupIfNeed();
		this.onShow();

		if(this.props.overrideOrderData >= 0) {
			if(this.getField('order')) {
				this.hideField('order');
			}
		}

		window.addEventListener('unload', this.tryBackupData);
		this.backupInterval = setInterval(this.tryBackupData, 15000);
		if(this.props.isRootForm) {
			LeftBar.refreshLeftBarActive();
		}
	}

	recoveryBackupIfNeed() {
		if(!this.currentData.id && !this.props.inlineEditable) {
			var backup = getItem(this._getBackupKey());
			if(backup) {
				this.currentData = Object.assign(backup, this.filters);
				this.resendDataToFields();
			}
		}
	}

	prepareToBackup() {
		var fields = this.props.node.fields;
		for(var k in fields) {
			var f = fields[k];
			if((f.fieldType === FIELD_TYPE.LOOKUP_1toN) && this.isFieldVisibleByFormViewMask(f)) {
				this.currentData[f.fieldName] = this.getField(f.fieldName).getBackupData();
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
		if(this.props.editable) {
			for(var k in this.fieldsRefs) {
				var f = this.fieldsRefs[k];
				if(this.currentData.hasOwnProperty(k)) {
					f.setValue(this.currentData[k]);
				}
			}
		}
	}

	forceBouncingTimeout() {
		for(var k in this.fieldsRefs) {
			var f = this.fieldsRefs[k];
			if(!(f instanceof FieldWrap)) {
				continue;
			}
			if(f.forceBouncingTimeout) {
				f.forceBouncingTimeout();
			}
		}
	}

	async saveForm(): Promise<boolean> {
		if(this.props.editable) {
			return this.saveClick('keepStatus');
		}
	}

	async validate(): Promise<boolean> {
		this.formIsValid = true;
		if(await this.onSave()) {
			this.formIsValid = false;
			return false;
		}

		for(let k in this.fieldsRefs) {
			var fieldWrapperRef = this.fieldsRefs[k];
			if(!(fieldWrapperRef instanceof FieldWrap)) {
				continue;
			}
			var field = fieldWrapperRef.props.field;

			if(this.props.overrideOrderData >= 0 && field.fieldName === 'order') {
				this.currentData[field.fieldName] = this.props.overrideOrderData;
			}

			if(fieldWrapperRef.fieldRef.isRequired() && fieldWrapperRef.isEmpty()) {
				this.fieldAlert(field.fieldName, L('REQUIRED_FLD'), false, this.formIsValid);
				this.formIsValid = false;
			} else {
				this.fieldAlert(field.fieldName);
				let isValid = await this.checkUniqueValue(field, (!fieldWrapperRef.isEmpty()) && this.currentData[field.fieldName]);
				let isValid2 = await fieldWrapperRef.checkValidityBeforeSave(this.formIsValid);
				if(!isValid || !isValid2) {
					this.formIsValid = false;
				}
			}
		}
		return this.formIsValid;
	}
	async saveClick(isDraft): Promise<boolean> {
		LoadingIndicator.instance.show();

		let ret = this.saveClickInner(isDraft)
			/// #if DEBUG
			/*
			/// #endif
			.catch((er) => {
				console.log('invalid form.');
				console.dir(er);
			})
			//*/
			.finally(() => {
				LoadingIndicator.instance.hide();
			});
		return ret;
	}
	async saveClickInner(isDraft): Promise<boolean> {
		this.isPreventCloseFormAfterSave = false;
		this.forceBouncingTimeout();
		var data: RecordData = {};

		if(isDraft !== 'keepStatus') {
			if(this.props.initialData.isP || !this.props.initialData.id) {
				if(isDraft === true) {
					if(this.props.initialData.status !== 2) {
						data.status = 2; //TODO: add RECORD_STATUS enum
					}
				} else {
					if(this.props.initialData.status !== 1) {
						data.status = 1;
					}
				}
			}
		}

		if(!await this.validate()) {
			return true;
		}

		for(var k in this.fieldsRefs) {
			var fieldRef = this.fieldsRefs[k];
			if(!(fieldRef instanceof FieldWrap)) {
				continue;
			}
			var field = fieldRef.props.field;

			var val = this.currentData[field.fieldName];

			if(field.sendToServer) {
				if((field.fieldType === FIELD_TYPE.LOOKUP_NtoM)) {
					if(!n2mValuesEqual(this.props.initialData[field.fieldName], val)) {
						data[field.fieldName] = val.map(v => v.id);
					}
				} else if((field.fieldType === FIELD_TYPE.LOOKUP)) {

					var cVal = val;
					var iVal = this.props.initialData[field.fieldName];

					if(cVal && cVal.id) {
						cVal = cVal.id;
					}

					if(iVal && iVal.id) {
						iVal = iVal.id;
					}

					if(cVal !== iVal) {
						data[field.fieldName] = val;
					}

				} else if(val && val._isAMomentObject) {
					if(!val.isSame(this.props.initialData[field.fieldName])) {
						data[field.fieldName] = val;
					}
				} else {
					if(this.props.initialData[field.fieldName] != val) {
						data[field.fieldName] = val;
					}
				}
			}
		}

		await callForEachField(this.fieldsRefs, data, 'beforeSave')
		if(this.invalidAlertInOnSaveHandler) {
			return;
		}

		if(Object.keys(data).length > 0) {

			if(this.props.node.captcha) {
				data.c = await getCaptchaToken();
			}
			let submitResult: RecordSubmitResult = (await submitRecord(this.props.node.id, data, this.props.initialData ? this.props.initialData.id : undefined));
			let recId = submitResult.recId;
			if(!recId) {
				// save error
				return;
			}
			this.isDataModified = false;
			this.recId = recId;
			if(!this.currentData.hasOwnProperty('id')) {
				this.currentData.id = recId;
				this.props.initialData.id = recId;
			}
			this.deleteBackup();
			//renew current data
			this.currentData = Object.assign(this.currentData, data);
			//renew initial data;
			window.crudJs.Stage.dataDidModified(this.currentData);

			for(var k in data) {
				var val = data[k];
				if(typeof val === 'object') {
					if($.isEmptyObject(val)) {
						this.props.initialData[k] = undefined;
					} else if(val._isAMomentObject) {
						this.props.initialData[k] = val.clone();
					} else if(Array.isArray(val)) {
						this.props.initialData[k] = val.concat();
					} else {
						this.props.initialData[k] = Object.assign({}, val);
					}
				} else {
					this.props.initialData[k] = val;
				}
			}
			await callForEachField(this.fieldsRefs, data, 'afterSave');

			await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_AFTER_SAVE, submitResult);


		} else {
			this.isDataModified = false;
			await callForEachField(this.fieldsRefs, data, 'afterSave');
		}

		if(!this.isPreventCloseFormAfterSave) {
			if(this.isSubForm()) {
				this.props.parentForm.valueSelected(this.currentData, true);
			} else {
				this.cancelClick();
			}
		}
	}

	isFieldVisibleByFormViewMask(field) {
		return (this.props.editable ? (field.show & 1) : (field.show & 4)) > 0;
	}

	render() {
		var node = this.props.node;
		if(!node) {
			return R.div({ className: 'field-lookup-loading-icon-container' },
				renderIcon('cog fa-spin fa-2x')
			);
		}

		var tabs;
		var fields = [];
		var data = this.currentData;
		var nodeFields = node.fields;

		var className = 'form form-full form-node-' + node.id + ' form-rec-' + this.recId;
		if(this.props.isCompact) {
			className += ' form-compact';
		}

		if(this.props.editable) {
			className += ' form-edit';
		}

		var forcedValues = this.props.filters;
		var currentTab;
		var currentTabName;

		for(var k in nodeFields) {
			let field = nodeFields[k];
			if(this.isFieldVisibleByFormViewMask(field)) {

				const ref = (ref) => {
					if(ref) {
						this.fieldsRefs[field.fieldName] = ref;
					} else {
						delete this.fieldsRefs[field.fieldName];
					}
				}

				if((field.fieldType === FIELD_TYPE.TAB) && (field.maxLength === 0) && !this.isSubForm()) {//tab
					var isDefaultTab;
					if(!tabs) {
						tabs = [];
						isDefaultTab = true;
					} else {
						isDefaultTab = false;
						fields = [];
					}

					var tabVisible;
					if(this.filters.hasOwnProperty('tab')) {
						tabVisible = (this.filters.tab === field.fieldName);
					} else {
						tabVisible = isDefaultTab;
					}

					currentTabName = field.fieldName;
					currentTab = React.createElement(FormTab, {
						key: field.id,
						ref,
						title: field.name,
						visible: tabVisible || this.showAllDebug || this.showAllTabs,
						highlightFrame: this.showAllDebug,
						field, form: this,
						fields
					});
					tabs.push(currentTab);
				} else if(this.props.editable || data[field.fieldName] || !field.storeInDB || (field.fieldType === FIELD_TYPE.LOOKUP_1toN) || field.fieldType >= 100) {
					var tf = React.createElement(FieldWrap, {
						ref,
						key: field.id,
						field,
						initialValue: data[field.fieldName],
						form: this, parentTabName: currentTabName,
						isEdit: this.props.editable,
						isCompact: this.props.isCompact,
						hidden: (this.hiddenFields.hasOwnProperty(field.fieldNamePure) || (forcedValues.hasOwnProperty(field.fieldNamePure))),
						fieldDisabled: this.isFieldDisabled(field.fieldNamePure) || forcedValues.hasOwnProperty(field.fieldNamePure)
					});

					fields.push(tf);
				}
			}
		}

		var isMainTab = (!this.filters.tab || (tabs[0].props.field.fieldName === this.filters.tab));

		if(this.props.isCompact) {
			fields.sort((a, b) => {

				var alow = (a.props.field.fieldType === FIELD_TYPE.LOOKUP_1toN || a.props.field.fieldType === FIELD_TYPE.LOOKUP_NtoM || a.props.field.fieldType === FIELD_TYPE.BOOL);
				var blow = (b.props.field.fieldType === FIELD_TYPE.LOOKUP_1toN || b.props.field.fieldType === FIELD_TYPE.LOOKUP_NtoM || b.props.field.fieldType === FIELD_TYPE.BOOL);
				if(alow !== blow) {
					if(alow) {
						return 1;
					} else {
						return -1
					}
				}
				var pa = a.props.field.lang;
				var pb = b.props.field.lang;

				if(pa !== pb) {
					if(!pa) return -1;
					if(!pb) return 1;
					if(pa && (pa > pb)) return 1;
					if(pa && (pa < pb)) return -1;
				}
				return a.props.field.index - b.props.field.index;
			});
		}

		var closeButton;
		var header;

		var deleteButton;
		var saveButton;
		var draftButton;
		/// #if DEBUG
		var nodeAdmin;
		/// #endif
		const isRestricted = isRecordRestrictedForDeletion(node.id, data.id);
		if(!this.props.inlineEditable) {
			if(data.isD && isMainTab && !this.props.preventDeleteButton) {
				deleteButton = R.button({
					className: isRestricted ? 'restricted clickable danger-button delete-button' : 'clickable danger-button delete-button', onClick: async () => {
						if(await deleteRecord(data.name, node.id, data.id)) {
							if(this.isSubForm()) {
								this.props.parentForm.valueSelected();
							} else {
								goBack(true);
							}
						}
					}, title: L('DELETE')
				}, renderIcon('trash'), this.isSubForm() ? '' : L('DELETE'));
			}

			const saveButtonLabel = node.storeForms ? (this.isSubForm() ? '' : (this.saveButtonTitle || L('SAVE'))) : node.matchName;

			if(this.props.editable) {
				if(!node.draftable || !isMainTab || this.disableDrafting || (data.id && !data.isP) || !(node.privileges & PRIVILEGES_MASK.PUBLISH)) {
					saveButton = R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick, title: saveButtonLabel }, this.isSubForm() ? renderIcon('check') : renderIcon(node.storeForms ? 'floppy-o' : node.icon), saveButtonLabel);
				} else {
					if(data.status === 1) {
						draftButton = R.button({ className: isRestricted ? 'clickable default-button unpublish-button restricted' : 'clickable default-button unpublish-button', onClick: () => { this.saveClick(true) }, title: L('UNPUBLISH') }, L('UNPUBLISH'));
						saveButton = R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick }, saveButtonLabel);
					} else {
						draftButton = R.button({ className: 'clickable default-button publish-button', onClick: () => { this.saveClick(true) }, title: L('SAVE_TEMPLATE') }, L('SAVE_TEMPLATE'));
						saveButton = R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick, title: L('PUBLISH') }, L('PUBLISH'));
					}
				}
			}
			/// #if DEBUG
			if(iAdmin()) {
				nodeAdmin = React.createElement(NodeAdmin, { form: this });
			}
			/// #endif
			if(!this.props.isCompact) {
				let headerContent = this.header || this.state.header || R.span(null, node.icon ? renderIcon(node.icon) : undefined, (this.recId === 'new') ?
					((node.storeForms ? (L('CREATE') + ' ') : undefined), (node.creationName || node.singleName)) :
					(this.state.data ? this.state.data.name : this.props.initialData.name));
				header = R.h4({ className: "form-header" }, headerContent);
			}

			if(!this.isCancelButtonHidden) {
				if(this.props.editable) {
					closeButton = React.createElement(HotkeyButton, { hotkey: 27, className: 'clickable default-button', onClick: this.cancelClick, title: L('CANCEL'), label: R.span(null, renderIcon('caret-left'), this.isSubForm() ? '' : L('CANCEL')) });
				} else {
					closeButton = React.createElement(HotkeyButton, { hotkey: 27, className: 'clickable default-button', onClick: this.cancelClick, label: R.span(null, renderIcon('caret-left'), this.isSubForm() ? '' : L('BACK')) });
				}
			}
		}

		let tabsHeader;
		if(tabs && tabs.length > 1) {
			tabsHeader = R.div({ className: 'header-tabs' }, tabs.map((tab) => {
				let tabField: FieldDesc = tab.props.field;
				return this.isFieldVisible(tabField.fieldName) ? R.span({ key: tabField.fieldName, }, R.span({
					className: tab.props.visible ? 'tab-header-button tab-header-button-active not-clickable' : 'tab-header-button tab-header-button-inactive clickable',
					onClick: tab.props.visible ? undefined : () => {
						this.setFormFilter('tab', tabField.fieldName);
					}
				}, renderIcon(tabField.icon), tabField.name)
					/// #if DEBUG
					, React.createElement(FieldAdmin, { field: tabField, form: this })
					/// #endif
				) : undefined;
			}));
		}

		return R.div({ className },
			/// #if DEBUG
			nodeAdmin,
			/// #endif
			header,
			tabsHeader,
			tabs || fields,
			R.div({ className: (this.state.footerHidden || this.props.inlineEditable) ? 'form-footer hidden' : 'form-footer' },
				deleteButton,
				draftButton,
				saveButton,
				closeButton
			)
		)
	}
}

export { FormFull };