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
        define(["require", "exports", "../forms/form-full.js", "../forms/list.js", "../utils.js", "../utils.js", "./field-lookup-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var form_full_js_1 = require("../forms/form-full.js");
    var list_js_1 = require("../forms/list.js");
    var utils_js_1 = require("../utils.js");
    var utils_js_2 = require("../utils.js");
    var field_lookup_mixins_js_1 = require("./field-lookup-mixins.js");
    utils_js_2.registerFieldClass(FIELD_7_Nto1, /** @class */ (function (_super) {
        __extends(EnumField, _super);
        function EnumField(props) {
            var _this = _super.call(this, props) || this;
            var val = props.initialValue;
            if (typeof val === 'string') {
                val = {
                    id: val,
                    name: 'selected'
                };
                _this.props.wrapper.valueListener(val, false, _this);
            }
            _this.state = {
                filters: _this.generateDefaultFiltersByProps(_this.props),
                value: val
            };
            _this.clearLeaveTimeout = _this.clearLeaveTimeout.bind(_this);
            _this.onMouseLeave = _this.onMouseLeave.bind(_this);
            _this.toggleList = _this.toggleList.bind(_this);
            _this.valueChoosed = _this.valueChoosed.bind(_this);
            _this.toggleCreateDialogue = _this.toggleCreateDialogue.bind(_this);
            _this.setValue = _this.setValue.bind(_this);
            return _this;
        }
        EnumField.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
            if (nextProps.editIt) { //edit item in extended n2m list
                if (!this.state.expanded) {
                    this.setState({
                        expanded: true
                    });
                }
                this.toggleCreateDialogue(nextProps.editIt);
            }
            if (this.props.filters) {
                if (!this.state.filters) {
                    this.state.filters = {};
                }
                for (var k in this.props.filters) {
                    if (this.props.filters.hasOwnProperty(k)) {
                        this.state.filters[k] = this.props.filters[k];
                    }
                }
            }
        };
        EnumField.prototype.componentWillUnmount = function () {
            this.clearLeaveTimeout();
        };
        EnumField.prototype.toggleList = function () {
            if (!this.props.fieldDisabled || this.state.expanded) {
                if (this.state.expanded) {
                    utils_js_1.scrollToVisible(this, true);
                }
                this.setState({
                    expanded: !this.state.expanded,
                    dataToEdit: undefined,
                    creationOpened: false
                });
            }
        };
        EnumField.prototype.valueChoosed = function (recordData, isNewCreated, noToggleList) {
            if (recordData) {
                if (!noToggleList) {
                    this.toggleList();
                }
                if (!this.state.value || (this.state.value.id !== recordData.id) || (this.state.value.name !== recordData.name) || (this.state.value.icon !== recordData[this.props.field.icon])) {
                    var newVal = {
                        id: recordData.id,
                        name: recordData.name
                    };
                    if (this.props.field.icon) {
                        newVal.icon = recordData[this.props.field.icon];
                    }
                    this.setValue(newVal);
                    this.props.wrapper.valueListener(newVal, false, this);
                    if (isNewCreated) {
                        this.saveNodeDataAndFilters(this.savedNode);
                    }
                }
            }
            else {
                this.saveNodeDataAndFilters(this.savedNode, undefined, this.savedFilters);
                this.setState({
                    creationOpened: false
                });
            }
        };
        EnumField.prototype.toggleCreateDialogue = function (itemIdToEdit, defaultCreationData, backupPrefix) {
            var _this = this;
            if (defaultCreationData) {
                var curBackup = utils_js_1.getBackupData(this.props.field.nodeRef, backupPrefix);
                utils_js_1.backupCreationData(this.props.field.nodeRef, Object.assign(curBackup, defaultCreationData), backupPrefix);
            }
            this.clearLeaveTimeout();
            var isOpened = this.state.creationOpened;
            this.setState({
                creationOpened: !isOpened,
                backupPrefix: backupPrefix,
                dataToEdit: undefined,
                itemIdToEdit: itemIdToEdit
            });
            if (isOpened) {
                this.setState({
                    expanded: this.isEnterCreateThroughList
                });
            }
            if (typeof itemIdToEdit !== 'undefined') {
                this.isEnterCreateThroughList = this.state.expanded;
                utils_js_1.getNodeData(this.props.field.nodeRef, itemIdToEdit, undefined, true).then(function (data) {
                    utils_js_1.getNode(_this.props.field.nodeRef).then(function (node) {
                        _this.saveNodeDataAndFilters(node);
                        _this.setState({
                            dataToEdit: data,
                            itemIdToEdit: undefined
                        });
                    });
                });
            }
            else {
                this.setState({
                    dataToEdit: {}
                });
            }
        };
        EnumField.prototype.onMouseLeave = function () {
            var _this = this;
            if (this.state.expanded && !this.state.creationOpened) {
                this.leaveTimout = setTimeout(function () { _this.toggleList(); }, 400);
            }
        };
        EnumField.prototype.clearLeaveTimeout = function () {
            if (this.leaveTimout) {
                clearTimeout(this.leaveTimout);
                delete (this.leaveTimout);
            }
        };
        EnumField.encodeValue = function (val) {
            if (val && val.hasOwnProperty('id')) {
                return val.id;
            }
            else {
                return val;
            }
        };
        EnumField.prototype.setValue = function (val) {
            this.state.value = val;
            this.forceUpdate();
        };
        EnumField.prototype.render = function () {
            var _this = this;
            var field = this.props.field;
            var value = this.state.value;
            var iconPic;
            if (field.icon && value && (!this.props.hideIcon) && value.icon) {
                iconPic = R.img({
                    className: 'field-lookup-icon-pic',
                    src: utils_js_1.idToImgURL(value.icon, field.icon)
                });
            }
            if (this.props.isEdit) {
                var list;
                var clearBtn;
                if (this.state.expanded) {
                    if (this.state.creationOpened) {
                        if (this.state.itemIdToEdit) {
                            list = R.div({
                                className: 'field-lookup-loading-icon-container'
                            }, utils_js_1.renderIcon('cog fa-spin fa-2x'));
                        }
                        else {
                            list = React.createElement(form_full_js_1.default, {
                                preventDeleteButton: true,
                                node: this.savedNode,
                                nodeId: field.nodeRef,
                                backupPrefix: this.state.backupPrefix,
                                initialData: this.state.dataToEdit || {},
                                isCompact: true,
                                parentForm: this,
                                isLookup: true,
                                filters: this.savedFilters || this.state.filters,
                                editable: true
                            });
                        }
                    }
                    else {
                        list = React.createElement(list_js_1.default, {
                            node: this.savedNode,
                            preventCreateButton: this.state.preventCreateButton || this.props.preventCreateButton,
                            initialData: this.savedData,
                            nodeId: field.nodeRef,
                            isLookup: true,
                            parentForm: this,
                            filters: this.savedFilters || this.state.filters
                        });
                    }
                }
                if (list) {
                    list = R.div({
                        className: 'field-lookup-drop-list',
                        ref: function (ref) {
                            utils_js_1.scrollToVisible(ref, true);
                        }
                    }, list);
                }
                if (!field.requirement && !this.props.isN2M) {
                    clearBtn = R.div({
                        title: utils_js_1.L('CLEAR'),
                        className: 'clickable clear-btn',
                        onClick: function (e) {
                            utils_js_1.sp(e);
                            _this.valueChoosed({
                                id: 0,
                                name: ''
                            }, false, true);
                            if (_this.state.expanded) {
                                _this.toggleList();
                            }
                        }
                    }, utils_js_1.renderIcon('times'));
                }
                else {
                }
                var valLabel;
                if (value && value.name) {
                    valLabel = R.span(null, value.name);
                }
                else {
                    valLabel = R.span({
                        className: 'field-lookup-value-label'
                    }, this.props.noBorder ? utils_js_1.L('+ADD') : utils_js_1.L('SELECT'));
                }
                return R.div({
                    className: 'field-lookup-wrapper',
                    onMouseLeave: this.onMouseLeave,
                    onMouseEnter: this.clearLeaveTimeout
                }, R.div({
                    className: this.props.fieldDisabled ? 'field-lookup-chooser unclickable disabled' : 'field-lookup-chooser clickable',
                    title: this.props.isCompact ? field.name : utils_js_1.L('SELECT'),
                    onClick: this.toggleList
                }, R.span({
                    className: 'field-lookup-value'
                }, iconPic, valLabel), R.span({ className: 'field-lookup-right-block' }, R.span({
                    className: 'field-lookup-caret'
                }, utils_js_1.renderIcon('caret-down')), clearBtn)), list);
            }
            else {
                return R.span(null, iconPic, value.name);
            }
        };
        return EnumField;
    }(field_lookup_mixins_js_1.default)));
});
//# sourceMappingURL=field-7-nto1.js.map