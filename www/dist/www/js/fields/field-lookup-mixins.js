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
        define(["require", "exports", "./field-mixins.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var field_mixins_js_1 = require("./field-mixins.js");
    var fieldLookupMixins = /** @class */ (function (_super) {
        __extends(fieldLookupMixins, _super);
        function fieldLookupMixins() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        fieldLookupMixins.prototype.componentDidUpdate = function () {
            if (!this.state.filters) {
                this.setState({ filters: this.generateDefaultFiltersByProps(this.props) });
                this.saveNodeDataAndFilters();
            }
        };
        fieldLookupMixins.prototype.generateDefaultFiltersByProps = function (props) {
            var ret = Object.assign({}, props.filters);
            var parentId = props.wrapper.props.form.props.initialData.id || props.wrapper.props.form.filters[props.field.fieldName] || 'new';
            if (props.field.fieldType === FIELD_15_1toN) {
                ret[props.field.fieldName + '_linker'] = parentId;
            } /* else {
                ret[props.field.fieldName] = parentId;
            }*/
            return ret;
        };
        fieldLookupMixins.prototype.saveNodeDataAndFilters = function (node, data, filters) {
            if (node) {
                this.savedNode = node;
            }
            this.savedData = data;
            this.savedFilters = filters;
        };
        fieldLookupMixins.prototype.setLookupFilter = function (filtersObjOrName, val) {
            if ((typeof filtersObjOrName) === 'string') {
                if (this.state.filters[filtersObjOrName] !== val) {
                    this.state.filters[filtersObjOrName] = val;
                    this.forceUpdate();
                }
            }
            else {
                var leastOneUpdated;
                var keys = Object.keys(filtersObjOrName);
                for (var i = keys.length; i > 0;) {
                    i--;
                    var name = keys[i];
                    var value = filtersObjOrName[name];
                    if (this.state.filters[name] !== value) {
                        this.state.filters[name] = value;
                        leastOneUpdated = true;
                    }
                }
                if (leastOneUpdated) {
                    this.forceUpdate();
                }
            }
        };
        return fieldLookupMixins;
    }(field_mixins_js_1.default));
    exports.default = fieldLookupMixins;
});
//# sourceMappingURL=field-lookup-mixins.js.map