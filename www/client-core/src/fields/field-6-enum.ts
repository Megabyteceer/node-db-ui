import { h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { normalizeEnumName, type EnumList } from '../bs-utils';
import { Select } from '../components/select';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import { BaseField__old } from './base-field';

class EnumField extends BaseField__old {

	enum?: EnumList;

	setValue(value: number) {
		this.setState({ value });
	}

	setFilterValues(namesToFilter: string[]) {
		if (namesToFilter) {
			const en = Object.assign({}, this.props.field.enumList);
			en.items = en.items.filter(v => !namesToFilter.includes(v.name));
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
				onInput: (val: string) => {
					this.props.wrapper.valueListener(parseInt(val), false, this);
				},
				options: this.enum ? this.enum.items : field.enumList!.items
			};
			return h(Select, inputsProps);
		} else {
			return R.span({
				className: 'enum-type-' + normalizeEnumName(field.enumList!.name).toLowerCase().replaceAll('_', '-') + (value ? ' enum-val-' + normalizeEnumName(field.enumList!.namesByValue[value]).toLowerCase().replaceAll('_', '-') : '')
			}, field.enumList!.namesByValue[value]);
		}
	}
}

registerFieldClass(FIELD_TYPE.ENUM, EnumField);

export { EnumField };
