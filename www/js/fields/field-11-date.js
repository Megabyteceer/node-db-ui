import {innerDatetimeFormat, readableDateFormat, registerFieldClass, toReadableDate} from "../utils.js";
import {dateFieldMixins} from "./field-4-datetime.js";

registerFieldClass(FIELD_11_DATE, class DateField extends dateFieldMixins {

	static decodeValue(val) {
		if(val === '0000-00-00 00:00:00') {
			return null;
		}
		return moment(val, innerDatetimeFormat);
	}

	static encodeValue(val) {
		if(!val) {
			return ('0000-00-00 00:00:00');
		}
		return val.format(innerDatetimeFormat);
	}

	focusOverride() {
		ReactDOM.findDOMNode(this.refToInput).querySelector('input').focus();
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
			return R.div({
				title: (this.props.isCompact ? field.name : '')
			},
				React.createElement(Datetime, inputsProps)
			);

		} else {
			return R.span(null, value);
		}
	}
});