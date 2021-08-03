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
        define(["require", "exports", "../admin/field-admin.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var field_admin_js_1 = require("../admin/field-admin.js");
    var FormTab = /** @class */ (function (_super) {
        __extends(FormTab, _super);
        function FormTab(props) {
            var _this = _super.call(this, props) || this;
            _this.state = { visible: _this.props.visible };
            return _this;
        }
        FormTab.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
            this.state.visible = nextProps.visible;
        };
        FormTab.prototype.show = function (val) {
            if (!this.state.visible) {
                this.setState({ visible: true });
            }
        };
        FormTab.prototype.hide = function (val) {
            if (this.state.visible) {
                this.setState({ visible: false });
            }
        };
        FormTab.prototype.render = function () {
            var className = 'form-tab';
            if (!this.state.visible) {
                className += ' hidden';
            }
            if (this.props.highlightFrame) {
                className += ' form-tab-highlight';
            }
            return R.div({ className: className }, (this.props.highlightFrame ? React.createElement(field_admin_js_1.default, { field: this.props.field, form: this.props.form, x: 13 }) : ''), this.props.fields);
        };
        return FormTab;
    }(Component));
    exports.default = FormTab;
});
//# sourceMappingURL=form-tab.js.map