import { FIELD_1_TEXT } from "../bs-utils";
import { R } from "../r";
import { consoleDir, registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

registerFieldClass(FIELD_1_TEXT, class TextField extends BaseField {

	setValue(val) {
		this.refToInput.value = val;
		//@ts-ignore
		this.state.value = val;
	}

	render() {

		var value = this.state.value;
		var field = this.props.field;

		if(typeof (value) !== 'string') {
			if(value === null || value === undefined) {
				value = '';
			} else {

				setTimeout(() => {
					console.error('non string value for field ' + field.name + ' with default type');
					//debugError('non string value for field '+field.name+' with default type');
				}, 1);
				/// #if DEBUG
				consoleDir(field);
				consoleDir(value);
				/// #endif
				value = JSON.stringify(value);
			}
		}

		if(this.props.isEdit) {
			let className;
			if(this.props.isCompact) {
				if(field.maxLength > 600) {
					className = 'middle-size-input';
				}
			} else {
				if(field.maxLength > 600) {
					className = 'large-input';
				} else if(field.maxLength > 200) {
					className = 'middle-size-input';
				}
			}

			var inputsProps = {
				className,
				autoFocus: this.isAutoFocus(),
				defaultValue: value,
				maxLength: this.props.maxLen || field.maxLength,
				title: field.name,
				name: field.fieldName,
				placeholder: field.name + (field.lang ? (' (' + field.lang + ')') : ''),
				readOnly: this.props.fieldDisabled,
				ref: this.refGetter,
				onChange: () => {
					this.props.wrapper.valueListener(this.refToInput.value, true, this);
				}
			};

			if(field.maxLength > 200) {
				return R.textarea(inputsProps);
			} else {
				return R.input(inputsProps);
			}
		} else {
			return this.renderTextValue(value);
		}
	}
});
