

import moment from 'moment';
import type { ComponentChild } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { innerDateTimeFormat, registerFieldClass, renderIcon, toReadableDate, toReadableDateTime, toReadableTime } from '../utils';
import type { FieldProps, FieldState, RefToInput } from './base-field';
import { BaseField } from './base-field';

function isSameDay(val, d) {
	if (!d || !val) return false;
	return d.date() === val.date() && d.month() === val.month() && d.year() === val.year();
};

interface DateTimeFieldState extends FieldState {
	minDate?: moment.Moment;
	maxDate?: moment.Moment;
	allowedDays?: moment.Moment[];
}
/*
const ReactDateTimeClassHolder: {
	importReactDateTime: () => void,
	isRequired?: boolean,
	ReactDateTimeClass?: typeof import('react-datetime')
} = {
	importReactDateTime: () => {
		if (!ReactDateTimeClassHolder.isRequired) {
			ReactDateTimeClassHolder.isRequired = true;
			import('react-datetime').then((module) => {
				ReactDateTimeClassHolder.ReactDateTimeClass = module.default;
				if (globals.Stage.currentForm) {
					(globals.Stage.currentForm as FormFull).forceUpdate();
				}
			});
		}
	}
};*/

class dateFieldMixins extends BaseField<FieldProps, DateTimeFieldState> {


	constructor(props) {
		super(props);
	}

	setValue(val) {
		if (val) {
			if (typeof val === 'string') {
				val = moment(val);
			} else {
				val = val.clone();
			}
		}

		const props = {
			inputValue: toReadableDate(val),
			selectedDate: val,
		};

		this.refToInput.setState(props);
		// @ts-ignore
		if (this.timeRef) {
			// @ts-ignore
			this.timeRef.setState({
				inputValue: toReadableTime(val),
				selectedDate: val,
			});
		}
		//@ts-ignore
		this.state.value = val;
		this.props.wrapper.valueListener(val, false, this);

	}

	setMin(moment) {
		//@ts-ignore
		this.state.minDate = moment;
		if (moment && (this.state.focused)) {
			if (!this.state.value) {
				this.setValue(moment);
				this.props.wrapper.valueListener(moment, true, this);
			} else {
				this.enforceToValid();
			}
		}
	}

	setMax(moment) {
		//@ts-ignore
		this.state.maxDate = moment;
		if (moment && (this.state.focused)) {
			if (!this.state.value) {
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
			const nv = this.state.value.clone();
			nv.year(moment.year());
			nv.month(moment.month());
			nv.date(moment.date());
			this.setValue(nv);
			this.props.wrapper.valueListener(nv, true, this);
		}
	}

	validateDate(val, doFix?: boolean) {
		if (this.state.allowedDays) {
			const isValid = this.state.allowedDays.some((d) => {
				return isSameDay(val, d);
			});

			if (!isValid && (doFix === true)) {
				this.setDatePart(this.state.allowedDays[0]);
				this.props.wrapper.valueListener(this.state.value, true, this);
				return true;
			}
			return isValid;
		}

		if (this.state.minDate) {
			if (!val || !val.clone().startOf('day').isSameOrAfter(this.state.minDate.clone().startOf('day'))) {
				if (doFix === true) {
					this.setValue(this.state.minDate);
					this.props.wrapper.valueListener(this.state.value, true, this);
					return true;
				}
				return false;
			}
		}

		if (this.state.maxDate) {
			if (!val || !val.clone().startOf('day').isSameOrBefore(this.state.maxDate.clone().startOf('day'))) {
				if (doFix === true) {
					this.setValue(this.state.maxDate);
					this.props.wrapper.valueListener(this.state.value, true, this);
					return true;
				}
				return false;
			}
		}

		if (!val) {
			if (doFix === true) {
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

registerFieldClass(FIELD_TYPE.DATE_TIME, class FieldDateTime extends dateFieldMixins {
	timeRef: RefToInput;

	static decodeValue(val) {
		if (val) {
			return moment(val, innerDateTimeFormat);
		}
		return null;
	}

	static encodeValue(val) {
		if (!val) {
			return ('0000-00-00 00:00:00');
		}
		return val.format(innerDateTimeFormat);
	}

	focus() {
		// @ts-ignore
		this.timeRef.base.querySelector('input').focus();
	}

	clearValue() {
		this.setValue(null);
		this.props.wrapper.valueListener(null, true, this);
	}

	render():ComponentChild {

		//const field = this.props.field;

		let value = this.state.value;

		if (value && isNaN(value.year())) {
			value = undefined;
		}

		if (this.props.isEdit) {
			/*if (!ReactDateTimeClassHolder.ReactDateTimeClass) {
				ReactDateTimeClassHolder.importReactDateTime();*/
			//TODO datetime input
			return renderIcon('cog fa-spin');
			/*}
			const inputsProps1 = {
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
					this.refGetter(ref);
				},
				onInput: (val) => {
					if (val._isAMomentObject) {
						let mergedValue;
						const value = this.state.value;
						if (value) {
							mergedValue = value.clone();
							mergedValue.hour(val.hour());
							mergedValue.minute(val.minute());
							mergedValue.second(val.second());
						} else {
							mergedValue = val;
						}

						this.setValue(mergedValue);
						this.props.wrapper.valueListener(mergedValue, true, this);
					} else {
						this.clearValue();
					}
				}
			};

			const inputsProps2 = {
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
				onInput: (val) => {
					if (val._isAMomentObject) {
						let mergedValue;
						const value = this.state.value;
						if (value) {
							mergedValue = value.clone();
							mergedValue.year(val.year());
							mergedValue.dayOfYear(val.dayOfYear());
						} else {
							mergedValue = val;
						}

						this.setValue(mergedValue);
						this.props.wrapper.valueListener(mergedValue, true, this);
					} else {
						this.clearValue();
					}
				}
			};
			return R.div({
				title: (this.props.isCompact ? field.name : '')
			},
			R.div({
				className: 'field-date-time-time'
			}, R.input(inputsProps1)),
			R.div({
				className: 'field-date-time-date'
			}, R.input(inputsProps2))
			);*/
		} else {
			return toReadableDateTime(value);
		}
	}
});

export {
	dateFieldMixins /*, ReactDateTimeClassHolder*/
};

