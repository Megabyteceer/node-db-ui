
import { FieldWrap } from "../fields/field-wrap";
import { backupCreationData, CLIENT_SIDE_FORM_EVENTS, consoleLog, deleteRecord, getBackupData, goBack, isRecordRestrictedForDeletion, L, n2mValuesEqual, removeBackup, renderIcon, submitRecord } from "../utils";
import { FormTab } from "./form-tab";
import { eventProcessingMixins } from "./event-processing-mixins";
import { NodeAdmin } from "../admin/node-admin";
import { LoadingIndicator } from "../loading-indicator";
import { R } from "../r";
import { FIELD_TYPE_LOOKUP_NtoM_14, FIELD_TYPE_LOOKUP_1toN_15, FIELD_TYPE_TAB_17, FIELD_TYPE_BOOL_5, FIELD_TYPE_LOOKUP_7, PRIVILEGES_PUBLISH, RecId, RecordData } from "../bs-utils";
import React from "react";
import { iAdmin } from "../user";
import { HotkeyButton } from "../components/hotkey-button";

var backupCallback;

function tryBackup() {
	if(backupCallback) {
		backupCallback();
	}
}


window.addEventListener('unload', tryBackup);
setInterval(tryBackup, 15000);

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

class FormFull extends eventProcessingMixins {

	constructor(props) {
		super(props);
		this.currentData = Object.assign({}, props.filters, props.initialData);
		this.saveClick = this.saveClick.bind(this);

		this.showAllDebug = false;
		this.disableDrafting = false;
	}

	componentDidMount() {
		super.componentDidMount(); // TODO merge base class
		this.recoveryBackupIfNeed();
		this.onShow();
		backupCallback = this.backupCurrentDataIfNeed.bind(this);
		if(this.props.overrideOrderData >= 0) {
			if(this.getField('order')) {
				this.hideField('order');
			}
		}
	}

	recoveryBackupIfNeed() {
		if(!this.currentData.id && !this.props.inlineEditable) {
			var backup = getBackupData(this.props.node.id);
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
			if((f.fieldType === FIELD_TYPE_LOOKUP_1toN_15) && this.isFieldVisibleByFormViewMask(f)) {
				this.currentData[f.fieldName] = this.getField(f.fieldName).getBackupData();
			}
		}
	}

	backupCurrentDataIfNeed() {
		if(!this.currentData.id && !this.props.inlineEditable) {
			this.prepareToBackup();
			backupCreationData(this.props.node.id, this.currentData);
		}
	}

	deleteBackup() {
		removeBackup(this.props.node.id);
	}

	componentWillUnmount() {
		backupCallback = null;
		this.backupCurrentDataIfNeed();
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
			var fieldRef = this.fieldsRefs[k];
			if(!(fieldRef instanceof FieldWrap)) {
				continue;
			}
			var field = fieldRef.props.field;

			if(this.props.overrideOrderData >= 0 && field.fieldName === 'order') {
				this.currentData[field.fieldName] = this.props.overrideOrderData;
			}

			if(field.requirement && fieldRef.isEmpty()) {
				this.fieldAlert(field.fieldName, L('REQUIRED_FLD'), false, this.formIsValid);
				this.formIsValid = false;
			} else {
				this.fieldAlert(field.fieldName);
				let isValid = await this.checkUniqueValue(field, (!fieldRef.isEmpty()) && this.currentData[field.fieldName]);
				let isValid2 = await fieldRef.checkValidityBeforeSave(this.formIsValid);
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
				debugger;
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
						data.status = 2;
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

			if(!field.clientOnly) {
				if((field.fieldType === FIELD_TYPE_LOOKUP_NtoM_14)) {
					if(!n2mValuesEqual(this.props.initialData[field.fieldName], val)) {
						data[field.fieldName] = val.map(v => v.id);
					}
				} else if((field.fieldType === FIELD_TYPE_LOOKUP_7)) {

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
		if(Object.keys(data).length > 0) {
			let recId = await submitRecord(this.props.node.id, data, this.props.initialData ? this.props.initialData.id : undefined);
			this.recId = recId;
			if(!this.currentData.hasOwnProperty('id')) {
				this.currentData.id = recId;
				this.props.initialData.id = recId;
			}
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

			await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_AFTER_SAVE, recId);

			this.deleteBackup();
		} else {
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
		var currentCompactAreaName;
		var currentCompactAreaFields = [];
		var currentCompactAreaCounter = 0;

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

				if((field.fieldType === FIELD_TYPE_TAB_17) && (field.maxLength === 0) && !this.isSubForm()) {//tab
					currentCompactAreaCounter = 0;//terminate compact area nesting
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
				} else if(this.props.editable || data[field.fieldName] || field.noStore || (field.fieldType === FIELD_TYPE_LOOKUP_1toN_15) || field.fieldType >= 100) {
					var tf = React.createElement(FieldWrap, {
						ref,
						key: field.id,
						field,
						initialValue: data[field.fieldName],
						form: this, parentTabName: currentTabName,
						isEdit: this.props.editable,
						subFields: currentCompactAreaFields,
						parentCompactAreaName: currentCompactAreaName,
						isCompact: this.props.isCompact || (currentCompactAreaCounter > 0),
						hidden: (this.hiddenFields.hasOwnProperty(field.fieldNamePure) || (forcedValues.hasOwnProperty(field.fieldNamePure))),
						fieldDisabled: this.isFieldDisabled(field.fieldNamePure) || forcedValues.hasOwnProperty(field.fieldNamePure)
					});


					if((field.fieldType === FIELD_TYPE_TAB_17) && (field.maxLength >= 0) && !this.isSubForm()) {//compact area
						currentCompactAreaCounter = 0;//terminate compact area nesting
					}

					if(currentCompactAreaCounter > 0) {
						field.isCompactNested = true;
						currentCompactAreaFields.push(tf);
						currentCompactAreaCounter--;
						if(currentCompactAreaCounter === 0) {
							currentCompactAreaFields = [];
							currentCompactAreaName = undefined;
						}
					} else {
						fields.push(tf);
					}
					if((field.fieldType === FIELD_TYPE_TAB_17) && (field.maxLength >= 0) && !this.isSubForm()) {//compact area
						currentCompactAreaCounter = field.maxLength;
						currentCompactAreaName = field.fieldName;
					}
				}
			}
		}

		var isMainTab = (!this.filters.tab || (tabs[0].props.field.fieldName === this.filters.tab));

		if(this.props.isCompact) {
			fields.sort((a, b) => {

				var alow = (a.props.field.fieldType === FIELD_TYPE_LOOKUP_1toN_15 || a.props.field.fieldType === FIELD_TYPE_LOOKUP_NtoM_14 || a.props.field.fieldType === FIELD_TYPE_BOOL_5);
				var blow = (b.props.field.fieldType === FIELD_TYPE_LOOKUP_1toN_15 || b.props.field.fieldType === FIELD_TYPE_LOOKUP_NtoM_14 || b.props.field.fieldType === FIELD_TYPE_BOOL_5);
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
		var nodeAdmin;
		const isRestricted = isRecordRestrictedForDeletion(node.id, data.id);
		if(!this.props.inlineEditable) {
			if(data.isD && isMainTab && !this.props.preventDeleteButton) {
				deleteButton = R.button({
					className: isRestricted ? 'restricted clickable danger-button' : 'clickable danger-button', onClick: async () => {
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

			if(this.props.editable) {
				if(!node.draftable || !isMainTab || this.disableDrafting || (data.id && !data.isP) || !(node.privileges & PRIVILEGES_PUBLISH)) {
					saveButton = R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick, title: node.noStoreForms ? node.matchName : L('SAVE') }, this.isSubForm() ? renderIcon('check') : renderIcon(node.noStoreForms ? node.icon : 'floppy-o'), node.noStoreForms ? node.matchName : (this.isSubForm() ? '' : (this.saveButtonTitle || L('SAVE'))));
				} else {
					if(data.status === 1) {
						draftButton = R.button({ className: isRestricted ? 'clickable default-button restricted' : 'clickable default-button', onClick: () => { this.saveClick(true) }, title: L('UNPUBLISH') }, L('UNPUBLISH'));
						saveButton = R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick }, L('SAVE'));
					} else {
						draftButton = R.button({ className: 'clickable default-button', onClick: () => { this.saveClick(true) }, title: L('SAVE_TEMPLATE') }, L('SAVE_TEMPLATE'));
						saveButton = R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick, title: L('PUBLISH') }, L('PUBLISH'));
					}
				}
			}

			if(iAdmin()) {
				nodeAdmin = React.createElement(NodeAdmin, { form: this, x: 320, y: -40 });
			}


			if(!this.props.isCompact) {
				let headerContent = this.header || this.state.header || R.span(null, node.icon ? renderIcon(node.icon) : undefined, (this.recId === 'new') ?
					((node.noStoreForms ? undefined : L('CREATE') + ' '), (node.creationName || node.singleName)) :
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
		return R.div({ className },
			nodeAdmin,
			header,
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