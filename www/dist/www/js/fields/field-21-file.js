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
        define(["require", "exports", "../main-frame.js", "../modal.js", "../utils.js", "../utils.js", "./field-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var main_frame_js_1 = require("../main-frame.js");
    var modal_js_1 = require("../modal.js");
    var utils_js_1 = require("../utils.js");
    var utils_js_2 = require("../utils.js");
    var field_mixins_js_1 = require("./field-mixins.js");
    utils_js_2.registerFieldClass(FIELD_21_FILE, /** @class */ (function (_super) {
        __extends(FileField, _super);
        function FileField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FileField.prototype.setValue = function (val) {
            if (typeof val === 'string') {
                this.state.value = val;
            }
            else {
                this.props.form.currentData[this.props.field.fieldName] = undefined;
            }
        };
        FileField.prototype.isEmpty = function () {
            return !this.fileFormBodyRef.fileInputRef.value && !this.state.value;
        };
        FileField.prototype.focus = function () {
            this.fileFormBodyRef.selectButtonRef.focus();
        };
        FileField.prototype.beforeSave = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.fileFormBodyRef.save()];
                });
            });
        };
        FileField.prototype.render = function () {
            var _this_1 = this;
            var field = this.props.field;
            var fileName = this.props.initialValue;
            if (this.props.isEdit) {
                var accept = main_frame_js_1.ENV.ALLOWED_UPLOADS.map(function (i) { return '.' + i; }).join(', ');
                return React.createElement(FileFormBody, { field: field, ref: function (r) { _this_1.fileFormBodyRef = r; }, accept: accept, wrapper: this.props.wrapper, parent: this, form: this.props.form, currentFileName: fileName, isCompact: this.props.isCompact });
            }
            return R.a({ className: 'field-file-link', href: utils_js_1.idToFileUrl(fileName), download: true }, fileName ? (fileName.split('/').pop()) : undefined);
        };
        return FileField;
    }(field_mixins_js_1.default)));
    var FileFormBody = /** @class */ (function (_super) {
        __extends(FileFormBody, _super);
        function FileFormBody(props) {
            var _this_1 = _super.call(this, props) || this;
            _this_1.state = {};
            _this_1._onChange = _this_1._onChange.bind(_this_1);
            return _this_1;
        }
        FileFormBody.prototype._cancel = function () {
            this.setState({
                file: null
            });
            this.fileInputRef.value = '';
            modal_js_1.default.instance.hide();
            this.props.parent.props.wrapper.hideTooltip();
        };
        FileFormBody.prototype.save = function () {
            if (this.state.file) {
                return utils_js_1.submitData('api/uploadFile', utils_js_1.serializeForm(ReactDOM.findDOMNode(this.formRef)), true);
            }
        };
        FileFormBody.prototype._onChange = function (e) {
            var _this = this;
            e.preventDefault();
            var files = undefined;
            if (e.dataTransfer) {
                files = e.dataTransfer.files;
            }
            else if (e.target) {
                files = e.target.files;
            }
            if (utils_js_1.checkFileSize(files[0])) {
                return;
            }
            this.setState({ file: files[0] });
            this.props.wrapper.valueListener(files[0], true, this);
        };
        FileFormBody.prototype.render = function () {
            var _this_1 = this;
            var field = this.props.field;
            var curFile;
            var selFile;
            var select;
            if (this.props.currentFileName) {
                curFile =
                    R.a({ href: utils_js_1.idToFileUrl(this.props.currentFileName), download: true, target: '_blank', className: 'field-file-link' }, this.props.currentFileName.split('/').pop());
            }
            if (this.state.file) {
                selFile = R.span({ className: 'small-text' }, utils_js_1.L('FILE_SELECTED', this.state.file.name), "(", (this.state.file.size / 1000).toFixed(2), utils_js_1.L("KILO_BYTES_SHORT"), ")");
            }
            select = R.button({
                className: 'clickable field-button', onClick: function () {
                    _this_1.fileInputRef.value = null;
                    _this_1.fileInputRef.click();
                }
            }, utils_js_1.renderIcon('folder-open'), utils_js_1.L('FILE_SELECT', utils_js_1.getReadableUploadSize()));
            var recIdField, nodeIdField;
            if (this.props.form.currentData && this.props.form.currentData.id) {
                recIdField = R.input({ name: "recId", className: 'hidden', defaultValue: this.props.form.currentData.id });
                nodeIdField = R.input({ name: "nodeId", className: 'hidden', defaultValue: this.props.form.props.node.id });
            }
            var form = R.form({ ref: function (r) { _this_1.formRef = r; }, encType: "multipart/form-data", className: 'hidden' }, R.input({ name: "all files", ref: function (r) { _this_1.fileInputRef = r; }, type: 'file', accept: this.props.accept, onChange: this._onChange }), R.input({ name: "MAX_FILE_SIZE", defaultValue: 30000000 }), R.input({ name: "fid", defaultValue: field.id }), R.input({ name: "nid", defaultValue: field.node.id }), recIdField, nodeIdField);
            return R.div(null, curFile, selFile, form, select);
        };
        return FileFormBody;
    }(Component));
    exports.default = FileFormBody;
});
//# sourceMappingURL=field-21-file.js.map