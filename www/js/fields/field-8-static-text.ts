import { FIELD_8_STATICTEXT } from "../bs-utils";
import { R } from "../r";
import { registerFieldClass } from "../utils";
import { fieldMixins } from "./field-mixins";

registerFieldClass(FIELD_8_STATICTEXT, class StaticTextField extends fieldMixins {

	setValue(val) { }

	render() {
		var field = this.props.field;
		if(window[field.fdescription]) {
			//TODO: custom class forms
			debugger;
			//return React.createElement(window[field.fdescription], this.props);
		} else {
			return R.span({
				dangerouslySetInnerHTML: {
					__html: field.fdescription
				}
			});
		}
	}
});