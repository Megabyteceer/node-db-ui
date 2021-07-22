import {L} from "../utils.js";

var fieldsEvents = {};



fieldsEvents[20] = function () { //field20onchangebegin_cswhggft
	const fieldType = this.fieldValue("fieldType");
	this.showField();
	this.setFieldLabel("fdescription", L("FLD_DESC"));
	this.hideField("selectFieldName", "show", "nodeRef", "enum", "width", "height", "icon");
	this.enableField("vis_list");
	if(fieldType === FIELD_14_NtoM) {
		this.getField('nodeRef').setLookupFilter('exludeIDs', [this.fieldValue("node_fields_linker").id]);
	} else {
		this.getField('nodeRef').setLookupFilter('exludeIDs', undefined);
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
} //field20onchangeend_wqdggft

fieldsEvents[14] = function () { //field14onchangebegin_cswhggft
	if(this.fieldValue('tableName') && !this.isFieldDisabled('tableName')) {
		this.setFieldValue("tableName", this.fieldValue('tableName').replace('_', ''));
	}
} //field14onchangeend_wqdggft

fieldsEvents[22] = function () { //field22onchangebegin_cswhggft
	var shv = this.fieldValue("show");

	if(this.fieldValue("vis_create"))
		shv |= 1;
	else
		shv &= (65535 - 1);

	this.setFieldValue("show", shv);
} //field22onchangeend_wqdggft

fieldsEvents[23] = function () { //field23onchangebegin_cswhggft
	var shv = this.fieldValue("show");

	if(this.fieldValue("vis_list"))
		shv |= 2;
	else
		shv &= (65535 - 2);

	this.setFieldValue("show", shv);
} //field23onchangeend_wqdggft

fieldsEvents[24] = function () { //field24onchangebegin_cswhggft
	var shv = this.fieldValue("show");
	if(this.fieldValue("vis_view")) {
		shv |= 4;
	} else {
		shv &= (65535 - 4);
	}

	this.setFieldValue("show", shv);
} //field24onchangeend_wqdggft



fieldsEvents[30] = function () { //field30onchangebegin_cswhggft
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
} //field30onchangeend_wqdggft


fieldsEvents[39] = function () { //field39onchangebegin_cswhggft
	var p = this.fieldValue('PASS');
	var p2 = this.fieldValue('passconfirm');
	if(p && (p !== p2)) {
		this.fieldAlert('passconfirm', L('PASSWORDS_NOT_M'));
	} else {
		this.fieldAlert('passconfirm');
	}
} //field39onchangeend_wqdggft


fieldsEvents[246] = function () { //field246onchangebegin_cswhggft
	var pv = this.fieldValue('title');
	if(pv) {
		var newv = pv.replace(/ /g, '_').replace(/[^0-9a-zA-Z_]/g, '');

		if(pv != newv) {
			this.setFieldValue('title', newv);
		}

	}
	this.setFieldValue('help', location.protocol + '//' + location.host + '/custom/html/' + newv + '.html');
} //field246onchangeend_wqdggft

fieldsEvents[486] = function () { //field486onchangebegin_cswhggft
	fieldsEvents[32].call(this);
} //field486onchangeend_wqdggft

fieldsEvents[32] = function () { //field32onchangebegin_cswhggft
	if(this.isFieldVisible('nostore')) {
		if(this.fieldValue('nostore') || this.fieldValue('clientOnly')) {
			this.hideField('forSearch', 'uniqu');
		} else {
			this.showField('forSearch', 'uniqu');
		}
	}
} //field32onchangeend_wqdggft


fieldsEvents[9] = function () { //field9onchangebegin_cswhggft
	if(this.fieldValue('fieldName') && !this.isFieldDisabled('fieldName')) {
		this.setFieldValue("fieldName", this.fieldValue('fieldName').replace('_', ''));
	}
	this.check12nFieldName();
} //field9onchangeend_wqdggft



fieldsEvents[318] = function () { //field318onchangebegin_cswhggft
	var shv = this.fieldValue("show");
	if(this.fieldValue("vis_reflist")) {
		shv |= 8;
	} else {
		shv &= (65535 - 8);
	}

	this.setFieldValue("show", shv);
} //field318onchangeend_wqdggft

fieldsEvents[357] = function () { //field357onchangebegin_cswhggft
	var shv = this.fieldValue("show");

	if(this.fieldValue("vis_list_custom"))
		shv |= 16;
	else
		shv &= (65535 - 16);

	this.setFieldValue("show", shv);
} //field357onchangeend_wqdggft

fieldsEvents[253] = function () { //field253onchangebegin_cswhggft

	this.check12nFieldName();
} //field253onchangeend_wqdggft
//insertNewhandlersHere_adsqw09


export default fieldsEvents;