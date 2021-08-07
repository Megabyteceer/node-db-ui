import ReactDOM from "react-dom";
import React from "react";

import {assert} from "../bs-utils";
import {Component} from "react";
import {Highlighter} from "react-highlight-words";

export default class fieldMixins extends Component {

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

				return React.createElement(Highlighter, {

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
		if(this.refToInput) {
			// @ts-ignore
			ReactDOM.findDOMNode(this.refToInput).focus();
		}
	}

	refGetter(refToInput) {
		this.refToInput = refToInput;
	}
}