import BaseField from '../base-field';
import { R } from '../r';
import { FIELD_TYPE } from '../types/generated';
import { registerFieldClass } from '../utils';

export default class NumericField extends BaseField {

	static decodeValue(val?: string) {
		return val;
	}

	isEmpty() {
		return false;
	}

	setMin(min?: number) {
		this.refToInput.min = min as any;
		this.min = min;
	}

	private min?: number;
	private max?: number;

	valueListener(val: string, withBounceDelay?: boolean | number) {
		if (typeof this.min === 'number') {
			val = Math.max(this.min, parseFloat(val)).toFixed(this.props.fieldDesc.decimals || 0);
		}
		if (typeof this.max === 'number') {
			val = Math.min(this.max, parseFloat(val)).toFixed(this.props.fieldDesc.decimals || 0);
		}
		return super.valueListener(this.props.fieldDesc.decimals ? val : parseInt(val), withBounceDelay);
	}

	setMax(max?: number) {
		this.refToInput.max = max as any;
		this.max = max;
	}

	renderFieldEditable() {
		let value = this.currentValue;
		const field = this.props.fieldDesc;

		if (isNaN(value)) {
			value = 0;
			this.valueListener('0', 5);
		}

		let step = undefined as string | undefined;
		if (field.decimals! > 0) {
			step = '0.' + ('0'.repeat(field.decimals! - 1)) + '1';
		}

		const inputsProps = {
			type: 'number',
			value: value,
			title: field.name,
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
