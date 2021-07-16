import {scrollToVisible} from "../utils.js";

export default class fieldMixins extends React.Component {

	constructor(props) {
		assert(props.field, '"field" property  expected.');
		super(props);
		let value = props.initialValue;
		if(Array.isArray(value)) {
			value = value.slice();
		}
		this.state = {value};
		this.refGetter = this.refGetter.bind(this);
	}

	focus() {
		if(this.focusOverride) {
			this.focusOverride();
		} else {
			if(this.refToInput) {
				scrollToVisible(this.refToInput);
				//TODO: shake field
				ReactDOM.findDOMNode(this.refToInput).focus();
			}
		}
	}

	refGetter(refToInput) {
		this.refToInput = refToInput;
	}
}