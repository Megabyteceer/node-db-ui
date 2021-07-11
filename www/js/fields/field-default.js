import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

var readOnlyFieldProperties={
	style:{
		margin:'3px',
		display:'inline-block',
		fontWeight:'bold',
		fontSize:'120%'
	}
};
var readOnlyCompactFieldProperties=null;

var notCompactInputStyle = {
	width:'100%',
	maxWidth:'100%'
};
var notCompactLargeInputStyle = {
	width:'100%',
	maxWidth:'100%',
	height: 206
};
var notCompactMiddleInputStyle = {
	width:'100%',
	maxWidth:'100%',
	height: 64
};

var compactInputStyle = {
	marginBottom:4,
	marginTop:4,
	display:'inline-block',
	width:'95%',
	maxWidth:'95%',
};

registerFieldClass(FIELD_1_TEXT, class TextField extends fieldMixins {

	setValue(val) {
		this.refToInput.value = val;
		this.state.value = val;
	}

	getMessageIfInvalid(callback) {
		callback(false);
	}

	render() {
		
		var value = this.state.value;
		var field = this.props.field;
		
		
		if (typeof(value) !== 'string') {
			if(value === null || value === undefined){
				value = '';
			} else {
				
				setTimeout(function(){
					console.error('non string value for field '+field.name+' with default type');
					//debugError('non string value for field '+field.name+' with default type');
				},1);
/// #if DEBUG
					consoleDir(field);
					consoleDir(value);
/// #endif
				value = JSON.stringify(value);
			}
		}
		
		
		if (this.props.isEdit) {
			
			var s;
			
			if (this.props.isCompact) {
				if (field.maxlen > 600) {
					s = notCompactMiddleInputStyle;
				} else {
					s = compactInputStyle;
				}
				
			} else {
				if (field.maxlen > 600) {
					s = notCompactLargeInputStyle;
					
				} else if (field.maxlen > 200) {
					s = notCompactMiddleInputStyle;
				} else {
					s = notCompactInputStyle;
				}
			}
			
			
			var inputsProps = {
				style:s,
				defaultValue:value,
				maxLength:this.props.maxLen || field.maxlen,
				title:field.name,
				placeholder:field.name+(field.lang?(' ('+field.lang+')'):''),
				readOnly :this.props.fieldDisabled,
				ref:this.refGetter,
				onChange:function() {
					this.props.wrapper.valueListener(this.refToInput.value, true, this);
				}.bind(this)
			};
			
			
			
			if (field.maxlen > 200) {
				return ReactDOM.textarea(inputsProps);
			} else {
				return ReactDOM.input(inputsProps);
			}
			
		} else {
			return ReactDOM.span(this.props.isCompact?readOnlyCompactFieldProperties:readOnlyFieldProperties,
				value
			);
		}
	}
});

