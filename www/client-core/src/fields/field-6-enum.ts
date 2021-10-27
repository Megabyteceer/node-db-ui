import { EnumList, FIELD_TYPE } from "../bs-utils";
import { R } from "../r";
import React from "react";
import { Select } from "../components/select";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

class EnumField extends BaseField {

	enum: EnumList;

	setValue(value) {
		this.setState({ value });
	}

	setFilterValues(filter) {
		if(filter) {
			this.enum = this.props.field.enum.filter(v => filter.indexOf(v) < 0);
		} else {
			delete this.enum;
		}
	}

	render() {

		var value = this.state.value;
		var field = this.props.field;

		if(!value) {
			value = 0
		}

		if(this.props.isEdit) {

			var inputsProps = {
				isCompact: this.props.isCompact,
				defaultValue: value,
				title: field.name,
				readOnly: this.props.fieldDisabled,
				onChange: (val) => {
					this.props.wrapper.valueListener(parseInt(val), false, this);
				},
				options: this.enum || field.enum
			};
			return React.createElement(Select, inputsProps);
		} else {
			return R.span({
				className: 'enum-type-' + field.enumId + ' enum-val-' + value,
			}, field.enumNamesById[value]);
		}
	}
}

registerFieldClass(FIELD_TYPE.ENUM, EnumField);

export { EnumField };