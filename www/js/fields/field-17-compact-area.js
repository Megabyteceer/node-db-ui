import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

registerFieldClass(FIELD_17_TAB, class TabField extends fieldMixins {

	setValue(val) {
	}

	render() {
		return R.div({style: {minHeight: 38}},
			this.props.wrapper.props.subFields
		);
	}
});
