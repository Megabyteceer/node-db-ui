import moment from 'moment';
import type { ComponentChild } from 'preact';
import { EMPTY_DATE } from '../consts';
import { R } from '../r';
import { FIELD_TYPE } from '../types/generated';
import { INNER_DATE_FORMAT, L, registerFieldClass, toReadableDate } from '../utils';
import { dateFieldMixins /* , ReactDateTimeClassHolder */ } from './field-4-date-time';

const momentToInputValue = (val: moment.Moment): string => {
	return (val as moment.Moment).toDate().toISOString().slice(0, 10);
};

export default class DateField extends dateFieldMixins {

	setValue(val: moment.Moment | string) {
		if (val) {
			if (typeof val === 'string') {
				val = moment(val);
			} else {
				val = val.clone();
			}
		}
		this.refToInput.value = momentToInputValue(val as moment.Moment);
		this.currentValue = val as moment.Moment;
		this.forceUpdate();
		this.valueListener(val);
	}

	static decodeValue(val: string) {
		if (val === EMPTY_DATE) {
			return null;
		}
		return moment(val, INNER_DATE_FORMAT);
	}

	static encodeValue(val: moment.Moment) {
		if (!val) {
			return (EMPTY_DATE);
		}
		return val.format(INNER_DATE_FORMAT);
	}

	renderFieldEditable() {

		let value = this.currentValue as moment.Moment | undefined;

		if (value && isNaN(value.year())) {
			value = undefined;
		}

		return R.input({
			defaultValue: value && momentToInputValue(value as moment.Moment),
			type: 'date',
			placeholder: L('DATE'),
			min: this.state.minDate && momentToInputValue(this.state.minDate),
			max: this.state.maxDate && momentToInputValue(this.state.maxDate),
			disable: this.props.fieldDisabled,
			title: L('N_DATE', this.props.fieldDesc.name),
			ref: this.refGetter,
			onInput: (ev: InputEvent) => {
				const val = moment.utc((ev.target as HTMLInputElement).value);
				if (val.isValid()) {
					this.setValue(val);
				}
			}
		});
	}

	renderField(): ComponentChild {
		return toReadableDate(this.currentValue);
	}
}

registerFieldClass(FIELD_TYPE.DATE, DateField);
