import { FIELD_TYPE_STATIC_TEXT_8 } from "../bs-utils";
import { R } from "../r";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

registerFieldClass(FIELD_TYPE_STATIC_TEXT_8, class StaticTextField extends BaseField {

	setValue(val) { }

	render() {
		var field = this.props.field;
		if(window.crudJs.customClasses[field.description]) {
			//TODO: custom class forms
			debugger;
			//return React.createElement(window.crudJs.customClasses[field.description], this.props);
		} else {
			return R.span({
				dangerouslySetInnerHTML: {
					__html: field.description
				}
			});
		}
	}
});