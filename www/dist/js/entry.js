var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
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
        define(["require", "exports", "./main-frame.js", "./fields/field-1-text-default.js", "./fields/field-2-numeric.js", "./fields/field-4-datetime.js", "./fields/field-5-bool.js", "./fields/field-6-enum.js", "./fields/field-7-nto1.js", "./fields/field-8-static-text.js", "./fields/field-10-password.js", "./fields/field-11-date.js", "./fields/field-12-picture.js", "./fields/field-14-n2m.js", "./fields/field-15-12n.js", "./fields/field-16-rating.js", "./fields/field-17-compact-area.js", "./fields/field-18-button.js", "./fields/field-19-rich-ditor.js", "./fields/field-20-color.js", "./fields/field-21-file.js", "./views/view_5_users.js", "react-dom", "react", "./admin/admin-roleprevs-form.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    var _this = this;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.R = void 0;
    var main_frame_js_1 = __importDefault(require("./main-frame.js"));
    require("./fields/field-1-text-default.js");
    require("./fields/field-2-numeric.js");
    require("./fields/field-4-datetime.js");
    require("./fields/field-5-bool.js");
    require("./fields/field-6-enum.js");
    require("./fields/field-7-nto1.js");
    require("./fields/field-8-static-text.js");
    require("./fields/field-10-password.js");
    require("./fields/field-11-date.js");
    require("./fields/field-12-picture.js");
    require("./fields/field-14-n2m.js");
    require("./fields/field-15-12n.js");
    require("./fields/field-16-rating.js");
    require("./fields/field-17-compact-area.js");
    require("./fields/field-18-button.js");
    require("./fields/field-19-rich-ditor.js");
    require("./fields/field-20-color.js");
    require("./fields/field-21-file.js");
    require("./views/view_5_users.js");
    var react_dom_1 = __importDefault(require("react-dom"));
    var react_1 = __importDefault(require("react"));
    /// #if DEBUG
    var admin_roleprevs_form_js_1 = __importDefault(require("./admin/admin-roleprevs-form.js"));
    // @ts-ignore
    window.AdminRoleprevsForm = admin_roleprevs_form_js_1.default;
    var R = {};
    exports.R = R;
    var _loop_1 = function (factoryType) {
        R[factoryType] = function () {
            var _a;
            var theArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                theArgs[_i] = arguments[_i];
            }
            return (_a = react_1.default.createElement).call.apply(_a, __spreadArray([_this, factoryType], theArgs));
        };
    };
    for (var _i = 0, _a = ['div', 'form', 'span', 'p', 'img', 'button', 'input', 'label',
        'b', 'a', 'br', 'hr', 'svg', 'td', 'tr', 'th', 'tbody', 'thead', 'table', 'polyline',
        'textarea', 'iframe', 'h2', 'h3', 'h4', 'h5']; _i < _a.length; _i++) {
        var factoryType = _a[_i];
        _loop_1(factoryType);
    }
    react_dom_1.default.render(react_1.default.createElement(main_frame_js_1.default), document.getElementById('container'));
});
//# sourceMappingURL=entry.js.map