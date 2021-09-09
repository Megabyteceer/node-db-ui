
import { FieldWrap } from "../fields/field-wrap";
import { backupCreationData, consoleLog, deleteRecord, getBackupData, goBack, L, n2mValuesEqual, removeBackup, renderIcon, submitRecord } from "../utils";
import { FormTab } from "./form-tab";
import { eventProcessingMixins } from "./event-processing-mixins";
import { NodeAdmin } from "../admin/node-admin";
import { LoadingIndicator } from "../loading-indicator";
import { R } from "../r";
import { FIELD_14_NtoM, FIELD_15_1toN, FIELD_17_TAB, FIELD_5_BOOL, FIELD_7_Nto1, PREVS_PUBLISH, RecId, RecordData } from "../bs-utils";
import React from "react";
import { iAdmin } from "../user";

var backupCallback;

function tryBackup() {
	if(backupCallback) {
		backupCallback();
	}
}


window.addEventListener('unload', tryBackup);
setInterval(tryBackup, 15000);

async function callForEachField(fieldRefs, data, functionName) {
	await Promise.all(Object.keys(fieldRefs).map(async (k) => {
		let f = fieldRefs[k];
		var fieldName = f.props.field.fieldName;
		let newValue = await f[functionName]();
		if((typeof newValue !== 'undefined') && (f.props.initialValue !== newValue)) {
			data[fieldName] = newValue;
		}
	}));
}

class FormFull extends eventProcessingMixins {

	constructor(props) {
		super(props);
		this.currentData = Object.assign({}, props.filters, props.initialData);
		this.saveClick = this.saveClick.bind(this);

		this.showAllDebug = false;
		this.disableDrafting = false;
		this.onSaveCallback = null;
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

	componentDidUpdate() {
		if(this._isNeedCallOnload) {
			this.recoveryBackupIfNeed();
			this.onShow();
			this._isNeedCallOnload = false;
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
			if((f.fieldType === FIELD_15_1toN) && this.isVisibleField(f)) {
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

	deteleBackup() {
		removeBackup(this.props.node.id);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		super.UNSAFE_componentWillReceiveProps(nextProps); //TODO merge with super class
		consoleLog('receive props; ' + this.props.node.tableName);
		if((this.currentData.id !== nextProps.initialData.id) || (this.props.node !== nextProps.node) || (this.props.editable !== nextProps.editable)) {

			this.backupCurrentDataIfNeed();

			this._isNeedCallOnload = true;
			this.currentData = Object.assign({}, nextProps.filters, nextProps.initialData);
			this.resendDataToFields();
		}
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
			f.forceBouncingTimeout();
		}
	}

	async saveForm(): Promise<boolean> {
		if(this.props.editable) {
			return this.saveClick('keepStatus');
		}
	}

	async validate() {
		this.formIsValid = true;
		if(await this.onSave()) {
			this.formIsValid = false;
			return
		}

		for(let k in this.fieldsRefs) {
			var fieldRef = this.fieldsRefs[k];
			var field = fieldRef.props.field;

			if(this.props.overrideOrderData >= 0 && field.fieldName === 'order') {
				this.currentData[field.fieldName] = this.props.overrideOrderData;
			}

			if(field.requirement && fieldRef.isEmpty()) {
				this.fieldAlert(field.fieldName, L('REQUIRED_FLD'), false, this.formIsValid);
				this.formIsValid = false;
			} else {
				this.fieldAlert(field.fieldName);
				let isValid = await this.checkUniquValue(field, (!fieldRef.isEmpty()) && this.currentData[field.fieldName]);
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
			var field = fieldRef.props.field;

			var val = this.currentData[field.fieldName];

			if(!field.clientOnly) {
				if((field.fieldType === FIELD_14_NtoM)) {
					if(!n2mValuesEqual(this.props.initialData[field.fieldName], val)) {
						data[field.fieldName] = val.map(v => v.id);
					}
				} else if((field.fieldType === FIELD_7_Nto1)) {

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

			if(!this.currentData.hasOwnProperty('id')) {
				this.currentData.id = recId;
				this.props.initialData.id = recId;
			}

			//renew current data
			this.currentData = Object.assign(this.currentData, data);
			//renew initial data;
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

			this.rec_ID = this.currentData.id;
			this.deteleBackup();
			if(this.onSaveCallback) {
				await this.onSaveCallback();
			}
		} else {
			await callForEachField(this.fieldsRefs, data, 'afterSave');
		}

		if(this.isSubForm()) {

			this.props.parentForm.valueChoosed(this.currentData, true);
		} else {
			this.cancelClick();
		}
	}

	isVisibleField(field) {
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
		var flds = node.fields;

		var className = 'form-full form-node-' + node.id;
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

		for(var k in flds) {
			var field = flds[k];
			if(this.isVisibleField(field)) {
				if((field.fieldType === FIELD_17_TAB) && (field.maxlen === 0) && !this.isSubForm()) {//tab
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
						title: field.name,
						visible: tabVisible || this.showAllDebug || this.showAllTabs,
						highlightFrame: this.showAllDebug,
						field, form: this,
						fields
					});
					tabs.push(currentTab);
				} else if(this.props.editable || data[field.fieldName] || field.nostore || (field.fieldType === FIELD_15_1toN) || field.fieldType >= 100) {
					var tf = React.createElement(FieldWrap, {
						key: field.id,
						field,
						initialValue: data[field.fieldName],
						form: this, parentTabName: currentTabName,
						isEdit: this.props.editable,
						subFields: currentCompactAreaFields,
						parentCompactAreaName: currentCompactAreaName,
						isCompact: this.props.isCompact || (currentCompactAreaCounter > 0),
						hidden: (this.hiddenFields.hasOwnProperty(field.fieldName) || (forcedValues.hasOwnProperty(field.fieldName))),
						fieldDisabled: this.isFieldDisabled(field.fieldName) || forcedValues.hasOwnProperty(field.fieldName)
					});


					if((field.fieldType === FIELD_17_TAB) && (field.maxlen >= 0) && !this.isSubForm()) {//compact area
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
					if((field.fieldType === FIELD_17_TAB) && (field.maxlen >= 0) && !this.isSubForm()) {//compact area
						currentCompactAreaCounter = field.maxlen;
						currentCompactAreaName = field.fieldName;
					}
				}
			}
		}

		var isMainTab = (!this.filters.tab || (tabs[0].props.field.fieldName === this.filters.tab));

		if(this.props.isCompact) {
			fields.sort((a, b) => {

				var alow = (a.props.field.fieldType === FIELD_15_1toN || a.props.field.fieldType === FIELD_14_NtoM || a.props.field.fieldType === FIELD_5_BOOL);
				var blow = (b.props.field.fieldType === FIELD_15_1toN || b.props.field.fieldType === FIELD_14_NtoM || b.props.field.fieldType === FIELD_5_BOOL);
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
		if(!this.props.inlineEditable) {
			if(data.isD && isMainTab && !this.props.preventDeleteButton) {
				deleteButton = R.button({
					className: 'clickable danger-button', onClick: async () => {
						await deleteRecord(data.name, node.id, data.id);
						if(this.isSubForm()) {
							this.props.parentForm.valueChoosed();
						} else {
							goBack(true);
						}
					}, title: L('DELETE')
				}, renderIcon('trash'), this.isSubForm() ? '' : L('DELETE'));
			}

			if(this.props.editable) {
				if(!node.draftable || !isMainTab || this.disableDrafting || (data.id && !data.isP) || !(node.prevs & PREVS_PUBLISH)) {
					saveButton = R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick, title: L('SAVE') }, this.isSubForm() ? renderIcon('check') : renderIcon('floppy-o'), this.isSubForm() ? '' : L('SAVE'));
				} else {
					if(data.status === 1) {
						draftButton = R.button({ className: 'clickable default-button', onClick: () => { this.saveClick(true) }, title: L('UNPUBLISH') }, L('UNPUBLISH'));
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
				let headerContent = this.header || this.state.header || R.span(null, node.icon ? renderIcon(node.icon) : undefined, node.singleName);

				header = R.h4({ className: "form-header" }, headerContent);
			}

			if(this.props.editable) {
				closeButton = R.button({ className: 'clickable default-button', onClick: this.cancelClick, title: L('CANCEL') }, renderIcon('caret-left'), this.isSubForm() ? '' : L('CANCEL'));
			} else {
				closeButton = R.button({ className: 'clickable default-button', onClick: this.cancelClick }, renderIcon('caret-left'), this.isSubForm() ? '' : L('BACK'));
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