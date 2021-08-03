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
        define(["require", "exports", "js/entry.js", "../components/select.js", "../main-frame.js", "../utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.makeIconSelectionField = void 0;
    var entry_js_1 = require("js/entry.js");
    var select_js_1 = __importDefault(require("../components/select.js"));
    var main_frame_js_1 = __importDefault(require("../main-frame.js"));
    var utils_js_1 = require("../utils.js");
    var admin = {};
    admin.moveField = function (fIndex, form, node, direction) {
        if (direction === void 0) { direction = 0; }
        return __awaiter(void 0, void 0, void 0, function () {
            var fieldIndex, j, fields, field, group1, group2, f, i, f, f, field1, field2, prior, _i, group1_1, f_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        j = 0;
                        fields = node.fields.filter(function (f, i) {
                            if (i === fIndex) {
                                fieldIndex = j;
                            }
                            if (form.isVisibleField(f) && !f.lang) {
                                j++;
                                return true;
                            }
                            return false;
                        });
                        if (!(typeof fieldIndex !== 'undefined')) return [3 /*break*/, 5];
                        field = fields[fieldIndex];
                        group1 = [];
                        group2 = [];
                        if (field.fieldType === FIELD_17_TAB) {
                            if (field.maxlen === 0) { //two tabs exchanging
                                i = fieldIndex;
                                group1.push(fields[i]);
                                i++;
                                while (i < fields.length && i >= 0) {
                                    f = fields[i];
                                    if (f.fieldType === FIELD_17_TAB && f.maxlen === 0) {
                                        break;
                                    }
                                    group1.push(f);
                                    i++;
                                }
                                if (direction < 0) {
                                    if (fieldIndex > 0) {
                                        i = fieldIndex - 1;
                                        while (i > 0) {
                                            f = fields[i];
                                            if (f.fieldType === FIELD_17_TAB && f.maxlen === 0) {
                                                break;
                                            }
                                            i--;
                                        }
                                        while (i < fieldIndex) {
                                            group2.push(fields[i]);
                                            i++;
                                        }
                                    }
                                }
                                else {
                                    if (i < fields.length) {
                                        group2.push(fields[i]);
                                        i++;
                                        while (i < fields.length) {
                                            f = fields[i];
                                            if (f.fieldType === FIELD_17_TAB && f.maxlen === 0) {
                                                break;
                                            }
                                            group2.push(f);
                                            i++;
                                        }
                                    }
                                }
                            }
                            else { //compact area exchange
                                group1.push(fields[fieldIndex]);
                                i = fieldIndex + 1;
                                while (fields[i].isCompactNested) {
                                    group1.push(fields[i]);
                                    i++;
                                }
                                if (direction < 0) {
                                    i = fieldIndex - 1;
                                    while (fields[i].isCompactNested) {
                                        i--;
                                    }
                                    while (i < fieldIndex) {
                                        group2.push(fields[i]);
                                        i++;
                                    }
                                }
                                else {
                                    group2.push(fields[i]);
                                    i++;
                                    while (fields[i].isCompactNested) {
                                        group2.push(fields[i]);
                                        i++;
                                    }
                                }
                            }
                        }
                        else { //field and field exchange;
                            group1.push(fields[fieldIndex]);
                            i = fieldIndex + direction;
                            if ((i < fields.length) && (i >= 0)) {
                                group2.push(fields[i]);
                            }
                        }
                        if (group2.length === 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, utils_js_1.getNodeData(6, group1[0].id)];
                    case 1:
                        field1 = _a.sent();
                        return [4 /*yield*/, utils_js_1.getNodeData(6, group2[0].id)];
                    case 2:
                        field2 = _a.sent();
                        prior = Math.min(field1.prior, field2.prior);
                        if (direction < 0) {
                            group1 = group1.concat(group2);
                        }
                        else {
                            group1 = group2.concat(group1);
                        }
                        for (_i = 0, group1_1 = group1; _i < group1_1.length; _i++) {
                            f_1 = group1_1[_i];
                            f_1.prior = prior;
                            prior++;
                        }
                        return [4 /*yield*/, Promise.all(group1.map(function (f) {
                                return utils_js_1.submitRecord(6, { prior: f.prior }, f.id);
                            }))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, utils_js_1.getNode(node.id, true)];
                    case 4:
                        _a.sent();
                        utils_js_1.refreshForm();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    admin.exchangeNodes = function (node1, node2) { return __awaiter(void 0, void 0, void 0, function () {
        var ret;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(node1 && node2)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.all([utils_js_1.submitRecord(4, {
                                prior: node1.prior
                            }, node2.id).then(function () {
                                console.log(1);
                            }),
                            utils_js_1.submitRecord(4, {
                                prior: node2.prior
                            }, node1.id).then(function () {
                                console.log(2);
                            })])];
                case 1:
                    ret = _a.sent();
                    main_frame_js_1.default.instance.reloadOptions();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
    admin.popup = utils_js_1.popup;
    function debugInfoGetter() {
        utils_js_1.consoleDir(this);
    }
    admin.debug = function (obj) {
        debugInfoGetter.call(obj);
    };
    var styleEl = document.createElement('style');
    var styleSheet;
    document.head.appendChild(styleEl);
    styleSheet = styleEl.sheet;
    var adminOn = !utils_js_1.isLitePage();
    admin.toggleAdminUI = function () {
        if (adminOn) {
            styleSheet.insertRule('.admin-controll{display:none;}', 0);
        }
        else {
            if (styleSheet.rules.length) {
                styleSheet.removeRule(0);
            }
        }
        $('#admin-disable').prop('checked', !adminOn);
        adminOn = !adminOn;
    };
    $('body').append('<span class="admin-tools-enable-btn"><span>Admin tools </span><input type="checkbox" checked="' + adminOn + '" id="admin-disable" class="admin-tools-enable-check" title="hide/show admin controls"/></span>');
    $('#admin-disable').on('click', admin.toggleAdminUI);
    admin.toggleAdminUI();
    var iconsList;
    function initIconsList(params) {
        iconsList = [];
        var ruleList = Array.from(document.styleSheets).filter(function (r) {
            return r.href && (r.href.indexOf('font-awesome') >= 0);
        });
        for (var _i = 0, ruleList_1 = ruleList; _i < ruleList_1.length; _i++) {
            var style = ruleList_1[_i];
            for (var _a = 0, _b = Array.from(style.cssRules); _a < _b.length; _a++) {
                var rule = _b[_a];
                var s = rule.cssText.split('.fa-');
                var allNames = s.filter(function (s) { return s.indexOf('::before') > 0; }).map(function (s) { return s.substr(0, s.indexOf('::before')); });
                if (allNames.length) {
                    var iconName = allNames[0];
                    iconsList.push({
                        name: entry_js_1.R.span(null, utils_js_1.renderIcon(iconName), allNames.join(', ')),
                        value: iconName
                    });
                }
            }
        }
    }
    /** @param {FormFull} form */
    function makeIconSelectionField(form, fieldName) {
        if (!iconsList) {
            initIconsList();
        }
        var $iconInput = $('.field-container-id-' + form.getField(fieldName).props.field.id + ' input');
        $iconInput.css({
            display: 'none'
        });
        $iconInput.after('<span id="icons-selector"></span>');
        setTimeout(function () {
            return ReactDOM.render(React.createElement(select_js_1.default, {
                isCompact: form.props.isCompact,
                defaultValue: form.fieldValue(fieldName),
                readOnly: form.props.fieldDisabled,
                onChange: function (value) {
                    form.setFieldValue(fieldName, value);
                },
                options: iconsList
            }), document.getElementById('icons-selector'));
        }, 10);
    }
    exports.makeIconSelectionField = makeIconSelectionField;
    exports.default = admin;
});
//# sourceMappingURL=admin-utils.js.map