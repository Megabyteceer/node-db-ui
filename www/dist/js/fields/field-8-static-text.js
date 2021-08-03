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
        define(["require", "exports", "js/entry.js", "../utils.js", "./field-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var entry_js_1 = require("js/entry.js");
    var utils_js_1 = require("../utils.js");
    var field_mixins_js_1 = __importDefault(require("./field-mixins.js"));
    utils_js_1.registerFieldClass(FIELD_8_STATICTEXT, /** @class */ (function (_super) {
        __extends(StaticTextField, _super);
        function StaticTextField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StaticTextField.prototype.setValue = function (val) { };
        StaticTextField.prototype.render = function () {
            var field = this.props.field;
            if (window[field.fdescription]) {
                return React.createElement(window[field.fdescription], this.props);
            }
            else {
                return entry_js_1.R.span({
                    dangerouslySetInnerHTML: {
                        __html: field.fdescription
                    }
                });
            }
        };
        return StaticTextField;
    }(field_mixins_js_1.default)));
});
//# sourceMappingURL=field-8-static-text.js.map