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
    utils_js_1.registerFieldClass(FIELD_1_TEXT, /** @class */ (function (_super) {
        __extends(TextField, _super);
        function TextField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TextField.prototype.setValue = function (val) {
            this.refToInput.value = val;
            this.state.value = val;
        };
        TextField.prototype.render = function () {
            var _this = this;
            var value = this.state.value;
            var field = this.props.field;
            if (typeof (value) !== 'string') {
                if (value === null || value === undefined) {
                    value = '';
                }
                else {
                    setTimeout(function () {
                        console.error('non string value for field ' + field.name + ' with default type');
                        //debugError('non string value for field '+field.name+' with default type');
                    }, 1);
                    /// #if DEBUG
                    utils_js_1.consoleDir(field);
                    utils_js_1.consoleDir(value);
                    /// #endif
                    value = JSON.stringify(value);
                }
            }
            if (this.props.isEdit) {
                var className = void 0;
                if (this.props.isCompact) {
                    if (field.maxlen > 600) {
                        className = 'middle-size-input';
                    }
                }
                else {
                    if (field.maxlen > 600) {
                        className = 'large-input';
                    }
                    else if (field.maxlen > 200) {
                        className = 'middle-size-input';
                    }
                }
                var inputsProps = {
                    className: className,
                    defaultValue: value,
                    maxLength: this.props.maxLen || field.maxlen,
                    title: field.name,
                    placeholder: field.name + (field.lang ? (' (' + field.lang + ')') : ''),
                    readOnly: this.props.fieldDisabled,
                    ref: this.refGetter,
                    onChange: function () {
                        _this.props.wrapper.valueListener(_this.refToInput.value, true, _this);
                    }
                };
                if (field.maxlen > 200) {
                    return R.textarea(inputsProps);
                }
                else {
                    return R.input(inputsProps);
                }
            }
            else {
                return this.renderTextValue(value);
            }
        };
        return TextField;
    }(field_mixins_js_1.default)));
});
//# sourceMappingURL=field-1-text-default.js.map