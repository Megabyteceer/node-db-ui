var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../user.js", "../utils.js", "../admin/admin-utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formsEventsOnSave = exports.formsEventsOnLoad = void 0;
    var user_js_1 = require("../user.js");
    var utils_js_1 = require("../utils.js");
    var admin_utils_js_1 = require("../admin/admin-utils.js");
    var formsEventsOnLoad = {};
    exports.formsEventsOnLoad = formsEventsOnLoad;
    var formsEventsOnSave = {};
    exports.formsEventsOnSave = formsEventsOnSave;
    formsEventsOnLoad[5] = function _users_onload() {
        var _this = this;
        var isHiddenField = function (fn) {
            if (_this.fieldValue(fn) === 'hidden_91d2g7') {
                _this.hideField(fn);
            }
        };
        if ($('#org-edit-link').length === 0) {
            $('.field-container-id-63 input').css('width', '50%');
            if (this.fieldValue('_organID')) {
                $('.field-container-id-63 input').after('<a id="org-edit-link" class="clickable" style="display:block; color:#777; font-size:80%; float:right;" title="additional organisation settings" href="#n/7/r/' +
                    this.fieldValue('_organID').id +
                    '/e">additional organisation settings <p class="fa fa-wrench"></p></a>');
            }
        }
        if (!user_js_1.iAdmin()) {
            this.hideField('_userroles');
        }
        this.disableField('_organID');
        if (!user_js_1.iAdmin()) {
            this.hideField('_organID');
        }
        var myname = this.fieldValue('name');
        if (!isUserHaveRole(1)) {
            this.disableField('email');
        }
        if (this.rec_update || this.rec_creation) {
            this.addLookupFilters('_userroles', {
                exludeIDs: [2, 3]
            });
            this.hideField('public_phone');
            this.hideField('public_vk');
            this.hideField('public_fb');
            this.hideField('public_google');
            this.hideField('public_email');
        }
        else {
            isHiddenField('public_phone');
            isHiddenField('public_vk');
            isHiddenField('public_fb');
            isHiddenField('public_google');
            isHiddenField('public_email');
        }
        if (this.rec_update) {
            this.header = 'Edit user\'s profile ' + myname;
            this.setFieldValue('PASS', 'nc_l4DFn76ds5yhg');
            this.setFieldValue('passconfirm', 'nc_l4DFn76ds5yhg');
            this.props.initialData.PASS = 'nc_l4DFn76ds5yhg';
        }
        if (this.rec_creation) {
            this.hideField('mailing');
            this.hideField('PHONE');
            //this.hideField('desc');
            this.hideField('_organID');
            this.header = ('Registration:');
            this.setFieldValue('PASS', 'nc_l4DFn76ds5yhg');
            this.setFieldValue('passconfirm', 'nc_l4DFn76ds5yhg');
            this.props.initialData.PASS = 'nc_l4DFn76ds5yhg';
        }
    }; //form5onloadEnd_JS89DW72SISA887QKJ32IUSL
    formsEventsOnSave[5] = function _users_onsave() {
        return __awaiter(this, void 0, void 0, function () {
            var pass, pLang, nLang;
            return __generator(this, function (_a) {
                pass = this.fieldValue('PASS');
                if (pass.length < 6) {
                    this.fieldAlert('PASS', utils_js_1.L('PASS_LEN', 6));
                }
                if (pass != this.fieldValue('passconfirm')) {
                    this.fieldAlert('passconfirm', utils_js_1.L('PASS_NOT_MACH'));
                }
                if (currentUserData.id === this.fieldValue('id')) {
                    pLang = this.props.initialData.language;
                    nLang = this.currentData.language;
                    if (pLang && pLang.hasOwnProperty('id')) {
                        pLang = pLang.id;
                    }
                    if (nLang && nLang.hasOwnProperty('id')) {
                        nLang = nLang.id;
                    }
                    if (nLang != pLang) {
                        this.onSaveCallback = function () {
                            utils_js_1.myPromt(utils_js_1.L('RESTARTNOW')).then(function (isYes) {
                                if (isYes) {
                                    location = 'login';
                                }
                            });
                        };
                    }
                }
                return [2 /*return*/];
            });
        });
    }; //form5onsaveEnd_JS89DW72SISA887QKJ32IUSL
    formsEventsOnLoad[8] = function _roles_onload() {
        if ((this.rec_ID === 2) || (this.rec_ID === 3)) {
            this.hideField('_userroles');
        }
    }; //form8onloadEnd_JS89DW72SISA887QKJ32IUSL
    formsEventsOnLoad[52] = function _enums_onload() {
        this.getField("values").inlineEditable();
    }; //form52onloadEnd_JS89DW72SISA887QKJ32IUSL
    formsEventsOnLoad[4] = function _nodes_onload() {
        admin_utils_js_1.makeIconSelectionField(this, 'icon');
        if (this.rec_update) {
            this.disableField('isDoc');
            this.disableField('tableName');
            this.hideField('createdby_field');
            this.hideField('createdon_field');
            this.hideField('createUserFld');
        }
        if (this.rec_creation) {
            if (!this.fieldValue('recPerPage')) {
                this.setFieldValue('recPerPage', 25);
            }
            this.hideField('_fieldsID');
        }
        if (!this.rec_creation) {
            this.addLookupFilters('_nodesID', 'exludeIDs', [this.rec_ID]);
        }
        this.addLookupFilters('_nodesID', 'isDoc', 0);
        this.addLookupFilters('_fieldsID', {
            node_fields_linker: this.rec_ID,
            forSearch: 1
        });
    }; //form4onloadEnd_JS89DW72SISA887QKJ32IUSL
    formsEventsOnSave[4] = function _nodes_onsave() {
        return __awaiter(this, void 0, void 0, function () {
            var name;
            return __generator(this, function (_a) {
                if (!this.fieldValue("isDoc")) {
                    name = this.fieldValue("name");
                    this.setFieldValue("singleName", name);
                }
                else {
                    if (/[^a-zA-Z_0-9]/.test(this.fieldValue('tableName'))) {
                        this.fieldAlert('tableName', utils_js_1.L('LATIN_ONLY'));
                    }
                    if (this.fieldValue('tableName') == parseInt(this.fieldValue('tableName'))) {
                        this.fieldAlert('tableName', utils_js_1.L('NO_NUMERIC_NAME'));
                    }
                }
                return [2 /*return*/];
            });
        });
    }; //form4onsaveEnd_JS89DW72SISA887QKJ32IUSL
    formsEventsOnLoad[6] = function _fields_onload() {
        var _this = this;
        this.getField('fieldType').fieldRef.setFilterValues([16]);
        if (this.rec_creation) {
            if (isNaN(this.fieldValue("show"))) {
                this.setFieldValue("show", 5);
                this.setFieldValue("vis_create", 1);
                this.setFieldValue("vis_view", 1);
                this.setFieldValue("vis_list", 1);
                this.setFieldValue("vis_reflist", 0);
            }
            if (!this.fieldValue("prior")) {
                this.setFieldValue("prior", 1);
            }
        }
        else {
            if (this.fieldValue("show") & 1)
                this.setFieldValue("vis_create", 1);
            else
                this.setFieldValue("vis_create", 0);
            if (this.fieldValue("show") & 4)
                this.setFieldValue("vis_view", 1);
            else
                this.setFieldValue("vis_view", 0);
            if (this.fieldValue("show") & 2)
                this.setFieldValue("vis_list", 1);
            else
                this.setFieldValue("vis_list", 0);
            if (this.fieldValue("show") & 8)
                this.setFieldValue("vis_reflist", 1);
            else
                this.setFieldValue("vis_reflist", 0);
            if (this.fieldValue("show") & 16)
                this.setFieldValue("vis_list_custom", 1);
            else
                this.setFieldValue("vis_list_custom", 0);
            if (this.fieldValue("fieldType") === FIELD_12_PICTURE || this.fieldValue("fieldType") === FIELD_19_RICHEDITOR) {
                this.setFieldValue("height", this.fieldValue("maxlen") % 10000);
                this.setFieldValue("width", Math.floor(this.fieldValue("maxlen") / 10000));
            }
        }
        if (this.rec_update) {
            this.disableField("fieldName");
            this.disableField("fieldType");
            this.disableField("nodeRef");
            this.disableField("node_fields_linker");
            this.disableField("nostore");
            this.disableField("clientOnly");
        }
        this.addLookupFilters('node_fields_linker', {
            isDoc: 1
        });
        this.addLookupFilters('nodeRef', {
            isDoc: 1
        });
        this.hideField("prior");
        this.hideField("show");
        $('.field-container-id-22').css({
            width: '6%'
        });
        $('.field-container-id-23').css({
            width: '6%'
        });
        $('.field-container-id-24').css({
            width: '6%'
        });
        $('.field-container-id-318').css({
            width: '6%'
        });
        $('.field-container-id-357').css({
            width: '6%'
        });
        this.check12nFieldName = function () {
            if (_this.rec_creation) {
                _this.nameIsBad = false;
                var checkFieldExists = function (fName, nodeId) {
                    var fieldsFilter = {
                        fieldName: fName
                    };
                    if (_this.fieldValue('fieldType') !== FIELD_14_NtoM) {
                        fieldsFilter.node_fields_linker = nodeId;
                    }
                    utils_js_1.getNodeData(6, undefined, fieldsFilter).then(function (data) {
                        if (_this.nameIsBad)
                            return;
                        if (data.items.length > 0) {
                            if (_this.fieldValue('fieldType') === FIELD_14_NtoM) {
                                _this.fieldAlert('fieldName', utils_js_1.L('LOOKUP_NAME_NOT_UNIC'));
                            }
                            else {
                                _this.fieldAlert('fieldName', utils_js_1.L('FLD_EXISTS'));
                            }
                            _this.nameIsBad = true;
                        }
                        else {
                            _this.fieldAlert('fieldName', '', true);
                        }
                    });
                };
                var fn = _this.fieldValue('fieldName');
                var nodeId = _this.fieldValue('node_fields_linker');
                if (nodeId && nodeId.id) {
                    nodeId = nodeId.id;
                }
                var nodeRef = _this.fieldValue('nodeRef');
                if (nodeRef && nodeRef.id) {
                    nodeRef = nodeRef.id;
                }
                if (nodeId && fn && fn.length >= 3) {
                    if ((_this.fieldValue("fieldType") === FIELD_15_1toN) && nodeRef) {
                        checkFieldExists(fn + '_linker', nodeRef);
                    }
                    else {
                        checkFieldExists(fn, nodeId);
                    }
                }
            }
        };
    }; //form6onloadEnd_JS89DW72SISA887QKJ32IUSL
    formsEventsOnSave[6] = function _fields_onsave() {
        return __awaiter(this, void 0, void 0, function () {
            var fieldType, maxlen;
            return __generator(this, function (_a) {
                fieldType = this.fieldValue("fieldType");
                if (fieldType === FIELD_7_Nto1 || fieldType === FIELD_14_NtoM || fieldType === FIELD_15_1toN) {
                    if (this.isFieldEmpty('nodeRef')) {
                        this.fieldAlert('nodeRef', utils_js_1.L('REQUIRED_FLD'));
                    }
                }
                if (/[^a-zA-Z_0-9]/.test(this.fieldValue('fieldName'))) {
                    this.fieldAlert('fieldName', utils_js_1.L('LATIN_ONLY'));
                }
                if (this.fieldValue('fieldName') == parseInt(this.fieldValue('fieldName'))) {
                    this.fieldAlert('fieldName', utils_js_1.L('NO_NUMERIC_NAME'));
                }
                if (fieldType === FIELD_12_PICTURE || fieldType === FIELD_19_RICHEDITOR) {
                    if (!this.fieldValue("height")) {
                        this.fieldAlert("height", utils_js_1.L('REQUIRED_FLD'));
                    }
                    if (!this.fieldValue("width")) {
                        this.fieldAlert("width", utils_js_1.L('REQUIRED_FLD'));
                    }
                    maxlen = Math.min(9999, this.fieldValue("height") || undefined) + (this.fieldValue("width") || undefined) * 10000;
                    if (!isNaN(maxlen)) {
                        this.setFieldValue("maxlen", maxlen);
                    }
                }
                if (!this.fieldValue('maxlen')) {
                    this.setFieldValue('maxlen', 0);
                    if ((fieldType === FIELD_1_TEXT) || (fieldType === FIELD_2_INT) || (fieldType === FIELD_10_PASSWORD)) {
                        this.fieldAlert('maxlen', utils_js_1.L('REQUIRED_FLD'));
                    }
                }
                if (this.rec_creation) {
                    if (this.rec_creation && (!this.fieldValue('fieldName') || (this.fieldValue('fieldName').length < 3))) {
                        this.fieldAlert('fieldName', utils_js_1.L('MIN_NAMES_LEN', 3));
                    }
                }
                else {
                    this.hideField('selectFieldName');
                }
                if ((fieldType === FIELD_8_STATICTEXT) || (fieldType === FIELD_17_TAB) || (fieldType === FIELD_18_BUTTON)) {
                    this.setFieldValue('nostore', true);
                }
                if (this.nameIsBad) {
                    this.fieldAlert('fieldName', utils_js_1.L('FLD_EXISTS'));
                }
                return [2 /*return*/];
            });
        });
    }; //form6onsaveEnd_JS89DW72SISA887QKJ32IUSL
    formsEventsOnLoad[12] = function _languages_onload() {
        if (this.rec_update) {
            this.disableField("code");
        }
    }; //form12onloadEnd_JS89DW72SISA887QKJ32IUSL
    formsEventsOnSave[52] = function _enums_onsave() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    }; //form52onsaveEnd_JS89DW72SISA887QKJ32IUSL
});
//# sourceMappingURL=forms_events.js.map