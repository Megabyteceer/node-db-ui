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
        define(["require", "exports", "../utils.js", "../utils.js", "./field-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_js_1 = require("../utils.js");
    var utils_js_2 = require("../utils.js");
    var field_mixins_js_1 = require("./field-mixins.js");
    var idCounter = 0;
    var listeners = {};
    window.addEventListener('message', function (e) {
        var data = e.data;
        if (listeners.hasOwnProperty(data.id)) {
            listeners[data.id](data);
        }
    });
    utils_js_2.registerFieldClass(FIELD_19_RICHEDITOR, /** @class */ (function (_super) {
        __extends(RichEditorField, _super);
        function RichEditorField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RichEditorField.prototype.getSummernote = function () {
            return this.viewportRef.contentWindow;
        };
        RichEditorField.prototype.componentDidMount = function () {
            var _this = this;
            if (this.props.isEdit) {
                this.iframeId = idCounter++;
                var field = this.props.field;
                var w = Math.floor(field.maxlen / 10000);
                var h = field.maxlen % 10000;
                var options = {
                    width: w,
                    height: h,
                    lang: 'ru-RU'
                };
                listeners[this.iframeId] = function (data) {
                    if (!_this.summerNoteIsInited) {
                        _this.summerNoteIsInited = true;
                        _this.forceUpdate();
                    }
                    var s = _this.getSummernote();
                    if (data.hasOwnProperty('value')) {
                        _this.setValue(data.value, false);
                        _this.props.wrapper.valueListener(_this.state.value, true, _this);
                    }
                    else {
                        s.postMessage({ options: options, value: _this.state.value }, '*');
                    }
                    if (_this.onSaveCallback) {
                        _this.onSaveCallback(data.value);
                        delete _this.onSaveCallback;
                    }
                };
            }
        };
        RichEditorField.prototype.componentWillUnmount = function () {
            delete (listeners[this.iframeId]);
            if (this.interval) {
                clearInterval(this.interval);
                delete (this.interval);
            }
        };
        RichEditorField.prototype.getMessageIfInvalid = function () {
            return __awaiter(this, void 0, void 0, function () {
                var val;
                return __generator(this, function (_a) {
                    if (this.state.value) {
                        val = this.state.value;
                        if (val.length > 4000000) {
                            return [2 /*return*/, utils_js_1.L('RICH_ED_SIZE', this.props.field.name)];
                        }
                    }
                    return [2 /*return*/, (false)];
                });
            });
        };
        RichEditorField.prototype.setValue = function (val, sendToEditor) {
            if ($('<div>' + val + '</div>').text() === '') {
                val = '';
            }
            if (this.state.value !== val) {
                if (sendToEditor !== false) {
                    var s = this.getSummernote();
                    s.postMessage({ value: val }, '*');
                }
                this.state.value = val;
            }
        };
        RichEditorField.prototype.beforeSave = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve) {
                            var s = _this.getSummernote();
                            _this.onSaveCallback = resolve;
                            s.postMessage({ onSaveRichEditor: true }, '*');
                        })];
                });
            });
        };
        RichEditorField.prototype.render = function () {
            var _this = this;
            if (this.props.isEdit) {
                var field = this.props.field;
                var w = Math.floor(field.maxlen / 10000) + 230;
                var h = (field.maxlen % 10000) + 30;
                var style = { width: w, height: h + 100 };
                var cog;
                if (!this.summerNoteIsInited) {
                    cog = R.div(null, utils_js_1.renderIcon('cog fa-spin'));
                }
                return R.div(null, cog, R.iframe({ ref: function (r) { _this.viewportRef = r; }, allowFullScreen: true, sandbox: 'allow-scripts allow-forms allow-same-origin', style: style, src: 'rich-editor/index.html?iframeId=' + this.iframeId }));
            }
            else {
                return R.div({ dangerouslySetInnerHTML: { __html: this.props.initialValue } });
            }
        };
        return RichEditorField;
    }(field_mixins_js_1.default)));
});
//# sourceMappingURL=field-19-rich-ditor.js.map