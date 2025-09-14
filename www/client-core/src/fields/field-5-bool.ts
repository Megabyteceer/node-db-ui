import { Component, h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import type { BoolNum } from '../bs-utils';
import { R } from '../r';
import { L, registerFieldClass, renderIcon } from '../utils';
import { BaseField__old } from './base-field';

interface CheckBoxProps {
	defaultValue?: boolean;
	title?: string;
	onClick?: (val: boolean) => void;
}

class CheckBox extends Component<CheckBoxProps, {
	value?: boolean;
}> {
	constructor(props: CheckBoxProps) {
		super(props);
		this.state = {
			value: this.props.defaultValue
		};
	}

	componentWillReceiveProps(nextProps: CheckBoxProps) {
		this.setState({
			value: nextProps.defaultValue
		});
	}

	render() {
		let check;
		if (this.state.value) {
			check = R.span({
				className: 'field-boolean-check'
			}, renderIcon('check'));
		}
		return R.span({
			className: 'field-boolean clickable',
			title: this.props.title,
			onClick: () => {
				this.props.onClick!(!this.state.value);
			}
		},
		check
		);
	}
}

registerFieldClass(FIELD_TYPE.BOOL, class BooleanField extends BaseField__old {

	setValue(val: boolean | BoolNum) {
		val = (val !== 0) && Boolean(val);
		if (this.state.value !== val) {
			this.setState({
				value: val
			});
		}
	}

	static decodeValue(val: string) {
		return Boolean(val);
	}

	static encodeValue(val: BoolNum) {
		return val ? 1 : 0;
	}

	render() {

		const value = this.state.value;
		const field = this.props.field;

		if (this.props.isEdit) {

			return h(CheckBox, {
				title: this.props.isCompact ? field.name : '',
				defaultValue: value,
				onClick: this.props.fieldDisabled ? undefined : (val) => {
					this.setValue(val);
					this.props.wrapper.valueListener(val, false, this);
				}
			});

		} else {
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
});

export { CheckBox };
