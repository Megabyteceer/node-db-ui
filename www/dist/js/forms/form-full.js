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
        define(["require", "exports", "../fields/field-wrap.js", "../user.js", "../utils.js", "./form-tab.js", "./event-processing-mixins.js", "../admin/node-admin.js", "../loading-indicator.js", "js/entry.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var field_wrap_js_1 = __importDefault(require("../fields/field-wrap.js"));
    var user_js_1 = require("../user.js");
    var utils_js_1 = require("../utils.js");
    var form_tab_js_1 = __importDefault(require("./form-tab.js"));
    var event_processing_mixins_js_1 = __importDefault(require("./event-processing-mixins.js"));
    var node_admin_js_1 = __importDefault(require("../admin/node-admin.js"));
    var loading_indicator_js_1 = __importDefault(require("../loading-indicator.js"));
    var entry_js_1 = require("js/entry.js");
    var backupCallback;
    function tryBackup() {
        if (backupCallback) {
            backupCallback();
        }
    }
    window.addEventListener('unload', tryBackup);
    setInterval(tryBackup, 15000);
    function callForEachField(fieldRefs, data, functionName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(Object.keys(fieldRefs).map(function (k) { return __awaiter(_this, void 0, void 0, function () {
                            var f, fieldName, newValue;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        f = fieldRefs[k];
                                        fieldName = f.props.field.fieldName;
                                        return [4 /*yield*/, f[functionName]()];
                                    case 1:
                                        newValue = _a.sent();
                                        if ((typeof newValue !== 'undefined') && (f.props.initialValue !== newValue)) {
                                            data[fieldName] = newValue;
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    var FormFull = /** @class */ (function (_super) {
        __extends(FormFull, _super);
        function FormFull(props) {
            var _this = _super.call(this, props) || this;
            _this.currentData = Object.assign({}, props.filters, props.initialData);
            _this.saveClick = _this.saveClick.bind(_this);
            _this.showAllDebug = false;
            _this.disableDrafting = false;
            _this.onSaveCallback = null;
            return _this;
        }
        FormFull.prototype.componentDidMount = function () {
            _super.prototype.componentDidMount.call(this); // TODO merge base class
            this.recoveryBackupIfNeed();
            this.onShow();
            backupCallback = this.backupCurrentDataIfNeed.bind(this);
            if (this.props.overrideOrderData >= 0) {
                if (this.getField('order')) {
                    this.hideField('order');
                }
            }
        };
        FormFull.prototype.componentDidUpdate = function () {
            if (this.needCallOnload) {
                this.recoveryBackupIfNeed();
                this.onShow();
                delete (this.needCallOnload);
            }
        };
        FormFull.prototype.recoveryBackupIfNeed = function () {
            if (!this.currentData.id && !this.props.inlineEditable) {
                var backup = utils_js_1.getBackupData(this.props.node.id, this.props.backupPrefix);
                if (backup) {
                    this.currentData = Object.assign(backup, this.filters);
                    this.resendDataToFields();
                }
            }
        };
        FormFull.prototype.prepareToBackup = function () {
            var fields = this.props.node.fields;
            for (var k in fields) {
                var f = fields[k];
                if ((f.fieldType === FIELD_15_1toN) && this.isVisibleField(f)) {
                    this.currentData[f.fieldName] = this.getField(f.fieldName).getBackupData();
                }
            }
        };
        FormFull.prototype.backupCurrentDataIfNeed = function () {
            if (!this.currentData.id && !this.props.inlineEditable) {
                this.prepareToBackup();
                utils_js_1.backupCreationData(this.props.node.id, this.currentData, this.props.backupPrefix);
            }
        };
        FormFull.prototype.deteleBackup = function () {
            utils_js_1.removeBackup(this.props.node.id, this.props.backupPrefix);
        };
        FormFull.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
            _super.prototype.UNSAFE_componentWillReceiveProps.call(this, nextProps); //TODO merge with super class
            utils_js_1.consoleLog('receive props; ' + this.props.node.tableName);
            if ((this.currentData.id !== nextProps.initialData.id) || (this.props.node !== nextProps.node) || (this.props.editable !== nextProps.editable)) {
                this.backupCurrentDataIfNeed();
                this.needCallOnload = true;
                this.currentData = Object.assign({}, nextProps.filters, nextProps.initialData);
                this.resendDataToFields();
            }
        };
        FormFull.prototype.componentWillUnmount = function () {
            backupCallback = null;
            this.backupCurrentDataIfNeed();
        };
        FormFull.prototype.resendDataToFields = function () {
            if (this.props.editable) {
                for (var k in this.fieldsRefs) {
                    var f = this.fieldsRefs[k];
                    f.setValue(this.currentData[k] || '');
                }
            }
        };
        FormFull.prototype.forceBouncingTimeout = function () {
            for (var k in this.fieldsRefs) {
                var f = this.fieldsRefs[k];
                f.forceBouncingTimeout();
            }
        };
        FormFull.prototype.saveForm = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (this.props.editable) {
                        return [2 /*return*/, this.saveClick('keepStatus')];
                    }
                    return [2 /*return*/];
                });
            });
        };
        FormFull.prototype.validate = function () {
            return __awaiter(this, void 0, void 0, function () {
                var formIsValid, _a, _b, _i, k, fieldRef, field, isValid, isValid2;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.onSave()];
                        case 1:
                            if (_c.sent()) {
                                throw false;
                            }
                            formIsValid = true;
                            _a = [];
                            for (_b in this.fieldsRefs)
                                _a.push(_b);
                            _i = 0;
                            _c.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 7];
                            k = _a[_i];
                            fieldRef = this.fieldsRefs[k];
                            field = fieldRef.props.field;
                            if (this.props.overrideOrderData >= 0 && field.fieldName === 'order') {
                                this.currentData[field.fieldName] = this.props.overrideOrderData;
                            }
                            if (!(field.requirement && fieldRef.isEmpty())) return [3 /*break*/, 3];
                            this.fieldAlert(field.fieldName, utils_js_1.L('REQUIRED_FLD'), false, formIsValid);
                            formIsValid = false;
                            return [3 /*break*/, 6];
                        case 3:
                            this.fieldAlert(field.fieldName, '');
                            return [4 /*yield*/, this.checkUniquValue(field, (!fieldRef.isEmpty()) && this.currentData[field.fieldName])];
                        case 4:
                            isValid = _c.sent();
                            return [4 /*yield*/, fieldRef.checkValidityBeforeSave(formIsValid)];
                        case 5:
                            isValid2 = _c.sent();
                            if (!isValid || !isValid2) {
                                formIsValid = false;
                            }
                            _c.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 2];
                        case 7:
                            if (!formIsValid) {
                                throw false;
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        FormFull.prototype.saveClick = function (isDraft) {
            loading_indicator_js_1.default.instance.show();
            this.saveClickInner(isDraft).catch(function () {
                console.log('invalid form.');
            }).finally(function () {
                loading_indicator_js_1.default.instance.hide();
            });
        };
        FormFull.prototype.saveClickInner = function (isDraft) {
            return __awaiter(this, void 0, void 0, function () {
                var data, k, fieldRef, field, val, cVal, iVal, recId, k, val;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.forceBouncingTimeout();
                            data = {};
                            if (isDraft !== 'keepStatus') {
                                if (this.props.initialData.isP || !this.props.initialData.id) {
                                    if (isDraft === true) {
                                        if (this.props.initialData.status !== 2) {
                                            data.status = 2;
                                        }
                                    }
                                    else {
                                        if (this.props.initialData.status !== 1) {
                                            data.status = 1;
                                        }
                                    }
                                }
                            }
                            return [4 /*yield*/, this.validate()];
                        case 1:
                            _a.sent();
                            for (k in this.fieldsRefs) {
                                fieldRef = this.fieldsRefs[k];
                                field = fieldRef.props.field;
                                val = this.currentData[field.fieldName];
                                if (!field.clientOnly) {
                                    if ((field.fieldType === FIELD_14_NtoM)) {
                                        if (!utils_js_1.n2mValuesEqual(this.props.initialData[field.fieldName], val)) {
                                            data[field.fieldName] = val.map(function (v) { return v.id; });
                                        }
                                    }
                                    else if ((field.fieldType === FIELD_7_Nto1)) {
                                        cVal = val;
                                        iVal = this.props.initialData[field.fieldName];
                                        if (cVal && cVal.id) {
                                            cVal = cVal.id;
                                        }
                                        if (iVal && iVal.id) {
                                            iVal = iVal.id;
                                        }
                                        if (cVal !== iVal) {
                                            data[field.fieldName] = val;
                                        }
                                    }
                                    else if (val && val._isAMomentObject) {
                                        if (!val.isSame(this.props.initialData[field.fieldName])) {
                                            data[field.fieldName] = val;
                                        }
                                    }
                                    else {
                                        if (this.props.initialData[field.fieldName] != val) {
                                            data[field.fieldName] = val;
                                        }
                                    }
                                }
                            }
                            return [4 /*yield*/, callForEachField(this.fieldsRefs, data, 'beforeSave')];
                        case 2:
                            _a.sent();
                            if (!(Object.keys(data).length > 0)) return [3 /*break*/, 6];
                            return [4 /*yield*/, utils_js_1.submitRecord(this.props.node.id, data, this.props.initialData ? this.props.initialData.id : undefined)];
                        case 3:
                            recId = _a.sent();
                            if (!this.currentData.hasOwnProperty('id')) {
                                this.currentData.id = recId;
                                this.props.initialData.id = recId;
                            }
                            //renew current data
                            this.currentData = Object.assign(this.currentData, data);
                            //renew initial data;
                            for (k in data) {
                                val = data[k];
                                if (typeof val === 'object') {
                                    if ($.isEmptyObject(val)) {
                                        this.props.initialData[k] = undefined;
                                    }
                                    else if (val._isAMomentObject) {
                                        this.props.initialData[k] = val.clone();
                                    }
                                    else if (Array.isArray(val)) {
                                        this.props.initialData[k] = val.concat();
                                    }
                                    else {
                                        this.props.initialData[k] = Object.assign({}, val);
                                    }
                                }
                                else {
                                    this.props.initialData[k] = val;
                                }
                            }
                            return [4 /*yield*/, callForEachField(this.fieldsRefs, data, 'afterSave')];
                        case 4:
                            _a.sent();
                            this.rec_ID = this.currentData.id;
                            this.deteleBackup();
                            if (!this.onSaveCallback) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.onSaveCallback()];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            if (this.isSlave()) {
                                this.props.parentForm.valueChoosed(this.currentData, true);
                            }
                            else {
                                this.cancelClick();
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        FormFull.prototype.isVisibleField = function (field) {
            return (this.props.editable ? (field.show & 1) : (field.show & 4)) > 0;
        };
        FormFull.prototype.render = function () {
            var _this = this;
            var node = this.props.node;
            if (!node) {
                return entry_js_1.R.div({ className: 'field-lookup-loading-icon-container' }, utils_js_1.renderIcon('cog fa-spin fa-2x'));
            }
            var tabs;
            var fields = [];
            var data = this.currentData;
            var flds = node.fields;
            var className = 'form-full form-node-' + node.id;
            if (this.props.isCompact) {
                className += ' form-compact';
            }
            if (this.props.editable) {
                className += ' form-edit';
            }
            var forcedValues = this.props.filters;
            var currentTab;
            var currentTabName;
            var currentCompactAreaName;
            var currentCompactAreaFields = [];
            var currentCompactAreaCounter = 0;
            for (var k in flds) {
                var field = flds[k];
                if (this.isVisibleField(field)) {
                    if ((field.fieldType === FIELD_17_TAB) && (field.maxlen === 0) && !this.isSlave()) { //tab
                        currentCompactAreaCounter = 0; //terminate compact area nesting
                        var isDefaultTab;
                        if (!tabs) {
                            tabs = [];
                            isDefaultTab = true;
                        }
                        else {
                            isDefaultTab = false;
                            fields = [];
                        }
                        var tabVisible;
                        if (this.filters.hasOwnProperty('tab')) {
                            tabVisible = (this.filters.tab === field.fieldName);
                        }
                        else {
                            tabVisible = isDefaultTab;
                        }
                        currentTabName = field.fieldName;
                        currentTab = React.createElement(form_tab_js_1.default, {
                            key: field.id,
                            title: field.name,
                            visible: tabVisible || this.showAllDebug || this.showAllTabs,
                            highlightFrame: this.showAllDebug,
                            field: field,
                            form: this,
                            fields: fields
                        });
                        tabs.push(currentTab);
                    }
                    else if (this.props.editable || data[field.fieldName] || field.nostore || (field.fieldType === FIELD_15_1toN) || field.fieldType >= 100) {
                        var tf = React.createElement(field_wrap_js_1.default, {
                            key: field.id,
                            field: field,
                            initialValue: data[field.fieldName],
                            form: this, parentTabName: currentTabName,
                            isEdit: this.props.editable,
                            subFields: currentCompactAreaFields,
                            parentCompactAreaName: currentCompactAreaName,
                            isCompact: this.props.isCompact || (currentCompactAreaCounter > 0),
                            hidden: (this.hiddenFields.hasOwnProperty(field.fieldName) || (forcedValues.hasOwnProperty(field.fieldName))),
                            fieldDisabled: this.disabledFields.hasOwnProperty(field.fieldName) || forcedValues.hasOwnProperty(field.fieldName)
                        });
                        if ((field.fieldType === FIELD_17_TAB) && (field.maxlen >= 0) && !this.isSlave()) { //compact area
                            currentCompactAreaCounter = 0; //terminate compact area nesting
                        }
                        if (currentCompactAreaCounter > 0) {
                            field.isCompactNested = true;
                            currentCompactAreaFields.push(tf);
                            currentCompactAreaCounter--;
                            if (currentCompactAreaCounter === 0) {
                                currentCompactAreaFields = [];
                                currentCompactAreaName = undefined;
                            }
                        }
                        else {
                            fields.push(tf);
                        }
                        if ((field.fieldType === FIELD_17_TAB) && (field.maxlen >= 0) && !this.isSlave()) { //compact area
                            currentCompactAreaCounter = field.maxlen;
                            currentCompactAreaName = field.fieldName;
                        }
                    }
                }
            }
            var isMainTab = (!this.filters.tab || (tabs[0].props.field.fieldName === this.filters.tab));
            if (this.props.isCompact) {
                fields.sort(function (a, b) {
                    var alow = (a.props.field.fieldType === FIELD_15_1toN || a.props.field.fieldType === FIELD_14_NtoM || a.props.field.fieldType === FIELD_5_BOOL);
                    var blow = (b.props.field.fieldType === FIELD_15_1toN || b.props.field.fieldType === FIELD_14_NtoM || b.props.field.fieldType === FIELD_5_BOOL);
                    if (alow !== blow) {
                        if (alow) {
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    }
                    var pa = a.props.field.lang;
                    var pb = b.props.field.lang;
                    if (pa !== pb) {
                        if (!pa)
                            return -1;
                        if (!pb)
                            return 1;
                        if (pa && (pa > pb))
                            return 1;
                        if (pa && (pa < pb))
                            return -1;
                    }
                    return a.props.field.index - b.props.field.index;
                });
            }
            var closeButton;
            var header;
            var deleteButton;
            var saveButton;
            var draftButton;
            var nodeAdmin;
            if (!this.props.inlineEditable) {
                if (data.isD && isMainTab && !this.props.preventDeleteButton) {
                    deleteButton = entry_js_1.R.button({
                        className: 'clickable danger-button', onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, utils_js_1.deleteRecord(data.name, node.id, data.id)];
                                    case 1:
                                        _a.sent();
                                        if (this.isSlave()) {
                                            this.props.parentForm.valueChoosed();
                                        }
                                        else {
                                            utils_js_1.goBack(true);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }, title: utils_js_1.L('DELETE')
                    }, utils_js_1.renderIcon('trash'), this.isSlave() ? '' : utils_js_1.L('DELETE'));
                }
                if (this.props.editable) {
                    if (!node.draftable || !isMainTab || this.disableDrafting || (data.id && !data.isP) || !(node.prevs & PREVS_PUBLISH)) {
                        saveButton = entry_js_1.R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick, title: utils_js_1.L('SAVE') }, this.isSlave() ? utils_js_1.renderIcon('check') : utils_js_1.renderIcon('floppy-o'), this.isSlave() ? '' : utils_js_1.L('SAVE'));
                    }
                    else {
                        if (data.status === 1) {
                            draftButton = entry_js_1.R.button({ className: 'clickable default-button', onClick: function () { _this.saveClick(true); }, title: utils_js_1.L('UNPUBLISH') }, utils_js_1.L('UNPUBLISH'));
                            saveButton = entry_js_1.R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick }, utils_js_1.L('SAVE'));
                        }
                        else {
                            draftButton = entry_js_1.R.button({ className: 'clickable default-button', onClick: function () { _this.saveClick(true); }, title: utils_js_1.L('SAVE_TEMPLATE') }, utils_js_1.L('SAVE_TEMPLATE'));
                            saveButton = entry_js_1.R.button({ className: 'clickable success-button save-btn', onClick: this.saveClick, title: utils_js_1.L('PUBLISH') }, utils_js_1.L('PUBLISH'));
                        }
                    }
                }
                if (user_js_1.iAdmin()) {
                    nodeAdmin = React.createElement(node_admin_js_1.default, { form: this, x: 320, y: -40 });
                }
                if (!this.props.isCompact) {
                    var headerContent = this.header || this.state.header || entry_js_1.R.span(null, node.icon ? utils_js_1.renderIcon(node.icon) : undefined, node.singleName);
                    header = entry_js_1.R.h4({ className: "form-header" }, headerContent);
                }
                if (this.props.editable) {
                    closeButton = entry_js_1.R.button({ className: 'clickable default-button', onClick: this.cancelClick, title: utils_js_1.L('CANCEL') }, utils_js_1.renderIcon('caret-left'), this.isSlave() ? '' : utils_js_1.L('CANCEL'));
                }
                else {
                    closeButton = entry_js_1.R.button({ className: 'clickable default-button', onClick: this.cancelClick }, utils_js_1.renderIcon('caret-left'), this.isSlave() ? '' : utils_js_1.L('BACK'));
                }
            }
            return entry_js_1.R.div({ className: className }, nodeAdmin, header, tabs || fields, entry_js_1.R.div({ className: (this.state.footerHidden || this.props.inlineEditable) ? 'form-footer hidden' : 'form-footer' }, deleteButton, draftButton, saveButton, closeButton));
        };
        return FormFull;
    }(event_processing_mixins_js_1.default));
    exports.default = FormFull;
});
//# sourceMappingURL=form-full.js.map