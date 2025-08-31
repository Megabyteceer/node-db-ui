import { FIELD_TYPE } from '../../../../types/generated';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import { BaseField } from './base-field';

registerFieldClass(
	FIELD_TYPE.PASSWORD,
	class PasswordField extends BaseField {
		setValue(val) {
			this.refToInput.value = val;
			//@ts-ignore
			this.state.value = val;
		}

		render() {
			const value = this.state.value;
			const field = this.props.field;

			if (this.props.isEdit) {
				const inputsProps = {
					type: 'password',
					name: field.fieldName,
					autoFocus: this.isAutoFocus(),
					defaultValue: value,
					title: field.name,
					maxLength: field.maxLength,
					placeholder: field.name,
					readOnly: this.props.fieldDisabled,
					ref: this.refGetter,
					onChange: () => {
						this.props.wrapper.valueListener(this.refToInput.value, true, this);
					},
				};

				return R.input(inputsProps);
			} else {
				return R.span(null, '********');
			}
		}
	}
);
