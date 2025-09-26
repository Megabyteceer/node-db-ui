import BaseField from '../base-field';
import { R } from '../r';
import { FIELD_TYPE } from '../types/generated';
import { isAutoFocus, registerFieldClass } from '../utils';

export default class NumericField extends BaseField {

	static decodeValue(val?: string) {
		return val;
	}

	isEmpty() {
		return false;
	}

	renderFieldEditable() {
		let value = this.currentValue;
		const field = this.props.fieldDesc;

		if (isNaN(value)) {
			value = 0;
			this.valueListener(0, false);
		}

		let step = undefined as string | undefined;
		if (field.decimals! > 0) {
			step = '0.' + ('0'.repeat(field.decimals! - 1)) + '1';
		}

		const inputsProps = {
			type: 'number',
			value: value,
			title: field.name,
			autoFocus: isAutoFocus(),
			step,
			maxLength: field.maxLength,
			placeholder: field.name,
			readOnly: this.props.fieldDisabled,
			ref: this.refGetter,
			onInput: () => {
				const src = this.refToInput!.value as string;
				let value = src;
				if (!field.decimals) {
					value = parseInt(src.substring(0, field.maxLength)) as any;
				}
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
