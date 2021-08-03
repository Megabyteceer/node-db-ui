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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "js/entry.js", "../components/select.js", "../utils.js", "./field-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var entry_js_1 = require("js/entry.js");
    var select_js_1 = __importDefault(require("../components/select.js"));
    var utils_js_1 = require("../utils.js");
    var field_mixins_js_1 = __importDefault(require("./field-mixins.js"));
    /*
    var optionStyle = {
        padding:'5px',
        cursor:'pointer'
    }*/
    utils_js_1.registerFieldClass(FIELD_6_ENUM, /** @class */ (function (_super) {
        __extends(EnumField, _super);
        function EnumField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EnumField.prototype.setValue = function (val) {
            this.state.value = val;
        };
        EnumField.prototype.setFilterValues = function (filter) {
            if (filter) {
                this.enum = this.props.field.enum.filter(function (v) { return filter.indexOf(v) < 0; });
            }
            else {
                delete this.enum;
            }
        };
        EnumField.prototype.render = function () {
            var _this = this;
            var value = this.state.value;
            var field = this.props.field;
            if (!value) {
                value = 0;
            }
            if (this.props.isEdit) {
                var inputsProps = {
                    isCompact: this.props.isCompact,
                    defaultValue: value,
                    title: field.name,
                    readOnly: this.props.fieldDisabled,
                    onChange: function (val) {
                        _this.props.wrapper.valueListener(parseInt(val), false, _this);
                    },
                    options: this.enum || field.enum
                };
                return React.createElement(select_js_1.default, inputsProps);
            }
            else {
                return entry_js_1.R.span({
                    className: 'enum-' + field.id + '_' + value
                }, field.enumNamesById[value]);
            }
        };
        return EnumField;
    }(field_mixins_js_1.default)));
});
//# sourceMappingURL=field-6-enum.js.map