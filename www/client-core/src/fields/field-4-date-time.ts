

import moment from 'moment';
import type { ComponentChild } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { EMPTY_DATE } from '../consts';
import { R } from '../r';
import { innerDateTimeFormat, L, registerFieldClass, toReadableDateTime } from '../utils';
import type { FieldProps, FieldState } from './base-field';
import { BaseField } from './base-field';

interface DateTimeFieldState extends FieldState {
	value: moment.Moment;
	minDate?: moment.Moment;
	maxDate?: moment.Moment;
}

const momentToInputValue = (val: moment.Moment):string => {
	return (val as moment.Moment).toDate().toISOString().slice(0, 16);
};

class dateFieldMixins extends BaseField<FieldProps, DateTimeFieldState> {

	constructor(props) {
		super(props);
	}

	setValue(val:moment.Moment | string) {
		if (val) {
			if (typeof val === 'string') {
				val = moment(val);
			} else {
				val = val.clone();
			}
		}

		this.refToInput.value = momentToInputValue(val as moment.Moment);

		this.setState({value: val as moment.Moment});
		this.props.wrapper.valueListener(val, false, this);
	}

	setMin(moment) {
		this.setState({minDate: moment});
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
		this.setState({maxDate: moment});
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

	validateDate(val, doFix?: boolean) {

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

	constructor(props: any) {
		super(props);
		this.state = {
			value: props.initialValue || moment()
		};
	}

	static decodeValue(val:string) {

		if (val) {
			return moment.utc(val, innerDateTimeFormat);
		}
		return null;
	}

	static encodeValue(val) {
		if (!val) {
			return (EMPTY_DATE);
		}
		return val.format(innerDateTimeFormat);
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
			return R.input({
				defaultValue: momentToInputValue(value as moment.Moment),
				type: 'datetime-local',
				placeholder: L('TIME'),
				min: this.state.minDate && momentToInputValue(this.state.minDate),
				max: this.state.maxDate && momentToInputValue(this.state.maxDate),
				disable: this.props.fieldDisabled,
				title: L('N_TIME', this.props.field.name),
				ref: (ref) => {
					this.refGetter(ref);
				},
				onInput: (ev:InputEvent) => {
					const val = moment.utc((ev.target as HTMLInputElement).value);
					if (val.isValid()) {
						this.setValue(val);
					}
				}
			});
			/*if (!ReactDateTimeClassHolder.ReactDateTimeClass) {
				ReactDateTimeClassHolder.importReactDateTime();

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
*/

		} else {
			return toReadableDateTime(value);
		}
	}
});

export {
	dateFieldMixins /*, ReactDateTimeClassHolder*/
};

