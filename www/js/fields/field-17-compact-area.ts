import { FIELD_17_TAB } from "../bs-utils";
import { R } from "../r";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

registerFieldClass(FIELD_17_TAB, class TabField extends BaseField {

	setValue(val) {
	}

	render() {
		return R.div(null,
			this.props.wrapper.props.subFields
		);
	}
});
