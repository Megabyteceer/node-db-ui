import {registerFieldClass} from "../utils.js";
import {readOnlyCompactFieldProperties, readOnlyFieldProperties} from "./field-1-text-default.js";
import fieldMixins from "./field-mixins.js";

registerFieldClass(FIELD_2_INT, class NumericField extends fieldMixins {

	setValue(val) {
		this.refToInput.value = val;
		this.state.value = val;
	}

	static decodeValue(val) {
		if(val){
			return parseInt(val);
		}
		return val;
	}

	render() {
		
		var value = this.state.value;
		var field = this.props.field;

		if(!value){
			value = 0
		}
		
		if(this.props.isEdit) {
			
			var maxVal = Array(parseInt(field.maxlen)+1).join("9");
			
			var inputsProps = {
				style:this.props.isCompact?compactInputStyle:notCompactInputStyle,
				type:'number',
				defaultValue:value,
				min:0,
				max:maxVal,
				title:field.name,
				maxLength:field.maxlen,
				placeholder:field.name,
				readOnly :this.props.fieldDisabled,
				ref:this.refGetter,
				onChange:function() {
					this.props.wrapper.valueListener(parseInt(this.refToInput.value), true, this);
				}.bind(this)
			};
			
			return ReactDOM.input(inputsProps);
		} else {
			return ReactDOM.span(this.props.isCompact ? readOnlyCompactFieldProperties : readOnlyFieldProperties, value.toString());
		}
		
	}
});
