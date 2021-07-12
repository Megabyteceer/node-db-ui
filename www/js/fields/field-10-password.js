import {registerFieldClass} from "../utils.js";
import {readOnlyCompactFieldProperties, readOnlyFieldProperties} from "./field-1-text-default.js";
import fieldMixins from "./field-mixins.js";

registerFieldClass(FIELD_10_PASSWORD, class TextField extends fieldMixins {

	setValue(val) {
		this.refToInput.value = val;
		this.state.value = val;
	}

	render() {
		
		var value = this.state.value;
		var field = this.props.field;
		
		if (this.props.isEdit) {
			
			var inputsProps = {
				type:'password',
				name:'password',
				style:this.props.isCompact?compactInputStyle:notCompactInputStyle,
				defaultValue:value,
				title:field.name,
				maxLength:field.maxlen,
				placeholder:field.name,
				readOnly :this.props.fieldDisabled,
				ref:this.refGetter,
				onChange:function() {
					this.props.wrapper.valueListener(this.refToInput.value, true, this);
				}.bind(this)
			};
			
			return ReactDOM.input(inputsProps);
			
		} else {
			return ReactDOM.span(this.props.isCompact ? readOnlyCompactFieldProperties : readOnlyFieldProperties,
				'********'
			);
		}
	}
});