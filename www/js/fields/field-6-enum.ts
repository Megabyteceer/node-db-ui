import {FIELD_6_ENUM} from "../bs-utils";
import {R} from "../r.ts";
import React from "react";
import {Select} from "../components/select.js";
import {registerFieldClass} from "../utils.js";
import {fieldMixins} from "./field-mixins.js";

registerFieldClass(FIELD_6_ENUM, class EnumField extends fieldMixins {

	setValue(val) {
		this.state.value = val;
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
				className: 'enum-' + field.id + '_' + value
			}, field.enumNamesById[value]);
		}
	}
});