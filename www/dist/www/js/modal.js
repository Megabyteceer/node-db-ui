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
        define(["require", "exports", "./utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_js_1 = require("./utils.js");
    var modalStack = [];
    var idCounter = 0;
    var Modal = /** @class */ (function (_super) {
        __extends(Modal, _super);
        function Modal(props) {
            var _this = _super.call(this, props) || this;
            _this.show = _this.show.bind(_this);
            _this.hide = _this.hide.bind(_this);
            return _this;
        }
        Modal.prototype.componentDidMount = function () {
            Modal.instance = this;
        };
        Modal.prototype.show = function (content, noDiscardByBackdrop) {
            if (document.activeElement) {
                // @ts-ignore
                document.activeElement.blur();
            }
            idCounter++;
            if (content) {
                modalStack.push({ content: content, noDiscardByBackdrop: noDiscardByBackdrop, id: idCounter });
            }
            this.forceUpdate();
            return idCounter;
        };
        Modal.prototype.isShowed = function () {
            return modalStack.length > 0;
        };
        Modal.prototype.hide = function (idTohide) {
            if (typeof (idTohide) !== 'number') {
                /// #if DEBUG
                if (modalStack.length < 1) {
                    utils_js_1.debugError('tried to hide modal while no modal showed');
                }
                /// #endif
                modalStack.pop();
            }
            else {
                modalStack = modalStack.filter(function (m) {
                    return m.id !== idTohide;
                });
            }
            this.forceUpdate();
        };
        Modal.prototype.render = function () {
            var _this = this;
            if (modalStack.length > 0) {
                return R.div(null, modalStack.map(function (m) {
                    var className = 'fade-in modal-backdrop';
                    if (m.noDiscardByBackdrop) {
                        className += " pointer";
                    }
                    return R.div({
                        key: m.id,
                        className: className,
                        onClick: function () {
                            if (!m.noDiscardByBackdrop) {
                                _this.hide();
                            }
                        }
                    }, R.div({ className: "modal", onClick: utils_js_1.sp }, m.content));
                }));
            }
            else {
                return R.span();
            }
        };
        return Modal;
    }(Component));
    exports.default = Modal;
    /* @type = {Modal}*/ // #if DEBUG
    Modal.instance = null;
});
//# sourceMappingURL=modal.js.map