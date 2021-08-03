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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "js/entry.js", "react", "../forms/form-mixins.js", "../stage.js", "../user.js", "../utils.js", "./node-admin.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var entry_js_1 = require("js/entry.js");
    var react_1 = require("react");
    var form_mixins_js_1 = __importDefault(require("../forms/form-mixins.js"));
    var stage_js_1 = require("../stage.js");
    var user_js_1 = require("../user.js");
    var utils_js_1 = require("../utils.js");
    var node_admin_js_1 = __importDefault(require("./node-admin.js"));
    function check() {
        return entry_js_1.R.span({
            className: "admin-role-prevs-check"
        }, utils_js_1.renderIcon('check'));
    }
    var PrevsEditor = /** @class */ (function (_super) {
        __extends(PrevsEditor, _super);
        function PrevsEditor() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PrevsEditor.prototype.render = function () {
            var _this = this;
            var body;
            var item = this.props.item;
            var mask = (Math.pow(2, this.props.bitsCount) - 1) * this.props.baseBit;
            var curVal = (item.prevs & mask);
            var title;
            if (curVal === 0) {
                body = entry_js_1.R.span({
                    className: "admin-role-prevs-disabled"
                }, utils_js_1.renderIcon('ban'));
                title = utils_js_1.L('ADM_NA');
            }
            else if (this.props.bitsCount === 1) {
                body = entry_js_1.R.span({
                    className: "admin-role-prevs-enabled"
                }, check());
                title = utils_js_1.L('ADM_A');
            }
            else {
                switch (curVal / this.props.baseBit) {
                    case 1:
                        body = entry_js_1.R.span({
                            className: "admin-role-prevs-enabled"
                        }, check());
                        title = utils_js_1.L('ADM_A_OWN');
                        break;
                    case 2:
                    case 3:
                        body = entry_js_1.R.span({
                            className: "admin-role-prevs-enabled"
                        }, entry_js_1.R.span({
                            className: "admin-role-prevs-size2"
                        }, check(), check()));
                        title = utils_js_1.L('ADM_A_ORG');
                        break;
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        body = entry_js_1.R.span({
                            className: "admin-role-prevs-enabled"
                        }, entry_js_1.R.span({
                            className: "admin-role-prevs-size3"
                        }, check(), check(), check()));
                        title = utils_js_1.L('ADM_A_FULL');
                        break;
                    default:
                        body = 'props: ' + (curVal / this.props.baseBit);
                        break;
                }
            }
            return entry_js_1.R.td({
                className: 'clickable admin-role-prevs-cell',
                title: title,
                onClick: function () {
                    curVal *= 2;
                    curVal += _this.props.baseBit;
                    if ((curVal & mask) !== curVal) {
                        curVal = 0;
                    }
                    item.prevs = ((item.prevs & (65535 ^ mask)) | curVal);
                    _this.forceUpdate();
                }
            }, body);
        };
        return PrevsEditor;
    }(react_1.Component));
    var AdminRoleprevsForm = /** @class */ (function (_super) {
        __extends(AdminRoleprevsForm, _super);
        function AdminRoleprevsForm(props) {
            var _this = _super.call(this, props) || this;
            _this.saveClick = _this.saveClick.bind(_this);
            return _this;
        }
        AdminRoleprevsForm.prototype.componentDidMount = function (props, state) {
            this.onShow();
        };
        AdminRoleprevsForm.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
            _super.prototype.UNSAFE_componentWillReceiveProps.call(this, nextProps);
            this.onShow();
        };
        AdminRoleprevsForm.prototype.onShow = function () {
            return __awaiter(this, void 0, void 0, function () {
                var node, data, _i, _a, i;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, utils_js_1.getNode(this.props.recId)];
                        case 1:
                            node = _b.sent();
                            return [4 /*yield*/, utils_js_1.getData('admin/nodePrevs', {
                                    nodeId: this.props.recId
                                })];
                        case 2:
                            data = _b.sent();
                            for (_i = 0, _a = data.prevs; _i < _a.length; _i++) {
                                i = _a[_i];
                                if (!i.prevs) {
                                    i.prevs = 0;
                                }
                            }
                            this.initData = Object.assign({}, data.prevs);
                            this.setState({
                                node: node,
                                data: data
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        AdminRoleprevsForm.prototype.saveClick = function () {
            return __awaiter(this, void 0, void 0, function () {
                var submit, _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(JSON.stringify(this.initData) !== JSON.stringify(this.state.data.prevs))) return [3 /*break*/, 4];
                            submit = function (toChild) {
                                _this.state.data.nodeId = _this.props.recId;
                                _this.state.data.toChild = _this.props.toChild;
                                utils_js_1.submitData('admin/nodePrevs', _this.state.data).then(function () {
                                    _this.cancelClick();
                                });
                            };
                            if (!this.state.data.isDoc) return [3 /*break*/, 1];
                            submit();
                            return [3 /*break*/, 3];
                        case 1:
                            _a = submit;
                            return [4 /*yield*/, utils_js_1.myPromt(utils_js_1.L('APPLY_CHILD'), utils_js_1.L('TO_THIS'), utils_js_1.L('TO_ALL'), 'check', 'check')];
                        case 2:
                            _a.apply(void 0, [!(_b.sent())]);
                            _b.label = 3;
                        case 3: return [3 /*break*/, 5];
                        case 4:
                            this.cancelClick();
                            _b.label = 5;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        AdminRoleprevsForm.prototype.render = function () {
            if (this.state && this.state.data) {
                var data = this.state.data;
                var node = this.state.node;
                var lines = data.prevs.map(function (i) {
                    return entry_js_1.R.tr({
                        key: i.id,
                        className: "admin-role-prevs-line"
                    }, entry_js_1.R.td({
                        className: "admin-role-prevs-line-header"
                    }, i.name), React.createElement(PrevsEditor, {
                        bitsCount: 3,
                        baseBit: PREVS_VIEW_OWN,
                        item: i
                    }), React.createElement(PrevsEditor, {
                        bitsCount: 1,
                        baseBit: PREVS_CREATE,
                        item: i
                    }), React.createElement(PrevsEditor, {
                        bitsCount: 3,
                        baseBit: PREVS_EDIT_OWN,
                        item: i
                    }), React.createElement(PrevsEditor, {
                        bitsCount: 1,
                        baseBit: PREVS_DELETE,
                        item: i
                    }), node.draftable ? React.createElement(PrevsEditor, {
                        bitsCount: 1,
                        baseBit: PREVS_PUBLISH,
                        item: i
                    }) : undefined);
                });
                var body = entry_js_1.R.div({
                    className: "admin-role-prevs-block"
                }, entry_js_1.R.h3(null, entry_js_1.R.span({
                    className: "admin-role-prevs-header"
                }, utils_js_1.L('ADM_NODE_ACCESS')), node.matchName), entry_js_1.R.table({
                    className: "admin-role-prevs-table"
                }, entry_js_1.R.thead({
                    className: "admin-role-prevs-row-header"
                }, entry_js_1.R.tr({
                    className: "admin-role-prevs-line"
                }, entry_js_1.R.th(), entry_js_1.R.th(null, utils_js_1.L('VIEW')), entry_js_1.R.th(null, utils_js_1.L('CREATE')), entry_js_1.R.th(null, utils_js_1.L('EDIT')), entry_js_1.R.th(null, utils_js_1.L('DELETE')), node.draftable ? entry_js_1.R.th(null, utils_js_1.L('PUBLISH')) : undefined)), entry_js_1.R.tbody(null, lines)));
                var saveButton = entry_js_1.R.button({
                    className: 'clickable success-button',
                    onClick: this.saveClick
                }, this.isSlave() ? utils_js_1.renderIcon('check') : utils_js_1.renderIcon('floppy-o'), this.isSlave() ? '' : utils_js_1.L('SAVE'));
                var nodeAdmin;
                if (user_js_1.iAdmin()) {
                    nodeAdmin = React.createElement(node_admin_js_1.default, {
                        form: this,
                        x: 320,
                        y: -40
                    });
                }
                var closeButton = entry_js_1.R.button({
                    className: 'clickable default-button',
                    onClick: this.cancelClick
                }, utils_js_1.renderIcon('times'), this.isSlave() ? '' : utils_js_1.L('CANCEL'));
                return entry_js_1.R.div({ className: "admin-role-prevs-body" }, nodeAdmin, body, entry_js_1.R.div(null, saveButton, closeButton));
            }
            else {
                return React.createElement(stage_js_1.FormLoaderCog);
            }
        };
        return AdminRoleprevsForm;
    }(form_mixins_js_1.default));
    exports.default = AdminRoleprevsForm;
});
//# sourceMappingURL=admin-roleprevs-form.js.map