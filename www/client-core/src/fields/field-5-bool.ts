import { Component, h, type ComponentChild } from 'preact';
import BaseField from '../base-field';
import type { BoolNum } from '../bs-utils';
import { R } from '../r';
import { FIELD_TYPE } from '../types/generated';
import { L, registerFieldClass, renderIcon } from '../utils';

interface CheckBoxProps {
	defaultValue?: boolean;
	title?: string;
	onClick?: (val: boolean) => void;
}

class CheckBox extends Component<CheckBoxProps> {
	render() {
		let check;
		if (this.props.defaultValue) {
			check = R.span({
				className: 'field-boolean-check'
			}, renderIcon('check'));
		}
		return R.span({
			className: 'field-boolean clickable',
			title: this.props.title,
			onClick: () => {
				this.props.onClick!(!this.props.defaultValue);
			}
		},
		check
		);
	}
}

class BooleanField extends BaseField {

	setValue(val: boolean | BoolNum) {
		val = (val !== 0) && Boolean(val);
		if (this.currentValue !== val) {
			this.currentValue = val;
			this.forceUpdate();
		}
	}

	static decodeValue(val: string) {
		return Boolean(val);
	}

	static encodeValue(val: BoolNum) {
		return val ? 1 : 0;
	}

	renderFieldEditable() {

		const value = this.currentValue;
		const field = this.props.fieldDesc;

		return h(CheckBox, {
			title: this.props.isCompact ? field.name : '',
			defaultValue: value,
			onClick: this.props.fieldDisabled ? undefined : (val) => {
				this.setValue(val);
				this.valueListener(val);
			}
		});

	}

	renderField(): ComponentChild {
		const value = this.currentValue;
		if (this.props.isCompact) {
			if (value) {
				return R.span({
					className: 'field-boolean-read-only-compact'
				},
				renderIcon('check')
				);
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

registerFieldClass(FIELD_TYPE.BOOL, BooleanField);

export { CheckBox };
