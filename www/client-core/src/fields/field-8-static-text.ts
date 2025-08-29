import React from "react";
import { FIELD_TYPE } from "../bs-utils";
import { R } from "../r";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

registerFieldClass(FIELD_TYPE.STATIC_TEXT, class StaticTextField extends BaseField {

	setValue(val) { }

	render() {
		const field = this.props.field;
		if(crudJs.customClasses[field.description]) {
			//@ts-ignore
			return React.createElement(crudJs.customClasses[field.description], this.props);
		} else {
			return R.span({
				dangerouslySetInnerHTML: {
					__html: field.description
				}
			});
		}
	}
});