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
        define(["require", "exports", "../utils.js", "../utils.js", "./field-lookup-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils_js_1 = require("../utils.js");
    var utils_js_2 = require("../utils.js");
    var field_lookup_mixins_js_1 = require("./field-lookup-mixins.js");
    var keyCounter = 0;
    var dragItem;
    var dragList;
    var dragListenersInited;
    var refs = [];
    utils_js_2.registerFieldClass(FIELD_14_NtoM, /** @class */ (function (_super) {
        __extends(LookupNtoMField, _super);
        function LookupNtoMField(props) {
            var _this = _super.call(this, props) || this;
            _this.state.filters = _this.generateDefaultFiltersByProps(_this.props);
            return _this;
        }
        LookupNtoMField.prototype.setValue = function (val) {
            if (!val) {
                val = [];
            }
            if (!utils_js_1.n2mValuesEqual(val, this.state.value)) {
                this.setState({ value: val });
            }
        };
        LookupNtoMField.prototype.extendEditor = function () {
            this.setState({ extendedEditor: true });
        };
        LookupNtoMField.prototype.valueListener = function (newVal, withBounceDelay, sender) {
            if (sender.props.isNew) {
                this.state.value.splice(sender.props.pos, 0, newVal);
                this.forceUpdate();
                this.props.wrapper.valueListener(this.state.value, false, this);
            }
            else {
                if (this.state.value[sender.props.pos].id !== newVal.id) {
                    this.state.value[sender.props.pos] = newVal;
                    this.forceUpdate();
                    this.props.wrapper.valueListener(this.state.value, false, this);
                }
            }
        };
        LookupNtoMField.prototype.dragStart = function (item) {
            if (!dragListenersInited) {
                $(document).on('mouseup', function () {
                    if (dragItem) {
                        dragItem = undefined;
                        dragList.forceUpdate();
                        dragList = undefined;
                    }
                });
                $(document).on('mousemove', function (event) {
                    if (dragList) {
                        dragItem;
                        var y = event.clientY;
                        if (y < 100) {
                            document.body.scrollTop -= 10;
                        }
                        if (y > (document.body.offsetHeight - 100)) {
                            document.body.scrollTop += 10;
                        }
                        var closestD = 1000000;
                        var closestItem = undefined;
                        dragList.state.value.some(function (i) {
                            var el = ReactDOM.findDOMNode(refs[utils_js_1.UID(i)]);
                            // @ts-ignore
                            var ey = el.getBoundingClientRect();
                            ey = (ey.top + ey.bottom) / 2;
                            var d = Math.abs(y - ey);
                            if (d < closestD) {
                                closestD = d;
                                closestItem = i;
                            }
                        });
                        if (closestItem !== dragItem) {
                            var toPos = dragList.state.value.indexOf(closestItem);
                            var curPos = dragList.state.value.indexOf(dragItem);
                            dragList.state.value.splice(curPos, 1);
                            dragList.state.value.splice(toPos, 0, dragItem);
                            dragList.forceUpdate();
                        }
                    }
                });
                dragListenersInited = true;
            }
            dragList = this;
            dragItem = item;
            this.forceUpdate();
        };
        LookupNtoMField.prototype.deleteItemByIndex = function (i) {
            this.state.value.splice(i, 1);
            this.props.wrapper.valueListener(this.state.value, false, this);
            this.forceUpdate();
        };
        LookupNtoMField.prototype.renderItem = function (field, value, i, isEdit) {
            var _this = this;
            var isDrag = (dragItem === value);
            var buttons;
            var isNew = '';
            if (!value) {
                isNew = 'n';
            }
            var additionalButtonsN2M = this.state.additionalButtonsN2M || this.props.additionalButtonsN2M;
            if (additionalButtonsN2M) {
                additionalButtonsN2M = additionalButtonsN2M(field, value, i, this);
            }
            if (isEdit) {
                if (value) {
                    var reorderButton = void 0;
                    if (this.state.extendedEditor) {
                        reorderButton = R.button({
                            title: utils_js_1.L('FRAG_TO_REORDER'),
                            className: isDrag ? 'toolbtn drag draggable default-btn' : 'toolbtn drag default-btn', onMouseDown: function (e) {
                                utils_js_1.sp(e);
                                _this.dragStart(value);
                            }
                        }, utils_js_1.renderIcon('reorder'));
                    }
                    buttons = R.span({ className: 'field-lookup-right-block' }, additionalButtonsN2M, R.button({
                        title: utils_js_1.L('EDIT'),
                        className: 'clickable toolbtn edit-btn', onClick: function () {
                            _this.uidToEdit = utils_js_1.UID(_this.state.value[i]);
                            _this.forceUpdate();
                        }
                    }, utils_js_1.renderIcon('pencil')), R.button({
                        title: utils_js_1.L('LIST_REMOVE'),
                        className: 'clickable toolbtn danger-btn', onClick: function () {
                            _this.deleteItemByIndex(i);
                        }
                    }, utils_js_1.renderIcon('times')), reorderButton);
                }
                if (isEdit || value) {
                    var editIt = value && this.uidToEdit === utils_js_1.UID(value);
                    if (editIt) {
                        delete (this.uidToEdit);
                        editIt = value.id;
                    }
                    var key;
                    if (value) {
                        key = utils_js_1.UID(value);
                    }
                    else {
                        key = 'emp' + keyCounter;
                        keyCounter++;
                    }
                    var body = R.div({ key: key, ref: value ? function (ref) { refs[utils_js_1.UID(value)] = ref; } : undefined, className: isDrag ? 'lookup-n2m-item lookup-n2m-item-drag' : 'lookup-n2m-item' }, React.createElement(utils_js_1.getClassForField(FIELD_7_Nto1), {
                        field: field,
                        preventCreateButton: this.state.preventCreateButton,
                        editIt: editIt,
                        pos: i,
                        isEdit: isEdit,
                        isN2M: true, filters: this.state.filters, ref: function (ref) {
                            if (ref) {
                                ref.setLookupFilter({ 'exludeIDs': _this.exludeIDs || _this.state.filters.exludeIDs });
                            }
                        }, isNew: isNew, wrapper: this, initialValue: value, isCompact: this.props.isCompact, fieldDisabled: this.props.fieldDisabled
                    }), buttons);
                    return body;
                }
                else {
                    return undefined;
                }
            }
        };
        LookupNtoMField.prototype.render = function () {
            var _this = this;
            if (!this.state.value) {
                this.state.value = [];
            }
            var value = this.state.value;
            var field = this.props.field;
            var exludeIDs = this.state.filters.exludeIDs ? this.state.filters.exludeIDs.slice() : undefined;
            for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                var v = value_1[_i];
                if (v && v.id) {
                    if (!exludeIDs) {
                        exludeIDs = [];
                    }
                    exludeIDs.push(v.id);
                }
            }
            this.exludeIDs = exludeIDs;
            var lines = [];
            value.forEach(function (value, i) {
                lines.push(_this.renderItem(field, value, i, _this.props.isEdit));
            });
            lines.push(this.renderItem(field, null, lines.length, this.props.isEdit));
            return R.div(null, lines);
        };
        return LookupNtoMField;
    }(field_lookup_mixins_js_1.default)));
});
//# sourceMappingURL=field-14-n2m.js.map