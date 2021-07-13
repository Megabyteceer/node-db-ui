import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

registerFieldClass(FIELD_17_TAB, class TextField extends fieldMixins {

	setValue(val) {
	}

	render() {
		return ReactDOM.div({style: {minHeight: 38}},
			this.props.wrapper.props.subFields
		);
	}
});
