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
    var intToColor = function (color, alpha) {
        var ret = 'rgba(' + ((color >> 16) & 255) + ',' + ((color >> 8) & 255) + ',' + (color & 255) + ',' + (alpha / 255.0).toFixed(2) + ')';
        return ret;
    };
    var validateValue = function (val) {
        return (typeof val !== 'number' || isNaN(val)) ? 0xffffffff : val;
    };
    utils_js_1.registerFieldClass(FIELD_20_COLOR, /** @class */ (function (_super) {
        __extends(ColorField, _super);
        function ColorField(props) {
            var _this = _super.call(this, props) || this;
            var val = validateValue(props.initialValue);
            _this.state = { value: val, color: val % 0x1000000, alpha: Math.floor(val / 0x1000000) };
            _this.onChangeColor = _this.onChangeColor.bind(_this);
            _this.onChangeAlpha = _this.onChangeAlpha.bind(_this);
            return _this;
        }
        ColorField.prototype.onChangeAlpha = function (ev) {
            this.setState({ alpha: ev.target.value });
            this._onChange();
        };
        ColorField.prototype._onChange = function () {
            var value = Math.floor(Math.floor(this.state.alpha) * 0x1000000) + this.state.color;
            this.setState({ value: value });
            this.props.wrapper.valueListener(value, true, this);
        };
        ColorField.prototype.onChangeColor = function (ev) {
            this.setState({ color: parseInt(ev.target.value.substr(1), 16) });
            this._onChange();
        };
        ColorField.prototype.setValue = function (value) {
            value = validateValue(value);
            this.setState({ color: value % 0x1000000, alpha: Math.floor(value / 0x1000000) });
        };
        ColorField.prototype.render = function () {
            var background = intToColor(this.state.color, this.state.alpha);
            var preview = R.div({ className: "field-color-input field-color-preview-bg" }, R.div({ className: 'field-color-preview', style: { background: background } }));
            if (this.props.isEdit) {
                return R.div(null, R.input({ className: 'field-color-input field-color-input-picker', type: 'color', defaultValue: '#' + (this.state.color & 0xFFFFFF).toString(16), onChange: this.onChangeColor }), preview, R.input({ className: 'field-color-input field-color-input-alpha-slider', type: 'range', min: 0, max: 255, value: this.state.alpha, onChange: this.onChangeAlpha }), R.input({ className: 'field-color-input field-color-input-alpha-input', type: 'number', min: 0, max: 255, value: this.state.alpha, onChange: this.onChangeAlpha }));
            }
            else {
                return preview;
            }
        };
        return ColorField;
    }(field_mixins_js_1.default)));
});
//# sourceMappingURL=field-20-color.js.map