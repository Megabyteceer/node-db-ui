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
        define(["require", "exports", "./forms/form-full.js", "./forms/list.js", "./left-bar.js", "./utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FormLoaderCog = exports.Stage = void 0;
    var form_full_js_1 = require("./forms/form-full.js");
    var list_js_1 = require("./forms/list.js");
    var left_bar_js_1 = require("./left-bar.js");
    var utils_js_1 = require("./utils.js");
    var FormLoaderCog = /** @class */ (function (_super) {
        __extends(FormLoaderCog, _super);
        function FormLoaderCog() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FormLoaderCog.prototype.render = function () {
            return R.div({ className: "fade-in loading-icon" }, utils_js_1.renderIcon('cog fa-spin fa-5x'));
        };
        return FormLoaderCog;
    }(Component));
    exports.FormLoaderCog = FormLoaderCog;
    if (utils_js_1.isLitePage()) {
        document.body.classList.add('lite-ui');
    }
    var Stage = /** @class */ (function (_super) {
        __extends(Stage, _super);
        function Stage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Stage.prototype.componentDidMount = function () {
            Stage.instance = this;
        };
        Stage.prototype.setCustomClass = function (className, props) {
            this.setState({ customClass: className, props: props });
        };
        Stage.prototype._setFormData = function (node, data, recId, filters, editable) {
            var _this = this;
            utils_js_1.consoleLog('set form data');
            if (typeof (node) !== 'undefined') {
                this.state = null;
                setTimeout(function () {
                    _this.filters = filters;
                    _this.setState({ node: node, data: data, recId: recId, editable: editable });
                });
            }
            else {
                this.state = null;
                this.forceUpdate();
            }
        };
        Stage.prototype.setFormFilter = function (name, val) {
            if (!this.filters) {
                this.filters = {};
            }
            if (this.filters[name] !== val) {
                this.filters[name] = val;
                this.forceUpdate();
                if (name === 'tab') {
                    left_bar_js_1.default.instance.refreshLeftBarActive();
                }
                return true;
            }
        };
        Stage.prototype.loadCustomClass = function () {
            var _this = this;
            utils_js_1.loadJS('js/custom/' + this.state.customClass.toLowerCase() + '.js').then(function () {
                _this.forceUpdate();
            });
        };
        Stage.prototype.render = function () {
            var _this = this;
            var body;
            if (this.state) {
                if (this.state.customClass) {
                    if (!window[this.state.customClass]) {
                        setTimeout(function () {
                            _this.loadCustomClass();
                        }, 1);
                    }
                    else {
                        return React.createElement(window[this.state.customClass], this.state.props);
                    }
                }
                else {
                    if (!this.state.node.staticLink) {
                        if (typeof (this.state.recId) !== 'undefined') {
                            body = React.createElement(form_full_js_1.default, { node: this.state.node, initialData: this.state.data, filters: this.filters || {}, editable: this.state.editable });
                        }
                        else {
                            body = React.createElement(list_js_1.default, { node: this.state.node, initialData: this.state.data, filters: this.filters || {} });
                        }
                    }
                    else {
                        if (this.state.node.staticLink === 'reactClass') {
                            if (typeof window[this.state.node.tableName] === 'undefined') {
                                utils_js_1.myAlert('Unknown react class: ' + this.state.node.tableName);
                            }
                            else {
                                body = React.createElement(window[this.state.node.tableName], { node: this.state.node, recId: this.state.recId, filters: this.filters || {} });
                            }
                        }
                        else {
                            location.href = this.state.node.staticLink;
                        }
                    }
                }
            }
            else {
                body = React.createElement(FormLoaderCog);
            }
            return R.div({ className: 'stage' }, body);
        };
        return Stage;
    }(Component));
    exports.Stage = Stage;
    /** @type Stage */
    Stage.instance = null;
});
//# sourceMappingURL=stage.js.map