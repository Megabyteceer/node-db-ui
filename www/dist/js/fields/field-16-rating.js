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
        define(["require", "exports", "js/entry.js", "../utils.js", "../utils.js", "./field-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var entry_js_1 = require("js/entry.js");
    var utils_js_1 = require("../utils.js");
    var utils_js_2 = require("../utils.js");
    var field_mixins_js_1 = __importDefault(require("./field-mixins.js"));
    utils_js_2.registerFieldClass(FIELD_16_RATING, /** @class */ (function (_super) {
        __extends(RatingField, _super);
        function RatingField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RatingField.prototype.setValue = function (val) {
            this.refToInput.value = val;
            this.state.value = val;
        };
        RatingField.prototype.render = function () {
            if (this.state.value.all === 0) {
                return entry_js_1.R.span(null, utils_js_1.L('NORATES'));
            }
            else {
                var rate = parseFloat(this.state.value.rate.replace(',', '.'));
                var stars = [];
                for (var i = 1; i < 6; i++) {
                    if (i <= (rate + 0.1)) {
                        stars.push(entry_js_1.R.p({ key: i, className: 'fa fa-star rating-star' }));
                    }
                    else if (i <= rate + 0.6) {
                        stars.push(entry_js_1.R.p({ key: i, className: 'fa fa-star-half-o rating-star' }));
                    }
                    else {
                        stars.push(entry_js_1.R.p({ key: i, className: 'fa fa-star-o rating-star' }));
                    }
                }
                return entry_js_1.R.span({ title: rate.toFixed(2) }, stars, ' (' + this.state.value.all + ')');
            }
        };
        return RatingField;
    }(field_mixins_js_1.default)));
});
//# sourceMappingURL=field-16-rating.js.map