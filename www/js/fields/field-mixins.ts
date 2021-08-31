import ReactDOM from "react-dom";
import React from "react";

import { assert, FieldDesc, RecordData } from "../bs-utils";
import { Component } from "react";
import { Highlighter } from "react-highlight-words";
import { FormFull } from "../forms/form-full.js";
import { FieldWrap } from "./field-wrap.js";

interface FiledProps {
	field: FieldDesc;
	form: FormFull;
	isEdit: boolean;
	disabled: boolean;
	isCompact: boolean;
	maxLen?: number;
	fieldDisabled?: boolean;
	wrapper: FieldWrap;
	initialValue: any;

}

interface FieldState {
	focused?: boolean;
	value?: any;
}

interface RefToInput extends Component {
	value: any;
	focus();
	click();
}


class fieldMixins<T extends FiledProps = FiledProps, T2 extends FieldState = FieldState> extends Component<T, T2> {
	onSaveCallback: () => void;
	refToInput: RefToInput;

	constructor(props) {
		assert(props.field, '"field" property  expected.');
		super(props);
		let value = props.initialValue;
		if(Array.isArray(value)) {
			value = value.slice();
		}
		//@ts-ignore
		this.state = { value };
		this.refGetter = this.refGetter.bind(this);
	}

	isEmpty(): boolean {
		var val = this.props.wrapper.props.form.currentData[this.props.field.fieldName];
		return !val;
	}

	getBackupData(): RecordData {
		throw "class " + this.constructor.name + " has no getBackupData() method.";
	}

	setMin(val: Number) {
		throw "class " + this.constructor.name + " has no setMin() method.";
	}

	setMax(val: Number) {
		throw "class " + this.constructor.name + " has no setMax() method.";
	}

	setLookupFilter(name: string, value: any) {
		throw "class " + this.constructor.name + " has no setLookupFilter() method.";
	}

	setValue(value: any) {
		throw "class " + this.constructor.name + " has no setValue() method.";
	}

	async getMessageIfInvalid?(): Promise<string | false>;
	async beforeSave?(): Promise<unknown>;
	async afterSave?(): Promise<unknown>;
	inlineEditable?(): void;
	extendEditor?(): void;

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
export { fieldMixins, RefToInput, FieldState, FiledProps };