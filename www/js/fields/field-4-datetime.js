import {R} from "js/entry.js";
import {moment} from "../libs/libs.js";
import {innerDatetimeFormat, L, readableDateFormat, readableTimeFormat, renderIcon, toReadableDate, toReadableDatetime, toReadableTime} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

function isSameDay(val, d) {
	if(!d || !val) return false;
	return d.date() === val.date() && d.month() === val.month() && d.year() === val.year();
};

class dateFieldMixins extends fieldMixins {

	constructor(props) {
		super(props);
		this.importReactDateTime();

	}

	importReactDateTime() {
		if(!this.ReactDatetimeClass) {
			import('../libs/react-datetime.js').then((module) => {
				this.ReactDatetimeClass = module.ReactDatetimeClass;
				this.forceUpdate();
			});
		}
	}

	setValue(val) {
		if(val) {
			if(typeof val === 'string') {
				val = moment(val);
			} else {
				val = val.clone();
			}
		}

		var props = {
			inputValue: toReadableDate(val),
			selectedDate: val,
		}
		if(val) {
			props.viewDate = val.clone().startOf("day");

		}
		this.refToInput.setState(props);
		// @ts-ignore
		if(this.timeRef) {
			// @ts-ignore
			this.timeRef.setState({
				inputValue: toReadableTime(val),
				selectedDate: val,
			});
		}

		this.state.value = val;
		this.props.wrapper.valueListener(val, false, this);

	}

	setMin(moment) {
		this.state.minDate = moment;
		if(moment && (this.state.focused)) {
			if(!this.state.value) {
				this.setValue(moment);
				this.props.wrapper.valueListener(moment, true, this);
			} else {
				this.enforceToValid();
			}
		}
	}

	setMax(moment) {
		this.state.maxDate = moment;
		if(moment && (this.state.focused)) {
			if(!this.state.value) {
				this.setValue(moment);
				this.props.wrapper.valueListener(moment, true, this);
			} else {
				this.enforceToValid();
			}
		}
	}

	enforceToValid() {
		this.validateDate(this.state.value, true);
	}

	setDatePart(moment) {
		if(this.state.value && !this.validateDate(this.state.value)) {
			var nv = this.state.value.clone();
			nv.year(moment.year());
			nv.month(moment.month());
			nv.date(moment.date());
			this.setValue(nv);
			this.props.wrapper.valueListener(nv, true, this);
		}
	}

	validateDate(val, doFix) {
		if(this.state.allowedDays) {
			var isValid = this.state.allowedDays.some((d) => {
				return isSameDay(val, d);
			});

			if(!isValid && (doFix === true)) {
				this.setDatePart(this.state.allowedDays[0]);
				this.props.wrapper.valueListener(this.state.value, true, this);
				return true;
			}
			return isValid;
		}

		if(this.state.minDate) {
			if(!val || !val.clone().startOf('day').isSameOrAfter(this.state.minDate.clone().startOf('day'))) {
				if(doFix === true) {
					this.setValue(this.state.minDate);
					this.props.wrapper.valueListener(this.state.value, true, this);
					return true;
				}
				return false;
			}
		}

		if(this.state.maxDate) {
			if(!val || !val.clone().startOf('day').isSameOrBefore(this.state.maxDate.clone().startOf('day'))) {
				if(doFix === true) {
					this.setValue(this.state.maxDate);
					this.props.wrapper.valueListener(this.state.value, true, this);
					return true
				}
				return false;
			}
		}

		if(!val) {
			if(doFix === true) {
				val = moment();
				this.setValue(val);
			} else {
				return false;
			}
		}


		return true;
	}

	focused() {
		this.setState({
			focused: true
		});
		this.enforceToValid();
	}
}

registerFieldClass(FIELD_4_DATETIME, class FieldDateTime extends dateFieldMixins {

	static decodeValue(val) {
		if(val) {
			return moment(val, innerDatetimeFormat);
		}
		return null;
	}

	static encodeValue(val) {
		if(!val) {
			return ('0000-00-00 00:00:00');
		}
		return val.format(innerDatetimeFormat);
	}

	focus() {
		// @ts-ignore
		ReactDOM.findDOMNode(this.timeRef).querySelector('input').focus();
	}

	clearValue() {
		this.setValue(null);
		this.props.wrapper.valueListener(null, true, this);
	}

	render() {
		if(!this.ReactDatetimeClass) {
			return renderIcon('cog fa-spin');
		}

		var field = this.props.field;

		var value = this.state.value;

		if(value && isNaN(value.year())) {
			value = undefined;
		}

		if(this.props.isEdit) {

			var inputsProps1 = {
				closeOnSelect: true,
				initialValue: value,
				placeholder: L('TIME'),
				readOnly: this.props.fieldDisabled,
				dateFormat: false,
				timeFormat: readableTimeFormat,
				title: L('N_TIME', field.name),
				mask: 'dd:dd',
				onFocus: this.focused,
				isValidDate: this.state.focused ? this.validateDate : undefined,
				ref: (ref) => {
					this.timeRef = ref;
					this.refGetter(ref)
				},
				onChange: (val) => {
					if(val._isAMomentObject) {
						var concatedVal;
						var value = this.state.value;
						if(value) {
							concatedVal = value.clone();
							concatedVal.hour(val.hour());
							concatedVal.minute(val.minute());
							concatedVal.second(val.second());
						} else {
							concatedVal = val;
						}

						this.setValue(concatedVal);
						this.props.wrapper.valueListener(concatedVal, true, this);
					} else {
						this.clearValue();
					}
				}
			};

			var inputsProps2 = {
				closeOnSelect: true,
				initialValue: value,
				placeholder: L('DATE'),
				readOnly: this.props.fieldDisabled,
				dateFormat: readableDateFormat,
				isValidDate: this.state.focused ? this.validateDate : undefined,
				timeFormat: false,
				onFocus: this.focused,
				title: L('N_DATE', field.name),
				ref: (ref) => {
					this.refToInput = ref;
				},
				onChange: (val) => {
					if(val._isAMomentObject) {
						var concatedVal;
						var value = this.state.value;
						if(value) {
							concatedVal = value.clone();
							concatedVal.year(val.year());
							concatedVal.dayOfYear(val.dayOfYear());
						} else {
							concatedVal = val;
						}

						this.setValue(concatedVal);
						this.props.wrapper.valueListener(concatedVal, true, this);
					} else {
						this.clearValue();
					}
				}
			};
			return R.div({
				title: (this.props.isCompact ? field.name : '')
			},
				R.div({
					className: "field-date-time-time"
				}, React.createElement(this.ReactDatetimeClass, inputsProps1)),
				R.div({
					className: "field-date-time-date"
				}, React.createElement(this.ReactDatetimeClass, inputsProps2))
			);
		} else {
			return toReadableDatetime(value);
		}
	}
});

export {
	dateFieldMixins
};