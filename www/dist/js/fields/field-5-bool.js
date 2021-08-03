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
        define(["require", "exports", "js/entry.js", "react", "../utils.js", "../utils.js", "./field-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var entry_js_1 = require("js/entry.js");
    var react_1 = require("react");
    var utils_js_1 = require("../utils.js");
    var utils_js_2 = require("../utils.js");
    var field_mixins_js_1 = __importDefault(require("./field-mixins.js"));
    var CheckBox = /** @class */ (function (_super) {
        __extends(CheckBox, _super);
        function CheckBox(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {
                value: _this.props.defaultValue
            };
            return _this;
        }
        CheckBox.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
            this.setState({
                value: nextProps.defaultValue
            });
        };
        CheckBox.prototype.render = function () {
            var _this = this;
            var check;
            if (this.state && this.state.value) {
                check = entry_js_1.R.span({
                    className: "field-boolean-check"
                }, utils_js_1.renderIcon('check'));
            }
            return entry_js_1.R.span({
                className: 'field-boolean clickable',
                title: this.props.title,
                onClick: function () {
                    _this.props.onClick(!_this.state.value);
                }
            }, check);
        };
        return CheckBox;
    }(react_1.Component));
    exports.default = CheckBox;
    utils_js_2.registerFieldClass(FIELD_5_BOOL, /** @class */ (function (_super) {
        __extends(BooleanField, _super);
        function BooleanField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BooleanField.prototype.setValue = function (val) {
            val = (val !== 0) && Boolean(val);
            this.setState({
                value: val
            });
        };
        BooleanField.decodeValue = function (val) {
            return Boolean(val);
        };
        BooleanField.encodeValue = function (val) {
            return val ? 1 : 0;
        };
        BooleanField.prototype.render = function () {
            var _this = this;
            var value = this.state.value;
            var field = this.props.field;
            if (this.props.isEdit) {
                return React.createElement(CheckBox, {
                    disable: this.props.fieldDisabled,
                    title: this.props.isCompact ? field.name : '',
                    defaultValue: value,
                    onClick: function (val) {
                        _this.setValue(val);
                        _this.props.wrapper.valueListener(val, false, _this);
                    }
                });
            }
            else {
                if (this.props.isCompact) {
                    if (value) {
                        return entry_js_1.R.span({
                            className: 'field-boolean-read-only-compact'
                        }, utils_js_1.renderIcon('check'));
                    }
                    else {
                        return entry_js_1.R.span({ className: 'field-boolean-read-only-compact' });
                    }
                }
                else {
                    return entry_js_1.R.span({ className: 'field-boolean-read-only' }, value ? utils_js_1.L('YES') : utils_js_1.L('NO'));
                }
            }
        };
        return BooleanField;
    }(field_mixins_js_1.default)));
});
//# sourceMappingURL=field-5-bool.js.map