import {scrollToVisible} from "../utils.js";

export default class fieldMixins extends React.Component {

	constructor(props) {
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
				ReactDOM.findDOMNode(this.refToInput).focus();
			}
		}
	}

	refGetter(refToInput) {
		this.refToInput = refToInput;
	}
}