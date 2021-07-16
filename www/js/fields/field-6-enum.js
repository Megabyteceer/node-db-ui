import Select from "../components/select.js";
import {registerFieldClass} from "../utils.js";
import {readOnlyCompactFieldProperties, readOnlyFieldProperties} from "./field-1-text-default.js";
import fieldMixins from "./field-mixins.js";
/*
var optionStyle = {
	padding:'5px',
	cursor:'pointer'
}*/

registerFieldClass(FIELD_6_ENUM, class EnumField extends fieldMixins {

	setValue(val) {
		this.state.value = val;
	}

	render() {

		var value = this.state.value;
		var field = this.props.field;

		if(!value) {
			value = 0
		}

		if(this.props.isEdit) {

			var inputsProps = {
				isCompact: this.props.isCompact,
				defaultValue: value,
				title: field.name,
				readOnly: this.props.fieldDisabled,
				onChange: (val) => {
					this.props.wrapper.valueListener(parseInt(val), false, this);
				},
				options: field.enum
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
			return ReactDOM.span(this.props.isCompact ? readOnlyCompactFieldProperties : readOnlyFieldProperties, ReactDOM.span({
				className: 'enum-' + field.id + '_' + value
			}, field.enum[value]));
		}
	}
});