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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
        define(["require", "exports", "./utils.js", "./components/select.js", "./admin/admin-utils.js", "./main-frame.js", "./libs/libs.js", "react", "both-side-utils.js", "./entry.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    var __syncRequire = typeof module === "object" && typeof module.exports === "object";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.iAdmin = void 0;
    var utils_js_1 = require("./utils.js");
    var select_js_1 = __importDefault(require("./components/select.js"));
    var admin_utils_js_1 = __importDefault(require("./admin/admin-utils.js"));
    var main_frame_js_1 = require("./main-frame.js");
    var libs_js_1 = require("./libs/libs.js");
    var react_1 = require("react");
    var both_side_utils_js_1 = require("both-side-utils.js");
    var entry_js_1 = require("./entry.js");
    var currentUserData;
    function setUserOrg(orgId) {
        if (currentUserData.orgId !== orgId) {
            utils_js_1.getData('api/setCurrentOrg', { orgId: orgId }).then(function () {
                User.instance.refreshUser();
            });
        }
    }
    function iAdmin() {
        return both_side_utils_js_1.isUserHaveRole(ADMIN_ROLE_ID);
    }
    exports.iAdmin = iAdmin;
    var isFirstCall = true;
    var User = /** @class */ (function (_super) {
        __extends(User, _super);
        function User() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        User.prototype.componentDidMount = function () {
            User.instance = this;
            this.refreshUser();
        };
        User.prototype.refreshUser = function () {
            var _this = this;
            utils_js_1.getData('api/getMe').then(function (data) {
                var _a;
                data.lang.code = data.lang.code || 'en';
                libs_js_1.moment.locale(data.lang.code);
                (_a = '/locales/' + data.lang.code + '/lang.js', __syncRequire ? Promise.resolve().then(function () { return __importStar(require(_a)); }) : new Promise(function (resolve_1, reject_1) { require([_a], resolve_1, reject_1); }).then(__importStar)).then(function () {
                    _this.setState(data);
                    window.currentUserData = data;
                    if (iAdmin()) {
                        admin_utils_js_1.default.toggleAdminUI();
                    }
                    if (isFirstCall) {
                        isFirstCall = false;
                        utils_js_1.goToPageByHash();
                    }
                });
            });
        };
        User.prototype.changeOrg = function (value) {
            utils_js_1.clearForm();
            setTimeout(function () {
                setUserOrg(value);
                utils_js_1.showForm(14);
            }, 10);
        };
        User.prototype.toggleMultilang = function () {
            utils_js_1.getData('api/toggleMultilang').then(function () {
                window.location.reload();
            });
        };
        User.prototype.render = function () {
            var body;
            if (this.state) {
                var iconName = '';
                var className = 'clickable top-bar-user-multilang';
                if (this.state.hasOwnProperty('langs')) {
                    className += ' top-bar-user-multilang-active';
                    iconName = 'check-';
                }
                ;
                var multilangBtn;
                if (main_frame_js_1.ENV.ENABLE_MULTILANG) {
                    multilangBtn = entry_js_1.R.div({ className: className, onClick: this.toggleMultilang }, utils_js_1.renderIcon(iconName + 'square-o'), utils_js_1.L('MULTILANG'));
                }
                var org;
                if (this.state.orgs && Object.keys(this.state.orgs).length > 1 && this.state.orgs[this.state.orgId]) {
                    var options = [];
                    for (var k in this.state.orgs) {
                        var name = this.state.orgs[k];
                        options.push({ value: k, name: name });
                    }
                    ;
                    org = React.createElement(select_js_1.default, { options: options, className: "top-bar-user-org-select", isCompact: true, defaultValue: this.state.orgId, onChange: this.changeOrg });
                }
                else {
                    org = this.state.org;
                }
                var btn1, btn2;
                if (this.state.id === 2) {
                    btn2 = entry_js_1.R.a({ href: 'login', title: utils_js_1.L('LOGIN'), className: 'clickable top-bar-user-btn' }, utils_js_1.renderIcon('sign-in fa-2x'));
                }
                else {
                    var imgUrl = utils_js_1.idToImgURL(this.state.avatar, 'avatar');
                    btn1 = entry_js_1.R.a({ href: utils_js_1.loactionToHash(5, this.state.id, undefined, true), title: utils_js_1.L('USER_PROFILE'), className: 'clickable top-bar-user-btn' }, entry_js_1.R.img({ className: 'user-avatar', src: imgUrl }));
                    btn2 = entry_js_1.R.a({ href: 'login', title: utils_js_1.L('LOGOUT'), className: 'clickable top-bar-user-btn' }, utils_js_1.renderIcon('sign-out fa-2x'));
                }
                body = entry_js_1.R.span(null, multilangBtn, org, btn1, btn2);
            }
            else {
                body = utils_js_1.renderIcon('cog fa-spin');
            }
            return entry_js_1.R.div({ className: "top-bar-user-container" }, body);
        };
        return User;
    }(react_1.Component));
    exports.default = User;
    /** @type User */
    User.instance = null;
    /// #if DEBUG
    User.sessionToken = "dev-admin-session-token";
});
//# sourceMappingURL=user.js.map