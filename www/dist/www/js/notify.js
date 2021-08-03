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
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var instance;
    var stack = [];
    var idCounter = 0;
    var Notify = /** @class */ (function (_super) {
        __extends(Notify, _super);
        function Notify() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Notify.prototype.componentDidMount = function () {
            instance = this;
        };
        Notify.add = function (content) {
            instance.add(content);
        };
        Notify.prototype.add = function (content) {
            var _this = this;
            var id = idCounter++;
            if (content) {
                stack.push({ content: content, id: id });
            }
            setTimeout(function () {
                _this.hideById(id);
            }, 10000);
            this.forceUpdate();
        };
        Notify.prototype.hideById = function (id) {
            stack = stack.filter(function (i) {
                return i.id !== id;
            });
            this.forceUpdate();
        };
        Notify.prototype.render = function () {
            var _this = this;
            if (stack.length > 0) {
                return R.div({ className: "notify-area" }, stack.map(function (m) {
                    return R.div({
                        key: m.id, className: 'fade-in notify-block', onClick: function () {
                            _this.hideById(m.id);
                        }
                    }, m.content.split('\n').map(function (l, i) {
                        return R.div({ key: i }, l);
                    }));
                }));
            }
            else {
                return R.span();
            }
        };
        return Notify;
    }(Component));
    exports.default = Notify;
});
//# sourceMappingURL=notify.js.map