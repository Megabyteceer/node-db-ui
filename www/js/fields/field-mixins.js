import {scrollToVisible} from "../utils.js";

export default class fieldMixins extends React.Component {

	constructor(props) {
		super(props);
		this.state = {value: props.initialValue};
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