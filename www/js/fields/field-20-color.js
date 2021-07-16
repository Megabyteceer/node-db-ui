import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

var intToColor = (i) => {
	var ret = 'rgba(' + (i & 255) + ',' + ((i >> 8) & 255) + ',' + ((i >> 16) & 255) + ',' + (((i >> 24) & 255) / 255.0).toFixed(2) + ')';
	return ret;
};

var _idCounter = 0;

registerFieldClass(FIELD_20_COLOR, class ColorField extends fieldMixins {

	constructor(props) {
		super(props);
		_idCounter++;
		this.state = {id: 'spectrum' + _idCounter};
	}

	getSpectrum() {
		return $('#' + this.state.id);
	}

	colorChange(color) {
		color = color.toRgb();
		this.state.value = color.r + (color.g * 256) + (color.b * 65536) + (Math.round(color.a * 255) * 16777216);
		this.props.wrapper.valueListener(this.state.value, true, this);
	}

	componentDidMount() {
		this.getSpectrum().spectrum({
			color: intToColor(this.props.initialValue),
			showInput: true,
			showInitial: true,
			preferredFormat: "hex",
			showAlpha: true,
			hide: this.colorChange,
			move: this.colorChange
		});
		if(typeof (this.state.value) === 'undefined' || this.state.value === '') {
			this.setValue(0xff000000);
		}
	}

	componentWillUnmount() {
		this.getSpectrum().spectrum('destroy');
	}

	setValue(val) {
		this.getSpectrum().spectrum('set', intToColor(val));
		this.state.value = val;
	}

	render() {
		var value = this.state.value;
		var field = this.props.field;

		if(this.props.isEdit) {
			return ReactDOM.input({id: this.state.id});
		} else {
			return ReactDOM.div({style: {width: 60, position: 'relative', height: 32, background: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAKElEQVQYV2OcM2fOfwY0kJycjC7EwDgUFP7//x/DM3PnzsX0zBBQCADu1zEWG5C/XgAAAABJRU5ErkJggg==) repeat"}},
				ReactDOM.div({style: {width: 60, position: 'absolute', top: 0, left: 0, height: 32, background: intToColor(value)}, defaultValue: value})
			);
		}

	}
});