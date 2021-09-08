import { FIELD_2_INT } from "../bs-utils";
import { R } from "../r";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

registerFieldClass(FIELD_2_INT, class NumericField extends BaseField {

	setValue(val) {
		this.refToInput.value = val;
		//@ts-ignore
		this.state.value = val;
	}

	static decodeValue(val) {
		if(val) {
			return parseInt(val);
		}
		return val;
	}

	render() {

		var value = this.state.value;
		var field = this.props.field;

		if(!value) {
			value = 0
		}

		if(this.props.isEdit) {
			var inputsProps = {
				type: 'number',
				value: value,
				title: field.name,
				maxLength: field.maxlen,
				placeholder: field.name,
				readOnly: this.props.fieldDisabled,
				ref: this.refGetter,
				onChange: () => {
					let value = parseInt(this.refToInput.value.substr(0, field.maxlen));
					this.setState({ value });
					this.props.wrapper.valueListener(value, true, this);
				}
			};

			return R.input(inputsProps);
		} else {
			return this.renderTextValue(value.toString());
		}

	}
});