import { consoleLog, Filters, getData, L, ON_FIELD_CHANGE, ON_FORM_LOAD, ON_FORM_SAVE } from "../utils";
import { BaseForm } from "./base-form";
import { LeftBar } from "../left-bar";
import { assert, FieldDesc, FIELD_17_TAB, FIELD_18_BUTTON, RecId, RecordData } from "../bs-utils";
import { FieldWrap } from "../fields/field-wrap";

let FormEvents;
let FieldsEvents;

import("../events/forms_events").then((m) => {
	FormEvents = m.FormEvents;
});
import("../events/fields_events").then((m) => {
	FieldsEvents = m.FieldsEvents;
});

let isHandlersInitialized;

class eventProcessingMixins extends BaseForm {
	/** true if form opened for new record creation */
	rec_creation: boolean;
	/** true if form opened for editing existing form */
	rec_update: boolean;

	/** id of current edited/shown record. 'new' - if record is not saved yet.*/
	rec_ID: RecId | 'new';

	/** previous value of changed field. Can be used in onChage event of field */
	prev_value: any;

	/**  says if field was changed by user's action. Can be used in onChage event of field */
	isUserEdit: boolean;

	currentData: RecordData;

	/** show all fields for debug purposes (hidden and field of another tabs) */
	showAllDebug: boolean;

	showAllTabs: boolean;

	/** set *true* - to make drafting buttons invisible. It is still possible do draft/publish records via api. */
	disableDrafting: boolean;

	/** contains validate() result */
	formIsValid: boolean;

	protected _isNeedCallOnload: boolean;

	onSaveCallback: () => void;

	currentTabName: string;

	private invalidAlertInOnSaveHandler: boolean;

	private disabledFields: { [key: string]: 1 | null };

	isListItem?: boolean;

	constructor(props) {
		super(props);

		if(!isHandlersInitialized) {

			for(let h of [FormEvents, FieldsEvents]) {
				const proto = h.prototype;
				const names = Object.getOwnPropertyNames(proto);
				for(let name of names) {
					if(name !== 'constructor') {
						const method = proto[name];
						if(typeof method === 'function') {
							assert(!eventProcessingMixins.prototype[name], FormEvents.name + " contains wrong method name: " + name);
							eventProcessingMixins.prototype[name] = method;
						}
					}
				}
				FieldsEvents.prototype;
				isHandlersInitialized = true;
			}
		}


		this.currentData = null;
		this.onSaveCallback = null;
		this.resetFieldsProperties();
	}

	componentDidMount() {
		if(!this.isListItem) {
			this.callOnTabShowEvent(this.props.filters.tab);
		}
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		super.UNSAFE_componentWillReceiveProps(nextProps);
		this.showAllTabs = false;
		if(nextProps.initialData.id !== this.props.initialData.id) {
			//@ts-ignore
			this.state = {};
			this.resetFieldsProperties(true);
			this.forceUpdate();
		}
		setTimeout(() => {
			this.callOnTabShowEvent(nextProps.filters.tab);
		}, 0);
	}

	resetFieldsProperties(_isNeedCallOnload?: boolean) {
		this.hiddenFields = {};
		this.disabledFields = {};
		this.currentTabName = null;
		this.onSaveCallback = null;
		this._isNeedCallOnload = _isNeedCallOnload;
	}

	isVisibleField(field) {
		return true;
	}

	callOnTabShowEvent(tabNameToShow) {
		if(this.currentTabName !== tabNameToShow) {
			this.currentTabName = tabNameToShow;
			var field;
			var flds = this.props.node.fields;
			for(var k in flds) {
				var f = flds[k];
				if(this.isVisibleField(f)) {
					if((f.fieldType === FIELD_17_TAB) && (f.maxlen === 0)) {//tab
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

	setFieldLabel(fieldName, label) {
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
			var f = this.getField(fieldName);
			if(f && (this.hiddenFields[fieldName] !== 1)) {
				this.hiddenFields[fieldName] = 1;
				f.hide();
			}
		}
	}

	showField(...fieldsNames: string[]) {
		let fields = this._fieldsFromArgs(arguments);
		for(let fieldName of fields) {
			if(this.hiddenFields[fieldName] === 1) {
				delete (this.hiddenFields[fieldName]);
				this.getField(fieldName).show();
			}
		}
	}

	isFieldVisible(fieldName) {
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
		await this.processFormEvent(ON_FORM_LOAD);
		this.refreshLeftBar();

		for(var k in this.fieldsRefs) {
			var f = this.fieldsRefs[k];
			if(f.props.field.fieldType !== FIELD_18_BUTTON && f.props.field.fieldType !== FIELD_17_TAB) {
				await this.processFieldEvent(f.props.field, false);
			}
		}

		var hdr = this.header;
		if(this.state.header !== hdr) {
			this.setState({ header: hdr });
		}

		if(this.props.filters && this.props.filters.tab) {
			this.callOnTabShowEvent(this.props.filters.tab);
		}
	}

	refreshLeftBar() {
		if(!this.isSubForm()) {
			if(!Array.isArray(this.currentData) && this.currentData.id && !this.showAllTabs) {
				var items = [this.currentData.name || L('NEW', this.props.node.singleName)];
				var isDefault = true;
				var fields = this.props.node.fields
				for(var k in fields) {
					var f = fields[k];

					if((f.fieldType === FIELD_17_TAB) && (f.maxlen === 0)) {//tab

						if(this.isVisibleField(f)) {

							items.push({ icon: f.icon, name: f.name, field: f, form: this, id: false, isDoc: 1, isDefault: isDefault, tabId: f.id, tab: f.fieldName });
							isDefault = false;

						}

					}

				}

				LeftBar.instance.setLeftBar(items);
			} else {
				LeftBar.instance.setLeftBar();
			}
		}
	}

	async setFieldValue(fieldName: string, val: any, isUserAction = false) {

		var f = this.getField(fieldName);
		let field = f.props.field;

		if(this.currentData[fieldName] !== val) {
			if(!isUserAction) {
				f.setValue(val);
			}
			var prev_value = this.currentData[fieldName];
			this.currentData[fieldName] = val;

			await this.processFieldEvent(field, isUserAction, prev_value);

			this.checkUniquValue(field, val);

			if(fieldName === 'name') {
				this.refreshLeftBar();
			}
		}
	}

	async checkUniquValue(field, val) {
		if(field.uniqu && val) {
			let data = await getData('api/uniquCheck', {
				fieldId: field.id,
				nodeId: field.node.id,
				recId: (this.rec_ID !== 'new') && this.rec_ID,
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
		//DEBUG
		consoleLog('onSave ' + this.props.node.tableName + ': ' + this.props.initialData.id);
		//ENDDEBUG			

		for(var k in this.props.node.fields) {
			if(this.hasField(k)) {//hide all alerts
				this.fieldAlert(this.props.node.fields[k].fieldName);
			}
		}

		this.invalidAlertInOnSaveHandler = false;
		var onSaveRes = await this.processFormEvent(ON_FORM_SAVE);
		return onSaveRes || this.invalidAlertInOnSaveHandler;
	}

	fieldAlert(fieldName: string, text: string = '', isSuccess?: boolean, focus?: boolean) {
		assert(fieldName, "fieldName expected");
		var f = this.getField(fieldName);
		if(f && f.props.parentCompactAreaName) {
			f = this.getField(f.props.parentCompactAreaName);
		}
		if(f) {
			f.fieldAlert(text, isSuccess, focus);
			if(!isSuccess) {
				this.invalidAlertInOnSaveHandler = true;
			}
		}
	}

	_getFormEventHandler(eventName) {
		return FormEvents.prototype[this.props.node.tableName + '_' + eventName];
	}

	_getFieldEventHandler(field: FieldDesc) {
		return FieldsEvents.prototype[this.props.node.tableName + '_' + field.fieldName + '_' + ON_FIELD_CHANGE];
	}

	async processFieldEvent(field: FieldDesc, isUserAction?: boolean, prev_val?) {
		return this.processEvent(this._getFieldEventHandler(field), isUserAction, prev_val);
	}

	async processFormEvent(eventName) {
		return this.processEvent(this._getFormEventHandler(eventName));
	}

	async processEvent(handler, isUserAction = false, prev_val = undefined) {
		if(handler) {
			this.prev_value = prev_val;
			this.rec_ID = this.props.initialData.id || 'new';
			this.rec_update = this.props.editable;
			if(this.rec_update) {
				this.rec_creation = !this.props.initialData.hasOwnProperty('id');
				if(this.rec_creation) {
					this.rec_update = false;
				}
			}
			this.isUserEdit = isUserAction;
			return handler.call(this);
		}
	}
}

export { eventProcessingMixins };