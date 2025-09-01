import { render, type ComponentChild } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { assert, throwError, validateFieldName } from '../assert';
import type { FieldDesc, GetRecordsFilter, RecordData } from '../bs-utils';
import type { FieldWrap } from '../fields/field-wrap';
import { CLIENT_SIDE_FORM_EVENTS, consoleLog, getData, L } from '../utils';
import { BaseForm } from './base-form';

const eventsHandlers = [];

function registerEventHandler(classInstance) {
	const proto = classInstance.prototype;
	eventsHandlers.push(proto);
	const names = Object.getOwnPropertyNames(proto);
	for (const name of names) {
		if (name !== 'constructor') {
			const method = proto[name];
			if (typeof method === 'function') {
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

	/** previous value of changed field. Can be used in onInput event of field */
	prev_value: any;

	/**  says if field was changed by user's action. Can be used in onInput event of field */
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

	isFieldVisibleByFormViewMask(_field) {
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
			const nodeFields = this.props.node.fields;
			for (const k in nodeFields) {
				const f = nodeFields[k];
				if (this.isFieldVisibleByFormViewMask(f)) {
					if (f.fieldType === FIELD_TYPE.TAB && f.maxLength === 0) {
						//tab
						if (tabNameToShow === f.fieldName || !tabNameToShow) {
							field = f;
							break;
						}
					}
				}
			}

			if (field) {
				this.processFieldEvent(field.id, false, false);
			}
		}
	}

	hasField(fieldName) {
		validateFieldName(fieldName);
		return this.fieldsRefs.hasOwnProperty(fieldName);
	}

	getField(fieldName): FieldWrap {
		validateFieldName(fieldName);
		if (this.hasField(fieldName)) {
			return this.fieldsRefs[fieldName];
		} else {
			throwError('Unknown field: ' + fieldName);
		}
	}

	setFieldLabel(fieldName: string, label?) {
		validateFieldName(fieldName);
		this.getField(fieldName).setLabel(label);
	}

	hideField(...fieldsNames: string[]) {
		for (const fieldName of fieldsNames) {
			validateFieldName(fieldName);
			if (this.hiddenFields[fieldName] !== 1) {
				this.hiddenFields[fieldName] = 1;
				const f = this.getField(fieldName);
				if (f) {
					f.hide();
				}
				if (f.props.field.fieldType === FIELD_TYPE.TAB) {
					this.forceUpdate();
				}
			}
		}
		this.refreshLeftBar();
	}

	showField(...fieldsNames: string[]) {
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

	disableField(fieldName) {
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

	enableField(fieldName) {
		validateFieldName(fieldName);
		if (this.disabledFields[fieldName] === 1) {
			delete this.disabledFields[fieldName];
			this.getField(fieldName).enable();
		}
	}

	makeFieldRequired(fieldName, required = true) {
		validateFieldName(fieldName);
		this.getField(fieldName).makeFieldRequired(required);
	}

	isFieldDisabled(fieldName) {
		validateFieldName(fieldName);
		return this.disabledFields[fieldName] === 1;
	}

	addLookupFilters(fieldName: string, filtersObjOrName: GetRecordsFilter);
	addLookupFilters(fieldName: string, filtersObjOrName: string, val: any);
	addLookupFilters(fieldName: string, filtersObjOrName: string | GetRecordsFilter, val?: any) {
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

		for (const k in this.fieldsRefs) {
			const f = this.fieldsRefs[k];
			if (
				f.props.field.fieldType !== FIELD_TYPE.BUTTON &&
				f.props.field.fieldType !== FIELD_TYPE.TAB
			) {
				await this.processFieldEvent(f.props.field, false);
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

	getFieldDomElement(fieldName: string): HTMLDivElement {
		const formElement = this.base as HTMLDialogElement;
		return formElement.querySelector(
			'.field-container-id-' + this.getField(fieldName).props.field.id
		) as HTMLDivElement;
	}

	renderToField(fieldName: string, containerClassName: string, reactContent: ComponentChild) {
		const el = this.getFieldDomElement(fieldName);
		let container = el.querySelector('.' + containerClassName);
		if (!container) {
			container = document.createElement('SPAN');
			container.className = containerClassName;
			el.appendChild(container);
		}
		render(reactContent, container);
	}

	save() {
		//@ts-ignore
		this.saveClick();
	}

	refreshLeftBar() {
		this.forceUpdate();
	}

	async setFieldValue(fieldName: string, val: any, isUserAction = false) {
		const f = this.getField(fieldName);
		if (!f) {
			return; // prevent crash on unmount values debouncing
		}
		const field = f.props.field;

		if (this.currentData[fieldName] !== val) {
			if (!isUserAction) {
				f.setValue(val);
			}
			if (isUserAction) {
				this.isDataModified = true;
				if (this.isSubForm()) {
					this.props.parentForm.props.form.isDataModified = true;
				}
			}
			const prev_value = this.currentData[fieldName];
			this.currentData[fieldName] = val;

			await this.processFieldEvent(field, isUserAction, prev_value);

			this.checkUniqueValue(field, val);
		}
	}

	async checkUniqueValue(field, val) {
		if (field.unique && val) {
			const data = await getData(
				'api/uniqueCheck',
				{
					fieldId: field.id,
					nodeId: field.node.id,
					recId: this.recId !== 'new' && this.recId,
					val,
				},
				undefined,
				true
			);
			if (!data) {
				this.fieldAlert(field.fieldName, L('VALUE_EXISTS'), false, true);
				return false;
			} else {
				this.fieldAlert(field.fieldName, undefined, true);
			}
		}
		return true;
	}

	fieldValue(fieldName) {
		validateFieldName(fieldName);
		return this.currentData[fieldName];
	}

	isFieldEmpty(fieldName) {
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
		consoleLog('onSave ' + this.props.node.tableName + ': ' + this.props.initialData.id);
		/// #endif

		for (const fieldName in this.fieldsRefs) {
			this.fieldAlert(fieldName); //hide all alerts
		}

		this.invalidAlertInOnSaveHandler = false;
		const onSaveRes = await this.processFormEvent(CLIENT_SIDE_FORM_EVENTS.ON_FORM_SAVE);
		return onSaveRes || this.invalidAlertInOnSaveHandler;
	}

	fieldAlert(
		fieldName: string,
		text: string = '',
		isSuccess?: boolean,
		focus: boolean = !isSuccess
	) {
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
		const name = this.props.node.tableName + '_' + eventName;
		return this._getEventHandler(name);
	}

	_getFieldEventHandler(field: FieldDesc) {
		const name =
			this.props.node.tableName +
			'_' +
			field.fieldName +
			'_' +
			CLIENT_SIDE_FORM_EVENTS.ON_FIELD_CHANGE;
		return this._getEventHandler(name);
	}

	_getEventHandler(name) {
		const ret = eventsHandlers.filter((i) => i.hasOwnProperty(name)).map((i) => i[name]);
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
		let ret;
		if (handlers) {
			for (const handler of handlers) {
				this.prev_value = prev_val;
				this.recId = this.props.initialData.id || 'new';
				this.isUpdateRecord = this.props.editable;
				if (this.isUpdateRecord) {
					this.isNewRecord = !this.props.initialData.hasOwnProperty('id');
					if (this.isNewRecord) {
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
