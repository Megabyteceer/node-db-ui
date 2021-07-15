import {innerDatetimeFormat, readableDateFormat, registerFieldClass} from "../utils.js";
import {readOnlyCompactFieldProperties, readOnlyFieldProperties} from "./field-1-text-default.js";
import {dateFieldMixins} from "./field-4-datetime.js";

registerFieldClass(FIELD_11_DATE, class TextField extends dateFieldMixins {

	setValue(val) {
		if(val) {
			if(typeof val === 'string') {
				val = new moment(val);
			} else {
				val = val.clone();
			}
		}
		var props = {
			inputValue: toReadableDate(val),
			selectedDate: val,
		}
		if(val) {
			val = val.startOf("day")
			props.viewDate = val;
		}
		this.refToInput.setState(props);
		this.state.value = val;
		this.props.wrapper.valueListener(val, false, this);
	}

	static decodeValue(val) {
		if(val === '0000-00-00 00:00:00') {
			return null;
		}
		return new moment(val, innerDatetimeFormat);
	}

	static encodeValue(val) {
		if(!val) {
			return ('0000-00-00 00:00:00');
		}
		return val.format(innerDatetimeFormat);
	}

	focusOverride() {
		this.refToInput.refs.inputInstance.focus();
	}

	render() {

		var field = this.props.field;
		var value = toReadableDate(this.state.value);
		if(this.props.isEdit) {
			var inputsProps = {
				closeOnSelect: true,
				defaultValue: value,
				placeholder: field.name,
				readOnly: this.props.fieldDisabled,
				dateFormat: readableDateFormat,
				title: field.name,
				onFocus: this.focused,
				isValidDate: this.state.focused ? this.validateDate : undefined,
				timeFormat: false,
				ref: this.refGetter,
				onChange: (val) => {
					if(!val._isAMomentObject) {
						val = null;
					}
					this.props.wrapper.valueListener(val, true, this);
				}
			};
			return ReactDOM.div({
				title: (this.props.isCompact ? field.name : ''),
				style: this.props.isCompact ? compactInputStyle : notCompactInputStyle
			},
				React.createElement(Datetime, inputsProps)
			);

		} else {
			return ReactDOM.span(this.props.isCompact ? readOnlyCompactFieldProperties : readOnlyFieldProperties,
				value
			)
		}
	}
});