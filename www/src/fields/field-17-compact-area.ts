import { FIELD_TYPE_TAB_17 } from "../bs-utils";
import { R } from "../r";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

registerFieldClass(FIELD_TYPE_TAB_17, class TabField extends BaseField {

	setValue(val) {
	}

	render() {
		return R.div(null,
			this.props.wrapper.props.subFields
		);
	}
});
