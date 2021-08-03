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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./admin/field-admin.js", "./admin/node-admin.js", "./user.js", "./utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var field_admin_js_1 = require("./admin/field-admin.js");
    var node_admin_js_1 = require("./admin/node-admin.js");
    var user_js_1 = require("./user.js");
    var utils_js_1 = require("./utils.js");
    var collapsed;
    function isMustBeExpanded(i) {
        if (i.children) {
            for (var k in i.children) {
                var j = i.children[k];
                if (isCurrentlyShowedLeftbarItem(j) || isMustBeExpanded(j)) {
                    return true;
                }
            }
            return false;
        }
        else {
            return isCurrentlyShowedLeftbarItem(i);
        }
    }
    function isCurrentlyShowedLeftbarItem(item) {
        if (item.id === false) {
            if (!currentFormParameters.filters || (Object.keys(currentFormParameters.filters).length === 0)) {
                return item.isDefault;
            }
            return item.tab === currentFormParameters.filters.tab;
        }
        if (!item.staticLink) {
            var allItems = LeftBar.instance.props.staticItems.concat(LeftBar.instance.state.items);
            excludeItem = item;
            if (allItems.some(isStrictlySelected)) {
                return false;
            }
            return currentFormParameters.nodeId === item.id &&
                currentFormParameters.recId === item.recId &&
                currentFormParameters.editable === item.editable;
        }
        else {
            excludeItem = null;
            return isStrictlySelected(item);
        }
    }
    var excludeItem;
    function isStrictlySelected(item) {
        if (item) {
            if (item.hasOwnProperty('children')) {
                return item.children.some(isStrictlySelected);
            }
            else {
                if (item !== excludeItem && item.staticLink) {
                    return location.hash === item.staticLink;
                }
            }
        }
    }
    var BarItem = /** @class */ (function (_super) {
        __extends(BarItem, _super);
        function BarItem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BarItem.prototype.toggle = function () {
            if (!this.state) {
                this.setState({ expanded: true });
            }
            else {
                this.setState({ expanded: !this.state.expanded });
            }
        };
        BarItem.prototype.closeMenuIfNeed = function () {
            if (collapsable && !collapsed) {
                LeftBar.instance.toggleCollapse();
            }
        };
        BarItem.prototype.render = function () {
            var _this = this;
            var item = this.props.item;
            /// #if DEBUG
            var adminControl;
            if (user_js_1.iAdmin()) {
                if (item.field) {
                    adminControl = R.div({ className: "left-bar-admin-button" }, React.createElement(field_admin_js_1.default, { field: item.field, form: item.form, x: -10, y: 0 }));
                }
                else {
                    adminControl = R.div({ className: "left-bar-admin-button" }, React.createElement(node_admin_js_1.default, { menuItem: item, x: -10, y: 0 }));
                }
            }
            /// #endif
            if (!item.isDoc && (!item.children || (item.children.length === 0))
                /// #if DEBUG
                && false // in debug build always show empty nodes
            /// #endif
            ) {
                return R.div(null);
            }
            /*
            if(item.children && item.children.length === 1) {
                return React.createElement(BarItem, {item: item.children[0], key: this.props.key, level: this.props.level});
            }*/
            var itemsIcon = R.div({ className: "left-bar-item-icon" }, utils_js_1.renderIcon(item.icon + (item.isDoc ? ' brand-color' : ' noicon')));
            var className = 'left-bar-item ' + (item.isDoc ? 'left-bar-item-doc' : 'left-bar-group');
            var isActive = isCurrentlyShowedLeftbarItem(item);
            if (isActive) {
                className += ' left-bar-item-active unclickable';
            }
            if (item.tabId) {
                className += ' left-bar-item-tab-' + item.tabId;
            }
            var caret;
            var children;
            if (!item.isDoc) {
                if ((this.state && this.state.expanded) || isMustBeExpanded(this.props.item)) {
                    caret = 'up';
                    children = R.div({ className: 'left-bar-children' }, renderItemsArray(item.children, this.props.level + 1, item));
                }
                else if (!item.isDoc) {
                    caret = 'down';
                }
                if (caret) {
                    caret = R.div({ className: "left-bar-group-caret" }, utils_js_1.renderIcon('caret-' + caret));
                }
            }
            var isMustBeExpandedVal = isMustBeExpanded(this.props.item);
            if (!isMustBeExpandedVal) {
                if (!isActive) {
                    className += ' clickable';
                }
            }
            else {
                className += ' unclickable left-bar-active-group';
            }
            var itemBody = R.div({
                onClick: function () {
                    if (!isMustBeExpandedVal) {
                        if (item.isDoc) {
                            if (item.id === false) {
                                utils_js_1.setFormFilter('tab', item.tab);
                                return;
                            }
                        }
                        else {
                            _this.toggle();
                            return;
                        }
                        _this.closeMenuIfNeed();
                    }
                },
                className: className
            }, itemsIcon, collapsed ? undefined : item.name, collapsed ? undefined : caret);
            if (item.isDoc && (item.id !== false)) {
                var href;
                if (item.staticLink && item.staticLink !== 'reactClass') {
                    href = item.staticLink;
                }
                else {
                    href = utils_js_1.loactionToHash(item.id, item.recId, item.filters, item.editable);
                }
                return R.a({ href: href }, adminControl, itemBody);
            }
            else {
                return R.div({ className: 'left-bar-group-container' }, adminControl, itemBody, children);
            }
        };
        return BarItem;
    }(Component));
    function renderItemsArray(itemsArray, level, item) {
        /// #if DEBUG
        if ((!itemsArray || itemsArray.length === 0) && (level > 0)) {
            return [R.div({
                    className: 'clickable left-bar-empty-section', onClick: function () {
                        node_admin_js_1.createNodeForMenuItem(item);
                    }
                }, utils_js_1.L("EMPTY_SECTION"))];
        }
        /// #endif
        var ret = [];
        for (var k in itemsArray) {
            var item = itemsArray[k];
            if (typeof item === 'string') {
                if (!collapsed) {
                    ret.push(R.h5({ key: ret.length, className: 'left-bar-tabs-header' }, item));
                }
            }
            else {
                ret.push(React.createElement(BarItem, { item: item, key: ret.length, level: level }));
            }
        }
        return ret;
    }
    var LeftBar = /** @class */ (function (_super) {
        __extends(LeftBar, _super);
        function LeftBar(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {};
            LeftBar.instance = _this;
            _this.toggleCollapse = _this.toggleCollapse.bind(_this);
            return _this;
        }
        LeftBar.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
        };
        LeftBar.prototype.toggleCollapse = function () {
            collapsed = !collapsed;
            this.forceUpdate();
        };
        LeftBar.prototype.refreshLeftBarActive = function () {
            this.forceUpdate();
        };
        LeftBar.prototype.setLeftBar = function (menuData) {
            this.setState({ items: menuData });
        };
        LeftBar.prototype.render = function () {
            if (utils_js_1.isLitePage()) {
                return R.td(null);
            }
            var lines;
            var staticLines;
            staticLines = renderItemsArray(this.props.staticItems, 0);
            if (this.state) {
                lines = renderItemsArray(this.state.items, 0);
                if (lines.length === 1) {
                    lines = undefined;
                }
            }
            if (collapsed) {
                lines = undefined;
                staticLines = [];
            }
            if (collapsable) {
                staticLines.unshift(R.div({ key: 'toggle-collapsing', className: "left-bar-collapse-button clickable", onClick: this.toggleCollapse }, utils_js_1.renderIcon('bars')));
            }
            return R.td({ className: collapsed ? 'left-bar left-bar-collapsed' : 'left-bar ' }, R.div({ className: "left-bar-body" }, staticLines, lines));
        };
        return LeftBar;
    }(Component));
    exports.default = LeftBar;
    /** @type LeftBar */
    LeftBar.instance = null;
    var collapsable;
    function renewIsCollapsable() {
        collapsable = window.innerWidth < 1330;
        collapsed = collapsable;
        if (LeftBar.instance) {
            LeftBar.instance.forceUpdate();
        }
    }
    ;
    window.addEventListener('resize', renewIsCollapsable);
    renewIsCollapsable();
});
//# sourceMappingURL=left-bar.js.map