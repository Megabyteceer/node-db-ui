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
        define(["require", "exports", "../fields/field-wrap.js", "../utils.js", "./form-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderItemsButtons = void 0;
    var field_wrap_js_1 = require("../fields/field-wrap.js");
    var utils_js_1 = require("../utils.js");
    var form_mixins_js_1 = require("./form-mixins.js");
    var publishClick = function (draft, node, data) {
        if (draft) {
            return utils_js_1.draftRecord(node.id, data.id);
        }
        else {
            return utils_js_1.publishRecord(node.id, data.id);
        }
    };
    var renderItemsButtons = function (node, data, refreshFunction, formItem, editButtonFilters) {
        if (formItem && formItem.props.isLookup) {
            if (data.hasOwnProperty('isE')) {
                buttons = [
                    R.button({
                        key: 2, className: 'clickable toolbtn edit-btn', title: utils_js_1.L('EDIT'), onMouseDown: function (e) {
                            utils_js_1.sp(e);
                            formItem.props.parentForm.toggleCreateDialogue(data.id);
                        }
                    }, utils_js_1.renderIcon('pencil'))
                ];
            }
        }
        else {
            var itemName;
            if (node.draftable && (data.status !== 1)) {
                itemName = ' ' + utils_js_1.L('TEMPLATE');
            }
            else {
                itemName = '';
            }
            var buttons = [];
            if (data.hasOwnProperty('isP') && (!formItem || !formItem.props.disableDrafting)) {
                if (data.status === 1) {
                    buttons.push(R.button({ key: 1, className: 'clickable toolbtn unpublish-btn', title: utils_js_1.L('UNPUBLISH'), onClick: function () { publishClick(true, node, data).then(refreshFunction); } }, utils_js_1.renderIcon('eye')));
                }
                else {
                    buttons.push(R.button({ key: 1, className: 'clickable toolbtn publish-btn', title: utils_js_1.L('PUBLISH'), onClick: function () { publishClick(false, node, data).then(refreshFunction); } }, utils_js_1.renderIcon('eye-slash')));
                }
            }
            if (editButtonFilters != 'noed') {
                if (data.hasOwnProperty('isE')) {
                    if (!formItem || !formItem.props.list || !formItem.props.list.state.noEditButton) {
                        buttons.push(R.a({
                            key: 2, href: utils_js_1.loactionToHash(node.id, data.id, editButtonFilters, true), onClick: function (e) {
                                if (formItem && formItem.props.parentForm) {
                                    utils_js_1.sp(e);
                                    formItem.props.parentForm.toggleCreateDialogue(data.id);
                                }
                            }
                        }, R.button({ className: 'clickable toolbtn edit-btn', title: utils_js_1.L('EDIT', itemName) }, utils_js_1.renderIcon('pencil'))));
                    }
                }
                else if (!formItem || !formItem.props.list || !(formItem.props.list.state.noPreviewButton || formItem.props.list.props.noPreviewButton)) {
                    buttons.push(R.a({ key: 2, href: utils_js_1.loactionToHash(node.id, data.id, undefined) }, R.button({ className: 'clickable toolbtn view-btn', title: utils_js_1.L('DETAILS') + itemName }, utils_js_1.renderIcon('search'))));
                }
            }
            if (data.hasOwnProperty('isD')) {
                buttons.push(R.button({
                    key: 3, className: 'clickable toolbtn danger-btn', title: utils_js_1.L('DELETE') + itemName, onClick: function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, utils_js_1.deleteRecord(data.name, node.id, data.id)];
                                case 1:
                                    _a.sent();
                                    if (formItem && formItem.props.parentForm) {
                                        formItem.props.parentForm.valueChoosed();
                                    }
                                    else {
                                        refreshFunction();
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); }
                }, utils_js_1.renderIcon('times')));
            }
        }
        return buttons;
    };
    exports.renderItemsButtons = renderItemsButtons;
    var FormItem = /** @class */ (function (_super) {
        __extends(FormItem, _super);
        function FormItem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FormItem.prototype.isVisibleField = function (field) {
            if (this.props.isLookup) {
                return field.show & 8;
            }
            else {
                return field.show & 2;
            }
        };
        FormItem.prototype.render = function () {
            var _this = this;
            var fields = [];
            var data = this.props.initialData;
            var flds = this.props.node.fields;
            for (var k in flds) {
                var field = flds[k];
                if (this.isVisibleField(field)) {
                    var className = 'form-item-row';
                    if (field.fieldType === FIELD_2_INT) {
                        className += ' form-item-row-num';
                    }
                    else if (field.fieldType !== FIELD_1_TEXT && field.fieldType !== FIELD_19_RICHEDITOR && field.fieldType !== FIELD_7_Nto1) {
                        className += ' form-item-row-misc';
                    }
                    fields.push(R.td({ key: field.id, className: className }, React.createElement(field_wrap_js_1.default, { key: k, field: field, initialValue: data[field.fieldName], form: this, isCompact: true, isTable: true })));
                }
            }
            /** @type any */
            var itemProps = {};
            itemProps.className = 'list-item list-item-id-' + data.id;
            if (this.props.node.draftable && (data.status !== 1)) {
                itemProps.className += ' list-item-draft';
            }
            if (this.props.isLookup) {
                itemProps.title = utils_js_1.L('SELECT');
                itemProps.className += ' clickable';
                itemProps.onClick = function () { _this.props.parentForm.valueChoosed(data); };
            }
            else {
                if (this.props.onClick) {
                    itemProps.className = 'clickable';
                    itemProps.onClick = this.props.onClick;
                }
            }
            var buttons;
            if (!this.props.hideControlls && !this.state.hideControlls) {
                buttons = renderItemsButtons(this.props.node, data, this.props.list.refreshData, this);
            }
            var additionalButtons;
            if (this.props.additionalButtons) {
                additionalButtons = this.props.additionalButtons(this.props.node, data, this.props.list.refreshData, this);
            }
            fields.push(R.td({ key: 'b', className: 'form-item-row form-item-row-buttons' }, buttons, additionalButtons));
            return R.tr(itemProps, fields);
        };
        return FormItem;
    }(form_mixins_js_1.default));
    exports.default = FormItem;
});
//# sourceMappingURL=form-item.js.map