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
        define(["require", "exports", "js/entry.js", "../admin/field-admin.js", "../admin/node-admin.js", "../left-bar.js", "../user.js", "../utils.js", "./form-full.js", "./form-item.js", "./form-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerListRenderer = exports.isPresentListRenderer = void 0;
    var entry_js_1 = require("js/entry.js");
    var field_admin_js_1 = __importDefault(require("../admin/field-admin.js"));
    var node_admin_js_1 = __importDefault(require("../admin/node-admin.js"));
    var left_bar_js_1 = __importDefault(require("../left-bar.js"));
    var user_js_1 = require("../user.js");
    var utils_js_1 = require("../utils.js");
    var form_full_js_1 = __importDefault(require("./form-full.js"));
    var form_item_js_1 = __importDefault(require("./form-item.js"));
    var form_mixins_js_1 = __importDefault(require("./form-mixins.js"));
    var sortByOrder = function (a, b) {
        return a.order - b.order;
    };
    var listRenderers = [];
    function registerListRenderer(nodeId, renderFunction) {
        if (listRenderers.hasOwnProperty(nodeId)) {
            throw 'List renderer redifinition for node ' + nodeId;
        }
        listRenderers[nodeId] = renderFunction;
    }
    exports.registerListRenderer = registerListRenderer;
    function isPresentListRenderer(nodeId) {
        return listRenderers.hasOwnProperty(nodeId);
    }
    exports.isPresentListRenderer = isPresentListRenderer;
    function createPageButton(self, page, isActive) {
        if (isActive) {
            return entry_js_1.R.button({ key: page, className: 'page-btn page-btn-active' }, page + 1);
        }
        return entry_js_1.R.button({
            key: page, className: 'clickable page-btn', onClick: function () {
                self.changeFilter('p', page, true);
            }
        }, page + 1);
    }
    var List = /** @class */ (function (_super) {
        __extends(List, _super);
        function List(props) {
            var _this = _super.call(this, props) || this;
            _this.filters = Object.assign({}, props.filters);
            _this.state.node = props.node;
            _this.state.data = props.initialData;
            _this.refreshData = _this.refreshData.bind(_this);
            _this.changeSearch = _this.changeSearch.bind(_this);
            _this.subFormRef = _this.subFormRef.bind(_this);
            return _this;
        }
        List.prototype.componentDidMount = function () {
            this.subformsRefs = {};
            this.onShow();
        };
        List.prototype.UNSAFE_componentWillReceiveProps = function (newProps) {
            _super.prototype.UNSAFE_componentWillReceiveProps.call(this, newProps);
            utils_js_1.consoleLog('LIST receive props');
            this.filters = $.extend({}, newProps.filters);
            this.setSearchInputValue(this.filters.s);
            this.state.node = newProps.node;
            this.state.data = newProps.initialData;
            this.onShow();
        };
        List.prototype.onShow = function () {
            var _this = this;
            if (!this.state.data) {
                setTimeout(function () { _this.refreshData(); }, 1);
            }
            else if (!this.props.node) {
                utils_js_1.getNode(this.props.nodeId).then(function (node) {
                    _this.setState({ node: node });
                    if (_this.props.parentForm) {
                        _this.props.parentForm.savedNode = node;
                    }
                });
            }
            if (!this.isSlave() && !this.props.noSetHash) {
                left_bar_js_1.default.instance.setLeftBar();
            }
        };
        List.prototype.isVisibleField = function (field) {
            if (this.props.isLookup) {
                return field.show & 8;
            }
            else {
                return field.show & 2;
            }
        };
        List.prototype.refreshData = function () {
            return __awaiter(this, void 0, void 0, function () {
                var nodeIdToFetch, data, sorting, node;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.isSlave() && !this.props.noSetHash) {
                                utils_js_1.updateHashLocation(this.filters);
                            }
                            nodeIdToFetch = this.props.nodeId || this.props.node.id;
                            if (!(nodeIdToFetch !== this.currentFechingNodeId)) return [3 /*break*/, 4];
                            this.currentFechingNodeId = nodeIdToFetch;
                            if (this.props.editable) {
                                this.filters.p = '*';
                            }
                            return [4 /*yield*/, utils_js_1.getNodeData(nodeIdToFetch, undefined, this.filters, this.props.editable, this.props.isLookup, this.isCustomListRenering())];
                        case 1:
                            data = _a.sent();
                            if (this.unmounted) {
                                return [2 /*return*/];
                            }
                            this.currentFechingNodeId = -1;
                            sorting = data.items.length && data.items[0].hasOwnProperty('order');
                            if (sorting) {
                                data.items.sort(sortByOrder);
                            }
                            if (!!this.props.node) return [3 /*break*/, 3];
                            return [4 /*yield*/, utils_js_1.getNode(this.props.nodeId)];
                        case 2:
                            node = _a.sent();
                            if (this.isSlave()) {
                                this.props.parentForm.saveNodeDataAndFilters(node, data, this.filters);
                            }
                            this.setState({ data: data, node: node });
                            this.scrollIfNeed();
                            return [3 /*break*/, 4];
                        case 3:
                            if (this.isSlave()) {
                                this.props.parentForm.saveNodeDataAndFilters(this.props.node, data, this.filters);
                            }
                            this.setState({ data: data });
                            this.scrollIfNeed();
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        List.prototype.scrollIfNeed = function () {
            if (this.isSlave() && this.props.parentForm.props.field.fieldType === FIELD_7_Nto1) {
                utils_js_1.scrollToVisible(this, true);
            }
        };
        List.prototype.changeSearch = function (event) {
            var _this = this;
            var val = event.target.value;
            this.clearSearchInterval();
            this.searchTimeout = setTimeout(function () {
                delete (_this.searchTimeout);
                if (_this.changeFilter('s', val)) {
                    if (_this.filters.p !== '*') {
                        _this.changeFilter('p');
                    }
                    _this.refreshData();
                }
            }, 500);
        };
        List.prototype.clearSearchInterval = function () {
            if (this.hasOwnProperty('searchTimeout')) {
                clearTimeout(this.searchTimeout);
            }
        };
        List.prototype.componentWillUnmount = function () {
            this.unmounted = true;
            this.clearSearchInterval();
        };
        List.prototype.setSearchInputValue = function (v) {
            if (this.searchInput) {
                if (!v) {
                    v = '';
                }
                this.searchInput.value = v;
                this.clearSearchInterval();
            }
        };
        List.prototype.clearSearch = function () {
            this.setSearchInputValue();
            if (this.changeFilter('s')) {
                if (this.filters.p !== '*') {
                    this.changeFilter('p');
                }
                this.refreshData();
            }
        };
        List.prototype.subFormRef = function (ref) {
            if (ref) {
                this.subformsRefs[utils_js_1.UID(ref.props.initialData)] = (ref);
            }
        };
        List.prototype.getSubforms = function (includeDeleted) {
            var ret = [];
            for (var k in this.subformsRefs) {
                if (this.subformsRefs.hasOwnProperty(k)) {
                    var f = this.subformsRefs[k];
                    if (includeDeleted || !f.props.initialData.__deleted_901d123f) {
                        ret.push(f);
                    }
                }
            }
            return ret;
        };
        List.prototype.isCustomListRenering = function () {
            return (!this.props.onItemClick && !this.props.filters.noCustomList && !this.props.isLookup && isPresentListRenderer(parseInt(this.props.nodeId || this.props.node.id)));
        };
        List.prototype.renderEditableList = function () {
            var _this = this;
            var node = this.state.node;
            var data = this.state.data;
            var filters = this.filters;
            var lines = [];
            if (data.items.length > 0) {
                var sorting = data.items[0].hasOwnProperty('order');
                for (var i = 0; i < data.items.length; i++) {
                    (function () {
                        var itemNum = i;
                        var item = data.items[i];
                        if (!item.__deleted_901d123f) {
                            lines.push(entry_js_1.R.div({ key: utils_js_1.UID(item), className: 'inline-editable-item' }, React.createElement(form_full_js_1.default, { ref: _this.subFormRef, inlineEditable: true, editable: true, isCompact: true, filters: filters, parentForm: _this.props.parentForm, isLookup: _this.props.isLookup, list: _this, node: node, initialData: item, overrideOrderData: sorting ? itemNum : -1 })));
                            var btns = [];
                            btns.push(entry_js_1.R.button({
                                className: 'clickable toolbtn danger-btn', title: utils_js_1.L('DELETE'), key: 'b' + utils_js_1.UID(item), onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!(item.hasOwnProperty('id') && !this.state.noPromptDelete)) return [3 /*break*/, 2];
                                                return [4 /*yield*/, utils_js_1.deleteRecord(item.name, node.id, 0, undefined, false)];
                                            case 1:
                                                _a.sent();
                                                _a.label = 2;
                                            case 2:
                                                item.__deleted_901d123f = true;
                                                this.forceUpdate();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }
                            }, utils_js_1.renderIcon('times')));
                            if (sorting) {
                                var _uidM1 = false;
                                var _uidP1 = false;
                                var _itemNumM1;
                                var _itemNumP1;
                                for (var j = itemNum - 1; j >= 0; j--) {
                                    if (!data.items[j].__deleted_901d123f) {
                                        _itemNumM1 = j;
                                        _uidM1 = utils_js_1.UID(data.items[j]);
                                        break;
                                    }
                                }
                                for (var j = itemNum + 1; j < (data.items.length); j++) {
                                    if (!data.items[j].__deleted_901d123f) {
                                        _itemNumP1 = j;
                                        _uidP1 = utils_js_1.UID(data.items[j]);
                                        break;
                                    }
                                }
                                if (_uidM1 !== false) {
                                    (function () {
                                        var uid = utils_js_1.UID(data.items[itemNum]);
                                        var itemNumM1 = _itemNumM1;
                                        var uidM1 = _uidM1;
                                        btns.push(entry_js_1.R.button({
                                            className: 'clickable toolbtn edit-btn', title: utils_js_1.L('MOVE_UP'), key: 'bu' + utils_js_1.UID(item), onClick: function () {
                                                var t = data.items[itemNum];
                                                data.items[itemNum] = data.items[itemNumM1];
                                                data.items[itemNumM1] = t;
                                                _this.subformsRefs[uid].setFieldValue('order', itemNumM1);
                                                _this.subformsRefs[uid].saveForm();
                                                _this.subformsRefs[uidM1].setFieldValue('order', itemNum);
                                                _this.subformsRefs[uidM1].saveForm();
                                                _this.forceUpdate();
                                            }
                                        }, utils_js_1.renderIcon('arrow-up')));
                                    })();
                                }
                                if (_uidP1 !== false) {
                                    (function () {
                                        var uid = utils_js_1.UID(data.items[itemNum]);
                                        var itemNumP1 = _itemNumP1;
                                        var uidP1 = _uidP1;
                                        btns.push(entry_js_1.R.button({
                                            className: 'clickable toolbtn edit-btn', title: utils_js_1.L('MOVE_DOWN'), key: 'bd' + utils_js_1.UID(item), onClick: function () {
                                                var t = data.items[itemNum];
                                                data.items[itemNum] = data.items[itemNumP1];
                                                data.items[itemNumP1] = t;
                                                _this.subformsRefs[uid].setFieldValue('order', itemNumP1);
                                                _this.subformsRefs[uid].saveForm();
                                                _this.subformsRefs[uidP1].setFieldValue('order', itemNum);
                                                _this.subformsRefs[uidP1].saveForm();
                                                _this.forceUpdate();
                                            }
                                        }, utils_js_1.renderIcon('arrow-down')));
                                    })();
                                }
                            }
                            lines.push(entry_js_1.R.span({ key: utils_js_1.UID(item) + 'btns', className: 'btns' }, btns));
                        }
                    })();
                }
            }
            var nodeAdmin;
            if (user_js_1.iAdmin()) {
                nodeAdmin = React.createElement(node_admin_js_1.default, { form: this, x: 400, y: 0 });
            }
            var createBtn;
            if (node.canCreate) {
                createBtn = entry_js_1.R.div(null, entry_js_1.R.button({ title: utils_js_1.L('ADD', (node.creationName || node.singleName)), className: 'clickable toolbtn create-btn', onClick: function () { data.items.push({}); _this.forceUpdate(); } }, utils_js_1.renderIcon('plus')));
            }
            return entry_js_1.R.div(null, nodeAdmin, lines, createBtn);
        };
        List.prototype.render = function () {
            var node = this.state.node;
            var data = this.state.data;
            if (!node || !data) {
                return entry_js_1.R.div({ className: 'field-lookup-loading-icon-container' }, utils_js_1.renderIcon('cog fa-spin fa-2x'));
            }
            if (this.props.editable) {
                return this.renderEditableList();
            }
            else {
                return this.renderList();
            }
        };
        List.prototype.renderList = function () {
            var _this = this;
            var node = this.state.node;
            var data = this.state.data;
            var filters = this.filters;
            var header;
            if (!this.props.omitHeader) {
                var createButton;
                if (node.canCreate && !this.props.preventCreateButton && !this.filters.preventCreateButton && !this.state.preventCreateButton) {
                    if (this.isSlave()) {
                        createButton = entry_js_1.R.button({
                            className: 'clickable create-button', onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!this.props.askToSaveParentBeforeCreation) return [3 /*break*/, 2];
                                            return [4 /*yield*/, this.props.parentForm.saveParentFormBeforeCreation()];
                                        case 1:
                                            _a.sent();
                                            this.props.parentForm.toggleCreateDialogue();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            this.props.parentForm.toggleCreateDialogue();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }
                        }, utils_js_1.renderIcon('plus'), ' ' + utils_js_1.L('CREATE') + ' ' + (node.creationName || node.singleName));
                    }
                    else {
                        createButton = entry_js_1.R.button({ className: 'clickable create-button', onClick: function () { utils_js_1.createRecord(node.id, filters); } }, utils_js_1.renderIcon('plus'), ' ' + utils_js_1.L('CREATE') + ' ' + (node.creationName || node.singleName));
                    }
                }
                var searchPanel;
                if (!this.props.hideSearch && !this.state.hideSearch && (this.filters.s || data.items.length > 2)) {
                    searchPanel = entry_js_1.R.div({ className: 'list-search' }, entry_js_1.R.input({ ref: function (input) { _this.searchInput = input; }, className: 'list-search-input', placeholder: utils_js_1.L('SEARCH_LIST'), onChange: this.changeSearch, defaultValue: this.filters.s }), entry_js_1.R.a({
                        className: 'clickable toolbtn default-btn', onClick: function (e) {
                            _this.clearSearch();
                            utils_js_1.sp(e);
                        }
                    }, utils_js_1.renderIcon('times')));
                }
                if (createButton || searchPanel) {
                    header = entry_js_1.R.div({ className: 'list-header' }, createButton, searchPanel);
                }
            }
            var body;
            data.total = parseInt(data.total);
            if (data.total > 0) {
                if (this.isCustomListRenering()) {
                    body = listRenderers[node.id].call(this);
                }
                if (!body) {
                    var tableHeader = [];
                    node.fields.some(function (field) {
                        var fieldAdmin;
                        if (user_js_1.iAdmin()) {
                            fieldAdmin = React.createElement(field_admin_js_1.default, { field: field, form: _this, x: 80 });
                        }
                        var rowHeader;
                        if (field.forSearch === 1) {
                            rowHeader = entry_js_1.R.span({
                                className: (filters.o === field.fieldName) ? 'clickable list-row-header-sorting' : 'clickable', onClick: function () {
                                    if (filters.o === field.fieldName) {
                                        _this.changeFilter('r', filters.r ? undefined : 1, true);
                                    }
                                    else {
                                        _this.changeFilter('o', field.fieldName, true);
                                    }
                                }
                            }, field.name, utils_js_1.renderIcon((!filters.r && (filters.o === field.fieldName)) ? 'caret-up' : 'caret-down'));
                        }
                        else {
                            rowHeader = field.name;
                        }
                        if (_this.isVisibleField(field)) {
                            tableHeader.push(entry_js_1.R.td({ key: field.id, className: (field.fieldType === FIELD_2_INT) ? 'list-row-header list-row-header-num' : 'list-row-header' }, rowHeader, fieldAdmin));
                        }
                    });
                    tableHeader.push(entry_js_1.R.td({ key: 'holder', className: 'list-row-header' }, ' '));
                    var additionalButtons;
                    if (this.state.additionalButtons || this.props.additionalButtons) {
                        additionalButtons = this.props.additionalButtons;
                        if (typeof (additionalButtons) !== 'function') {
                            additionalButtons = window[additionalButtons];
                        }
                    }
                    var hideControlls = this.props.hideControlls || this.state.hideControlls || (this.props.filters && this.props.filters.hideControlls);
                    var lines = data.items.map(function (item) {
                        return React.createElement(form_item_js_1.default, { key: Math.random() + '_' + item.id, disableDrafting: _this.props.disableDrafting, noPreviewButton: _this.props.noPreviewButton, onClick: _this.props.onItemClick ? function () { _this.props.onItemClick(item); } : undefined, parentForm: _this.props.parentForm, additionalButtons: additionalButtons, hideControlls: hideControlls, isLookup: _this.props.isLookup, list: _this, node: node, initialData: item });
                    });
                    body = entry_js_1.R.table({ className: 'list-table' }, entry_js_1.R.thead(null, entry_js_1.R.tr(null, tableHeader)), entry_js_1.R.tbody({ className: 'list-body' }, lines));
                }
            }
            else if (!this.props.hideIfEmpty) {
                var t1, t2;
                if (filters.s || filters.s === 0) {
                    t1 = utils_js_1.L('NO_RESULTS', filters.s);
                    t2 = '';
                }
                else if (createButton) {
                    t1 = utils_js_1.L('PUSH_CREATE', (node.creationName || node.singleName));
                    t2 = utils_js_1.L(this.isSlave() ? 'TO_CONTINUE' : 'TO_START');
                }
                else {
                    t1 = utils_js_1.L('LIST_EMPTY');
                }
                var emptyIcon;
                if (node.icon) {
                    emptyIcon = utils_js_1.renderIcon((node.icon || 'plus') + ((this.isSlave() ? ' fa-3x' : ' fa-5x') + ' list-empty-icon'));
                }
                body = entry_js_1.R.div({ className: 'list-emty' }, emptyIcon, entry_js_1.R.div(null, t1), entry_js_1.R.div(null, t2));
            }
            var pages = [];
            var recPerPage;
            if (this.filters && this.filters.n) {
                recPerPage = this.filters.n;
            }
            var totalPages = Math.ceil(data.total / (recPerPage || node.recPerPage));
            var curPage = parseInt(filters.p) || 0;
            var pageNums = { 0: 1, 1: 1, 2: 1 };
            var p;
            for (p = 0; p <= 2; p++) {
                pageNums[curPage + p] = 1;
                pageNums[curPage - p] = 1;
                pageNums[totalPages - 1 - p] = 1;
            }
            var prevP = -1;
            for (p in pageNums) {
                p = parseInt(p);
                if (p >= 0 && p < totalPages) {
                    if ((p - prevP) !== 1) {
                        pages.push(entry_js_1.R.span({ key: 'dots' + p }, ' ... '));
                    }
                    prevP = p;
                    pages.push(createPageButton(this, p, p === curPage));
                }
            }
            var paginator;
            if (pages.length > 1) {
                paginator = entry_js_1.R.span({ className: 'list-paginator-items' }, pages);
            }
            var footer;
            var paginatorText = utils_js_1.L('SHOWED_LIST', data.items.length).replace('%', data.total);
            if (this.filters.s) {
                paginatorText += utils_js_1.L('SEARCH_RESULTS', this.filters.s);
            }
            if (data.items.length > 0 && data.items.length < data.total) {
                footer = entry_js_1.R.span({ className: 'list-paginator' }, paginatorText, paginator);
            }
            var nodeAdmin;
            if (user_js_1.iAdmin()) {
                nodeAdmin = React.createElement(node_admin_js_1.default, { form: this, x: 400, y: 0 });
            }
            var title;
            if (!this.props.isCompact) {
                var hdr = this.header || this.filters.formTitle;
                if (hdr) {
                    title = entry_js_1.R.h4({ className: 'form-header' }, hdr);
                }
            }
            return entry_js_1.R.div({ className: 'list-container form-node-' + node.id }, nodeAdmin, title, header, footer, body, footer);
        };
        return List;
    }(form_mixins_js_1.default));
    exports.default = List;
});
//# sourceMappingURL=list.js.map