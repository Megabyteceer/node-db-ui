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
        define(["require", "exports", "react", "./entry.js", "./utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var react_1 = require("react");
    var entry_js_1 = require("./entry.js");
    var utils_js_1 = require("./utils.js");
    var LoadingIndicator = /** @class */ (function (_super) {
        __extends(LoadingIndicator, _super);
        function LoadingIndicator(props) {
            var _this = _super.call(this, props) || this;
            _this.state = { showCount: 0 };
            LoadingIndicator.instance = _this;
            return _this;
        }
        LoadingIndicator.prototype.hide = function () {
            this.setState({ showCount: Math.max(0, this.state.showCount - 1) });
        };
        LoadingIndicator.prototype.show = function () {
            if (utils_js_1.isLitePage())
                return;
            this.state.showCount++;
            if (this.state.showCount === 1) {
                this.forceUpdate();
            }
        };
        LoadingIndicator.prototype.render = function () {
            var active = this.state.showCount > 0;
            return entry_js_1.R.div({ className: active ? 'back-drop' : null }, entry_js_1.R.div({ className: active ? "loading-spinner-container" : "loading-spinner-container-inactive" }, active ? entry_js_1.R.div({ className: "loading-spinner" }, utils_js_1.renderIcon('cog fa-spin')) : undefined));
        };
        return LoadingIndicator;
    }(react_1.Component));
    exports.default = LoadingIndicator;
    /** @type LoadingIndicator */
    LoadingIndicator.instance = null;
});
//# sourceMappingURL=loading-indicator.js.map