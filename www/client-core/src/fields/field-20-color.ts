'use strict';

import { FIELD_TYPE } from '../bs-utils';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import type { FieldProps, FieldState } from './base-field';
import { BaseField } from './base-field';

const intToColor = (color, alpha) => {
	const ret = 'rgba(' + ((color >> 16) & 255) + ',' + ((color >> 8) & 255) + ',' + (color & 255) + ',' + (alpha / 255.0).toFixed(2) + ')';
	return ret;
};

const validateValue = (val) => {
	return (typeof val !== 'number' || isNaN(val)) ? 0xffffffff : val;
};

interface ColorFieldState extends FieldState {
	color: number;
	alpha: number;
}

registerFieldClass(FIELD_TYPE.COLOR, class ColorField extends BaseField<FieldProps, ColorFieldState> {

	constructor(props) {
		super(props);
		const val = validateValue(props.initialValue);
		this.state = { value: val, color: val % 0x1000000, alpha: Math.floor(val / 0x1000000) };
		this.onChangeColor = this.onChangeColor.bind(this);
		this.onChangeAlpha = this.onChangeAlpha.bind(this);
	}

	onChangeAlpha(ev) {
		this.setState({ alpha: ev.target.value });
		this._onChange();
	}

	_onChange() {
		const value = Math.floor(Math.floor(this.state.alpha) * 0x1000000) + this.state.color;
		this.setState({ value });
		this.props.wrapper.valueListener(value, true, this);
	}

	onChangeColor(ev) {
		this.setState({ color: parseInt(ev.target.value.substr(1), 16) });
		this._onChange();
	}

	setValue(value) {
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
				R.input({ className: 'field-color-input field-color-input-picker', type: 'color', defaultValue: '#' + (this.state.color & 0xFFFFFF).toString(16), onChange: this.onChangeColor }),
				preview,
				R.input({ className: 'field-color-input field-color-input-alpha-slider', type: 'range', min: 0, max: 255, value: this.state.alpha, onChange: this.onChangeAlpha }),
				R.input({ className: 'field-color-input field-color-input-alpha-input', type: 'number', min: 0, max: 255, value: this.state.alpha, onChange: this.onChangeAlpha })
			);
		} else {
			return preview;
		}

	}
});
