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

	isEmpty() {
		const val = this.state.value;
		return (!val && val !== 0);
	}

	focus() {
		if(this.focusOverride) {
			this.focusOverride();
		} else {
			if(this.refToInput) {
				scrollToVisible(this.refToInput);
				ReactDOM.findDOMNode(this.refToInput).focus();
			} else {
				return false;
			}
		}
	}

	refGetter(refToInput) {
		this.refToInput = refToInput;
	}
}