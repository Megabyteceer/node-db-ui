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
        define(["require", "exports", "../admin/field-admin.js", "../user.js", "../utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FieldLabel = exports.FieldHelp = void 0;
    var field_admin_js_1 = require("../admin/field-admin.js");
    var user_js_1 = require("../user.js");
    var utils_js_1 = require("../utils.js");
    var FieldHelp = /** @class */ (function (_super) {
        __extends(FieldHelp, _super);
        function FieldHelp(props) {
            var _this = _super.call(this, props) || this;
            _this.mouseOut = _this.mouseOut.bind(_this);
            _this.mouseOver = _this.mouseOver.bind(_this);
            return _this;
        }
        FieldHelp.prototype.mouseOut = function () {
            this.setState({ hovered: false });
        };
        FieldHelp.prototype.mouseOver = function () {
            this.setState({ hovered: true });
        };
        FieldHelp.prototype.render = function () {
            var body;
            if (this.state && this.state.hovered) {
                body = R.div({ className: 'field-wrap-help field-wrap-help-open' }, this.props.text);
            }
            else {
                body = R.div({ className: 'field-wrap-help' }, utils_js_1.renderIcon('question-circle'));
            }
            return R.div({ onMouseOver: this.mouseOver, onMouseOut: this.mouseOut, className: 'field-wrap-help-container' }, body);
        };
        return FieldHelp;
    }(Component));
    exports.FieldHelp = FieldHelp;
    var FieldLabel = /** @class */ (function (_super) {
        __extends(FieldLabel, _super);
        function FieldLabel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FieldLabel.prototype.render = function () {
            var field = this.props.field;
            var star;
            if (this.props.isEdit && field.requirement) {
                star = R.span({ className: 'field-wrap-required-star' }, '*');
            }
            else {
                star = '';
            }
            var alertBody;
            if (this.props.fieldAlert) {
                if (this.props.isSucessAlert) {
                    alertBody = R.div({ className: 'fade-in field-wrap-alert field-wrap-alert-success' }, this.props.fieldAlert);
                }
                else {
                    alertBody = R.div({ className: 'fade-in field-wrap-alert' }, this.props.fieldAlert);
                }
            }
            var body;
            if (field.lang) {
                body = R.span({ className: 'field-wrap-label-lang' }, field.lang);
            }
            else {
                body = (field.fieldType !== FIELD_18_BUTTON) ? (this.props.labelOwerride || field.name) : '';
            }
            return R.div({ className: 'field-wrap-label' }, body, star, alertBody);
        };
        return FieldLabel;
    }(Component));
    exports.FieldLabel = FieldLabel;
    var FieldWrap = /** @class */ (function (_super) {
        __extends(FieldWrap, _super);
        function FieldWrap(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {};
            _this.hidden = props.hidden;
            props.form.fieldsRefs[props.field.fieldName] = _this;
            _this.UNSAFE_componentWillReceiveProps(_this.props);
            return _this;
        }
        FieldWrap.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
            this.hidden = nextProps.hidden;
            //this.currentValue = nextProps.initialValue;
            if (nextProps.fieldDisabled) {
                this.fieldDisabled = true;
            }
        };
        FieldWrap.prototype.hideTooltip = function () {
            if (this.state.showtooltip)
                this.setState({ showtooltip: false });
        };
        FieldWrap.prototype.componentWillUnmount = function () {
            this.forceBouncingTimeout();
            if (this.props.form.fieldsRefs[this.props.field.fieldName] === this) {
                delete this.props.form.fieldsRefs[this.props.field.fieldName];
            }
        };
        FieldWrap.prototype.isEmpty = function () {
            if (this.fieldRef.isEmpty) {
                return this.fieldRef.isEmpty();
            }
            var val = this.props.form.currentData[this.props.field.fieldName];
            return !val;
        };
        FieldWrap.prototype.hide = function () {
            if (!this.hidden) {
                this.hidden = true;
                this.forceUpdate();
            }
        };
        FieldWrap.prototype.getBackupData = function () {
            return this.fieldRef.getBackupData();
        };
        FieldWrap.prototype.setMin = function (val) {
            this.fieldRef.setMin(val);
        };
        FieldWrap.prototype.setMax = function (val) {
            this.fieldRef.setMax(val);
        };
        FieldWrap.prototype.setLookupFilter = function (filtersObjOrName, val) {
            /// #if DEBUG
            if ((this.props.field.fieldType !== FIELD_7_Nto1) &&
                (this.props.field.fieldType !== FIELD_14_NtoM) &&
                (this.props.field.fieldType !== FIELD_15_1toN)) {
                utils_js_1.debugError('setLookupFilter aplied to not lookUp field: ' + this.props.field.fieldName);
            }
            /// #endif
            this.fieldRef.setLookupFilter(filtersObjOrName, val);
        };
        FieldWrap.prototype.show = function () {
            if (this.hidden) {
                this.hidden = false;
                this.forceUpdate();
            }
        };
        FieldWrap.prototype.disable = function () {
            if (!this.fieldDisabled) {
                this.fieldDisabled = true;
                this.forceUpdate();
            }
        };
        FieldWrap.prototype.enable = function () {
            if (this.fieldDisabled) {
                this.fieldDisabled = false;
                this.forceUpdate();
            }
        };
        FieldWrap.prototype.setLabel = function (label) {
            if (this.labelOwerride !== label) {
                this.labelOwerride = label;
                this.forceUpdate();
            }
        };
        FieldWrap.prototype.sendCurrentValueToForm = function () {
            if (this.props.form.setFieldValue) {
                console.log('sendCurrentValueToForm: ' + this.props.field.fieldName + '=' + this.currentValue);
                this.props.form.setFieldValue(this.props.field.fieldName, this.currentValue, true);
            }
        };
        FieldWrap.prototype.checkValidityBeforeSave = function (focusIfInvalid) {
            return __awaiter(this, void 0, void 0, function () {
                var invalidMessage;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(!this.fieldRef || !this.fieldRef.getMessageIfInvalid)) return [3 /*break*/, 1];
                            return [2 /*return*/, true];
                        case 1: return [4 /*yield*/, this.fieldRef.getMessageIfInvalid()];
                        case 2:
                            invalidMessage = _a.sent();
                            if (!invalidMessage) {
                                this.fieldAlert();
                                return [2 /*return*/, true];
                            }
                            else {
                                this.fieldAlert(invalidMessage, false, focusIfInvalid);
                                return [2 /*return*/, false];
                            }
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        FieldWrap.prototype.beforeSave = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (this.fieldRef.beforeSave) {
                        return [2 /*return*/, this.fieldRef.beforeSave()];
                    }
                    return [2 /*return*/];
                });
            });
        };
        FieldWrap.prototype.afterSave = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (this.fieldRef.afterSave) {
                        return [2 /*return*/, this.fieldRef.afterSave()];
                    }
                    return [2 /*return*/];
                });
            });
        };
        FieldWrap.prototype.fieldAlert = function (text, isSucess, focus) {
            if (text) {
                if (this.hidden) {
                    /// #if DEBUG
                    throw 'Tried to alert hidden field';
                    /// #endif
                }
            }
            this.setState({ fieldAlert: text, isSucessAlert: isSucess });
            if (focus && text) {
                this.focus();
            }
        };
        FieldWrap.prototype.focus = function () {
            var _this = this;
            /// #if DEBUG
            utils_js_1.consoleLog('focus set ' + this.props.field.fieldName);
            /// #endif
            if (this.props.parentTabName && !this.props.form.isSlave()) {
                utils_js_1.setFormFilter('tab', this.props.parentTabName);
            }
            setTimeout(function () {
                utils_js_1.scrollToVisible(_this);
                _this.fieldRef.focus();
            }, 1);
        };
        FieldWrap.prototype.setValue = function (val) {
            this.clearChangeTimout();
            if (this.fieldRef) {
                this.fieldRef.setValue(val);
            }
        };
        FieldWrap.prototype.inlineEditable = function () {
            this.fieldRef.inlineEditable();
        };
        FieldWrap.prototype.extendEditor = function () {
            this.fieldRef.extendEditor();
        };
        FieldWrap.prototype.clearChangeTimout = function () {
            if (this.ChangeTimeout) {
                console.log('clearChangeTimout: ' + this.props.field.fieldName);
                clearTimeout(this.ChangeTimeout);
                delete (this.ChangeTimeout);
            }
        };
        FieldWrap.prototype.forceBouncingTimeout = function () {
            if (this.ChangeTimeout) {
                console.log('forceBouncingTimeout: ' + this.props.field.fieldName);
                this.clearChangeTimout();
                this.sendCurrentValueToForm();
            }
        };
        FieldWrap.prototype.valueListener = function (newVal, withBounceDelay, sender) {
            var _this = this;
            console.log('valueListener: ' + this.props.field.fieldName + ': ' + newVal);
            this.currentValue = newVal;
            if (withBounceDelay) {
                this.clearChangeTimout();
                this.ChangeTimeout = setTimeout(function () {
                    delete (_this.ChangeTimeout);
                    _this.sendCurrentValueToForm();
                }, 600);
            }
            else {
                this.sendCurrentValueToForm();
            }
        };
        FieldWrap.prototype.render = function () {
            var _this = this;
            var field = this.props.field;
            var domId = 'field-container-id-' + field.id;
            var fprops = {
                field: field,
                wrapper: this,
                form: this.props.form,
                initialValue: this.props.initialValue,
                isCompact: this.props.isCompact,
                isEdit: this.props.isEdit,
                fieldDisabled: this.fieldDisabled,
                additionalButtons: this.state.additionalButtons || this.props.additionalButtons,
                ref: function (fieldRef) {
                    _this.fieldRef = fieldRef;
                }
            };
            var fieldTypedBody = React.createElement(utils_js_1.getClassForField(field.fieldType), fprops);
            var fieldCustomBody;
            if (field.customRender) {
                fieldCustomBody = field.customRender(fprops);
            }
            var noLabel = !field.name; // (field.fieldType===FIELD_14_NtoM)||(field.fieldType===FIELD_15_1toN);
            var help;
            if (field.fdescription && field.fieldType !== FIELD_8_STATICTEXT) {
                help = React.createElement(FieldHelp, { text: R.div(null, R.h4(null, field.name), field.fdescription) });
            }
            var fieldAdmin;
            if (user_js_1.iAdmin() && !field.lang && (!this.props.isCompact || this.props.parentCompactAreaName)) {
                fieldAdmin = React.createElement(field_admin_js_1.default, { field: field, form: this.props.form, x: -10 });
            }
            var className = domId + ' field-wrap field-container-name-' + field.fieldName;
            if (this.hidden
                /// #if DEBUG
                && !this.props.form.showAllDebug
            /// #endif
            ) {
                className += ' hidden';
            }
            if (!this.props.isEdit) {
                className += ' field-wrap-readonly';
            }
            if (this.props.isCompact) {
                if (this.props.isTable) {
                    className += ' field-wrap-inline';
                }
                var tooltip;
                if (this.state.showtooltip) {
                    tooltip = R.span({ className: 'field-wrap-tooltip' }, R.span({ className: 'fa fa-caret-left field-wrap-tooltip-arrow' }), R.span({ className: 'field-wrap-tooltip-body' }, field.name, (field.lang ? (' (' + field.lang + ')') : undefined), (this.state && this.state.fieldAlert) ? (' (' + this.state.fieldAlert + ')') : ''));
                }
                return R.span({
                    className: className,
                    onFocus: function () {
                        _this.setState({ showtooltip: true });
                    },
                    onBlur: function () {
                        _this.setState({ showtooltip: false });
                    },
                }, fieldTypedBody, fieldCustomBody, fieldAdmin, tooltip);
            }
            else {
                if (field.lang) {
                    className += 'field-wrap-lang';
                }
                var label;
                if (!noLabel) {
                    label = React.createElement(FieldLabel, { field: field, isEdit: this.props.isEdit, labelOwerride: this.labelOwerride, fieldAlert: this.state ? this.state.fieldAlert : undefined, isSucessAlert: this.state ? this.state.isSucessAlert : undefined });
                }
                return R.div({ className: className }, label, R.div({ className: noLabel ? 'field-wrap-value field-wrap-value-no-label' : 'field-wrap-value' }, fieldTypedBody, fieldCustomBody), help, fieldAdmin);
            }
        };
        return FieldWrap;
    }(Component));
    exports.default = FieldWrap;
});
//# sourceMappingURL=field-wrap.js.map