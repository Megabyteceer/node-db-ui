import { FIELD_TYPE } from '../../../../types/generated';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import { BaseField } from './base-field';

registerFieldClass(
	FIELD_TYPE.NUMBER,
	class NumericField extends BaseField {

		setValue(value: number) {
			this.refToInput!.value = value;
			this.setState({ value });
		}

		static decodeValue(val?: string) {
			if (val) {
				return parseInt(val);
			}
			return val;
		}

		render() {
			let value = this.state.value;
			const field = this.props.field;

			if (!value) {
				value = 0;
			}

			if (this.props.isEdit) {
				const inputsProps = {
					type: 'number',
					value: value,
					title: field.name,
					autoFocus: this.isAutoFocus(),
					maxLength: field.maxLength,
					placeholder: field.name,
					readOnly: this.props.fieldDisabled,
					ref: this.refGetter,
					onInput: () => {
						const value = parseInt(this.refToInput!.value.substr(0, field.maxLength));
						this.setState({ value });
						this.props.wrapper.valueListener(value, true, this);
					}
				};

				return R.input(inputsProps);
			} else {
				return this.renderTextValue(value.toString());
			}
		}
	}
);
