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

	renderTextValue(txt) {
		if(this.props.field.forSearch) {
			const list = this.props.form.props.list;
			if(list && list.filters && list.filters.s) {

				return React.createElement(window.Highlighter, {

					highlightClassName: 'mark-search',
					searchWords: [(typeof list.filters.s === 'string') ? list.filters.s : String(list.filters.s)],
					autoEscape: true,
					textToHighlight: txt
				});
			}
		}
		return txt;
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