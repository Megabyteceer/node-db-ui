import { h, type ComponentChild } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import BaseField from '../base-field';
import { normalizeEnumName, type EnumList } from '../bs-utils';
import { Select } from '../components/select';
import { R } from '../r';
import { registerFieldClass } from '../utils';

class EnumField extends BaseField {

	enum?: EnumList;

	setValue(value: number) {
		this.currentValue = value;
		this.forceUpdate();
	}

	setFilterValues(namesToFilter: string[]) {
		if (namesToFilter) {
			const en = Object.assign({}, this.props.fieldDesc.enumList);
			en.items = en.items.filter(v => !namesToFilter.includes(v.name));
			this.enum = en;
		} else {
			delete this.enum;
		}
	}

	renderFieldEditable() {
		let value = this.currentValue;
		const field = this.props.fieldDesc;

		if (!value) {
			value = 0;
		}
		const inputsProps = {
			isCompact: this.props.isCompact,
			defaultValue: value,
			title: field.name,
			readOnly: this.props.fieldDisabled,
			onInput: (val: string) => {
				this.valueListener(parseInt(val));
			},
			options: this.enum ? this.enum.items : field.enumList!.items
		};
		return h(Select, inputsProps);
	}

	renderField(): ComponentChild {
		let value = this.currentValue;
		const field = this.props.fieldDesc;
		return R.span({
			className: 'enum-type-' + normalizeEnumName(field.enumList!.name).toLowerCase().replaceAll('_', '-') + (value ? ' enum-val-' + normalizeEnumName(field.enumList!.namesByValue[value]).toLowerCase().replaceAll('_', '-') : '')
		}, field.enumList!.namesByValue[value]);
	}
}

registerFieldClass(FIELD_TYPE.ENUM, EnumField);

export { EnumField };
