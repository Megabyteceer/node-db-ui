import { render, type ComponentChild } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { assert, throwError, validateFieldName } from '../assert';
import type { FieldDesc, GetRecordsFilter, RecordDataBaseFields } from '../bs-utils';
import { clientHandlers } from '../events-handle';
import type { FieldWrap } from '../fields/field-wrap';
import { CLIENT_SIDE_FORM_EVENTS, consoleLog, getData, L } from '../utils';
import { BaseForm } from './base-form';

type a = ((name: string) => any);
type b = ((filedName: string, value: any, isUserAction?: boolean) => Promise<void> | void);

class FormEventProcessingMixins<FieldsNames extends string, GetValueType = a, SetValueType = b> extends BaseForm {
	/** true if form opened for new record creation */
	isNewRecord: boolean;
	/** true if form opened for editing existing form */
	isUpdateRecord: boolean;

	saveButtonTitle: string;
	isCancelButtonHidden: boolean;

	currentData: {[key in (FieldsNames | RecordDataBaseFields)]: any};

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

	hasField(fieldName: FieldsNames) {
		validateFieldName(fieldName);
		return this.fieldsRefs.hasOwnProperty(fieldName);
	}

	getField(fieldName:FieldsNames): FieldWrap {
		validateFieldName(fieldName);
		if (this.hasField(fieldName)) {
			return this.fieldsRefs[fieldName];
		} else {
			throwError('Unknown field: ' + fieldName);
		}
	}

	setFieldLabel(fieldName: FieldsNames, label?) {
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
				if (f.props.field.fieldType === FIELD_TYPE.TAB) {
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

	addLookupFilters(fieldName: FieldsNames, filtersObjOrName: GetRecordsFilter);
	addLookupFilters(fieldName: FieldsNames, filtersObjOrName: string, val: any);
	addLookupFilters(fieldName: FieldsNames, filtersObjOrName: string | GetRecordsFilter, val?: any) {
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

	getFieldDomElement(fieldName: FieldsNames): HTMLDivElement {
		const formElement = this.base as HTMLDialogElement;
		return formElement.querySelector(
			'.field-container-id-' + this.getField(fieldName).props.field.id
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

	save() {
		//@ts-ignore
		this.saveClick();
	}

	refreshLeftBar() {
		this.forceUpdate();
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

	declare fieldValue: GetValueType;
	declare setFieldValue: SetValueType;

	isFieldEmpty(fieldName: FieldsNames) {
		//@ts-ignore
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
			this.fieldAlert(fieldName as FieldsNames); //hide all alerts
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
		const name = this.props.node.tableName + '.' + eventName;
		return this._getEventHandlers(name);
	}

	_getFieldEventHandlers(field: FieldDesc) {
		const name =
			this.props.node.tableName +
			',' +
			field.fieldName +
			'.' +
			(field.fieldType === FIELD_TYPE.BUTTON || field.fieldType === FIELD_TYPE.TAB) ?
				CLIENT_SIDE_FORM_EVENTS.ON_FIELD_CLICK :
				CLIENT_SIDE_FORM_EVENTS.ON_FIELD_CHANGE;
		return this._getEventHandlers(name);
	}

	_getEventHandlers(name: string) {
		return clientHandlers.get(name);
	}

	processFieldEvent(field: FieldDesc, isUserAction?: boolean, prev_val?) {
		return this.processEvent(this._getFieldEventHandlers(field), isUserAction, prev_val);
	}

	processFormEvent(eventName: CLIENT_SIDE_FORM_EVENTS, ...args: any[]) {
		return this.processEvent(this._getFormEventHandler(eventName), ...args);
	}

	async processEvent(handlers, ...args) {
		if (handlers) {
			for (const handler of handlers) {
				this.recId = this.props.initialData.id || 'new';
				this.isUpdateRecord = this.props.editable;
				if (this.isUpdateRecord) {
					this.isNewRecord = !this.props.initialData.hasOwnProperty('id');
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


FormEventProcessingMixins.prototype.setFieldValue = async function setFieldValue(fieldName: string, val: any, isUserAction = false) {
	const f = this.getField(fieldName);
	if (!f) {
		return; // prevent crash on unmount values debouncing
	}
	const field = f.props.field;

	if (this.currentData[fieldName as string] !== val) {
		if (!isUserAction) {
			f.setValue(val);
		}
		if (isUserAction) {
			this.isDataModified = true;
			if (this.isSubForm()) {
				this.props.parentForm.props.form.isDataModified = true;
			}
		}
		const prev_value = this.currentData[fieldName as string];
		this.currentData[fieldName as string] = val;

		await this.processFieldEvent(field, isUserAction, prev_value);

		this.checkUniqueValue(field, val);
	}
};

FormEventProcessingMixins.prototype.fieldValue = function fieldValue(fieldName: string) {
	validateFieldName(fieldName);
	return this.currentData[fieldName as string];
};

export { FormEventProcessingMixins };
