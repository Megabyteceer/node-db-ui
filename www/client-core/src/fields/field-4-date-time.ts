import moment from 'moment';
import type { ComponentChild } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { EMPTY_DATE } from '../consts';
import { R } from '../r';
import { innerDateTimeFormat, L, registerFieldClass, toReadableDateTime } from '../utils';

import BaseField, { type BaseFieldProps, type BaseFieldState } from '../base-field';

interface DateTimeFieldState extends BaseFieldState {

	minDate?: moment.Moment;
	maxDate?: moment.Moment;
}

const momentToInputValue = (val: moment.Moment): string => {
	return (val as moment.Moment).toDate().toISOString().slice(0, 16);
};

export class dateFieldMixins extends BaseField<BaseFieldProps, DateTimeFieldState> {

	declare currentValue: moment.Moment;

	setValue(val: moment.Moment | string) {
		if (val) {
			if (typeof val === 'string') {
				val = moment(val);
			} else {
				val = val.clone();
			}
		}

		this.refToInput!.value = momentToInputValue(val as moment.Moment);

		this.currentValue = val as moment.Moment;
		this.forceUpdate();
		this.valueListener(val);
	}

	setMin(moment: moment.Moment) {
		this.setState({ minDate: moment });
		if (moment) {
			if (!this.currentValue) {
				this.setValue(moment);
				this.valueListener(moment);
			} else {
				this.enforceToValid();
			}
		}
	}

	setMax(moment: moment.Moment) {
		this.setState({ maxDate: moment });
		if (moment) {
			if (!this.currentValue) {
				this.setValue(moment);
				this.valueListener(moment);
			} else {
				this.enforceToValid();
			}
		}
	}

	enforceToValid() {
		this.validateDate(this.currentValue, true);
	}

	validateDate(val: moment.Moment, doFix?: boolean) {

		if (this.state.minDate) {
			if (!val || !val.clone().startOf('day').isSameOrAfter(this.state.minDate.clone().startOf('day'))) {
				if (doFix === true) {
					this.setValue(this.state.minDate);
					this.valueListener(this.currentValue);
					return true;
				}
				return false;
			}
		}

		if (this.state.maxDate) {
			if (!val || !val.clone().startOf('day').isSameOrBefore(this.state.maxDate.clone().startOf('day'))) {
				if (doFix === true) {
					this.setValue(this.state.maxDate);
					this.valueListener(this.currentValue);
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
}

export default class FieldDateTime extends dateFieldMixins {

	constructor(props: any) {
		super(props);
		this.currentValue = props.initialValue || moment();
	}

	static decodeValue(val: string) {

		if (val) {
			return moment.utc(val, innerDateTimeFormat);
		}
		return null;
	}

	static encodeValue(val: moment.Moment) {
		if (!val) {
			return (EMPTY_DATE);
		}
		return val.format(innerDateTimeFormat);
	}

	clearValue() {
		this.setValue(EMPTY_DATE);
		this.valueListener(null);
	}

	renderFieldEditable(): ComponentChild {

		// const field = this.props.field;

		let value = this.currentValue as moment.Moment | undefined;

		if (value && isNaN(value.year())) {
			value = undefined;
		}

		return R.input({
			defaultValue: momentToInputValue(value as moment.Moment),
			type: 'datetime-local',
			placeholder: L('TIME'),
			min: this.state.minDate && momentToInputValue(this.state.minDate),
			max: this.state.maxDate && momentToInputValue(this.state.maxDate),
			disable: this.props.fieldDisabled,
			title: L('N_TIME', this.props.fieldDesc.name),
			ref: this.refGetter,
			onInput: (ev: InputEvent) => {
				const val = moment.utc((ev.target as HTMLInputElement).value);
				if (val.isValid()) {
					this.setValue(val);
				}
			}
		});
		/* if (!ReactDateTimeClassHolder.ReactDateTimeClass) {
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
						const value = this.currentValue;
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

	}

	renderField(): ComponentChild {
		return toReadableDateTime(this.currentValue);
	}
}

registerFieldClass(FIELD_TYPE.DATE_TIME, FieldDateTime);
