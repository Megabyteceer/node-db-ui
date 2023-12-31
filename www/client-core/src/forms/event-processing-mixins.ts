import { CLIENT_SIDE_FORM_EVENTS, consoleLog, Filters, getData, L } from "../utils";
import { BaseForm } from "./base-form";
import { assert, FieldDesc, FIELD_TYPE, RecordData } from "../bs-utils";
import type { FieldWrap } from "../fields/field-wrap";
import ReactDOM from "react-dom";
import React from "react";

let eventsHandlers = [];

function registerEventHandler(classInstance) {
	const proto = classInstance.prototype;
	eventsHandlers.push(proto);
	const names = Object.getOwnPropertyNames(proto);
	for(let name of names) {
		if(name !== 'constructor') {
			const method = proto[name];
			if(typeof method === 'function') {
				FormEventProcessingMixins.prototype[name] = method;
			}
		}
	}
}

class FormEventProcessingMixins extends BaseForm {
	/** true if form opened for new record creation */
	isNewRecord: boolean;
	/** true if form opened for editing existing form */
	isUpdateRecord: boolean;

	saveButtonTitle: string;
	isCancelButtonHidden: boolean;

	/** previous value of changed field. Can be used in onChange event of field */
	prev_value: any;

	/**  says if field was changed by user's action. Can be used in onChange event of field */
	isUserEdit: boolean;

	currentData: RecordData;

	/** show all fields for debug purposes (hidden and field of another tabs) */
	showAllDebug: boolean;

	showAllTabs: boolean;

	/** set *true* - to make drafting buttons invisible. It is still possible do draft/publish records via api. */
	disableDrafting: boolean;

	/** contains validate() result */
	formIsValid: boolean;

	currentTabName: string;

	invalidAlertInOnSaveHandler: boolean;

	private disabledFields: { [key: string]: 1 | null };

	/** dont close form after it is saved */
	isPreventCloseFormAfterSave?: boolean;

	constructor(props) {
		super(props);
		this.recId = this.props.initialData.id || 'new';
		this.currentData = null;
		this.hiddenFields = {};
		this.disabledFields = {};
		this.currentTabName = null;
	}

	componentDidMount() {
		this.callOnTabShowEvent(this.props.filters.tab);
	}

	isFieldVisibleByFormViewMask(field) {
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

	callOnTabShowEvent(tabNameToShow) {
		if(this.currentTabName !== tabNameToShow) {
			this.currentTabName = tabNameToShow;
			var field;
			var nodeFields = this.props.node.fields;
			for(var k in nodeFields) {
				var f = nodeFields[k];
				if(this.isFieldVisibleByFormViewMask(f)) {
					if((f.fieldType === FIELD_TYPE.TAB) && (f.maxLength === 0)) {//tab
						if((tabNameToShow === f.fieldName) || !tabNameToShow) {
							field = f;
							break;
						}
					}
				}
			}

			if(field) {
				this.processFieldEvent(field.id, false, false);
			}
		}
	}

	hasField(fieldName) {
		return this.fieldsRefs.hasOwnProperty(fieldName)
	}

	getField(fieldName): FieldWrap {
		if(this.hasField(fieldName)) {
			return this.fieldsRefs[fieldName];
		} else {
			consoleLog('Unknown field: ' + fieldName);
		}
	}

	setFieldLabel(fieldName, label?) {
		this.getField(fieldName).setLabel(label);
	}

	_fieldsFromArgs(a: IArguments): string[] {
		let fields = Array.from(a);
		if(!fields.length) {
			fields = this.props.node.fields.map(i => i.fieldName);
		}
		return fields;
	}

	hideField(...fieldsNames: string[]) {
		let fields = this._fieldsFromArgs(arguments);
		for(let fieldName of fields) {
			if(this.hiddenFields[fieldName] !== 1) {
				this.hiddenFields[fieldName] = 1;
				var f = this.getField(fieldName);
				if(f) {
					f.hide();
				}
				if(f.props.field.fieldType === FIELD_TYPE.TAB) {
					this.forceUpdate();
				}
			}
		}
		this.refreshLeftBar();
	}

	showField(...fieldsNames: string[]) {
		let fields = this._fieldsFromArgs(arguments);
		for(let fieldName of fields) {
			if(this.hiddenFields[fieldName] === 1) {
				delete (this.hiddenFields[fieldName]);
				var f = this.getField(fieldName);
				if(f) {
					f.show();
				}
			}
		}
		this.refreshLeftBar();
	}

	isFieldVisible(fieldName: string) {
		return this.hiddenFields[fieldName] !== 1;
	}

	hideFooter() {
		this.setState({ footerHidden: true });
	}

	showFooter() {
		this.setState({ footerHidden: false });
	}

	disableField(fieldName) {
		if(this.disabledFields[fieldName] !== 1) {
			this.disabledFields[fieldName] = 1;
			var f = this.getField(fieldName);
			if(!f) {
				throw new Error('unknown field "' + fieldName + '"');
			}
			f.disable();
		}
	}

	enableField(fieldName) {
		if(this.disabledFields[fieldName] === 1) {
			delete (this.disabledFields[fieldName]);
			this.getField(fieldName).enable();
		}
	}

	makeFieldRequired(fieldName, required = true) {
		this.getField(fieldName).makeFieldRequired(required);
	}

	isFieldDisabled(fieldName) {
		return (this.disabledFields[fieldName] === 1);
	}

	addLookupFilters(fieldName: string, filtersObjOrName: Filters);
	addLookupFilters(fieldName: string, filtersObjOrName: string, val: any);
	addLookupFilters(fieldName: string, filtersObjOrName: string | Filters, val?: any) {
		this.getField(fieldName).setLookupFilter(filtersObjOrName, val);
	}

	focusField(fieldName) {
		this.getField(fieldName).focus();
	}

	async onShow() {
		this.header = '';
		this.currentTabName = null;
		this.hiddenFields = {};
		this.disabledFields = {};
		await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_LOAD);
		this.refreshLeftBar();

		for(var k in this.fieldsRefs) {
			var f = this.fieldsRefs[k];
			if(f.props.field.fieldType !== FIELD_TYPE.BUTTON && f.props.field.fieldType !== FIELD_TYPE.TAB) {
				await this.processFieldEvent(f.props.field, false);
			}
		}

		var hdr = this.header;
		if((this.state.header || '') != hdr) {
			this.setState({ header: hdr });
		}

		if(this.props.filters && this.props.filters.tab) {
			this.callOnTabShowEvent(this.props.filters.tab);
		}
	}

	getFieldDomElement(fieldName: string): HTMLDivElement {
		const formElement = ReactDOM.findDOMNode(this) as HTMLDivElement;
		return formElement.querySelector('.field-container-id-' + this.getField(fieldName).props.field.id) as HTMLDivElement;
	}

	renderToField(fieldName: string, containerClassName: string, reactContent: React.ReactElement) {
		const el = this.getFieldDomElement(fieldName);
		let container = el.querySelector('.' + containerClassName);
		if(!container) {
			container = document.createElement('SPAN');
			container.className = containerClassName;
			el.appendChild(container);
		}
		ReactDOM.render(reactContent, container);
	}

	save() {
		//@ts-ignore
		this.saveClick();
	}

	refreshLeftBar() {
		this.forceUpdate();
	}

	async setFieldValue(fieldName: string, val: any, isUserAction = false) {

		var f = this.getField(fieldName);
		if(!f) {
			return; // prevent crash on unmount values debouncing
		}
		let field = f.props.field;

		if(this.currentData[fieldName] !== val) {
			if(!isUserAction) {
				f.setValue(val);
			}
			if(isUserAction) {
				this.isDataModified = true;
				if(this.isSubForm()) {
					this.props.parentForm.props.form.isDataModified = true;
				}
			}
			var prev_value = this.currentData[fieldName];
			this.currentData[fieldName] = val;

			await this.processFieldEvent(field, isUserAction, prev_value);

			this.checkUniqueValue(field, val);
		}
	}

	async checkUniqueValue(field, val) {
		if(field.unique && val) {
			let data = await getData('api/uniqueCheck', {
				fieldId: field.id,
				nodeId: field.node.id,
				recId: (this.recId !== 'new') && this.recId,
				val
			}, undefined, true);
			if(!data) {
				this.fieldAlert(field.fieldName, L('VALUE_EXISTS'), false, true);
				return false;
			} else {
				this.fieldAlert(field.fieldName, undefined, true);
			}
		}
		return true;
	}

	fieldValue(fieldName) {
		return this.currentData[fieldName];
	}

	isFieldEmpty(fieldName) {
		var v = this.fieldValue(fieldName);
		if(Array.isArray(v)) {
			return v.length === 0;
		}
		if(v) {
			return false;
		}
		return this.getField(fieldName).isEmpty();
	}

	async onSave() {
		/// #if DEBUG
		consoleLog('onSave ' + this.props.node.tableName + ': ' + this.props.initialData.id);
		/// #endif

		for(var k in this.props.node.fields) {
			if(this.hasField(k)) {//hide all alerts
				this.fieldAlert(this.props.node.fields[k].fieldName);
			}
		}

		this.invalidAlertInOnSaveHandler = false;
		var onSaveRes = await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_SAVE);
		return onSaveRes || this.invalidAlertInOnSaveHandler;
	}

	fieldAlert(fieldName: string, text: string = '', isSuccess?: boolean, focus: boolean = !isSuccess) {
		assert(fieldName, "fieldName expected");
		var f = this.getField(fieldName);
		if(f) {
			if(typeof isSuccess === 'undefined') {
				isSuccess = !Boolean(text);
			}
			f.fieldAlert(text, isSuccess, focus);
			if(!isSuccess) {
				this.invalidAlertInOnSaveHandler = true;
			}
		}
	}

	_getFormEventHandler(eventName: CLIENT_SIDE_FORM_EVENTS) {
		let name = this.props.node.tableName + '_' + eventName;
		return this._getEventHandler(name);
	}

	_getFieldEventHandler(field: FieldDesc) {
		let name = this.props.node.tableName + '_' + field.fieldName + '_' + CLIENT_SIDE_FORM_EVENTS.ON_FIELD_CHANGE;
		return this._getEventHandler(name);
	}

	_getEventHandler(name) {
		let ret = eventsHandlers.filter(i => i.hasOwnProperty(name)).map(i => i[name]);
		return ret.length > 0 && ret;
	}

	processFieldEvent(field: FieldDesc, isUserAction?: boolean, prev_val?) {
		return this.processEvent(this._getFieldEventHandler(field), isUserAction, prev_val);
	}

	/** @argument arg - result of server side onSave event handler */
	processFormEvent(eventName: CLIENT_SIDE_FORM_EVENTS, arg?: any) {
		return this.processEvent(this._getFormEventHandler(eventName), undefined, undefined, arg);
	}

	async processEvent(handlers, isUserAction = false, prev_val = undefined, arg?: any) {
		var ret;
		if(handlers) {
			for(var handler of handlers) {
				this.prev_value = prev_val;
				this.recId = this.props.initialData.id || 'new';
				this.isUpdateRecord = this.props.editable;
				if(this.isUpdateRecord) {
					this.isNewRecord = !this.props.initialData.hasOwnProperty('id');
					if(this.isNewRecord) {
						this.isUpdateRecord = false;
					}
				}
				this.isUserEdit = isUserAction;
				ret = (await handler.call(this, arg)) || ret;
			}
		}
		return ret;
	}
}

export { FormEventProcessingMixins, registerEventHandler };