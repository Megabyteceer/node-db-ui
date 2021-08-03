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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./debug-panel.js", "./entry.js", "./left-bar.js", "./loading-indicator.js", "./modal.js", "./notify.js", "./stage.js", "./top-bar.js", "./utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ENV = void 0;
    var debug_panel_js_1 = require("./debug-panel.js");
    var entry_js_1 = require("./entry.js");
    var left_bar_js_1 = require("./left-bar.js");
    var loading_indicator_js_1 = require("./loading-indicator.js");
    var modal_js_1 = require("./modal.js");
    var notify_js_1 = require("./notify.js");
    var stage_js_1 = require("./stage.js");
    var top_bar_js_1 = require("./top-bar.js");
    var utils_js_1 = require("./utils.js");
    var ENV = {};
    exports.ENV = ENV;
    var MainFrame = /** @class */ (function (_super) {
        __extends(MainFrame, _super);
        function MainFrame(props) {
            var _this = _super.call(this, props) || this;
            MainFrame.instance = _this;
            _this.reloadOptions();
            return _this;
        }
        MainFrame.prototype.reloadOptions = function () {
            return __awaiter(this, void 0, void 0, function () {
                var data, nodesTree, items, k, i, parent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, utils_js_1.getData('api/getOptions')];
                        case 1:
                            data = _a.sent();
                            nodesTree = data.nodesTree;
                            items = {};
                            Object.assign(ENV, data.options);
                            ENV.nodesTree = nodesTree;
                            /// #if DEBUG
                            if (!ENV.DEBUG) {
                                throw "DEBUG directives nad not cutted of in PRODUCTION mode";
                            }
                            ;
                            /// #endif
                            nodesTree.some(function (i) {
                                items[i.id] = i;
                                if (i.id === 2) {
                                    ENV.rootItem = i;
                                }
                            });
                            for (k in nodesTree) {
                                i = nodesTree[k];
                                if (items.hasOwnProperty(i.parent)) {
                                    parent = items[i.parent];
                                    if (!parent.hasOwnProperty('children')) {
                                        parent.children = [];
                                    }
                                    parent.children.push(i);
                                }
                            }
                            this.forceUpdate();
                            return [2 /*return*/];
                    }
                });
            });
        };
        MainFrame.prototype.render = function () {
            var debug = React.createElement(debug_panel_js_1.default);
            if (!ENV.nodesTree) {
                return entry_js_1.R.div(null, debug);
            }
            return entry_js_1.R.div(null, React.createElement(top_bar_js_1.default), entry_js_1.R.table({ className: "root-table" }, entry_js_1.R.tbody(null, entry_js_1.R.tr(null, React.createElement(left_bar_js_1.default, { staticItems: ENV.rootItem.children }), entry_js_1.R.td({ className: "stage-container" }, React.createElement(stage_js_1.Stage))))), entry_js_1.R.div({ className: "footer" }, ENV.APP_TITLE), React.createElement(modal_js_1.default), React.createElement(notify_js_1.default), debug, React.createElement(loading_indicator_js_1.default));
        };
        return MainFrame;
    }(React));
    /** @type MainFrame */
    MainFrame.instance = null;
    exports.default = MainFrame;
});
//# sourceMappingURL=main-frame.js.map