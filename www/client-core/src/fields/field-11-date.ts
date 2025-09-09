

import moment from 'moment';
import { FIELD_TYPE } from '../../../../types/generated';
import { EMPTY_DATE } from '../consts';
import { R } from '../r';
import { innerDateTimeFormat, registerFieldClass, renderIcon, toReadableDate } from '../utils';
import { dateFieldMixins /*, ReactDateTimeClassHolder*/ } from './field-4-date-time';

registerFieldClass(FIELD_TYPE.DATE, class DateField extends dateFieldMixins {

	static decodeValue(val) {
		if (val === EMPTY_DATE) {
			return null;
		}
		return moment(val, innerDateTimeFormat);
	}

	static encodeValue(val) {
		if (!val) {
			return (EMPTY_DATE);
		}
		return val.format(innerDateTimeFormat);
	}

	focus() {
		(this.refToInput.base as HTMLDivElement).querySelector('input').focus();
	}

	render() {

		//const field = this.props.field;
		const value = toReadableDate(this.state.value);
		if (this.props.isEdit) {
			/*if (!ReactDateTimeClassHolder.ReactDateTimeClass) {
				ReactDateTimeClassHolder.importReactDateTime();*/
			debugger; // TODO
			return renderIcon('cog fa-spin');
			/*}
			const inputsProps = {
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
				onInput: (val) => {
					if (!val._isAMomentObject) {
						val = null;
					}
					this.props.wrapper.valueListener(val, true, this);
				}
			};
			return R.div({
				title: (this.props.isCompact ? field.name : '')
			},
			h(ReactDateTimeClassHolder.ReactDateTimeClass, inputsProps)
			);*/

		} else {
			return R.span(null, value);
		}
	}
});
