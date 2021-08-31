import { FIELD_17_TAB } from "../bs-utils";
import { R } from "../r";
import { registerFieldClass } from "../utils";
import { fieldMixins } from "./field-mixins";

registerFieldClass(FIELD_17_TAB, class TabField extends fieldMixins {

	setValue(val) {
	}

	render() {
		return R.div(null,
			this.props.wrapper.props.subFields
		);
	}
});
