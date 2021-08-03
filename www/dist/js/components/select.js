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
        define(["require", "exports", "js/entry.js", "react", "../utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var entry_js_1 = require("js/entry.js");
    var react_1 = require("react");
    var utils_js_1 = require("../utils.js");
    var Select = /** @class */ (function (_super) {
        __extends(Select, _super);
        function Select(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {};
            _this.toggle = _this.toggle.bind(_this);
            _this.onMouseLeave = _this.onMouseLeave.bind(_this);
            return _this;
        }
        Select.prototype.toggle = function () {
            if (!this.props.disabled) {
                this.setState({
                    expanded: !this.state.expanded
                });
            }
        };
        Select.prototype.setValue = function (v) {
            if (this.state.curVal !== v) {
                this.props.onChange(v);
                this.setState({
                    curVal: v
                });
            }
        };
        Select.prototype.onMouseLeave = function () {
            if (this.state.expanded) {
                this.toggle();
            }
        };
        Select.prototype.render = function () {
            var _this = this;
            var curVal = this.state.curVal || this.props.defaultValue;
            for (var _i = 0, _a = this.props.options; _i < _a.length; _i++) {
                var o = _a[_i];
                if (o.value === curVal) {
                    curVal = o.name;
                    break;
                }
            }
            var optionsList;
            if (this.state.expanded) {
                optionsList = entry_js_1.R.div({
                    className: 'select-control-list'
                }, this.props.options.map(function (o) {
                    return entry_js_1.R.div({
                        className: 'clickable select-control-item',
                        key: o.value,
                        title: o.name,
                        onClick: function () {
                            _this.setValue(o.value);
                            _this.toggle();
                        }
                    }, o.name);
                }));
            }
            var downCaret = entry_js_1.R.div({
                className: 'select-control-caret'
            }, utils_js_1.renderIcon('caret-down'));
            return entry_js_1.R.span({
                className: 'select-control-wrapper',
                onMouseLeave: this.onMouseLeave
            }, entry_js_1.R.div({
                className: this.props.disabled ? 'unclickable disabled select-control' : 'clickable select-control',
                onClick: this.toggle
            }, curVal || '\xa0', downCaret), optionsList);
        };
        return Select;
    }(react_1.Component));
    exports.default = Select;
});
//# sourceMappingURL=select.js.map