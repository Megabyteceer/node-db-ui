import {FIELD_10_PASSWORD} from "../bs-utils.js";
import R from "../r.js";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

registerFieldClass(FIELD_10_PASSWORD, class PasswordField extends fieldMixins {

	setValue(val) {
		this.refToInput.value = val;
		this.state.value = val;
	}

	render() {

		var value = this.state.value;
		var field = this.props.field;

		if(this.props.isEdit) {

			var inputsProps = {
				type: 'password',
				name: 'password',
				defaultValue: value,
				title: field.name,
				maxLength: field.maxlen,
				placeholder: field.name,
				readOnly: this.props.fieldDisabled,
				ref: this.refGetter,
				onChange: () => {
					this.props.wrapper.valueListener(this.refToInput.value, true, this);
				}
			};

			return R.input(inputsProps);

		} else {
			return R.span(null, '********');
		}
	}
});