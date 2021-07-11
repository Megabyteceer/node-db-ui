import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

var optionStyle = {
	padding:'5px',
	cursor:'pointer'
}

registerFieldClass(FIELD_6_ENUM, {
	mixins:[fieldMixins],
	setValue: function(val) {
		this.refToInput.value = val;
		this.state.value = val;
	},
	render:function() {
		
		var value = this.state.value;
		var field = this.props.field;

		if(!value){
			value = 0
		}
		
		if(this.props.isEdit) {
			
			var maxVal = Array(parseInt(field.maxlen)+1).join("9");
			
			var inputsProps = {
				isCompact:this.props.isCompact,
				defaultValue:value,
				title:field.name,
				readOnly :this.props.fieldDisabled,
				ref:this.refGetter,
				onChange:function(val) {
					this.props.wrapper.valueListener(val, false, this);
				}.bind(this),
				options:field.enum
			};
			
			/*
			var options = [ReactDOM.option({value: '', key:0, style:optionStyle},'')];
			
			for (var k in field.enum){
				var o = field.enum[k];
				options.push(ReactDOM.option({value: k, key:k, style:optionStyle},o));
			};
				
				
				
				
			return ReactDOM.select(inputsProps, options);
			*/
			return React.createElement(Select, inputsProps);
			
			
			
		} else {
			return ReactDOM.span(this.props.isCompact?readOnlyCompactFieldProperties:readOnlyFieldProperties, ReactDOM.span({className:'enum-'+field.id+'_'+value}, field.enum[value]));
		}
		
	}
});
