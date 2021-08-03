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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "js/entry.js", "../forms/form-full.js", "../forms/list.js", "../utils.js", "../utils.js", "./field-lookup-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var entry_js_1 = require("js/entry.js");
    var form_full_js_1 = __importDefault(require("../forms/form-full.js"));
    var list_js_1 = __importDefault(require("../forms/list.js"));
    var utils_js_1 = require("../utils.js");
    var utils_js_2 = require("../utils.js");
    var field_lookup_mixins_js_1 = __importDefault(require("./field-lookup-mixins.js"));
    // @ts-ignore
    utils_js_2.registerFieldClass(FIELD_15_1toN, /** @class */ (function (_super) {
        __extends(Lookup1toNField, _super);
        function Lookup1toNField(props) {
            var _this = _super.call(this, props) || this;
            if (!props.form.props.initialData.id) {
                _this.savedData = { items: [] };
            }
            var filters = _this.generateDefaultFiltersByProps(props);
            _this.state = { filters: filters };
            return _this;
        }
        Lookup1toNField.prototype.setValue = function (val) {
            if (this.state.inlineEditing) {
                this.savedData = { items: val };
                this.forceUpdate();
            }
        };
        Lookup1toNField.prototype.getBackupData = function () {
            var ret = [];
            var i;
            if (this.state.inlineEditing) {
                var subForms = this.inlineListRef.getSubforms();
                for (i = 0; i < subForms.length; i++) {
                    var form = subForms[i];
                    form.prepareToBackup();
                    var initialData = form.props.initialData;
                    ret.push(form.currentData);
                }
            }
            return ret;
        };
        Lookup1toNField.prototype.valueChoosed = function () {
            this.saveNodeDataAndFilters(this.savedNode, undefined, this.savedFilters);
            this.setState({ creationOpened: false });
        };
        Lookup1toNField.prototype.toggleCreateDialogue = function (itemIdToEdit, defaultCreationData, backupPrefix) {
            var _this = this;
            if (defaultCreationData) {
                var curBackup = utils_js_1.getBackupData(this.props.field.nodeRef, backupPrefix);
                utils_js_1.backupCreationData(this.props.field.nodeRef, Object.assign(curBackup, defaultCreationData), backupPrefix);
            }
            this.setState({ creationOpened: !this.state.creationOpened, backupPrefix: backupPrefix, dataToEdit: undefined, itemIdToEdit: itemIdToEdit });
            if (typeof itemIdToEdit !== 'undefined') {
                utils_js_1.getNodeData(this.props.field.nodeRef, itemIdToEdit, undefined, true).then(function (data) {
                    _this.setState({ dataToEdit: data, itemIdToEdit: undefined });
                });
            }
        };
        Lookup1toNField.prototype.inlineEditable = function () {
            this.setState({ inlineEditing: true });
        };
        Lookup1toNField.prototype.getMessageIfInvalid = function () {
            return __awaiter(this, void 0, void 0, function () {
                var ret_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.state.inlineEditing) return [3 /*break*/, 2];
                            return [4 /*yield*/, Promise.all(this.inlineListRef.getSubforms().map(function (subForm) {
                                    return subForm.validate().catch(function () {
                                        ret_1 = utils_js_1.L('INVALID_DATA_LIST');
                                    });
                                }))];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, ret_1];
                        case 2:
                            if (this.state.creationOpened) {
                                return [2 /*return*/, utils_js_1.L("SAVE_SUB_FIRST")];
                            }
                            else {
                                return [2 /*return*/, false];
                            }
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        Lookup1toNField.prototype.afterSave = function () {
            return __awaiter(this, void 0, void 0, function () {
                var subForms, field, _i, subForms_1, form, initialData, ln;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.state.inlineEditing) return [3 /*break*/, 7];
                            subForms = this.inlineListRef.getSubforms(true);
                            field = this.props.field;
                            _i = 0, subForms_1 = subForms;
                            _a.label = 1;
                        case 1:
                            if (!(_i < subForms_1.length)) return [3 /*break*/, 7];
                            form = subForms_1[_i];
                            initialData = form.props.initialData;
                            if (!initialData.hasOwnProperty('__deleted_901d123f')) return [3 /*break*/, 4];
                            if (!initialData.hasOwnProperty('id')) return [3 /*break*/, 3];
                            return [4 /*yield*/, utils_js_1.deleteRecord('', field.nodeRef, initialData.id, true)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [3 /*break*/, 6];
                        case 4:
                            ln = field.fieldName + '_linker';
                            if (!initialData.hasOwnProperty(ln) || initialData[ln] === 'new') {
                                form.currentData[ln] = { id: this.props.form.currentData.id };
                            }
                            return [4 /*yield*/, form.saveForm()];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 1];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        Lookup1toNField.prototype.saveParentFormBeforeCreation = function () {
            return __awaiter(this, void 0, void 0, function () {
                var linkerFieldName;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.props.form.saveForm()];
                        case 1:
                            _a.sent();
                            linkerFieldName = this.props.field.fieldName + '_linker';
                            this.state.filters[linkerFieldName] = this.props.form.currentData.id;
                            return [2 /*return*/];
                    }
                });
            });
        };
        Lookup1toNField.prototype.render = function () {
            var _this = this;
            var field = this.props.field;
            var body;
            if (this.state.creationOpened) {
                if (this.state.itemIdToEdit) {
                    body = entry_js_1.R.div({ className: 'field-lookup-loading-icon-container' }, utils_js_1.renderIcon('cog fa-spin fa-2x'));
                }
                else {
                    body = React.createElement(form_full_js_1.default, { node: this.savedNode, backupPrefix: this.state.backupPrefix, initialData: this.state.dataToEdit || {}, parentForm: this, isLookup: true, filters: this.state.filters, editable: true });
                }
            }
            else {
                var askToSaveParentBeforeCreation = !this.props.form.props.initialData.hasOwnProperty('id');
                body = entry_js_1.R.div(null, React.createElement(list_js_1.default, { ref: function (r) { _this.inlineListRef = r; }, hideControlls: this.state.hideControlls, noPreviewButton: this.state.noPreviewButton || this.props.noPreviewButton, disableDrafting: this.state.disableDrafting, additionalButtons: this.state.additionalButtons || this.props.additionalButtons, node: this.savedNode, omitHeader: this.state.creationOpened, initialData: this.savedData, preventCreateButton: this.state.preventCreateButton, askToSaveParentBeforeCreation: askToSaveParentBeforeCreation, editable: this.state.inlineEditing, nodeId: field.nodeRef, parentForm: this, filters: this.savedFilters || this.state.filters }));
            }
            return body;
        };
        return Lookup1toNField;
    }(field_lookup_mixins_js_1.default)));
});
//# sourceMappingURL=field-15-12n.js.map