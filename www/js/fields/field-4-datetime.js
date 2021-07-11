import {L} from "../utils";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

function isSameDay(val, d) {
	if(!d || !val) return false;
	return d.date() === val.date() && d.month() === val.month() && d.year() === val.year();
	
};

class dateFieldMixins extends fieldMixins {

	setMin (moment) {
		this.state.minDate = moment;
		if (moment && (this.state.focused)) {
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
		if (moment  && (this.state.focused)) {
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
		if (this.state.value && !this.validateDate(this.state.value)) {
			var nv = this.state.value.clone();
			nv.year(moment.year());
			nv.month(moment.month());
			nv.date(moment.date());
			this.setValue(nv);
			this.props.wrapper.valueListener(nv, true, this);
		}
	}

	validateDate(val, doFix) {
		if (this.state.allowedDays) {
			var isValid = this.state.allowedDays.some(function(d){
				return isSameDay(val, d);
			}.bind(this));
			
			if (!isValid && (doFix===true)) {
				this.setDatePart(this.state.allowedDays[0]);
				this.props.wrapper.valueListener(this.state.value, true, this);
				return true;
			}
			return isValid;
		}
		
		if (this.state.minDate) {
			if(!val || !val.clone().startOf('day').isSameOrAfter(this.state.minDate.clone().startOf('day'))){
				if (doFix===true) {
					this.setValue(this.state.minDate);
					this.props.wrapper.valueListener(this.state.value, true, this);
					return true;
				}
				return false;
			}
		}
		
		if (this.state.maxDate) {
			if (!val || !val.clone().startOf('day').isSameOrBefore(this.state.maxDate.clone().startOf('day'))) {
				if (doFix===true) {
					this.setValue(this.state.maxDate);
					this.props.wrapper.valueListener(this.state.value, true, this);
					return true
				}
				return false;
			}
		}
		
		if (!val) {
			if (doFix === true) {
				val = new moment();
				this.setValue(val);
			} else {
				return false;
			}
		}
		
		
		return true;
	}

	focused() {
		this.setState({focused:true});
		this.enforceToValid();
	}
}

registerFieldClass(FIELD_4_DATETIME, class FieldDateTime extends dateFieldMixins {

	setValue (val) {
					
		if (val) {
			if (typeof val === 'string') {
				val = new moment(val);
			} else {
				val = val.clone();
			}
		}
		
		var props = {
			inputValue:toReadableDate(val),
			selectedDate:val,
		}
		if (val) {
			props.viewDate = val.clone().startOf("day");
			
		}
		this.dateRef.setState(props);
		this.timeRef.setState({
			inputValue:toReadableTime(val),
			selectedDate:val,
		});
		
		this.state.value = val;
		this.props.wrapper.valueListener(val, false, this);
		
	}

	decodeDateValue (val) {
		//TODO: check if its necessery yet
		if(val) {
			if (val === '0000-00-00 00:00:00') {
				return null;
			}
			return new moment(val, innerDatetimeFormat);
		}
		return new moment();
	}

	encodeValue(val) {
		if (!val) {
			return('0000-00-00 00:00:00');
		}
		return val.format(innerDatetimeFormat);
	}

	focusOverride() {
		this.timeRef.refs.inputInstance.focus();
	}

	render() {
		
		var field = this.props.field;
		
		var value = this.state.value;
		
		if (value && isNaN(value.year())) {
			value = undefined;
		}
		
		if (this.props.isEdit) {
			
			var inputsProps1 = {
				closeOnSelect:true,
				defaultValue:value,
				placeholder:L('TIME'),
				readOnly :this.props.fieldDisabled,
				dateFormat:false,
				timeFormat:readableTimeFormat,
				title:L('N_TIME', field.name),
				mask:'dd:dd',
				onFocus:this.focused,
				isValidDate:this.state.focused?this.validateDate:undefined,
				ref:function(ref){
					this.timeRef = ref;
					this.refGetter(ref)
				}.bind(this),
				onChange:function(val) {
					if (val._isAMomentObject) {
						var concatedVal;
						var value = this.state.value;
						if(value){
							concatedVal = value.clone();
							concatedVal.hour(val.hour());
							concatedVal.minute(val.minute());
							concatedVal.second(val.second());
						} else {
							concatedVal = val;
						}
						
						this.setValue(concatedVal);
						this.props.wrapper.valueListener(concatedVal, true, this);
					}
					
				}.bind(this)
			};
			
			var inputsProps2 = {
				closeOnSelect:true,
				defaultValue:value,
				placeholder:L('DATE'),
				readOnly :this.props.fieldDisabled,
				dateFormat:readableDateFormat,
				isValidDate:this.state.focused?this.validateDate:undefined,
				timeFormat:false,
				onFocus:this.focused,
				title:L('N_DATE', field.name),
				ref:function(ref) {
					this.dateRef = ref;
					}.bind(this),
				onChange:function(val) {
					if (val._isAMomentObject) {
						var concatedVal;
						var value = this.state.value;
						if(value){
							concatedVal = value.clone();
							concatedVal.year(val.year());
							concatedVal.dayOfYear(val.dayOfYear());
						} else {
							concatedVal = val;
						}

						this.setValue(concatedVal);
						this.props.wrapper.valueListener(concatedVal, true, this);
					}
				}.bind(this)
			};
			return ReactDOM.div({title:(this.props.isCompact?field.name:''),style:{display:'inline-block'}},
				ReactDOM.div({style:{display:'inline-block', width:'35%'}}, React.createElement(Datetime, inputsProps1)),
				ReactDOM.div({style:{display:'inline-block', width:'5%'}}),
				ReactDOM.div({style:{display:'inline-block', width:'60%'}}, React.createElement(Datetime, inputsProps2))
			);
		} else {
			return ReactDOM.span( this.props.isCompact?readOnlyCompactFieldProperties:readOnlyFieldProperties,
				toReadableDatetime(value)
			)
		}
	}
});
