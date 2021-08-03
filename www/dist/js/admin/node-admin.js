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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "js/entry.js", "react", "../events/forms_events.js", "../utils.js", "./admin-event-editor.js", "./admin-utils.js", "./field-admin.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createNodeForMenuItem = void 0;
    var entry_js_1 = require("js/entry.js");
    var react_1 = require("react");
    var forms_events_js_1 = require("../events/forms_events.js");
    var utils_js_1 = require("../utils.js");
    var admin_event_editor_js_1 = require("./admin-event-editor.js");
    var admin_utils_js_1 = __importDefault(require("./admin-utils.js"));
    var field_admin_js_1 = __importDefault(require("./field-admin.js"));
    var showedNodeId;
    var NodeAdmin = /** @class */ (function (_super) {
        __extends(NodeAdmin, _super);
        function NodeAdmin(props) {
            var _this = _super.call(this, props) || this;
            if (_this.props.form) {
                _this.state = {
                    show: _this.props.form.props.node && (showedNodeId === _this.props.form.props.node.id)
                };
            }
            else {
                _this.state = {
                    show: showedNodeId === _this.props.menuItem.id
                };
            }
            _this.timeout = null;
            _this.show = _this.show.bind(_this);
            _this.hide = _this.hide.bind(_this);
            _this.toggleLock = _this.toggleLock.bind(_this);
            _this.toggleAllFields = _this.toggleAllFields.bind(_this);
            return _this;
        }
        NodeAdmin.prototype.componentDidMount = function () {
            var _this = this;
            if (this.props.form && !this.props.form.props.node) {
                utils_js_1.getNode(this.props.form.props.nodeId).then(function (node) {
                    _this.node = node;
                    _this.forceUpdate();
                });
            }
        };
        NodeAdmin.prototype.componentWillUnmount = function () {
            showedNodeId = -1;
        };
        NodeAdmin.prototype.show = function () {
            if (this.timeout) {
                clearTimeout(this.timeout);
                delete (this.timeout);
            }
            if (!this.state.show) {
                this.setState({
                    show: true
                });
            }
        };
        NodeAdmin.prototype.hide = function () {
            if (this.state.show) {
                this.setState({
                    show: false
                });
            }
        };
        NodeAdmin.prototype.toggleAllFields = function () {
            this.setState({
                allFieldsVisible: !this.state.allFieldsVisible
            });
        };
        NodeAdmin.prototype.toggleLock = function () {
            this.setState({
                locked: !this.state.locked
            });
        };
        NodeAdmin.prototype.render = function () {
            var _this = this;
            var node;
            var form;
            var item;
            if (this.props.form) {
                node = this.props.form.props.node || this.node;
                form = this.props.form;
            }
            else {
                node = {};
                item = this.props.menuItem; //left-bar-item
            }
            var nodeId = node && (node.id || item.id);
            var borderOnSave;
            var borderOnLoad;
            if (forms_events_js_1.formsEventsOnSave.hasOwnProperty(nodeId)) {
                borderOnSave = " admin-button-highlighted";
            }
            else {
                borderOnSave = '';
            }
            if (forms_events_js_1.formsEventsOnLoad.hasOwnProperty(nodeId)) {
                borderOnLoad = " admin-button-highlighted";
            }
            else {
                borderOnLoad = '';
            }
            var body;
            var bodyVisible = this.state.show || this.state.locked;
            if (bodyVisible) {
                var buttons;
                var allFields;
                if (!item) {
                    if (this.state.allFieldsVisible) {
                        allFields = [];
                        for (var _i = 0, _a = node.fields; _i < _a.length; _i++) {
                            var f = _a[_i];
                            if (f.lang)
                                return undefined;
                            allFields.push(entry_js_1.R.span({
                                key: f.id + 'a',
                                className: 'admin-form-header'
                            }, React.createElement(field_admin_js_1.default, {
                                field: f,
                                form: form,
                                x: 370,
                                zIndex: 10
                            }))),
                                allFields.push(entry_js_1.R.div({
                                    key: f.id,
                                    className: "admin-form-all-fields"
                                }, entry_js_1.R.div({
                                    className: "admin-form-all-fields-name"
                                }, f.fieldName + '; (' + f.id + ')'), utils_js_1.renderIcon((f.show & 1) ? 'eye' : 'eye-slash halfvisible'), utils_js_1.renderIcon((f.show & 2) ? 'eye' : 'eye-slash halfvisible'), utils_js_1.renderIcon((f.show & 16) ? 'eye' : 'eye-slash halfvisible'), utils_js_1.renderIcon((f.show & 4) ? 'eye' : 'eye-slash halfvisible'), utils_js_1.renderIcon((f.show & 8) ? 'eye' : 'eye-slash halfvisible'), utils_js_1.renderIcon((f.forSearch) ? 'search-plus' : 'search halfvisible')));
                        }
                    }
                    buttons = entry_js_1.R.span(null, entry_js_1.R.button({
                        className: 'clickable toolbtn admin-form-btn',
                        onClick: function () {
                            _this.toggleAllFields();
                        },
                        title: "Show full list of fields document contains."
                    }, 'all fields ', utils_js_1.renderIcon('caret-down')), entry_js_1.R.button({
                        className: 'clickable toolbtn admin-form-btn' + borderOnLoad,
                        onClick: function () {
                            admin_event_editor_js_1.admin_editSource('onload', node, undefined, form);
                        },
                        title: "Edit client side script which execute on form open."
                    }, 'onLoad...'), entry_js_1.R.button({
                        className: 'clickable toolbtn admin-form-btn' + borderOnSave,
                        onClick: function () {
                            admin_event_editor_js_1.admin_editSource('onsave', node, undefined, form);
                        },
                        title: "Edit client side script which execute on form save."
                    }, 'onSave...'), entry_js_1.R.button({
                        className: 'clickable toolbtn admin-form-btn',
                        title: utils_js_1.L('FLD_ADD'),
                        onClick: function () {
                            admin_utils_js_1.default.popup(utils_js_1.loactionToHash(6, 'new', {
                                node_fields_linker: {
                                    id: node.id,
                                    name: node.singleName
                                }
                            }, true), 900, true);
                        }
                    }, utils_js_1.renderIcon('plus')), entry_js_1.R.button({
                        className: 'clickable toolbtn admin-form-btn',
                        title: utils_js_1.L('FLD_SHOW_ALL'),
                        onClick: function () {
                            if (form) {
                                form.showAllDebug = !form.showAllDebug;
                                form.forceUpdate();
                            }
                        }
                    }, utils_js_1.renderIcon('eye')), entry_js_1.R.button({
                        className: 'clickable toolbtn admin-form-btn',
                        title: utils_js_1.L('ADD_RATING_FLD'),
                        onClick: function () {
                            // TODO: implement ratings creation process
                        }
                    }, utils_js_1.renderIcon('plus'), utils_js_1.renderIcon('bar-chart')));
                }
                else {
                    buttons = entry_js_1.R.span(null, entry_js_1.R.button({
                        className: 'clickable toolbtn admin-form-btn',
                        title: utils_js_1.L('ADD_NODE'),
                        onClick: function () {
                            createNodeForMenuItem(item);
                        }
                    }, utils_js_1.renderIcon('plus')), entry_js_1.R.button({
                        className: 'clickable toolbtn admin-form-btn',
                        onClick: function () {
                            utils_js_1.getNodeData(4, undefined, {
                                _nodesID: item.parent
                            }).then(function (data) {
                                for (var k in data.items) {
                                    if (data.items[k].id === item.id) {
                                        admin_utils_js_1.default.exchangeNodes(data.items[parseInt(k)], data.items[parseInt(k) + 1]);
                                    }
                                }
                            });
                        },
                        title: "Move node down"
                    }, utils_js_1.renderIcon('arrow-down')), entry_js_1.R.button({
                        className: 'clickable toolbtn admin-form-btn',
                        onClick: function () {
                            utils_js_1.getNodeData(4, undefined, {
                                _nodesID: item.parent
                            }).then(function (data) {
                                for (var k in data.items) {
                                    if (data.items[k].id === item.id) {
                                        admin_utils_js_1.default.exchangeNodes(data.items[parseInt(k)], data.items[parseInt(k) - 1]);
                                    }
                                }
                            });
                        },
                        title: "Move node up"
                    }, utils_js_1.renderIcon('arrow-up')));
                }
                body = entry_js_1.R.div({
                    ref: utils_js_1.keepInWindow,
                    className: "admin-form-body",
                    onClick: function () {
                        clearTimeout(_this.timeout);
                        delete (_this.timeout);
                        showedNodeId = nodeId;
                    },
                    onMouseLeave: function () {
                        _this.hide();
                    }
                }, utils_js_1.L('NODE_SETTINGS'), entry_js_1.R.b({ className: "admin-form-header" }, node.tableName), entry_js_1.R.span(null, '; (' + (node.matchName || item.name) + '); id: ' + nodeId), entry_js_1.R.div({
                    className: "admin-form-content"
                }, buttons, entry_js_1.R.button({
                    className: 'clickable toolbtn admin-form-btn',
                    title: utils_js_1.L('EDIT_NODE'),
                    onClick: function () {
                        admin_utils_js_1.default.popup(utils_js_1.loactionToHash(4, nodeId, undefined, true), 900, true);
                    }
                }, utils_js_1.renderIcon('wrench')), entry_js_1.R.button({
                    className: 'clickable toolbtn admin-form-btn',
                    title: utils_js_1.L('EDIT_ACCESS'),
                    onClick: function () {
                        admin_utils_js_1.default.popup(utils_js_1.loactionToHash(1, nodeId, undefined, true), 1100);
                    }
                }, utils_js_1.renderIcon('user')), entry_js_1.R.button({
                    onClick: function () {
                        admin_utils_js_1.default.debug(form || node);
                    },
                    className: 'clickable toolbtn admin-form-btn',
                    title: 'log node to console'
                }, utils_js_1.renderIcon('info')), entry_js_1.R.span({
                    className: 'clickable admin-form-lock-btn',
                    onClick: this.toggleLock
                }, utils_js_1.renderIcon(this.state.locked ? 'lock' : 'unlock'))), allFields);
            }
            return entry_js_1.R.div({
                ref: utils_js_1.keepInWindow,
                className: 'admin-controll admin-form-wrap' + (bodyVisible ? 'admin-form-wrap-visible' : ''),
                onClick: utils_js_1.sp
            }, entry_js_1.R.span({
                className: 'halfvisible admin-form-open-btn' + (borderOnLoad || borderOnSave),
                onMouseEnter: this.show
            }, utils_js_1.renderIcon('wrench')), body);
        };
        return NodeAdmin;
    }(react_1.Component));
    exports.default = NodeAdmin;
    function createNodeForMenuItem(item) {
        utils_js_1.getNodeData(4, item.isDoc ? item.parent : item.id).then(function (data) {
            admin_utils_js_1.default.popup(utils_js_1.loactionToHash(4, 'new', {
                prior: data.prior,
                _nodesID: {
                    id: data.id,
                    name: data.name
                }
            }, true), 900, true);
        });
    }
    exports.createNodeForMenuItem = createNodeForMenuItem;
});
//# sourceMappingURL=node-admin.js.map