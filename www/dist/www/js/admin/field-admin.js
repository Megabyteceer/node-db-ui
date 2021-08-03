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
        define(["require", "exports", "../events/fields_events.js", "../utils.js", "./admin-event-editor.js", "./admin-utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var fields_events_js_1 = require("../events/fields_events.js");
    var utils_js_1 = require("../utils.js");
    var admin_event_editor_js_1 = require("./admin-event-editor.js");
    var admin_utils_js_1 = require("./admin-utils.js");
    var showedFieldId;
    var FieldAdmin = /** @class */ (function (_super) {
        __extends(FieldAdmin, _super);
        function FieldAdmin(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {
                show: showedFieldId === _this.props.field.id
            };
            _this.onShow = _this.onShow.bind(_this);
            _this.hide = _this.hide.bind(_this);
            _this.toggleLock = _this.toggleLock.bind(_this);
            _this.timeout = null;
            return _this;
        }
        FieldAdmin.prototype.onShow = function () {
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
        FieldAdmin.prototype.hide = function () {
            if (this.state.show) {
                this.setState({
                    show: false
                });
            }
        };
        FieldAdmin.prototype.toggleLock = function () {
            this.setState({
                locked: !this.state.locked
            });
        };
        FieldAdmin.prototype.render = function () {
            var _this = this;
            var field = this.props.field;
            var node = field.node;
            var form = this.props.form;
            var body;
            var border;
            if (fields_events_js_1.default.hasOwnProperty(field.id)) {
                border = " admin-button-highlighted";
            }
            else {
                border = "";
            }
            var bodyVisible = this.state.show || this.state.locked;
            if (bodyVisible) {
                var extendedInfo;
                if (form.fieldsRefs && form.fieldsRefs[field.fieldName] && form.fieldsRefs[field.fieldName].fieldRef && form.getField(field.fieldName).fieldRef.state.filters) {
                    extendedInfo = R.div(null, 'filters:', R.input({
                        defaultValue: JSON.stringify(form.getField(field.fieldName).fieldRef.state.filters)
                    }));
                }
                body = R.div({
                    ref: utils_js_1.keepInWindow,
                    className: "admin-form-body",
                    onClick: function () {
                        clearTimeout(_this.timeout);
                        delete (_this.timeout);
                        showedFieldId = _this.props.field.id;
                    },
                    onMouseLeave: function () {
                        _this.hide();
                    }
                }, utils_js_1.L('FLD_SETTINGS'), R.b({ className: "admin-form-header" }, field.fieldName), R.div(null, 'type: ' + field.fieldType + '; id: ' + field.id + '; len:' + field.maxlen), R.div({
                    className: "admin-form-content"
                }, R.button({
                    className: 'clickable toolbtn admin-form-btn' + border,
                    onClick: function () {
                        admin_event_editor_js_1.admin_editSource('onchange', node, field, form);
                    },
                    title: "Edit client side script which execute on field value change."
                }, 'onChange...'), R.button({
                    className: 'clickable toolbtn admin-form-btn',
                    onClick: function () {
                        var i = field.index;
                        if (i > 0) {
                            admin_utils_js_1.default.moveField(i, form, node, -1);
                        }
                    },
                    title: "Move field up"
                }, utils_js_1.renderIcon('arrow-up')), R.button({
                    className: 'clickable toolbtn admin-form-btn',
                    onClick: function () {
                        var i = field.index;
                        if (i < (node.fields.length - 1)) {
                            admin_utils_js_1.default.moveField(i, form, node, +1);
                        }
                    },
                    title: "Move filed down"
                }, utils_js_1.renderIcon('arrow-down')), R.button({
                    className: 'clickable toolbtn admin-form-btn',
                    onClick: function () {
                        utils_js_1.getNodeData(6, field.id).then(function (data) {
                            admin_utils_js_1.default.popup(utils_js_1.loactionToHash(6, 'new', {
                                prior: data.prior,
                                node_fields_linker: {
                                    id: node.id,
                                    name: node.singleName
                                }
                            }, true), 900, true);
                        });
                    },
                    title: "Add new field"
                }, utils_js_1.renderIcon('plus')), R.button({
                    onClick: function () {
                        admin_utils_js_1.default.popup(utils_js_1.loactionToHash(6, field.id, undefined, true), 900, true);
                    },
                    className: 'clickable toolbtn admin-form-btn',
                    title: "Edit field properties"
                }, utils_js_1.renderIcon('wrench')), R.span({
                    className: 'clickable admin-form-lock-btn',
                    onClick: this.toggleLock
                }, utils_js_1.renderIcon(this.state.locked ? 'lock' : 'unlock')), R.button({
                    onClick: function () {
                        admin_utils_js_1.default.debug(form.getField(field.fieldName) || form);
                    },
                    className: 'clickable toolbtn admin-form-btn',
                    title: 'log field to console'
                }, utils_js_1.renderIcon('info'))), extendedInfo);
            }
            return R.span({
                ref: utils_js_1.keepInWindow,
                className: 'admin-controll admin-form-wrap' + (bodyVisible ? 'admin-form-wrap-visible' : ''),
                onClick: utils_js_1.sp
            }, R.span({
                ref: utils_js_1.keepInWindow,
                className: 'halfvisible admin-form-open-btn' + border,
                onMouseEnter: this.onShow
            }, utils_js_1.renderIcon('wrench')), body);
        };
        return FieldAdmin;
    }(Component));
    exports.default = FieldAdmin;
});
//# sourceMappingURL=field-admin.js.map