import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

registerFieldClass(FIELD_8_STATICTEXT, {
	mixins:[fieldMixins],
	setValue: function(val) {
	},
	render: function() {
		var field = this.props.field;
		if (window[field.fdescription]) {
			return React.createElement(window[field.fdescription], this.props);
		} else {
			return ReactDOM.span({dangerouslySetInnerHTML:{__html:field.fdescription}});
		}
	}
});

