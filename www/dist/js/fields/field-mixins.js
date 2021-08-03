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
        define(["require", "exports", "react", "../libs/libs.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var react_1 = require("react");
    var libs_js_1 = require("../libs/libs.js");
    var fieldMixins = /** @class */ (function (_super) {
        __extends(fieldMixins, _super);
        function fieldMixins(props) {
            var _this = this;
            assert(props.field, '"field" property  expected.');
            _this = _super.call(this, props) || this;
            var value = props.initialValue;
            if (Array.isArray(value)) {
                value = value.slice();
            }
            _this.state = { value: value };
            _this.refGetter = _this.refGetter.bind(_this);
            return _this;
        }
        fieldMixins.prototype.renderTextValue = function (txt) {
            if (this.props.field.forSearch) {
                var list = this.props.form.props.list;
                if (list && list.filters && list.filters.s) {
                    return React.createElement(libs_js_1.Highlighter, {
                        highlightClassName: 'mark-search',
                        searchWords: [(typeof list.filters.s === 'string') ? list.filters.s : String(list.filters.s)],
                        autoEscape: true,
                        textToHighlight: txt
                    });
                }
            }
            return txt;
        };
        fieldMixins.prototype.focus = function () {
            if (this.refToInput) {
                // @ts-ignore
                ReactDOM.findDOMNode(this.refToInput).focus();
            }
        };
        fieldMixins.prototype.refGetter = function (refToInput) {
            this.refToInput = refToInput;
        };
        return fieldMixins;
    }(react_1.Component));
    exports.default = fieldMixins;
});
//# sourceMappingURL=field-mixins.js.map