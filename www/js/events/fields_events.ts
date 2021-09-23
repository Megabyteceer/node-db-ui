import { FIELD_11_DATE, FIELD_12_PICTURE, FIELD_14_NtoM, FIELD_15_1toN, FIELD_17_TAB, FIELD_18_BUTTON, FIELD_19_RICH_EDITOR, FIELD_1_TEXT, FIELD_20_COLOR, FIELD_21_FILE, FIELD_4_DATE_TIME, FIELD_5_BOOL, FIELD_6_ENUM, FIELD_7_Nto1, FIELD_8_STATIC_TEXT, NODE_ID_LOGIN, NODE_ID_REGISTER, NODE_ID_RESET } from "../bs-utils";
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

	_nodes_isDocument_onChange() {
		if(this.fieldValue("isDocument")) {
			this.showField("tableName", "creationName", "singleName",
				"captcha", "draftable", "recPerPage");
			if(this.hasField('creationName_en')) {
				this.showField("creationName_en", "singleName_en");
			}
			if(!this.isNewRecord) {
				this.showField("_fieldsID", "reverse");
			} else {
				this.hideField("_fieldsID", "reverse");
			}

			if(!this.isUpdateRecord) {
				this.showField("addCreatedOnFiled", "createUserFld", "addCreatedByFiled", "staticLink",
					"noStoreForms");
			}

		} else {
			this.hideField("tableName", "creationName", "singleName",
				"captcha", "_fieldsID", "reverse", "draftable", "addCreatedOnFiled",
				"createUserFld", "addCreatedByFiled", "staticLink", "noStoreForms", "recPerPage");
			if(this.hasField('creationName_en')) {
				this.hideField("creationName_en", "singleName_en");
			}
		}
	}

	_fields_fieldName_onChange() {
		this.removeWrongCharactersInField('fieldName');
		this.check12nFieldName();
	}

	_fields_fieldType_onChange() {
		const fieldType = this.fieldValue("fieldType");
		this.showField();
		this.setFieldLabel("description", L("FLD_DESC"));
		this.hideField("selectFieldName", "show", "nodeRef", "enum", "width", "height", "icon");
		this.enableField("visibility_list");
		if(fieldType === FIELD_14_NtoM) {
			this.getField('nodeRef').setLookupFilter('excludeIDs', [this.fieldValue("node_fields_linker").id]);
		} else {
			this.getField('nodeRef').setLookupFilter('excludeIDs', undefined);
		}
		switch(fieldType) {
			case FIELD_8_STATIC_TEXT:
				this.setFieldLabel("description", L("CONTENT"));

			case FIELD_18_BUTTON:
				this.hideField("maxLength", "clientOnly", "noStore", "requirement", "unique", "forSearch");
			case FIELD_17_TAB:
				this.showField('maxLength');
				this.setFieldValue('forSearch', false);
				this.setFieldValue("clientOnly", 1);
				this.disableField("clientOnly");
				this.setFieldValue("noStore", 1);
				this.disableField("noStore");
				break;
			case FIELD_14_NtoM:
			case FIELD_15_1toN:
				this.disableField("visibility_list");
				this.disableField("noStore");
				this.setFieldValue('noStore', 0);
				this.setFieldValue("visibility_list", 0);
				this.hideField('forSearch', 'requirement', 'unique');
			case FIELD_7_Nto1:
				this.enableField("noStore");
				this.enableField("clientOnly");
				this.hideField("maxLength", "unique");
				this.setFieldValue("unique", false);
				this.showField("nodeRef");
				break;

			case FIELD_6_ENUM:
				this.enableField("noStore");
				this.enableField("clientOnly");
				this.showField('enum');
				break;
			case FIELD_19_RICH_EDITOR:
			case FIELD_12_PICTURE:
				this.showField("width", "height");
				this.hideField("maxLength", "noStore", "clientOnly", "unique");
				this.setFieldValue('noStore', false);
				this.setFieldValue('clientOnly', false);
				this.setFieldValue('unique', false);
				this.enableField("noStore");
				this.enableField("clientOnly");
				break;
			case FIELD_5_BOOL:
			case FIELD_4_DATE_TIME:
			case FIELD_11_DATE:
			case FIELD_20_COLOR:
			case FIELD_21_FILE:
				this.enableField("noStore");
				this.enableField("clientOnly");
				this.hideField("maxLength");
				break;

		}

		if(fieldType === FIELD_1_TEXT || fieldType === FIELD_19_RICH_EDITOR) {
			this.showField('multilingual');
		} else {
			this.hideField('multilingual');
			this.setFieldValue('multilingual', false);
		}
		this.check12nFieldName();
	}

	_fields_noStore_onChange() {
		if(this.isFieldVisible('noStore')) {
			if(this.fieldValue('noStore') || this.fieldValue('clientOnly')) {
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
			shv |= 1;
		else
			shv &= (65535 - 1);

		this.setFieldValue("show", shv);
	}

	_fields_visibility_list_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("visibility_list"))
			shv |= 2;
		else
			shv &= (65535 - 2);

		this.setFieldValue("show", shv);
	}

	_fields_visibility_customList_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("visibility_customList"))
			shv |= 16;
		else
			shv &= (65535 - 16);

		this.setFieldValue("show", shv);
	}

	_fields_visibility_view_onChange() {
		var shv = this.fieldValue("show");
		if(this.fieldValue("visibility_view")) {
			shv |= 4;
		} else {
			shv &= (65535 - 4);
		}

		this.setFieldValue("show", shv);
	}

	_fields_visibility_dropdownList_onChange() {
		var shv = this.fieldValue("show");
		if(this.fieldValue("visibility_dropdownList")) {
			shv |= 8;
		} else {
			shv &= (65535 - 8);
		}

		this.setFieldValue("show", shv);
	}

	_fields_nodeRef_onChange() {
		this.check12nFieldName();
	}

	_nodes_tableName_onChange() {
		this.removeWrongCharactersInField('tableName');
	}

	_nodes_staticLink_onChange() {
		if(this.fieldValue('staticLink')) {
			this.disableField('noStoreForms');
			this.setFieldValue('noStoreForms', 1);
		} else if(!this.isUpdateRecord) {
			this.enableField('noStoreForms');
		}
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

	//_insertNewHandlersHere_
}

export { FieldsEvents };