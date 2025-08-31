import React from 'react';
import { FIELD_TYPE } from '../../../../types/generated';
import { normalizeEnumName, type EnumList } from '../bs-utils';
import { Select } from '../components/select';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import { BaseField } from './base-field';


class EnumField extends BaseField {

	enum: EnumList;

	setValue(value) {
		this.setState({ value });
	}

	setFilterValues(filter) {
		if (filter) {
			const en = Object.assign({}, this.props.field.enumList);
			en.items = en.items.filter(v => filter.indexOf(v) < 0);
			this.enum = en;
		} else {
			delete this.enum;
		}
	}

	render() {

		let value = this.state.value;
		const field = this.props.field;

		if (!value) {
			value = 0;
		}

		if (this.props.isEdit) {

			const inputsProps = {
				isCompact: this.props.isCompact,
				defaultValue: value,
				title: field.name,
				readOnly: this.props.fieldDisabled,
				onChange: (val) => {
					this.props.wrapper.valueListener(parseInt(val), false, this);
				},
				options: this.enum ? this.enum.items : field.enumList.items
			};
			return React.createElement(Select, inputsProps);
		} else {
			return R.span({
				className: 'enum-type-' + normalizeEnumName(field.enumList.name).toLowerCase() + ' enum-val-' + value,
			}, field.enumList.namesByValue[value]);
		}
	}
}

registerFieldClass(FIELD_TYPE.ENUM, EnumField);

export { EnumField };

