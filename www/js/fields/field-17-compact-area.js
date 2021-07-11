import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

var starStyle={
	color:'#282',
	marginLeft:2,
	marginRight:2
}

registerFieldClass(FIELD_17_TAB, {
	mixins:[fieldMixins],
	setValue: function(val) {
	},
	render: function() {
		return ReactDOM.div({style:{minHeight:38}},
			this.props.wrapper.props.subFields
		);
	}
});
