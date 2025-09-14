import { Component, type ComponentChild } from 'preact';
import { assert } from '../assert';
import type { FieldDesc, GetRecordsFilter } from '../bs-utils';
import type { AdditionalButtonsRenderer } from '../fields/field-lookup-mixins';
import type { FormFull } from '../forms/form-full';
import type { FormListItem } from '../forms/form-list-item';
import type { FieldWrap } from './field-wrap';

let autoFocusNow = true;
const resetAutofocus = () => {
	autoFocusNow = true;
};

export interface FieldProps {
	field: FieldDesc;
	form: FormFull | FormListItem;
	hidden?: boolean;
	parent?: BaseField;
	isEdit?: boolean;
	disabled?: boolean;
	isCompact?: boolean;
	maxLen?: number;
	fieldDisabled?: boolean;
	wrapper: FieldWrap;
	initialValue: any;
	parentTabName?: string;
	additionalButtons?: AdditionalButtonsRenderer;
	isTable?: boolean;
}

interface FieldState {
	focused?: boolean;
	value?: any;
	requirement?: boolean;
	filters?: GetRecordsFilter;
}

interface RefToInput extends Component {
	value: any;
	focus(): void;
	click(): void;
}

class BaseField<T extends FieldProps = FieldProps, T2 extends FieldState = FieldState> extends Component<T, T2> {
	refToInput: RefToInput | undefined;
	forceBouncingTimeout?(): void;

	constructor(props: T) {
		assert(props.field, '"field" property  expected.');
		super(props);
		let value = props.initialValue;
		if (Array.isArray(value)) {
			value = value.slice();
		}
		(this as any).state = { value } as FieldState;
		this.refGetter = this.refGetter.bind(this);
	}

	/** returns true only for first call at one render time */
	isAutoFocus() {
		const ret = autoFocusNow;
		if (autoFocusNow) {
			autoFocusNow = false;
			setTimeout(resetAutofocus, 10);
		}
		return ret;
	}

	declare static decodeValue?: (val: any) => any;
	declare static encodeValue?: (val: any) => any;

	isRequired() {
		return this.state.hasOwnProperty('requirement')
			? this.state.requirement
			: this.props.field.requirement;
	}

	isEmpty(): boolean {
		const val = (this.props.wrapper!.props.form as FormFull).currentData[this.props.field.fieldName];
		return !val;
	}

	getBackupData(): any {
		throw 'class ' + this.constructor.name + ' has no getBackupData() method.';
	}

	setMin(_val: any) {
		throw 'class ' + this.constructor.name + ' has no setMin() method.';
	}

	setMax(_val: any) {
		throw 'class ' + this.constructor.name + ' has no setMax() method.';
	}

	setLookupFilter(_name: string | GetRecordsFilter, _value: any) {
		throw 'class ' + this.constructor.name + ' has no setLookupFilter() method.';
	}

	setValue(_value: any) {
		throw 'class ' + this.constructor.name + ' has no setValue() method.';
	}

	async getMessageIfInvalid?(): Promise<string | undefined>;
	async beforeSave?(): Promise<unknown>;
	async afterSave?(): Promise<unknown>;
	inlineEditable?(): void;
	extendEditor?(): void;

	renderTextValue(txt: string) {
		/* if (this.props.field.forSearch) { // TODO: searching highlighting
			const list = this.props.form.props.list;
			if (list && list.filters && list.filters.s) {
				return h(Highlighter, {
					highlightClassName: 'mark-search',
					searchWords: [
						typeof list.filters.s === 'string' ? list.filters.s : String(list.filters.s),
					],
					autoEscape: true,
					textToHighlight: txt,
				});
			}
		} */
		return txt;
	}

	focus() {
		if (this.refToInput) {
			this.refToInput.focus();
		}
	}

	refGetter(refToInput: RefToInput) {
		this.refToInput = refToInput;
	}

	render(): ComponentChild {
		return 'BaseField has no view.';
	}
}
export { BaseField, FieldState, RefToInput };
