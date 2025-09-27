import BaseField from '../base-field';
import { R } from '../r';
import { FIELD_TYPE } from '../types/generated';
import { isAutoFocus, registerFieldClass } from '../utils';

export default class PasswordField extends BaseField {

	setValue(value: string) {
		this.refToInput!.value = value;
		this.currentValue = value;
	}

	renderFieldEditable() {
		const value = this.currentValue;
		const field = this.props.fieldDesc;

		if (this.props.isEdit) {
			const inputsProps = {
				type: 'password',
				name: field.fieldName,
				autoFocus: isAutoFocus(),
				defaultValue: value,
				title: field.name,
				maxLength: field.maxLength,
				placeholder: field.name,
				readOnly: this.props.fieldDisabled,
				ref: this.refGetter,
				onInput: () => {
					this.valueListener(this.refToInput!.value, true);
				}
			};

			return R.input(inputsProps);
		} else {
			return R.span(null, '********');
		}
	}
}
registerFieldClass(FIELD_TYPE.PASSWORD, PasswordField);
