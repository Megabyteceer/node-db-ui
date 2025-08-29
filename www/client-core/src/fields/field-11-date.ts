import React from 'react';
import ReactDOM from 'react-dom';

import moment from 'moment';
import { FIELD_TYPE } from '../bs-utils';
import { R } from '../r';
import { innerDateTimeFormat, readableDateFormat, registerFieldClass, renderIcon, toReadableDate } from '../utils';
import { dateFieldMixins, ReactDateTimeClassHolder } from './field-4-date-time';

registerFieldClass(FIELD_TYPE.DATE, class DateField extends dateFieldMixins {

	static decodeValue(val) {
		if (val === '0000-00-00 00:00:00') {
			return null;
		}
		return moment(val, innerDateTimeFormat);
	}

	static encodeValue(val) {
		if (!val) {
			return ('0000-00-00 00:00:00');
		}
		return val.format(innerDateTimeFormat);
	}

	focus() {
		// @ts-ignore
		ReactDOM.findDOMNode(this.refToInput).querySelector('input').focus();
	}

	render() {

		const field = this.props.field;
		const value = toReadableDate(this.state.value);
		if (this.props.isEdit) {
			if (!ReactDateTimeClassHolder.ReactDateTimeClass) {
				ReactDateTimeClassHolder.importReactDateTime();
				return renderIcon('cog fa-spin');
			}
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
				onChange: (val) => {
					if (!val._isAMomentObject) {
						val = null;
					}
					this.props.wrapper.valueListener(val, true, this);
				}
			};
			return R.div({
				title: (this.props.isCompact ? field.name : '')
			},
			React.createElement(ReactDateTimeClassHolder.ReactDateTimeClass, inputsProps)
			);

		} else {
			return R.span(null, value);
		}
	}
});
