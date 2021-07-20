"use strict";

import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

const styleInput = {
	verticalAlign: 'middle',
	width: '130px',
	display: 'inline-block'
};

var intToColor = (color, alpha) => {
	var ret = 'rgba(' + ((color >> 16) & 255) + ',' + ((color >> 8) & 255) + ',' + (color & 255) + ',' + (alpha / 255.0).toFixed(2) + ')';
	return ret;
};

registerFieldClass(FIELD_20_COLOR, class ColorField extends fieldMixins {

	constructor(props) {
		super(props);
		this.state = {value: props.initialValue, color: props.initialValue % 0x1000000, alpha: Math.round(props.initialValue / 0x1000000)};
		this.onChangeColor = this.onChangeColor.bind(this);
		this.onChangeAlpha = this.onChangeAlpha.bind(this);
	}

	onChangeAlpha(ev) {
		this.setState({alpha: ev.target.value});
		this._onChange();
	}

	_onChange() {
		let value = Math.floor(Math.floor(this.state.alpha) * 0x1000000) + this.state.color;
		this.setState({value});
		this.props.wrapper.valueListener(value, true, this);
	}

	onChangeColor(ev) {
		this.setState({color: parseInt(ev.target.value.substr(1), 16)});
		this._onChange();
	}

	setValue(value) {
		this.setState({color: value % 0x1000000, alpha: value / 0x1000000});
	}

	render() {
		let background = intToColor(this.state.color, this.state.alpha);
		let preview = ReactDOM.div({style: styleInput},
			ReactDOM.div({style: {width: 120, display: 'inline-block', background: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAKElEQVQYV2OcM2fOfwY0kJycjC7EwDgUFP7//x/DM3PnzsX0zBBQCADu1zEWG5C/XgAAAABJRU5ErkJggg==) repeat"}},
				ReactDOM.div({style: {margin: '6px', height: 24, background}})
			)
		);
		if(this.props.isEdit) {
			return ReactDOM.div(null,
				ReactDOM.input({style: styleInput, type: 'color', defaultValue: '#' + (this.state.color & 0xFFFFFF).toString(16), onChange: this.onChangeColor}),
				ReactDOM.input({style: styleInput, type: 'number', min: 0, max: 255, value: this.state.alpha, onChange: this.onChangeAlpha}),
				ReactDOM.input({style: styleInput, type: 'range', min: 0, max: 255, value: this.state.alpha, onChange: this.onChangeAlpha}),
				preview
			);
		} else {
			return preview;
		}

	}
});