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
        define(["require", "exports", "../utils.js", "../utils.js", "./field-mixins.js", "../modal.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    var __syncRequire = typeof module === "object" && typeof module.exports === "object";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_js_1 = require("../utils.js");
    var utils_js_2 = require("../utils.js");
    var field_mixins_js_1 = require("./field-mixins.js");
    var modal_js_1 = require("../modal.js");
    utils_js_2.registerFieldClass(FIELD_12_PICTURE, /** @class */ (function (_super) {
        __extends(PictureField, _super);
        function PictureField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PictureField.prototype.setValue = function (value) {
            this.setState({ value: value });
        };
        PictureField.prototype.isEmpty = function () {
            return !this.cropperBody.references.fileInput.value && !this.state.value;
        };
        PictureField.prototype.focus = function () {
            this.cropperBody.references.selectButton.focus();
        };
        PictureField.prototype.beforeSave = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.cropperBody.save()];
                });
            });
        };
        PictureField.prototype.render = function () {
            var _this_1 = this;
            var field = this.props.field;
            var imgUrl = utils_js_1.idToImgURL(this.props.initialValue, this.props.field.fieldName);
            if (this.props.isEdit) {
                return React.createElement(CropperFieldBody, { field: field, ref: function (r) { _this_1.cropperBody = r; }, parent: this, imageRenderer: this.props.form.imageRenderer, form: this.props.form, currentPicUrl: imgUrl, isCompact: this.props.isCompact });
            }
            else {
                return R.img({ src: imgUrl, className: "field-readonly-image" });
            }
        };
        return PictureField;
    }(field_mixins_js_1.default)));
    var CropperFieldBody = /** @class */ (function (_super) {
        __extends(CropperFieldBody, _super);
        function CropperFieldBody(props) {
            var _this_1 = _super.call(this, props) || this;
            _this_1.state = {
                src: '',
                cropResult: null
            };
            _this_1.references = {};
            _this_1._onChange = _this_1._onChange.bind(_this_1);
            _this_1._cancel = _this_1._cancel.bind(_this_1);
            _this_1._cropImage = _this_1._cropImage.bind(_this_1);
            _this_1.clear = _this_1.clear.bind(_this_1);
            _this_1.save = _this_1.save.bind(_this_1);
            return _this_1;
        }
        CropperFieldBody.prototype._cancel = function () {
            this.setState({
                src: null
            });
            this.references.fileInput.value = '';
            modal_js_1.default.instance.hide();
            this.props.parent.props.wrapper.hideTooltip();
        };
        CropperFieldBody.prototype._cropImage = function (exactlySize, imgData) {
            if (exactlySize === true) { //no cropper needded
                this.setState({
                    cropResult: imgData,
                    src: null
                });
            }
            else {
                if (typeof this.cropper.cropper.getCroppedCanvas() === 'undefined') {
                    return;
                }
                var bounds = this.cropper.cropper.getData();
                this.references.w.value = bounds.width;
                this.references.h.value = bounds.height;
                this.references.x.value = bounds.x;
                this.references.y.value = bounds.y;
                this.setState({
                    cleared: false,
                    cropResult: this.cropper.cropper.getCroppedCanvas().toDataURL(),
                    src: null
                });
                modal_js_1.default.instance.hide();
                this.props.parent.props.wrapper.hideTooltip();
            }
        };
        CropperFieldBody.prototype.clear = function () {
            this.setState({
                cleared: true,
                cropResult: null,
                src: ''
            });
            this.props.parent.setValue('');
            this.references.fileInput.value = '';
        };
        CropperFieldBody.prototype.save = function () {
            return __awaiter(this, void 0, void 0, function () {
                var form;
                return __generator(this, function (_a) {
                    if (this.state.cropResult) {
                        form = ReactDOM.findDOMNode(this.references.form);
                        return [2 /*return*/, utils_js_1.submitData('api/uploadImage', utils_js_1.serializeForm(form), true).catch(function (er) {
                                utils_js_1.myAlert(utils_js_1.L('UPLOAD_ERROR'));
                            })];
                    }
                    else if (this.state.cleared) {
                        return [2 /*return*/, ''];
                    }
                    return [2 /*return*/];
                });
            });
        };
        CropperFieldBody.prototype._onChange = function (e) {
            var _this_1 = this;
            var _this = this;
            e.preventDefault();
            var files = undefined;
            if (e.dataTransfer) {
                files = e.dataTransfer.files;
            }
            else if (e.target) {
                files = e.target.files;
            }
            if (files.length > 0) {
                if (utils_js_1.checkFileSize(files[0])) {
                    return;
                }
                var reader = new FileReader();
                reader.onload = function () {
                    _this.setState({ waiting: 0, src: reader.result, cropResult: false });
                    var selectedImage = new Image();
                    var cropperLoader = __syncRequire ? Promise.resolve().then(function () { return require('../libs/react-cropper.js'); }) : new Promise(function (resolve_1, reject_1) { require(['../libs/react-cropper.js'], resolve_1, reject_1); });
                    selectedImage.onload = function () {
                        cropperLoader.then(function (module) {
                            var ReactCropper = module.ReactCropper;
                            var field = _this_1.props.field;
                            var w = Math.floor(field.maxlen / 10000);
                            var h = field.maxlen % 10000;
                            if ((w === selectedImage.width) && (h === selectedImage.height)) {
                                _this_1._cropImage(true, reader.result);
                            }
                            else {
                                var cropperW = 900;
                                var cropperH = 900 / w * h;
                                if (cropperH > 350) {
                                    cropperH = 350;
                                    cropperW = 350 / h * w;
                                }
                                utils_js_1.myAlert(R.div({ className: 'image-copper-popup' }, React.createElement(ReactCropper, {
                                    zoomable: false,
                                    style: { margin: 'auto', height: cropperH, width: cropperW },
                                    aspectRatio: w / h,
                                    preview: '.image-copper-preview',
                                    guides: false,
                                    src: reader.result,
                                    ref: function (ref) {
                                        _this_1.cropper = ref;
                                    }
                                }), R.div({ className: 'image-copper-controls' }, R.button({ className: 'clickable image-copper-crop-btn', onClick: _this_1._cropImage }, utils_js_1.renderIcon('check'), utils_js_1.L('APPLY')), R.button({ className: 'clickable image-copper-cancel-btn', onClick: _this_1._cancel }, utils_js_1.renderIcon('times'), utils_js_1.L('CANCEL')), R.div({ className: 'box', style: { margin: '30px auto', width: w, height: h } }, utils_js_1.L('PREVIEW'), R.div({ className: 'image-copper-preview', style: { width: w, height: h } })))), 1, 0, 1);
                            }
                        });
                    };
                    // @ts-ignore
                    selectedImage.src = reader.result;
                };
                this.setState({ waiting: 1 });
                reader.readAsDataURL(files[0]);
            }
        };
        CropperFieldBody.prototype.render = function () {
            var _this_1 = this;
            var field = this.props.field;
            var w = Math.floor(field.maxlen / 10000);
            var h = field.maxlen % 10000;
            var recW = w;
            var recH = h;
            if (this.props.isCompact) {
                w /= 3;
                h /= 3;
            }
            var body;
            var select;
            var preview;
            var clrBtn;
            if (this.state.cropResult || this.state.src || this.props.currentPicUrl && this.props.currentPicUrl !== 'images/placeholder_' + field.fieldName + '.png') {
                clrBtn = R.button({ className: 'clickable toolbtn clear-btn', onClick: this.clear }, utils_js_1.renderIcon('times'));
            }
            if (this.state.src) {
                body = clrBtn;
            }
            else {
                if (this.state.waiting) {
                    body = utils_js_1.renderIcon('cog fa-spin fa-2x');
                }
                else {
                    var imgSrc = this.state.cropResult || this.props.currentPicUrl;
                    if (this.state.cleared) {
                        imgSrc = utils_js_1.idToImgURL(0, field.fieldName);
                    }
                    if (this.props.imageRenderer) {
                        preview = this.props.imageRenderer(imgSrc, this.props.form);
                    }
                    else {
                        preview = R.img({
                            ref: function (r) { _this_1.references.img = r; }, style: { borderRadius: '5px', width: w / 2, height: h / 2 }, src: imgSrc, className: 'clickable', onClick: function () {
                                _this_1.references.fileInput.value = null;
                                _this_1.references.fileInput.click();
                            }
                        });
                    }
                    select = R.div(null, R.button({
                        className: 'clickable success-button button-small', onClick: function () {
                            _this_1.references.fileInput.value = null;
                            _this_1.references.fileInput.click();
                        }
                    }, utils_js_1.renderIcon('folder-open'), utils_js_1.L('SELECT_IMG')), clrBtn);
                }
            }
            var form = R.form({ ref: function (r) { _this_1.references.form = r; }, encType: "multipart/form-data", className: 'hidden' }, R.input({ name: "picture", ref: function (r) { _this_1.references.fileInput = r; }, type: 'file', accept: ".jpg, .jpeg, .png, .gif", onChange: this._onChange }), R.input({ name: "MAX_FILE_SIZE", defaultValue: 3000000 }), R.input({ name: "fid", defaultValue: field.id }), R.input({ name: "nid", defaultValue: field.node.id }), R.input({ name: "w", ref: function (r) { _this_1.references.w = r; } }), R.input({ name: "h", ref: function (r) { _this_1.references.h = r; } }), R.input({ name: "x", ref: function (r) { _this_1.references.x = r; } }), R.input({ name: "y", ref: function (r) { _this_1.references.y = r; } }));
            return R.div(null, R.div(null, preview, body, R.div({ className: 'small-text' }, utils_js_1.L('RECOMEND_SIZE', recW).replace('%', recH)), form), select);
        };
        return CropperFieldBody;
    }(Component));
});
//# sourceMappingURL=field-12-picture.js.map