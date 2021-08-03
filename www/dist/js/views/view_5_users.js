(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "js/entry.js", "../forms/form-item.js", "../forms/list.js", "../utils.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var entry_js_1 = require("js/entry.js");
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
                phone = entry_js_1.R.div({ className: 'user-item-info' }, utils_js_1.renderIcon('phone'), ' ' + item.public_phone);
            }
            var email;
            if (item.email) {
                email = entry_js_1.R.div({ className: 'user-item-info' }, utils_js_1.renderIcon('envelope'), ' ', entry_js_1.R.a({ href: 'mailto:' + item.public_email }, item.email));
            }
            return entry_js_1.R.div({ key: item.id, className: 'user-item' }, entry_js_1.R.img({ src: imgUrl, className: 'user-item-image' }), entry_js_1.R.div({ className: 'user-item-block' }, entry_js_1.R.h5(null, item.name), entry_js_1.R.div({ className: 'user-item-text' }, item.company)), entry_js_1.R.div({ className: 'user-item-block user-item-block-small' }, phone, email), entry_js_1.R.div({ className: 'user-item-controls' }, form_item_js_1.renderItemsButtons(node, item, _this.refreshData)));
        });
    });
});
//# sourceMappingURL=view_5_users.js.map