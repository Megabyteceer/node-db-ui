import { FIELD_11_DATE, FIELD_12_PICTURE, FIELD_14_NtoM, FIELD_15_1toN, FIELD_17_TAB, FIELD_18_BUTTON, FIELD_19_RICH_EDITOR, FIELD_1_TEXT, FIELD_20_COLOR, FIELD_21_FILE, FIELD_4_DATE_TIME, FIELD_5_BOOL, FIELD_6_ENUM, FIELD_7_Nto1, FIELD_8_STATIC_TEXT } from "../bs-utils";

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
		this.setFieldValue('link', location.protocol + '//' + location.host + '/custom/html/' + this.fieldValue('title') + '.html');
	}

	_users_passConfirm_onChange() {
		var p = this.fieldValue('PASS');
		var p2 = this.fieldValue('passConfirm');
		if(p && (p !== p2)) {
			this.fieldAlert('passConfirm', L('PASSWORDS_NOT_M'));
		} else {
			this.fieldAlert('passConfirm');
		}
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
				this.showField("addCreatedOnFiled", "createUserFld", "addCreatedByFiled",
					"staticLink");
			}

		} else {
			this.hideField("tableName", "creationName", "singleName",
				"captcha", "_fieldsID", "reverse", "draftable", "addCreatedOnFiled",
				"createUserFld", "addCreatedByFiled", "staticLink", "recPerPage");
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
		this.enableField("vis_list");
		if(fieldType === FIELD_14_NtoM) {
			this.getField('nodeRef').setLookupFilter('excludeIDs', [this.fieldValue("node_fields_linker").id]);
		} else {
			this.getField('nodeRef').setLookupFilter('excludeIDs', undefined);
		}
		switch(fieldType) {
			case FIELD_8_STATIC_TEXT:
				this.setFieldLabel("description", L("CONTENT"));
			case FIELD_17_TAB:
			case FIELD_18_BUTTON:
				this.hideField("maxLength", "clientOnly", "noStore", "requirement", "unique", "forSearch");
				this.setFieldValue('forSearch', false);
				break;
			case FIELD_14_NtoM:
			case FIELD_15_1toN:
				this.disableField("vis_list");
				this.disableField("noStore");
				this.setFieldValue('noStore', 0);
				this.setFieldValue("vis_list", 0);
				this.hideField('forSearch', 'requirement', 'unique');
			case FIELD_7_Nto1:
				this.hideField("maxLength", "unique");
				this.setFieldValue("unique", false);
				this.showField("nodeRef");
				break;

			case FIELD_6_ENUM:
				this.showField('enum');
				break;
			case FIELD_19_RICH_EDITOR:
			case FIELD_12_PICTURE:
				this.showField("width", "height");
				this.hideField("maxLength", "noStore", "clientOnly", "unique");
				this.setFieldValue('noStore', false);
				this.setFieldValue('clientOnly', false);
				this.setFieldValue('unique', false);
				break;
			case FIELD_5_BOOL:
			case FIELD_4_DATE_TIME:
			case FIELD_11_DATE:
			case FIELD_20_COLOR:
			case FIELD_21_FILE:
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

	_fields_vis_create_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("vis_create"))
			shv |= 1;
		else
			shv &= (65535 - 1);

		this.setFieldValue("show", shv);
	}

	_fields_vis_list_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("vis_list"))
			shv |= 2;
		else
			shv &= (65535 - 2);

		this.setFieldValue("show", shv);
	}

	_fields_vis_list_custom_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("vis_list_custom"))
			shv |= 16;
		else
			shv &= (65535 - 16);

		this.setFieldValue("show", shv);
	}

	_fields_vis_view_onChange() {
		var shv = this.fieldValue("show");
		if(this.fieldValue("vis_view")) {
			shv |= 4;
		} else {
			shv &= (65535 - 4);
		}

		this.setFieldValue("show", shv);
	}

	_fields_vis_dropdownList_onChange() {
		var shv = this.fieldValue("show");
		if(this.fieldValue("vis_dropdownList")) {
			shv |= 8;
		} else {
			shv &= (65535 - 8);
		}

		this.setFieldValue("show", shv);
	}

	_fields_nodeRef_onChange() {
		this.check12nFieldName();
	}

	async _nodes_tableName_onChange() {
		this.removeWrongCharactersInField('tableName');
	}

	//_insertNewHandlersHere_
}

export { FieldsEvents };