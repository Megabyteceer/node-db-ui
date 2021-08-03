(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_js_1 = require("../utils.js");
    var fieldsEvents = {};
    fieldsEvents[246] = function _html_title_onChange() {
        var pv = this.fieldValue('title');
        if (pv) {
            var newv = pv.replace(/ /g, '_').replace(/[^0-9a-zA-Z_]/g, '');
            if (pv != newv) {
                this.setFieldValue('title', newv);
            }
        }
        this.setFieldValue('help', location.protocol + '//' + location.host + '/custom/html/' + newv + '.html');
    }; //field246onchangeend_wqdggft
    fieldsEvents[39] = function _users_passconfirm_onChange() {
        var p = this.fieldValue('PASS');
        var p2 = this.fieldValue('passconfirm');
        if (p && (p !== p2)) {
            this.fieldAlert('passconfirm', utils_js_1.L('PASSWORDS_NOT_M'));
        }
        else {
            this.fieldAlert('passconfirm');
        }
    }; //field39onchangeend_wqdggft
    fieldsEvents[30] = function _nodes_isDoc_onChange() {
        if (this.fieldValue("isDoc")) {
            this.showField("tableName", "creationName", "singleName", "captcha", "draftable", "recPerPage");
            if (this.hasField('creationName_en')) {
                this.showField("creationName_en", "singleName_en");
            }
            if (!this.rec_creation) {
                this.showField("_fieldsID", "reverse");
            }
            else {
                this.hideField("_fieldsID", "reverse");
            }
            if (!this.rec_update) {
                this.showField("createdon_field", "createUserFld", "createdby_field", "staticLink");
            }
        }
        else {
            this.hideField("tableName", "creationName", "singleName", "captcha", "_fieldsID", "reverse", "draftable", "createdon_field", "createUserFld", "createdby_field", "staticLink", "recPerPage");
            if (this.hasField('creationName_en')) {
                this.hideField("creationName_en", "singleName_en");
            }
        }
    }; //field30onchangeend_wqdggft
    fieldsEvents[9] = function _fields_fieldName_onChange() {
        this.check12nFieldName();
    }; //field9onchangeend_wqdggft
    fieldsEvents[20] = function _fields_fieldType_onChange() {
        var fieldType = this.fieldValue("fieldType");
        this.showField();
        this.setFieldLabel("fdescription", utils_js_1.L("FLD_DESC"));
        this.hideField("selectFieldName", "show", "nodeRef", "enum", "width", "height", "icon");
        this.enableField("vis_list");
        if (fieldType === FIELD_14_NtoM) {
            this.getField('nodeRef').setLookupFilter('exludeIDs', [this.fieldValue("node_fields_linker").id]);
        }
        else {
            this.getField('nodeRef').setLookupFilter('exludeIDs', undefined);
        }
        switch (fieldType) {
            case FIELD_8_STATICTEXT:
                this.setFieldLabel("fdescription", utils_js_1.L("CONTENT"));
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
        if (fieldType === FIELD_1_TEXT || fieldType === FIELD_19_RICHEDITOR) {
            this.showField('multilang');
        }
        else {
            this.hideField('multilang');
            this.setFieldValue('multilang', false);
        }
        this.check12nFieldName();
    }; //field20onchangeend_wqdggft
    fieldsEvents[32] = function _fields_nostore_onChange() {
        if (this.isFieldVisible('nostore')) {
            if (this.fieldValue('nostore') || this.fieldValue('clientOnly')) {
                this.hideField('forSearch', 'uniqu');
            }
            else {
                this.showField('forSearch', 'uniqu');
            }
        }
    }; //field32onchangeend_wqdggft
    fieldsEvents[486] = function _fields_clientOnly_onChange() {
        fieldsEvents[32].call(this);
    }; //field486onchangeend_wqdggft
    fieldsEvents[22] = function _fields_vis_create_onChange() {
        var shv = this.fieldValue("show");
        if (this.fieldValue("vis_create"))
            shv |= 1;
        else
            shv &= (65535 - 1);
        this.setFieldValue("show", shv);
    }; //field22onchangeend_wqdggft
    fieldsEvents[23] = function _fields_vis_list_onChange() {
        var shv = this.fieldValue("show");
        if (this.fieldValue("vis_list"))
            shv |= 2;
        else
            shv &= (65535 - 2);
        this.setFieldValue("show", shv);
    }; //field23onchangeend_wqdggft
    fieldsEvents[357] = function _fields_vis_list_custom_onChange() {
        var shv = this.fieldValue("show");
        if (this.fieldValue("vis_list_custom"))
            shv |= 16;
        else
            shv &= (65535 - 16);
        this.setFieldValue("show", shv);
    }; //field357onchangeend_wqdggft
    fieldsEvents[24] = function _fields_vis_view_onChange() {
        var shv = this.fieldValue("show");
        if (this.fieldValue("vis_view")) {
            shv |= 4;
        }
        else {
            shv &= (65535 - 4);
        }
        this.setFieldValue("show", shv);
    }; //field24onchangeend_wqdggft
    fieldsEvents[318] = function _fields_vis_reflist_onChange() {
        var shv = this.fieldValue("show");
        if (this.fieldValue("vis_reflist")) {
            shv |= 8;
        }
        else {
            shv &= (65535 - 8);
        }
        this.setFieldValue("show", shv);
    }; //field318onchangeend_wqdggft
    fieldsEvents[253] = function _fields_nodeRef_onChange() {
        this.check12nFieldName();
    }; //field253onchangeend_wqdggft
    fieldsEvents[680] = function my_records_btn_onChange() {
        alert(2);
    }; //field680onchangeend_wqdggft
    fieldsEvents[738] = function my_records_button_onChange() {
        alert('Button clicked');
    }; //field738onchangeend_wqdggft
    //insertNewhandlersHere_adsqw09
    exports.default = fieldsEvents;
});
//# sourceMappingURL=fields_events.js.map