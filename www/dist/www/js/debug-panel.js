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
        define(["require", "exports", "./main-frame.js", "./user.js", "./utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var main_frame_js_1 = require("./main-frame.js");
    var user_js_1 = require("./user.js");
    var utils_js_1 = require("./utils.js");
    var currentId = 10;
    var debugInfo = [];
    var DebugPanel = /** @class */ (function (_super) {
        __extends(DebugPanel, _super);
        function DebugPanel(props) {
            var _this = _super.call(this, props) || this;
            _this.state = { expanded: false };
            DebugPanel.instance = _this;
            _this.clear = _this.clear.bind(_this);
            _this.show = _this.show.bind(_this);
            _this.hide = _this.hide.bind(_this);
            return _this;
        }
        DebugPanel.prototype.show = function () {
            if (debugInfo.length > 0) {
                this.setState({ expanded: true });
            }
        };
        DebugPanel.prototype.hide = function () {
            this.setState({ expanded: false });
        };
        DebugPanel.prototype.clear = function () {
            currentId = 10;
            debugInfo.length = 0;
            this.hide();
        };
        DebugPanel.prototype.addEntry = function (entry, expand, url) {
            if (typeof (entry) === 'string') {
                entry = { message: entry };
            }
            if (url) {
                entry.request = url;
            }
            entry.id = currentId++;
            debugInfo.unshift(entry);
            while (debugInfo.length > 100) {
                debugInfo.pop();
            }
            if (expand) {
                this.show();
            }
            this.forceUpdate();
        };
        DebugPanel.prototype.deployClick = function (ev) {
            return __awaiter(this, void 0, void 0, function () {
                var testResult, deployData, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            utils_js_1.sp(ev);
                            return [4 /*yield*/, utils_js_1.myPromt(utils_js_1.L('DEPLOY_TO', main_frame_js_1.ENV.DEPLOY_TO))];
                        case 1:
                            if (!_a.sent()) return [3 /*break*/, 6];
                            return [4 /*yield*/, utils_js_1.getData('test_uyas87dq8qwdqw/test')];
                        case 2:
                            testResult = _a.sent();
                            if (!(testResult === 'ok')) return [3 /*break*/, 5];
                            return [4 /*yield*/, utils_js_1.getData('/deploy/api/deploy', { commitmessage: 'no message' })];
                        case 3:
                            deployData = _a.sent();
                            return [4 /*yield*/, utils_js_1.getData('test_uyas87dq8qwdqw/test', { remote: true })];
                        case 4:
                            data = _a.sent();
                            if (data === 'ok') {
                                utils_js_1.myAlert(R.span(utils_js_1.renderIcon('thumbs-up'), 'Changes aplied to ', R.a({ href: main_frame_js_1.ENV.DEPLOY_TO, target: '_blank', onClick: function (ev) { ev.stopPropagation(); } }, main_frame_js_1.ENV.DEPLOY_TO), R.br(), JSON.stringify(deployData)), true);
                            }
                            else {
                                utils_js_1.myAlert(R.div(null, R.h2(null, utils_js_1.L('TESTS_ERROR')), data));
                            }
                            return [3 /*break*/, 6];
                        case 5:
                            utils_js_1.myAlert(R.div(null, R.h2(null, utils_js_1.L('TESTS_ERROR')), testResult));
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        DebugPanel.prototype.render = function () {
            var body;
            var deployBtn;
            var cacheClearBtn;
            var clearBtn = R.a({ className: 'clickable admin-controll', onClick: this.clear }, utils_js_1.renderIcon('trash'));
            if (user_js_1.iAdmin()) {
                deployBtn = R.a({ className: 'clickable admin-controll', title: utils_js_1.L('DEPLOY'), onClick: this.deployClick }, utils_js_1.renderIcon('upload'));
                cacheClearBtn = R.a({
                    className: 'clickable admin-controll', title: utils_js_1.L('CLEAR_CACHE'), onClick: function (ev) {
                        utils_js_1.sp(ev);
                        utils_js_1.getData('admin/cache_info', { clear: 1, json: 1 }).then(function () { location.reload(); });
                    }
                }, utils_js_1.renderIcon('refresh'));
            }
            if (debugInfo.length === 0) {
                body = R.span();
            }
            else {
                if (this.state.expanded) {
                    var items = debugInfo.map(function (i, iKey) {
                        var entryBody;
                        if (i.hasOwnProperty('SQLs')) {
                            entryBody = i.SQLs.map(function (SQL, key) {
                                return R.div({ key: key }, R.div({ className: 'debug-panel-header' }, SQL.SQL), R.div({ className: 'debug-panel-text' }, 'time (ms): ' + (SQL.timeElapsed_ms || -99999).toFixed(4)), SQL.stack.map(function (i, key) {
                                    return R.p({ key: key, className: 'debug-panel-entry' }, i);
                                }));
                            });
                        }
                        else {
                            entryBody = '';
                        }
                        var stackBody;
                        if (i.hasOwnProperty('stack')) {
                            stackBody = i.stack.map(function (i, key) {
                                return R.p({ key: key, className: 'debug-panel-entry' }, i);
                            });
                        }
                        else {
                            stackBody = '';
                        }
                        return R.div({ className: "debug-panel-item", key: i.id }, R.span({ className: "debug-panel-request-header" }, i.request + ': '), R.b({ className: "debug-panel-message" }, R.div({ dangerouslySetInnerHTML: { __html: utils_js_1.strip_tags(i.message) } })), R.div({ className: "debug-panel-time" }, 'time elapsed (ms): ' + (i.timeElapsed_ms || -9999).toFixed(4)), stackBody, R.hr(), entryBody);
                    });
                    body = R.div({ className: "admin-controll" }, R.div({ className: "debug-panel-background", onClick: this.hide }), R.div({ className: "debug-panel-panel" }, R.a({ className: 'clickable admin-controll', title: utils_js_1.L('CLEAR_DEBUG'), onClick: this.clear }, utils_js_1.renderIcon('trash')), R.div({ className: "debug-panel-scroll" }, items)));
                }
                else {
                    if (utils_js_1.isLitePage()) {
                        body = R.span();
                    }
                    else {
                        body = R.div({ className: "admin-controll debug-panel-panel" }, cacheClearBtn, deployBtn, clearBtn, R.br(), R.span({ className: 'debug-panel-sql-btn admin-controll clickable', onClick: this.show }, 'requests ' + debugInfo.length, R.br(), 'SQL ' + debugInfo.reduce(function (pc, i) {
                            if (i.hasOwnProperty('SQLs')) {
                                pc += i.SQLs.length;
                            }
                            return pc;
                        }, 0)));
                    }
                }
            }
            return body;
        };
        return DebugPanel;
    }(Component));
    exports.default = DebugPanel;
    /** @type DebugPanel */
    DebugPanel.instance = null;
});
//# sourceMappingURL=debug-panel.js.map