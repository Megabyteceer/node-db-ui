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
        define(["require", "exports", "../utils.js", "./field-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_js_1 = require("../utils.js");
    var field_mixins_js_1 = require("./field-mixins.js");
    utils_js_1.registerFieldClass(FIELD_2_INT, /** @class */ (function (_super) {
        __extends(NumericField, _super);
        function NumericField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        NumericField.prototype.setValue = function (val) {
            this.refToInput.value = val;
            this.state.value = val;
        };
        NumericField.decodeValue = function (val) {
            if (val) {
                return parseInt(val);
            }
            return val;
        };
        NumericField.prototype.render = function () {
            var _this = this;
            var value = this.state.value;
            var field = this.props.field;
            if (!value) {
                value = 0;
            }
            if (this.props.isEdit) {
                var inputsProps = {
                    type: 'number',
                    value: value,
                    title: field.name,
                    maxLength: field.maxlen,
                    placeholder: field.name,
                    readOnly: this.props.fieldDisabled,
                    ref: this.refGetter,
                    onChange: function () {
                        var value = parseInt(_this.refToInput.value.substr(0, field.maxlen));
                        _this.setState({ value: value });
                        _this.props.wrapper.valueListener(value, true, _this);
                    }
                };
                return R.input(inputsProps);
            }
            else {
                return this.renderTextValue(value.toString());
            }
        };
        return NumericField;
    }(field_mixins_js_1.default)));
});
//# sourceMappingURL=field-2-numeric.js.map