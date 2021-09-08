import { FIELD_5_BOOL } from "../bs-utils";
import { R } from "../r";
import React, { Component } from "react";
import { L, renderIcon } from "../utils";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

class CheckBox extends Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {
			value: this.props.defaultValue
		};
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.setState({
			value: nextProps.defaultValue
		});
	}

	render() {
		var check;
		if(this.state && this.state.value) {
			check = R.span({
				className: "field-boolean-check"
			}, renderIcon('check'));
		}
		return R.span({
			className: 'field-boolean clickable',
			title: this.props.title,
			onClick: () => {
				this.props.onClick(!this.state.value);
			}
		},
			check
		);
	}
}

registerFieldClass(FIELD_5_BOOL, class BooleanField extends BaseField {

	setValue(val) {
		val = (val !== 0) && Boolean(val);
		this.setState({
			value: val
		});
	}

	static decodeValue(val) {
		return Boolean(val);
	}

	static encodeValue(val) {
		return val ? 1 : 0;
	}

	render() {

		var value = this.state.value;
		var field = this.props.field;



		if(this.props.isEdit) {

			return React.createElement(CheckBox, {
				disable: this.props.fieldDisabled,
				title: this.props.isCompact ? field.name : '',
				defaultValue: value,
				onClick: (val) => {
					this.setValue(val);
					this.props.wrapper.valueListener(val, false, this);
				}
			});


		} else {
			if(this.props.isCompact) {
				if(value) {
					return R.span({
						className: 'field-boolean-read-only-compact'
					},
						renderIcon('check')
					)
				} else {
					return R.span({ className: 'field-boolean-read-only-compact' });
				}
			} else {
				return R.span({ className: 'field-boolean-read-only' },
					value ? L('YES') : L('NO')
				);
			}
		}
	}
});

export { CheckBox };