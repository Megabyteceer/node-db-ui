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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../libs/libs.js", "../utils.js", "../utils.js", "./field-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    var __syncRequire = typeof module === "object" && typeof module.exports === "object";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dateFieldMixins = void 0;
    var libs_js_1 = require("../libs/libs.js");
    var utils_js_1 = require("../utils.js");
    var utils_js_2 = require("../utils.js");
    var field_mixins_js_1 = require("./field-mixins.js");
    function isSameDay(val, d) {
        if (!d || !val)
            return false;
        return d.date() === val.date() && d.month() === val.month() && d.year() === val.year();
    }
    ;
    var dateFieldMixins = /** @class */ (function (_super) {
        __extends(dateFieldMixins, _super);
        function dateFieldMixins(props) {
            var _this = _super.call(this, props) || this;
            _this.importReactDateTime();
            return _this;
        }
        dateFieldMixins.prototype.importReactDateTime = function () {
            var _this = this;
            if (!this.ReactDatetimeClass) {
                (__syncRequire ? Promise.resolve().then(function () { return require('../libs/react-datetime.js'); }) : new Promise(function (resolve_1, reject_1) { require(['../libs/react-datetime.js'], resolve_1, reject_1); })).then(function (module) {
                    _this.ReactDatetimeClass = module.ReactDatetimeClass;
                    _this.forceUpdate();
                });
            }
        };
        dateFieldMixins.prototype.setValue = function (val) {
            if (val) {
                if (typeof val === 'string') {
                    val = libs_js_1.moment(val);
                }
                else {
                    val = val.clone();
                }
            }
            var props = {
                inputValue: utils_js_1.toReadableDate(val),
                selectedDate: val,
            };
            if (val) {
                props.viewDate = val.clone().startOf("day");
            }
            this.refToInput.setState(props);
            // @ts-ignore
            if (this.timeRef) {
                // @ts-ignore
                this.timeRef.setState({
                    inputValue: utils_js_1.toReadableTime(val),
                    selectedDate: val,
                });
            }
            this.state.value = val;
            this.props.wrapper.valueListener(val, false, this);
        };
        dateFieldMixins.prototype.setMin = function (moment) {
            this.state.minDate = moment;
            if (moment && (this.state.focused)) {
                if (!this.state.value) {
                    this.setValue(moment);
                    this.props.wrapper.valueListener(moment, true, this);
                }
                else {
                    this.enforceToValid();
                }
            }
        };
        dateFieldMixins.prototype.setMax = function (moment) {
            this.state.maxDate = moment;
            if (moment && (this.state.focused)) {
                if (!this.state.value) {
                    this.setValue(moment);
                    this.props.wrapper.valueListener(moment, true, this);
                }
                else {
                    this.enforceToValid();
                }
            }
        };
        dateFieldMixins.prototype.enforceToValid = function () {
            this.validateDate(this.state.value, true);
        };
        dateFieldMixins.prototype.setDatePart = function (moment) {
            if (this.state.value && !this.validateDate(this.state.value)) {
                var nv = this.state.value.clone();
                nv.year(moment.year());
                nv.month(moment.month());
                nv.date(moment.date());
                this.setValue(nv);
                this.props.wrapper.valueListener(nv, true, this);
            }
        };
        dateFieldMixins.prototype.validateDate = function (val, doFix) {
            if (this.state.allowedDays) {
                var isValid = this.state.allowedDays.some(function (d) {
                    return isSameDay(val, d);
                });
                if (!isValid && (doFix === true)) {
                    this.setDatePart(this.state.allowedDays[0]);
                    this.props.wrapper.valueListener(this.state.value, true, this);
                    return true;
                }
                return isValid;
            }
            if (this.state.minDate) {
                if (!val || !val.clone().startOf('day').isSameOrAfter(this.state.minDate.clone().startOf('day'))) {
                    if (doFix === true) {
                        this.setValue(this.state.minDate);
                        this.props.wrapper.valueListener(this.state.value, true, this);
                        return true;
                    }
                    return false;
                }
            }
            if (this.state.maxDate) {
                if (!val || !val.clone().startOf('day').isSameOrBefore(this.state.maxDate.clone().startOf('day'))) {
                    if (doFix === true) {
                        this.setValue(this.state.maxDate);
                        this.props.wrapper.valueListener(this.state.value, true, this);
                        return true;
                    }
                    return false;
                }
            }
            if (!val) {
                if (doFix === true) {
                    val = libs_js_1.moment();
                    this.setValue(val);
                }
                else {
                    return false;
                }
            }
            return true;
        };
        dateFieldMixins.prototype.focused = function () {
            this.setState({
                focused: true
            });
            this.enforceToValid();
        };
        return dateFieldMixins;
    }(field_mixins_js_1.default));
    exports.dateFieldMixins = dateFieldMixins;
    utils_js_2.registerFieldClass(FIELD_4_DATETIME, /** @class */ (function (_super) {
        __extends(FieldDateTime, _super);
        function FieldDateTime() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FieldDateTime.decodeValue = function (val) {
            if (val) {
                return libs_js_1.moment(val, utils_js_1.innerDatetimeFormat);
            }
            return null;
        };
        FieldDateTime.encodeValue = function (val) {
            if (!val) {
                return ('0000-00-00 00:00:00');
            }
            return val.format(utils_js_1.innerDatetimeFormat);
        };
        FieldDateTime.prototype.focus = function () {
            // @ts-ignore
            ReactDOM.findDOMNode(this.timeRef).querySelector('input').focus();
        };
        FieldDateTime.prototype.clearValue = function () {
            this.setValue(null);
            this.props.wrapper.valueListener(null, true, this);
        };
        FieldDateTime.prototype.render = function () {
            var _this = this;
            if (!this.ReactDatetimeClass) {
                return utils_js_1.renderIcon('cog fa-spin');
            }
            var field = this.props.field;
            var value = this.state.value;
            if (value && isNaN(value.year())) {
                value = undefined;
            }
            if (this.props.isEdit) {
                var inputsProps1 = {
                    closeOnSelect: true,
                    initialValue: value,
                    placeholder: utils_js_1.L('TIME'),
                    readOnly: this.props.fieldDisabled,
                    dateFormat: false,
                    timeFormat: utils_js_1.readableTimeFormat,
                    title: utils_js_1.L('N_TIME', field.name),
                    mask: 'dd:dd',
                    onFocus: this.focused,
                    isValidDate: this.state.focused ? this.validateDate : undefined,
                    ref: function (ref) {
                        _this.timeRef = ref;
                        _this.refGetter(ref);
                    },
                    onChange: function (val) {
                        if (val._isAMomentObject) {
                            var concatedVal;
                            var value = _this.state.value;
                            if (value) {
                                concatedVal = value.clone();
                                concatedVal.hour(val.hour());
                                concatedVal.minute(val.minute());
                                concatedVal.second(val.second());
                            }
                            else {
                                concatedVal = val;
                            }
                            _this.setValue(concatedVal);
                            _this.props.wrapper.valueListener(concatedVal, true, _this);
                        }
                        else {
                            _this.clearValue();
                        }
                    }
                };
                var inputsProps2 = {
                    closeOnSelect: true,
                    initialValue: value,
                    placeholder: utils_js_1.L('DATE'),
                    readOnly: this.props.fieldDisabled,
                    dateFormat: utils_js_1.readableDateFormat,
                    isValidDate: this.state.focused ? this.validateDate : undefined,
                    timeFormat: false,
                    onFocus: this.focused,
                    title: utils_js_1.L('N_DATE', field.name),
                    ref: function (ref) {
                        _this.refToInput = ref;
                    },
                    onChange: function (val) {
                        if (val._isAMomentObject) {
                            var concatedVal;
                            var value = _this.state.value;
                            if (value) {
                                concatedVal = value.clone();
                                concatedVal.year(val.year());
                                concatedVal.dayOfYear(val.dayOfYear());
                            }
                            else {
                                concatedVal = val;
                            }
                            _this.setValue(concatedVal);
                            _this.props.wrapper.valueListener(concatedVal, true, _this);
                        }
                        else {
                            _this.clearValue();
                        }
                    }
                };
                return R.div({
                    title: (this.props.isCompact ? field.name : '')
                }, R.div({
                    className: "field-date-time-time"
                }, React.createElement(this.ReactDatetimeClass, inputsProps1)), R.div({
                    className: "field-date-time-date"
                }, React.createElement(this.ReactDatetimeClass, inputsProps2)));
            }
            else {
                return utils_js_1.toReadableDatetime(value);
            }
        };
        return FieldDateTime;
    }(dateFieldMixins)));
});
//# sourceMappingURL=field-4-datetime.js.map