var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        define(["require", "exports", "../utils.js", "./form-mixins.js", "../events/forms_events.js", "../events/fields_events.js", "../left-bar.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_js_1 = require("../utils.js");
    var form_mixins_js_1 = require("./form-mixins.js");
    var forms_events_js_1 = require("../events/forms_events.js");
    var fields_events_js_1 = require("../events/fields_events.js");
    var left_bar_js_1 = require("../left-bar.js");
    var eventProcessingMixins = /** @class */ (function (_super) {
        __extends(eventProcessingMixins, _super);
        function eventProcessingMixins(props) {
            var _this = _super.call(this, props) || this;
            _this.currentData = null;
            _this.onSaveCallback = null;
            _this.resetFieldsProperties();
            return _this;
        }
        eventProcessingMixins.prototype.componentDidMount = function () {
            this.callOnTabShowEvent(this.props.filters.tab);
        };
        eventProcessingMixins.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
            var _this = this;
            _super.prototype.UNSAFE_componentWillReceiveProps.call(this, nextProps);
            this.showAllTabs = false;
            if (nextProps.initialData.id !== this.props.initialData.id) {
                this.state = {};
                this.resetFieldsProperties(true);
                this.forceUpdate();
            }
            setTimeout(function () {
                _this.callOnTabShowEvent(nextProps.filters.tab);
                _this.timeout = null;
            }, 0);
        };
        eventProcessingMixins.prototype.resetFieldsProperties = function (needCallOnload) {
            this.hiddenFields = {};
            this.disabledFields = {};
            this.currentTabName = -1;
            delete (this.onSaveCallback);
            this.needCallOnload = needCallOnload;
        };
        eventProcessingMixins.prototype.isVisibleField = function (field) {
            return true;
        };
        eventProcessingMixins.prototype.callOnTabShowEvent = function (tabNameToShow) {
            if (this.currentTabName !== tabNameToShow) {
                this.currentTabName = tabNameToShow;
                var field;
                var flds = this.props.node.fields;
                for (var k in flds) {
                    var f = flds[k];
                    if (this.isVisibleField(f)) {
                        if ((f.fieldType === FIELD_17_TAB) && (f.maxlen === 0)) { //tab
                            if ((tabNameToShow === f.fieldName) || !tabNameToShow) {
                                field = f;
                                break;
                            }
                        }
                    }
                }
                if (field && fields_events_js_1.default.hasOwnProperty(field.id)) {
                    this.processFormEvent(fields_events_js_1.default[field.id], false, false);
                }
            }
        };
        eventProcessingMixins.prototype.hasField = function (fieldName) {
            return this.fieldsRefs.hasOwnProperty(fieldName);
        };
        eventProcessingMixins.prototype.getField = function (fieldName) {
            if (this.hasField(fieldName)) {
                return this.fieldsRefs[fieldName];
            }
            else {
                utils_js_1.consoleLog('Unknown field: ' + fieldName);
            }
        };
        eventProcessingMixins.prototype.setFieldLabel = function (fieldName, label) {
            this.getField(fieldName).setLabel(label);
        };
        eventProcessingMixins.prototype._fieldsFromArgs = function (a) {
            var fields = Array.from(a);
            if (!fields.length) {
                fields = this.props.node.fields.map(function (i) { return i.fieldName; });
            }
            return fields;
        };
        eventProcessingMixins.prototype.hideField = function () {
            var fields = this._fieldsFromArgs(arguments);
            for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                var fieldName = fields_1[_i];
                var f = this.getField(fieldName);
                if (f && (this.hiddenFields[fieldName] !== 1)) {
                    this.hiddenFields[fieldName] = 1;
                    f.hide();
                }
            }
        };
        eventProcessingMixins.prototype.showField = function () {
            var fields = this._fieldsFromArgs(arguments);
            for (var _i = 0, fields_2 = fields; _i < fields_2.length; _i++) {
                var fieldName = fields_2[_i];
                if (this.hiddenFields[fieldName] === 1) {
                    delete (this.hiddenFields[fieldName]);
                    this.getField(fieldName).show();
                }
            }
        };
        eventProcessingMixins.prototype.isFieldVisible = function (fieldName) {
            return this.hiddenFields[fieldName] !== 1;
        };
        eventProcessingMixins.prototype.hideFooter = function () {
            this.setState({ footerHidden: true });
        };
        eventProcessingMixins.prototype.showFooter = function () {
            this.setState({ footerHidden: false });
        };
        eventProcessingMixins.prototype.disableField = function (fieldName) {
            if (this.disabledFields[fieldName] !== 1) {
                this.disabledFields[fieldName] = 1;
                var f = this.getField(fieldName);
                if (!f) {
                    throw new Error('unknown field "' + fieldName + '"');
                }
                f.disable();
            }
        };
        eventProcessingMixins.prototype.enableField = function (fieldName) {
            if (this.disabledFields[fieldName] === 1) {
                delete (this.disabledFields[fieldName]);
                this.getField(fieldName).enable();
            }
        };
        eventProcessingMixins.prototype.isFieldDisabled = function (fieldName) {
            return (this.disabledFields[fieldName] === 1);
        };
        eventProcessingMixins.prototype.addLookupFilters = function (fieldName, filtersObjOrName, val) {
            this.getField(fieldName).setLookupFilter(filtersObjOrName, val);
        };
        eventProcessingMixins.prototype.focusField = function (fieldName) {
            this.getField(fieldName).focus();
        };
        eventProcessingMixins.prototype.onShow = function () {
            //DEBUG
            utils_js_1.consoleLog('onLoad ' + this.props.node.tableName);
            //ENDDEBUG
            this.header = '';
            this.currentTabName = -1;
            this.hiddenFields = {};
            this.disabledFields = {};
            if (forms_events_js_1.formsEventsOnLoad.hasOwnProperty(this.props.node.id)) {
                this.processFormEvent(forms_events_js_1.formsEventsOnLoad[this.props.node.id], false);
            }
            this.refreshLeftBar();
            for (var k in this.fieldsRefs) {
                var f = this.fieldsRefs[k];
                if (f.props.field.fieldType !== FIELD_18_BUTTON && f.props.field.fieldType !== FIELD_17_TAB) { //is not button
                    if (fields_events_js_1.default.hasOwnProperty(f.props.field.id)) {
                        this.processFormEvent(fields_events_js_1.default[f.props.field.id], false);
                    }
                }
            }
            var hdr = this.header;
            if (this.state.header !== hdr) {
                this.setState({ header: hdr });
            }
            if (this.props.filters && this.props.filters.tab) {
                this.callOnTabShowEvent(this.props.filters.tab);
            }
        };
        eventProcessingMixins.prototype.refreshLeftBar = function () {
            if (!this.isSlave()) {
                if (!Array.isArray(this.currentData) && this.currentData.id && !this.showAllTabs) {
                    var items = [this.currentData.name || utils_js_1.L('NEW', this.props.node.singleName)];
                    var isDefault = true;
                    var fields = this.props.node.fields;
                    for (var k in fields) {
                        var f = fields[k];
                        if ((f.fieldType === FIELD_17_TAB) && (f.maxlen === 0)) { //tab
                            if (this.isVisibleField(f)) {
                                items.push({ icon: f.icon, name: f.name, field: f, form: this, id: false, isDoc: 1, isDefault: isDefault, tabId: f.id, tab: f.fieldName });
                                isDefault = false;
                            }
                        }
                    }
                    left_bar_js_1.default.instance.setLeftBar(items);
                }
                else {
                    left_bar_js_1.default.instance.setLeftBar();
                }
            }
        };
        eventProcessingMixins.prototype.setFieldValue = function (fieldName, val, isUserAction) {
            var f = this.getField(fieldName);
            var field = f.props.field;
            if (this.currentData[fieldName] !== val) {
                if (!isUserAction) {
                    f.setValue(val);
                }
                var prev_value = this.currentData[fieldName];
                this.currentData[fieldName] = val;
                if (fields_events_js_1.default.hasOwnProperty(field.id)) {
                    this.processFormEvent(fields_events_js_1.default[field.id], isUserAction, prev_value);
                }
                //DEBUG
                utils_js_1.consoleLog('onChange ' + fieldName + '; ' + prev_value + ' -> ' + val);
                //ENDDEBUG
                this.checkUniquValue(field, val);
                if (fieldName === 'name') {
                    this.refreshLeftBar();
                }
            }
        };
        eventProcessingMixins.prototype.checkUniquValue = function (field, val) {
            return __awaiter(this, void 0, void 0, function () {
                var data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(field.uniqu && val)) return [3 /*break*/, 2];
                            return [4 /*yield*/, utils_js_1.getData('api/uniquCheck', {
                                    fieldId: field.id,
                                    nodeId: field.node.id,
                                    recId: (this.rec_ID !== 'new') && this.rec_ID,
                                    val: val
                                }, undefined, true)];
                        case 1:
                            data = _a.sent();
                            if (!data) {
                                this.fieldAlert(field.fieldName, utils_js_1.L('VALUE_EXISTS'), false, true);
                                return [2 /*return*/, false];
                            }
                            else {
                                this.fieldAlert(field.fieldName, '', true);
                            }
                            _a.label = 2;
                        case 2: return [2 /*return*/, true];
                    }
                });
            });
        };
        eventProcessingMixins.prototype.fieldValue = function (fieldName) {
            return this.currentData[fieldName];
        };
        eventProcessingMixins.prototype.isFieldEmpty = function (fieldName) {
            var v = this.fieldValue(fieldName);
            if (Array.isArray(v)) {
                return v.length === 0;
            }
            if (v) {
                return false;
            }
            return this.getField(fieldName).isEmpty();
        };
        eventProcessingMixins.prototype.onSave = function () {
            return __awaiter(this, void 0, void 0, function () {
                var k, onSaveRes;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            //DEBUG
                            utils_js_1.consoleLog('onSave ' + this.props.node.tableName);
                            //ENDDEBUG			
                            for (k in this.props.node.fields) {
                                if (this.hasField(k)) { //hide all alerts
                                    this.fieldAlert(this.props.node.fields[k].fieldName);
                                }
                            }
                            this.invalidAlertInOnSaveHandler = false;
                            if (!forms_events_js_1.formsEventsOnSave.hasOwnProperty(this.props.node.id)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.processFormEvent(forms_events_js_1.formsEventsOnSave[this.props.node.id], false)];
                        case 1:
                            onSaveRes = _a.sent();
                            if (onSaveRes) {
                                //debugError('onSave event handler returned true. Saving operation was canceled.');
                            }
                            return [2 /*return*/, onSaveRes || this.invalidAlertInOnSaveHandler];
                        case 2: return [2 /*return*/, false];
                    }
                });
            });
        };
        eventProcessingMixins.prototype.fieldAlert = function (fieldName, text, isSuccess, focus) {
            assert(fieldName, "fieldName expected");
            var f = this.getField(fieldName);
            if (f && f.props.parentCompactAreaName) {
                f = this.getField(f.props.parentCompactAreaName);
            }
            if (f) {
                f.fieldAlert(text, isSuccess, focus);
                if (text && !isSuccess && !this.invalidAlertInOnSaveHandler) {
                    this.getField(fieldName).focus();
                }
                if (!isSuccess) {
                    this.invalidAlertInOnSaveHandler = true;
                }
            }
        };
        eventProcessingMixins.prototype.processFormEvent = function (handler, isUserAction, prev_val) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.prev_value = prev_val;
                    this.rec_ID = this.props.initialData.id || 'new';
                    this.rec_update = this.props.editable;
                    if (this.rec_update) {
                        this.rec_creation = !this.props.initialData.hasOwnProperty('id');
                        if (this.rec_creation) {
                            this.rec_update = false;
                        }
                    }
                    this.isUserEdit = isUserAction;
                    return [2 /*return*/, handler.call(this)];
                });
            });
        };
        return eventProcessingMixins;
    }(form_mixins_js_1.default));
    exports.default = eventProcessingMixins;
});
//# sourceMappingURL=event-processing-mixins.js.map