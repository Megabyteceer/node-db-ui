import { FIELD_TYPE_DATE_11, FIELD_TYPE_PICTURE_12, FIELD_TYPE_LOOKUP_NtoM_14, FIELD_TYPE_LOOKUP_1toN_15, FIELD_TYPE_TAB_17, FIELD_TYPE_BUTTON_18, FIELD_TYPE_RICH_EDITOR_19, FIELD_TYPE_TEXT_1, FIELD_TYPE_COLOR_20, FIELD_TYPE_FILE_21, FIELD_TYPE_DATE_TIME_4, FIELD_TYPE_BOOL_5, FIELD_TYPE_ENUM_6, FIELD_TYPE_LOOKUP_7, FIELD_TYPE_STATIC_TEXT_8, NODE_ID_LOGIN, NODE_ID_REGISTER, NODE_ID_RESET, NODE_TYPE, VIEW_MASK_CUSTOM_LIST, VIEW_MASK_ALL, VIEW_MASK_EDIT_CREATE, VIEW_MASK_LIST, VIEW_MASK_READONLY, VIEW_MASK_DROPDOWN_LOOKUP } from "../bs-utils";
import ReactDOM from "react-dom";

import { L } from "../utils";
import { FormEvents } from "./forms_events";

class FieldsEvents extends FormEvents {

	removeWrongCharactersInField(fieldName: string) {
		let pv = this.fieldValue(fieldName);
		if(pv) {
			var newValue = pv.replace(/ /g, '_').replace(/[^0-9a-zA-Z_]/g, '');
			if(pv != newValue) {
				this.setFieldValue(fieldName, newValue);
			}
		}
	}

	_html_title_onChange() {
		this.removeWrongCharactersInField('title');
		let href = location.protocol + '//' + location.host + '/custom/html/' + this.fieldValue('title') + '.html';
		this.setFieldValue('link', href);

		let e: HTMLDivElement = ReactDOM.findDOMNode(this) as HTMLDivElement;
		(e.querySelector('.clickable-link') as HTMLAnchorElement).href = href;
		(e.querySelector('.clickable-link-text') as HTMLAnchorElement).innerText = href;
	}

	_users_passwordConfirm_onChange() {
		this.checkPasswordConfirmation();
	}

	_nodes_nodeType_onChange() {

		const nodeType = this.fieldValue("nodeType");

		if(nodeType === NODE_TYPE.DOCUMENT) {
			this.showField('creationName', 'singleName', 'captcha',
				'reverse', 'draftable', 'addCreatedOnFiled', 'addCreatorUserFld', 'addCreatedByFiled',
				'storeForms', 'recPerPage',
				'dataStorageGroup', 'appearanceGroup', 'createFields');
			this.makeFieldRequired('singleName');
		} else {
			this.hideField('creationName', 'singleName', 'captcha',
				'reverse', 'draftable', 'addCreatedOnFiled', 'addCreatorUserFld', 'addCreatedByFiled',
				'storeForms', 'recPerPage',
				'dataStorageGroup', 'appearanceGroup', 'createFields');
			this.makeFieldRequired('singleName', false);
		}

		if(nodeType === NODE_TYPE.DOCUMENT || nodeType === NODE_TYPE.REACT_CLASS) {
			this.makeFieldRequired('tableName');
			this.showField('tableName');
		} else {
			this.hideField('tableName');
			this.makeFieldRequired('tableName', false);
		}

		if(nodeType === NODE_TYPE.REACT_CLASS) {
			this.setFieldLabel('tableName', L("REACT_CLASS_NAME"));
		} else {
			this.setFieldLabel('tableName');
		}

		this._nodes_recalculateFieldsVisibility();
	}

	_fields_fieldName_onChange() {
		this.removeWrongCharactersInField('fieldName');
		this.check12nFieldName();
	}

	_fields_fieldType_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_fields_noStore_onChange() {
		if(this.isFieldVisible('storeInDB')) {
			if(!this.fieldValue('storeInDB') || this.fieldValue('sendToServer')) {
				this.hideField('forSearch', 'unique');
			} else {
				this.showField('forSearch', 'unique');
			}
		}
	}

	_fields_clientOnly_onChange() {
		this._fields_noStore_onChange();
	}

	_fields_visibility_create_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("visibility_create"))
			shv |= VIEW_MASK_EDIT_CREATE;
		else
			shv &= (VIEW_MASK_ALL - VIEW_MASK_EDIT_CREATE);

		this.setFieldValue("show", shv);
	}

	_fields_visibility_list_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("visibility_list"))
			shv |= VIEW_MASK_LIST;
		else
			shv &= (VIEW_MASK_ALL - VIEW_MASK_LIST);

		this.setFieldValue("show", shv);
	}

	_fields_visibility_customList_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("visibility_customList"))
			shv |= VIEW_MASK_CUSTOM_LIST;
		else
			shv &= (VIEW_MASK_ALL - VIEW_MASK_CUSTOM_LIST);

		this.setFieldValue("show", shv);
	}

	_fields_visibility_view_onChange() {
		var shv = this.fieldValue("show");
		if(this.fieldValue("visibility_view")) {
			shv |= VIEW_MASK_READONLY;
		} else {
			shv &= (VIEW_MASK_ALL - VIEW_MASK_READONLY);
		}

		this.setFieldValue("show", shv);
	}

	_fields_visibility_dropdownList_onChange() {
		var shv = this.fieldValue("show");
		if(this.fieldValue("visibility_dropdownList")) {
			shv |= VIEW_MASK_DROPDOWN_LOOKUP;
		} else {
			shv &= (VIEW_MASK_ALL - VIEW_MASK_DROPDOWN_LOOKUP);
		}

		this.setFieldValue("show", shv);
	}

	_fields_nodeRef_onChange() {
		this.check12nFieldName();
	}

	_nodes_tableName_onChange() {
		this.removeWrongCharactersInField('tableName');
	}

	_registration_passwordConfirm_onChange() {
		this.checkPasswordConfirmation();
	}

	_registration_alreadyHaveAccountBtn_onChange() {
		window.crudJs.Stage.showForm(NODE_ID_LOGIN);
	}

	_login_signUpLinkBtn_onChange() {
		window.crudJs.Stage.showForm(NODE_ID_REGISTER, 'new', undefined, true);
	}

	_login_forgotPasswordButton_onChange() {
		window.crudJs.Stage.showForm(NODE_ID_RESET, 'new', undefined, true);
	}

	_nodes_storeForms_onChange() {
		if(this.fieldValue('storeForms')) {
			this.enableField('tableName');
		} else {
			this.disableField('tableName');
		}
	}

	_fields_recalculateFieldsVisibility() {


		const fieldType = this.fieldValue("fieldType");

		this.showField('maxLength', 'requirement', 'storeInDB', 'sendToServer', 'unique', 'forSearch');
		this.hideField('multilingual', 'nodeRef', 'width', 'height', "selectFieldName", "lookupIcon", "enum");
		this.setFieldLabel("description");

		this.enableField("visibility_list");
		this.enableField("visibility_customList");
		this.enableField("visibility_dropdownList");
		this.enableField("storeInDB");
		this.enableField("sendToServer");
		this.enableField('unique');
		this.enableField('forSearch');

		if(fieldType === FIELD_TYPE_LOOKUP_NtoM_14) {
			this.getField('nodeRef').setLookupFilter('excludeIDs', [this.fieldValue("node_fields_linker").id]);
		} else {
			this.getField('nodeRef').setLookupFilter('excludeIDs', undefined);
		}
		switch(fieldType) {
			case FIELD_TYPE_STATIC_TEXT_8:
				this.setFieldLabel("description", L("CONTENT"));

			case FIELD_TYPE_BUTTON_18:
				this.hideField("maxLength", "sendToServer", "storeInDB", "requirement", "unique", "forSearch");
			case FIELD_TYPE_TAB_17:
				this.showField('maxLength');
				this.setFieldValue('forSearch', false);
				this.setFieldValue("sendToServer", 0);
				this.disableField("sendToServer");
				this.setFieldValue("storeInDB", 0);
				this.disableField("storeInDB");
				break;
			case FIELD_TYPE_LOOKUP_NtoM_14:
			case FIELD_TYPE_LOOKUP_1toN_15:
				this.disableField("visibility_list");
				this.setFieldValue("visibility_list", 0);
				this.disableField("visibility_customList");
				this.setFieldValue("visibility_customList", 0);
				this.disableField("visibility_dropdownList");
				this.setFieldValue("visibility_dropdownList", 0);

				this.disableField("sendToServer");
				this.setFieldValue('sendToServer', 1);
				this.disableField("storeInDB");
				this.setFieldValue('storeInDB', 1);
				this.hideField('forSearch', 'requirement', 'unique');
			case FIELD_TYPE_LOOKUP_7:
				this.hideField("maxLength", "unique");
				this.setFieldValue("unique", false);
				this.showField("nodeRef");
				break;

			case FIELD_TYPE_ENUM_6:
				this.showField('enum');
				this.hideField('maxLength');
				break;
			case FIELD_TYPE_RICH_EDITOR_19:
			case FIELD_TYPE_PICTURE_12:
				this.showField("width", "height");
				this.hideField("maxLength");
				break;
			case FIELD_TYPE_BOOL_5:
			case FIELD_TYPE_DATE_TIME_4:
			case FIELD_TYPE_DATE_11:
			case FIELD_TYPE_COLOR_20:
			case FIELD_TYPE_FILE_21:
				this.hideField("maxLength");
				break;

		}

		if(fieldType === FIELD_TYPE_TEXT_1 || fieldType === FIELD_TYPE_RICH_EDITOR_19) {
			this.showField('multilingual');
		} else {
			this.hideField('multilingual');
			this.setFieldValue('multilingual', false);
		}
		this.check12nFieldName();

		if(!this.fieldValue('sendToServer')) {
			this.disableField('storeInDB');
			this.setFieldValue('storeInDB', 0);
		}

		if(!this.fieldValue('storeInDB')) {
			this.disableField('forSearch');
			this.setFieldValue('forSearch', 0);
		}

		if(!this.fieldValue('forSearch')) {
			this.disableField('unique');
			this.setFieldValue('unique', 0);
		}

		this.makeFieldRequired('maxLength', this.isFieldVisible('maxLength'));
	}

	_fields_storeInDB_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_fields_sendToServer_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_fields_forSearch_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	//_insertNewHandlersHere_
}

export { FieldsEvents };