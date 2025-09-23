import BaseField from '../base-field';
import { R } from '../r';
import { FIELD_TYPE } from '../types/generated';
import { isAutoFocus, registerFieldClass } from '../utils';

export default class NumericField extends BaseField {

	static decodeValue(val?: string) {
		if (val) {
			return parseInt(val);
		}
		return val;
	}

	renderFieldEditable() {
		let value = this.currentValue;
		const field = this.props.fieldDesc;

		if (isNaN(value)) {
			value = 0;
			this.valueListener(0, false);
		}

		const inputsProps = {
			type: 'number',
			value: value,
			title: field.name,
			autoFocus: isAutoFocus(),
			maxLength: field.maxLength,
			placeholder: field.name,
			readOnly: this.props.fieldDisabled,
			ref: this.refGetter,
			onInput: () => {
				const value = parseInt(this.refToInput!.value.substr(0, field.maxLength));
				this.valueListener(value, true);
			}
		};

		return R.input(inputsProps);
	}

	renderField() {
		return this.renderTextValue((typeof this.currentValue === 'number') ? this.currentValue.toString() : this.currentValue);
	}

}
registerFieldClass(FIELD_TYPE.NUMBER, NumericField);
