'use strict';
import { FIELD_TYPE } from '../../../../types/generated';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import type { FieldProps__olf, FieldState__olf } from './base-field';
import { BaseField__old } from './base-field';

const intToColor = (color: number, alpha: number) => {
	const ret = 'rgba(' + ((color >> 16) & 255) + ',' + ((color >> 8) & 255) + ',' + (color & 255) + ',' + (alpha / 255.0).toFixed(2) + ')';
	return ret;
};

const validateValue = (val: any) => {
	return (typeof val !== 'number' || isNaN(val)) ? 0xffffffff : val;
};

interface ColorFieldState extends FieldState__olf {
	color: number;
	alpha: number;
}

registerFieldClass(FIELD_TYPE.COLOR, class ColorField extends BaseField__old<FieldProps__olf, ColorFieldState> {

	constructor(props: FieldProps__olf) {
		super(props);
		const val = validateValue(props.initialValue);
		this.state = { value: val, color: val % 0x1000000, alpha: Math.floor(val / 0x1000000) };
		this.onChangeColor = this.onChangeColor.bind(this);
		this.onChangeAlpha = this.onChangeAlpha.bind(this);
	}

	onChangeAlpha(ev: MouseEvent) {
		this.setState({ alpha: parseInt((ev.target as HTMLInputElement).value) || 0xffffffff });
		this._onChange();
	}

	_onChange() {
		const value = Math.floor(Math.floor(this.state.alpha) * 0x1000000) + this.state.color;
		this.setState({ value });
		this.props.wrapper.valueListener(value, true, this);
	}

	onChangeColor(ev: InputEvent) {
		this.setState({ color: parseInt((ev.target as HTMLInputElement).value.substr(1), 16) });
		this._onChange();
	}

	setValue(value: number) {
		value = validateValue(value);
		this.setState({ color: value % 0x1000000, alpha: Math.floor(value / 0x1000000) });
	}

	render() {
		const background = intToColor(this.state.color, this.state.alpha);
		const preview = R.div({ className: 'field-color-input field-color-preview-bg' },
			R.div({ className: 'field-color-preview', style: { background } })
		);
		if (this.props.isEdit) {
			return R.div(null,
				R.input({ className: 'field-color-input field-color-input-picker', type: 'color', defaultValue: '#' + (this.state.color & 0xFFFFFF).toString(16), onInput: this.onChangeColor }),
				preview,
				R.input({ className: 'field-color-input field-color-input-alpha-slider', type: 'range', min: 0, max: 255, value: this.state.alpha, onInput: this.onChangeAlpha }),
				R.input({ className: 'field-color-input field-color-input-alpha-input', type: 'number', min: 0, max: 255, value: this.state.alpha, onInput: this.onChangeAlpha })
			);
		} else {
			return preview;
		}

	}
});
