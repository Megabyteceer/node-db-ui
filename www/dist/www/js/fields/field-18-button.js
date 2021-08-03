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
        define(["require", "exports", "../events/fields_events.js", "../utils.js", "../utils.js", "./field-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fields_events_js_1 = require("../events/fields_events.js");
    var utils_js_1 = require("../utils.js");
    var utils_js_2 = require("../utils.js");
    var field_mixins_js_1 = require("./field-mixins.js");
    utils_js_2.registerFieldClass(FIELD_18_BUTTON, /** @class */ (function (_super) {
        __extends(ButtonField, _super);
        function ButtonField(props) {
            var _this = _super.call(this, props) || this;
            _this.onClick = _this.onClick.bind(_this);
            return _this;
        }
        ButtonField.prototype.setValue = function (val) {
        };
        ButtonField.prototype.onClick = function () {
            if (fields_events_js_1.default.hasOwnProperty(this.props.field.id)) {
                this.props.form.processFormEvent.call(this.props.form, fields_events_js_1.default[this.props.field.id], true);
            }
        };
        ButtonField.prototype.render = function () {
            var field = this.props.field;
            var bIcon;
            if (field.icon) {
                bIcon = utils_js_1.renderIcon(field.icon);
            }
            return R.button({ className: (this.props.disabled ? 'unclickable field-button' : 'clickable field-button'), onClick: this.onClick }, bIcon, field.name);
        };
        return ButtonField;
    }(field_mixins_js_1.default)));
});
//# sourceMappingURL=field-18-button.js.map