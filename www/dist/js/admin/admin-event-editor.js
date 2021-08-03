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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
        define(["require", "exports", "react-dom", "js/entry.js", "react", "../modal.js", "../utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    var __syncRequire = typeof module === "object" && typeof module.exports === "object";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.admin_editSource = void 0;
    var react_dom_1 = __importDefault(require("react-dom"));
    var entry_js_1 = require("js/entry.js");
    var react_1 = require("react");
    var modal_js_1 = __importDefault(require("../modal.js"));
    var utils_js_1 = require("../utils.js");
    var node;
    function admin_editSource(handler, node_, field, form) {
        node = node_;
        var title, type, id;
        if (handler === 'onchange') {
            title = utils_js_1.L('ADM_ONCHANGEEVENT', field.fieldName) + ' (' + field.name + '):';
            type = 'field';
            id = field.id;
        }
        else {
            title = utils_js_1.L('', (handler === 'onload') ? 'onLoad' : 'onSave') + ' "' + node.tableName + '" (' + node.singleName + '):';
            type = 'node';
            id = node.id;
        }
        utils_js_1.myAlert(React.createElement(AdminEventEditor, {
            type: type,
            title: title,
            handler: handler,
            itemId: id,
            node: node,
            field: field,
            form: form
        }), false, false, true);
    }
    exports.admin_editSource = admin_editSource;
    var tipProps = [
        'rec_creation',
        'rec_update',
        'onSaveCallback',
        'onCancelCallback',
        'rec_ID',
        'isUserEdit',
        'prev_value',
        'fieldValue(',
        'isFieldEmpty(',
        'setFieldValue(',
        'focusField(',
        'setFieldLabel(',
        'hideField(',
        'showField(',
        'isFieldVisible(',
        'disableField(',
        'enableField(',
        'fieldAlert(',
        'addLookupFilters(',
        'hideFooter(',
        'showFooter(',
        'saveForm('
    ];
    var keysToTip = {
        '.': true,
        '"': true,
        '(': true,
        "'": true
    };
    function javascriptHint(cm, form) {
        var cur = cm.getCursor();
        var token = cm.getTokenAt(cur);
        var list = [];
        var flt;
        var from = token.start;
        var to = token.end;
        if (token.string.charAt(0) === '"' || token.string.charAt(0) === "'") {
            flt = token.string.replace("'", '').replace('"', '');
            list = node.fields.map(function (f) {
                return '"' + f.fieldName + '"';
            });
        }
        else {
            if (token.string === '.') {
                if (cm.getTokenAt({ ch: cur.ch - 2, line: cur.line }).string === 'this') {
                    flt = '';
                    from = to;
                }
            }
            else if (token.type = 'property') {
                if (cm.getTokenAt({ ch: token.start - 2, line: cur.line }).string === 'this') {
                    flt = token.string;
                }
            }
            if (typeof flt !== 'undefined') {
                list = tipProps;
            }
        }
        if (list && flt) {
            flt = flt.toLowerCase();
            list = list.filter(function (s) {
                return s.toLowerCase().indexOf(flt) >= 0;
            });
        }
        // @ts-ignore
        var jsList = CodeMirror.hint.javascript.call(form, cm);
        if (jsList && jsList.list) {
            list = list.concat(jsList.list);
        }
        return {
            from: CodeMirror.Pos(cur.line, from),
            to: CodeMirror.Pos(cur.line, to),
            list: list
        };
    }
    var CodeMirror;
    var AdminEventEditor = /** @class */ (function (_super) {
        __extends(AdminEventEditor, _super);
        function AdminEventEditor(props) {
            var _this = _super.call(this, props) || this;
            _this.getTextareaRef = _this.getTextareaRef.bind(_this);
            _this.saveClick = _this.saveClick.bind(_this);
            if (!CodeMirror) {
                (__syncRequire ? Promise.resolve().then(function () { return __importStar(require("codemirror")); }) : new Promise(function (resolve_1, reject_1) { require(["codemirror"], resolve_1, reject_1); }).then(__importStar)).then(function (module) {
                    CodeMirror = module.CodeMirror;
                    _this.forceUpdate();
                });
            }
            return _this;
        }
        AdminEventEditor.prototype.getPostData = function () {
            return {
                type: this.props.type,
                handler: this.props.handler,
                itemId: this.props.itemId
            };
        };
        AdminEventEditor.prototype.componentDidMount = function () {
            var _this = this;
            utils_js_1.getData('admin/getEventHandler', this.getPostData()).then(function (data) {
                _this.setState({
                    src: data
                });
            });
        };
        AdminEventEditor.prototype.saveClick = function () {
            return __awaiter(this, void 0, void 0, function () {
                var src, compiledSrc, data, er_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.editor.save();
                            if (!(this.state.src !== this.textareaRef.value)) return [3 /*break*/, 5];
                            src = this.textareaRef.value;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            compiledSrc = eval('"use strict";"function" + function Wrapper() {\n' + src + '\n}.name');
                            if (compiledSrc !== 'functionWrapper') {
                                utils_js_1.myAlert("Invalid javascript detected.");
                            }
                            data = this.getPostData();
                            data.__UNSAFE_UNESCAPED = { src: src };
                            return [4 /*yield*/, utils_js_1.submitData('admin/getEventHandler', data).then(function () {
                                    window.location.reload();
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            er_1 = _a.sent();
                            utils_js_1.myAlert(er_1.message);
                            console.dir(er_1);
                            return [3 /*break*/, 4];
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            modal_js_1.default.instance.hide();
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        AdminEventEditor.prototype.getTextareaRef = function (ref) {
            var _this = this;
            if (ref) {
                var ta = react_dom_1.default.findDOMNode(ref);
                this.textareaRef = ref;
                // @ts-ignore
                this.editor = CodeMirror.fromTextArea(ta, {
                    mode: { name: "javascript", globalVars: true },
                    matchBrackets: true,
                    autofocus: true,
                    lineNumbers: true,
                    styleActiveLine: true,
                    hintOptions: {
                        hint: function (cm) {
                            return javascriptHint(cm, _this.props.form);
                        }
                    },
                    extraKeys: {
                        "Ctrl-Space": "autocomplete",
                        "Ctrl-D": function (instance) {
                            var doc = instance.getDoc();
                            if (!doc.somethingSelected()) {
                                var c = doc.getCursor();
                                var text = instance.lineInfo(c.line).text;
                                doc.setCursor({
                                    line: c.line,
                                    ch: text.length
                                });
                                instance.replaceSelection('\r\n' + text);
                                doc.setCursor({
                                    line: c.line + 1,
                                    ch: c.ch
                                });
                            }
                            else {
                                var selections = doc.listSelections();
                                var text = doc.getSelection();
                                instance.replaceSelection(text + text);
                                doc.setSelections(selections);
                            }
                            return false;
                        },
                        "Ctrl-S": function (instance) {
                            _this.saveClick();
                            return false;
                        },
                        "Esc": modal_js_1.default.instance.hide
                    }
                });
                this.editor.setSize('900px', '500px');
                this.editor.on("keyup", function (editor, event) {
                    var k = event.key.toLowerCase();
                    if ((k.length === 1) && ((k === " " && event.ctrlKey) || (k >= 'a' && k <= 'z') || keysToTip[k])) {
                        // @ts-ignore
                        CodeMirror.commands.autocomplete(editor, null, {
                            completeSingle: false
                        });
                    }
                });
            }
        };
        AdminEventEditor.prototype.render = function () {
            if (!this.state || !CodeMirror) {
                return entry_js_1.R.div();
            }
            var fields = this.props.node.fields.map(function (f, i) {
                var extName;
                if (f.name) {
                    extName = ' (' + f.name + ')';
                }
                return entry_js_1.R.div({
                    key: i
                }, ((f.fieldType === FIELD_17_TAB) ? entry_js_1.R.hr({
                    className: 'halfvisible'
                }) : ''), entry_js_1.R.b(null, f.fieldName), extName);
            });
            var functionName = this.props.node.tableName + (this.props.field ? '_' + this.props.field.fieldName + '_' : '_') + this.props.handler;
            return entry_js_1.R.div({
                className: "left"
            }, entry_js_1.R.h4(null, this.props.title), entry_js_1.R.div({
                className: 'admin-events-editor-body'
            }, entry_js_1.R.span({ className: 'monospace' }, (this.props.handler === 'onsave' ? 'async ' : ''), 'function ', entry_js_1.R.b(null, functionName), '() {'), entry_js_1.R.textarea({
                ref: this.getTextareaRef,
                className: "admin-events-editor-textarea",
                defaultValue: this.state.src
            }), entry_js_1.R.span({ className: 'monospace' }, '}')), entry_js_1.R.div({
                className: 'centralize'
            }, entry_js_1.R.button({
                className: 'clickable default-button',
                onClick: modal_js_1.default.instance.hide
            }, utils_js_1.renderIcon('times'), utils_js_1.L('CANCEL')), entry_js_1.R.button({
                className: 'clickable success-button',
                onClick: this.saveClick
            }, utils_js_1.renderIcon('floppy-o'), utils_js_1.L('SAVE'))), entry_js_1.R.hr(), entry_js_1.R.h4(null, utils_js_1.L('ADM_VARS')), entry_js_1.R.b(null, 'this.rec_creation'), utils_js_1.L('ADM_HLP_1'), entry_js_1.R.br(), entry_js_1.R.b(null, 'this.rec_update'), utils_js_1.L('ADM_HLP_2'), entry_js_1.R.br(), entry_js_1.R.b(null, 'this.rec_ID'), utils_js_1.L('ADM_HLP_3'), entry_js_1.R.br(), entry_js_1.R.b(null, 'this.prev_value'), utils_js_1.L('ADM_HLP_4'), entry_js_1.R.br(), entry_js_1.R.b(null, 'this.linkedCreationParams'), utils_js_1.L('ADM_HLP_5'), entry_js_1.R.br(), entry_js_1.R.b(null, 'this.linkedFilter'), utils_js_1.L('ADM_HLP_6'), entry_js_1.R.br(), entry_js_1.R.b(null, 'this.isUserEdit'), utils_js_1.L('ADM_HLP_7'), entry_js_1.R.hr(), entry_js_1.R.h4(null, utils_js_1.L('ADM_FUNCTIONS')), entry_js_1.R.p(null, 'this.fieldValue(fn); this.isFieldEmpty(fn); this.setFieldValue(fn,val); this.isFieldVisible(fn); this.focusField(fn); this.setFieldLabel(fn,val);', entry_js_1.R.br(), 'this.hideField(fn); this.showField(fn); this.disableField(fn); this.enableField(fn); this.fieldAlert(fn, text, isSucess); ', entry_js_1.R.br(), 'this.addLookupFilters(fn, filtersObject), this.hideFooter(), this.showFooter(), this.saveForm()'), entry_js_1.R.hr(), entry_js_1.R.h4(null, utils_js_1.L('ADM_FIELDS')), fields);
        };
        return AdminEventEditor;
    }(react_1.Component));
});
//# sourceMappingURL=admin-event-editor.js.map