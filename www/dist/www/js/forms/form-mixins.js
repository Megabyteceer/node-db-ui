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
        define(["require", "exports", "../utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_js_1 = require("../utils.js");
    var BaseForm = /** @class */ (function (_super) {
        __extends(BaseForm, _super);
        function BaseForm(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {};
            _this.filters = Object.assign({}, _this.props.filters);
            _this.fieldsRefs = {};
            _this.cancelClick = _this.cancelClick.bind(_this);
            _this.header = '';
            return _this;
        }
        BaseForm.prototype.UNSAFE_componentWillReceiveProps = function (newProps) {
            this.filters = $.extend({}, newProps.filters);
        };
        BaseForm.prototype.changeFilter = function (name, v, refresh) {
            if (name === 'tab') {
                this.callOnTabShowEvent(v);
            }
            var p = this.filters[name];
            if ((p !== 0) && (v !== 0)) {
                if (!p && !v)
                    return;
            }
            if (p !== v) {
                if (typeof (v) === 'undefined') {
                    if (!this.isSlave()) {
                        delete (currentFormParameters.filters[name]);
                    }
                    delete (this.filters[name]);
                }
                else {
                    if (!this.isSlave()) {
                        currentFormParameters.filters[name] = v;
                    }
                    this.filters[name] = v;
                }
                if (refresh) {
                    this.refreshData();
                }
                return true;
            }
            return false;
        };
        BaseForm.prototype.isSlave = function () {
            if (this.props.parentForm) {
                return true;
            }
            return false;
        };
        BaseForm.prototype.cancelClick = function () {
            if (this.props.onCancel) {
                this.props.onCancel();
                return;
            }
            if (this.onCancelCallback) {
                this.onCancelCallback();
            }
            if (this.isSlave()) {
                this.props.parentForm.toggleCreateDialogue();
            }
            else {
                utils_js_1.goBack();
            }
        };
        return BaseForm;
    }(Component));
    exports.default = BaseForm;
});
//# sourceMappingURL=form-mixins.js.map