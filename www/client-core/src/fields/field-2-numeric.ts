import { FIELD_TYPE } from "../bs-utils";
import { R } from "../r";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

registerFieldClass(FIELD_TYPE.NUMBER, class NumericField extends BaseField {

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
				autoFocus: this.isAutoFocus(),
				maxLength: field.maxLength,
				placeholder: field.name,
				readOnly: this.props.fieldDisabled,
				ref: this.refGetter,
				onChange: () => {
					let value = parseInt(this.refToInput.value.substr(0, field.maxLength));
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