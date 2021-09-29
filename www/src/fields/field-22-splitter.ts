import { FIELD_TYPE_SPLITTER_22 } from "../bs-utils";
import { R } from "../r";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

registerFieldClass(FIELD_TYPE_SPLITTER_22, class StaticTextField extends BaseField {
	render() {
		return R.span();
	}
});