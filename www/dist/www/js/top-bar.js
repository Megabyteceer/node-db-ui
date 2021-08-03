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
        define(["require", "exports", "./user.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var user_js_1 = require("./user.js");
    var TopBar = /** @class */ (function (_super) {
        __extends(TopBar, _super);
        function TopBar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TopBar.prototype.render = function () {
            return R.div({ className: 'top-bar' }, R.a({
                className: 'clickable top-bar-logo',
                href: '/'
            }, R.img({ src: 'images/logo.png' })), 
            //search,
            R.div({ className: "top-bar-right-area" }, React.createElement(user_js_1.default)));
        };
        return TopBar;
    }(Component));
    exports.default = TopBar;
});
//# sourceMappingURL=top-bar.js.map