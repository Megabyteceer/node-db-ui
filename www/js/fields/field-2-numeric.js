import {FIELD_2_INT} from "../bs-utils.js";
import R from "../r.js";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

registerFieldClass(FIELD_2_INT, class NumericField extends fieldMixins {

	setValue(val) {
		this.refToInput.value = val;
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
					this.setState({value});
					this.props.wrapper.valueListener(value, true, this);
				}
			};

			return R.input(inputsProps);
		} else {
			return this.renderTextValue(value.toString());
		}

	}
});