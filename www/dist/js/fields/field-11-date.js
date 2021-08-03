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
        define(["require", "exports", "js/entry.js", "../libs/libs.js", "../utils.js", "./field-4-datetime.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var entry_js_1 = require("js/entry.js");
    var libs_js_1 = require("../libs/libs.js");
    var utils_js_1 = require("../utils.js");
    var field_4_datetime_js_1 = require("./field-4-datetime.js");
    utils_js_1.registerFieldClass(FIELD_11_DATE, /** @class */ (function (_super) {
        __extends(DateField, _super);
        function DateField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DateField.decodeValue = function (val) {
            if (val === '0000-00-00 00:00:00') {
                return null;
            }
            return libs_js_1.moment(val, utils_js_1.innerDatetimeFormat);
        };
        DateField.encodeValue = function (val) {
            if (!val) {
                return ('0000-00-00 00:00:00');
            }
            return val.format(utils_js_1.innerDatetimeFormat);
        };
        DateField.prototype.focus = function () {
            // @ts-ignore
            ReactDOM.findDOMNode(this.refToInput).querySelector('input').focus();
        };
        DateField.prototype.render = function () {
            var _this = this;
            var field = this.props.field;
            var value = utils_js_1.toReadableDate(this.state.value);
            if (this.props.isEdit) {
                var inputsProps = {
                    closeOnSelect: true,
                    defaultValue: value,
                    placeholder: field.name,
                    readOnly: this.props.fieldDisabled,
                    dateFormat: utils_js_1.readableDateFormat,
                    title: field.name,
                    onFocus: this.focused,
                    isValidDate: this.state.focused ? this.validateDate : undefined,
                    timeFormat: false,
                    ref: this.refGetter,
                    onChange: function (val) {
                        if (!val._isAMomentObject) {
                            val = null;
                        }
                        _this.props.wrapper.valueListener(val, true, _this);
                    }
                };
                return entry_js_1.R.div({
                    title: (this.props.isCompact ? field.name : '')
                }, React.createElement(this.ReactDatetimeClass, inputsProps));
            }
            else {
                return entry_js_1.R.span(null, value);
            }
        };
        return DateField;
    }(field_4_datetime_js_1.dateFieldMixins)));
});
//# sourceMappingURL=field-11-date.js.map