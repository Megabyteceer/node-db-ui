import {consoleLog, getData, L} from "../utils.js";
import BaseForm from "./form-mixins.js";
import {formsEventsOnLoad, formsEventsOnSave} from "../events/forms_events.js";
import fieldsEvents from "../events/fields_events.js";
import LeftBar from "../left-bar.js";

export default class eventProcessingMixins extends BaseForm {

	constructor(props) {
		super(props);
		this.resetFieldsProperties();
	}

	componentDidMount() {
		this.callOnTabShowEvent(this.props.filters.tab);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		super.UNSAFE_componentWillReceiveProps(nextProps);
		if(nextProps.initialData.id !== this.props.initialData.id) {
			this.state = {};
			this.resetFieldsProperties(true);
			this.forceUpdate();
		}
		setTimeout(() => {
			this.callOnTabShowEvent(nextProps.filters.tab);
			this.timeout = null;
		}, 0);
	}

	resetFieldsProperties(needCallOnload) {
		this.hiddenFields = {};
		this.disabledFields = {};
		this.currentTabName = -1;
		delete (this.onSaveCallback);
		this.needCallOnload = needCallOnload;
	}

	saveForm(callback, callbackInvalid) {
		if(this.props.editable) {
			if(!callback) {
				callback = () => { };
			}
			this.saveClick('keepStatus', callback, callbackInvalid);
		}
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

			if(field && fieldsEvents.hasOwnProperty(field.id)) {
				this.processFormEvent(fieldsEvents[field.id], false, false);
			}
		}
	}

	hasField(fieldName) {
		return this.fieldsRefs.hasOwnProperty(fieldName)
	}

	getField(fieldName) {
		if(this.hasField(fieldName)) {
			return this.fieldsRefs[fieldName];
		} else {
			consoleLog('Unknown field: ' + fieldName);
		}
	}

	setFieldLabel(fieldName, label) {
		this.getField(fieldName).setLabel(label);
	}

	_fieldsFromArgs(a) {
		let fields = Array.from(a);
		if(!fields.length) {
			fields = this.props.node.fields.map(i => i.fieldName);
		}
		return fields;
	}

	hideField() {
		let fields = this._fieldsFromArgs(arguments);
		for(let fieldName of fields) {
			var f = this.getField(fieldName);
			if(f && (this.hiddenFields[fieldName] !== 1)) {
				this.hiddenFields[fieldName] = 1;
				f.hide();
			}
		}
	}

	showField() {
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
		this.setState({footerHidden: true});
	}

	showFooter() {
		this.setState({footerHidden: false});
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

	addLookupFilters(fieldName, filtersObjOrName, val) {
		this.getField(fieldName).setLookupFilter(filtersObjOrName, val);
	}

	focusField(fieldName) {

		this.getField(fieldName).focus();
	}

	onShow() {
		//DEBUG
		consoleLog('onLoad ' + this.props.node.tableName);
		//ENDDEBUG
		this.header = '';
		this.currentTabName = -1;
		this.hiddenFields = {};
		this.disabledFields = {};

		if(formsEventsOnLoad.hasOwnProperty(this.props.node.id)) {
			this.processFormEvent(formsEventsOnLoad[this.props.node.id], false);
		}

		this.refreshLeftBar();

		for(var k in this.fieldsRefs) {
			var f = this.fieldsRefs[k];

			if(f.props.field.fieldType !== FIELD_18_BUTTON && f.props.field.fieldType !== FIELD_17_TAB) { //is not button
				if(fieldsEvents.hasOwnProperty(f.props.field.id)) {
					this.processFormEvent(fieldsEvents[f.props.field.id], false);
				}
			}
		}

		var hdr = this.header;
		if(this.state.header !== hdr) {
			this.setState({header: hdr});
		}

		if(this.props.filters && this.props.filters.tab) {
			this.callOnTabShowEvent(this.props.filters.tab);
		}

	}

	refreshLeftBar() {
		if(!this.isSlave()) {
			if((typeof (this.currentData) !== 'array') && this.currentData.id && !this.showAllTabs) {
				var items = [this.currentData.name || L('NEW', this.props.node.singleName)];
				var isDefault = true;
				var fields = this.props.node.fields
				for(var k in fields) {
					var f = fields[k];

					if((f.fieldType === FIELD_17_TAB) && (f.maxlen === 0)) {//tab

						if(this.isVisibleField(f)) {

							items.push({icon: f.icon, subheader: (f.fieldName.indexOf('header_') === 0), name: f.name, field: f, form: this, id: false, isDoc: 1, isDefault: isDefault, tabId: f.id, tab: f.fieldName});
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

	setFieldValue(fieldName, val, isUserAction) {

		var f = this.getField(fieldName);
		let field = f.props.field;

		if(this.currentData[fieldName] !== val) {
			if(!isUserAction) {
				f.setValue(val);
			}
			var prev_value = this.currentData[fieldName];
			this.currentData[fieldName] = val;

			if(fieldsEvents.hasOwnProperty(field.id)) {
				this.processFormEvent(fieldsEvents[field.id], isUserAction, prev_value);
			}
			//DEBUG
			consoleLog('onChange ' + fieldName + '; ' + prev_value + ' -> ' + val);
			//ENDDEBUG
			this.checkUniquValue(field, val);

			if(fieldName === 'name') {
				this.refreshLeftBar();
			}
		}
	}

	async checkUniquValue(field, val, callback) {
		if(field.uniqu) {
			return getData('api/uniquCheck', {
				fieldId: field.id,
				nodeId: field.node.id,
				recId: (this.rec_ID !== 'new') && this.rec_ID,
				val
			}, (data) => {
				if(!data) {
					this.fieldAlert(field.fieldName, L('VALUE_EXISTS'), false, true);
				} else {
					this.fieldAlert(field.fieldName, L('VALUE_CORRECT'), true);
				}
				callback && callback(data);
			}, undefined, undefined, true);
		} else {
			callback && callback(true);
		}
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

	onSave() {
		//DEBUG
		consoleLog('onSave ' + this.props.node.tableName);
		//ENDDEBUG			

		for(var k in this.props.node.fields) {
			if(this.hasField(k)) {//hide all alerts
				this.fieldAlert(this.props.node.fields[k].fieldName);
			}
		}

		this.invalidAlertInOnSaveHandler = false;
		if(formsEventsOnSave.hasOwnProperty(this.props.node.id)) {
			var onSaveRes = this.processFormEvent(formsEventsOnSave[this.props.node.id], false);
			if(onSaveRes) {
				//debugError('onSave event handler returned true. Saving operation was canceled.');
			}
			return onSaveRes || this.invalidAlertInOnSaveHandler;
		}
		return false;
	}

	fieldAlert(fieldName, text, isSuccess, focus) {
		assert(fieldName, "fieldName expected");
		var f = this.getField(fieldName);
		if(f && f.props.parentCompactAreaName) {
			f = this.getField(f.props.parentCompactAreaName);
		}
		if(f) {
			f.fieldAlert(text, isSuccess, focus);

			if(text && !isSuccess && !this.invalidAlertInOnSaveHandler) {
				this.getField(fieldName).focus();
			}

			if(!isSuccess) {
				this.invalidAlertInOnSaveHandler = true;
			}


		}
	}

	processFormEvent(handler, isUserAction, prev_val) {

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