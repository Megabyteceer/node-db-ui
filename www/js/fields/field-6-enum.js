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

	setFilterValues(filter) {
		if(filter) {
			this.enum = this.props.field.enum.filter(v => filter.indexOf(v) < 0);
		} else {
			delete this.enum;
		}
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
				options: this.enum || field.enum
			};
			/*
			var options = [R.option({value: '', key:0, style:optionStyle},'')];
		    
			for (var k in field.enum){
				var o = field.enum[k];
				options.push(R.option({value: k, key:k, style:optionStyle},o));
			};
			return R.select(inputsProps, options);
			*/
			return React.createElement(Select, inputsProps);
		} else {
			return R.span(this.props.isCompact ? readOnlyCompactFieldProperties : readOnlyFieldProperties, R.span({
				className: 'enum-' + field.id + '_' + value
			}, field.enumNamesById[value]));
		}
	}
});