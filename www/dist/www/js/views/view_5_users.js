(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../forms/form-item.js", "../forms/list.js", "../utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var form_item_js_1 = require("../forms/form-item.js");
    var list_js_1 = require("../forms/list.js");
    var utils_js_1 = require("../utils.js");
    list_js_1.registerListRenderer(5, function () {
        var _this = this;
        var node = this.state.node;
        var data = this.state.data;
        return data.items.map(function (item) {
            var imgUrl = utils_js_1.idToImgURL(item.avatar, 'avatar');
            var phone;
            if (item.phone) {
                phone = R.div({ className: 'user-item-info' }, utils_js_1.renderIcon('phone'), ' ' + item.public_phone);
            }
            var email;
            if (item.email) {
                email = R.div({ className: 'user-item-info' }, utils_js_1.renderIcon('envelope'), ' ', R.a({ href: 'mailto:' + item.public_email }, item.email));
            }
            return R.div({ key: item.id, className: 'user-item' }, R.img({ src: imgUrl, className: 'user-item-image' }), R.div({ className: 'user-item-block' }, R.h5(null, item.name), R.div({ className: 'user-item-text' }, item.company)), R.div({ className: 'user-item-block user-item-block-small' }, phone, email), R.div({ className: 'user-item-controls' }, form_item_js_1.renderItemsButtons(node, item, _this.refreshData)));
        });
    });
});
//# sourceMappingURL=view_5_users.js.map