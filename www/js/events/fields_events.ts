import { FIELD_11_DATE, FIELD_12_PICTURE, FIELD_14_NtoM, FIELD_15_1toN, FIELD_17_TAB, FIELD_18_BUTTON, FIELD_19_RICHEDITOR, FIELD_1_TEXT, FIELD_20_COLOR, FIELD_21_FILE, FIELD_4_DATETIME, FIELD_5_BOOL, FIELD_6_ENUM, FIELD_7_Nto1, FIELD_8_STATICTEXT } from "../bs-utils";

import { L } from "../utils";
import { FormEvents } from "./forms_events";

class FieldsEvents extends FormEvents {

	_html_title_onChange() {
		let pv = this.fieldValue('title');
		if(pv) {
			var newv = pv.replace(/ /g, '_').replace(/[^0-9a-zA-Z_]/g, '');

			if(pv != newv) {
				this.setFieldValue('title', newv);
			}

		}
		this.setFieldValue('help', location.protocol + '//' + location.host + '/custom/html/' + newv + '.html');

	}

	_users_passconfirm_onChange() {
		var p = this.fieldValue('PASS');
		var p2 = this.fieldValue('passconfirm');
		if(p && (p !== p2)) {
			this.fieldAlert('passconfirm', L('PASSWORDS_NOT_M'));
		} else {
			this.fieldAlert('passconfirm');
		}
	}

	_nodes_isDoc_onChange() {
		if(this.fieldValue("isDoc")) {
			this.showField("tableName", "creationName", "singleName",
				"captcha", "draftable", "recPerPage");
			if(this.hasField('creationName_en')) {
				this.showField("creationName_en", "singleName_en");
			}
			if(!this.rec_creation) {
				this.showField("_fieldsID", "reverse");
			} else {
				this.hideField("_fieldsID", "reverse");
			}

			if(!this.rec_update) {
				this.showField("createdon_field", "createUserFld", "createdby_field",
					"staticLink");
			}

		} else {
			this.hideField("tableName", "creationName", "singleName",
				"captcha", "_fieldsID", "reverse", "draftable", "createdon_field",
				"createUserFld", "createdby_field", "staticLink", "recPerPage");
			if(this.hasField('creationName_en')) {
				this.hideField("creationName_en", "singleName_en");
			}
		}
	}

	_fields_fieldName_onChange() {
		this.check12nFieldName();
	}

	_fields_fieldType_onChange() {
		const fieldType = this.fieldValue("fieldType");
		this.showField();
		this.setFieldLabel("fdescription", L("FLD_DESC"));
		this.hideField("selectFieldName", "show", "nodeRef", "enum", "width", "height", "icon");
		this.enableField("vis_list");
		if(fieldType === FIELD_14_NtoM) {
			this.getField('nodeRef').setLookupFilter('excludeIDs', [this.fieldValue("node_fields_linker").id]);
		} else {
			this.getField('nodeRef').setLookupFilter('excludeIDs', undefined);
		}
		switch(fieldType) {
			case FIELD_8_STATICTEXT:
				this.setFieldLabel("fdescription", L("CONTENT"));
			case FIELD_17_TAB:
			case FIELD_18_BUTTON:
				this.hideField("maxlen", "clientOnly", "nostore", "requirement", "uniqu", "forSearch");
				this.setFieldValue('forSearch', false);
				break;
			case FIELD_14_NtoM:
			case FIELD_15_1toN:
				this.disableField("vis_list");
				this.setFieldValue("vis_list", 0);
			case FIELD_7_Nto1:
				this.hideField("maxlen", "uniqu");
				this.setFieldValue("uniqu", false);
				this.showField("nodeRef");
				break;

			case FIELD_6_ENUM:
				this.showField('enum');
				break;
			case FIELD_19_RICHEDITOR:
			case FIELD_12_PICTURE:
				this.showField("width", "height");
				this.hideField("maxlen", "nostore", "clientOnly", "uniqu");
				this.setFieldValue('nostore', false);
				this.setFieldValue('clientOnly', false);
				this.setFieldValue('uniqu', false);
				break;
			case FIELD_5_BOOL:
			case FIELD_4_DATETIME:
			case FIELD_11_DATE:
			case FIELD_20_COLOR:
			case FIELD_21_FILE:
				this.hideField("maxlen");
				break;

		}

		if(fieldType === FIELD_1_TEXT || fieldType === FIELD_19_RICHEDITOR) {
			this.showField('multilang');
		} else {
			this.hideField('multilang');
			this.setFieldValue('multilang', false);
		}
		this.check12nFieldName();
	}

	_fields_nostore_onChange() {
		if(this.isFieldVisible('nostore')) {
			if(this.fieldValue('nostore') || this.fieldValue('clientOnly')) {
				this.hideField('forSearch', 'uniqu');
			} else {
				this.showField('forSearch', 'uniqu');
			}
		}
	}

	_fields_clientOnly_onChange() {
		this._fields_nostore_onChange();
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

	_fields_vis_reflist_onChange() {
		var shv = this.fieldValue("show");
		if(this.fieldValue("vis_reflist")) {
			shv |= 8;
		} else {
			shv &= (65535 - 8);
		}

		this.setFieldValue("show", shv);
	}

	_fields_nodeRef_onChange() {
		this.check12nFieldName();
	}

	my_records_button_onChange() {
		alert('Button clicked');
	}

	//_insertNewHandlersHere_
}

export { FieldsEvents };