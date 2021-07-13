import {
	L,
	renderIcon
} from "../utils.js";
import {
	registerFieldClass
} from "../utils.js";
import fieldMixins from "./field-mixins.js";

export default class CheckBox extends React.Component {
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
			check = ReactDOM.span({
				style: checkStyle
			}, renderIcon('check'));
		}
		return ReactDOM.span({
			style: this.props.disable ? styleDisabled : style,
			title: this.props.title,
			onClick: () => {
				this.props.onClick(!this.state.value);
			}
		},
			check
		);
	}
}

var style = {
	cursor: 'pointer',
	display: 'inline-block',
	width: 20,
	height: 20,
	marginRight: 10,
	verticalAlign: 'middle',
	border: '2px solid #ccc',
	borderRadius: 4,
	background: '#fff'
};
var styleDisabled = {
	display: 'inline-block',
	width: 20,
	height: 20,
	verticalAlign: 'middle',
	marginRight: 10,
	border: '2px solid #ccc',
	borderRadius: 4,
	background: '#fff',
	opacity: 0.3,
	pointerEvent: 'none'
};

var checkStyle = {
	display: 'inline-block',
	position: 'absolute',
	marginLeft: -8,
	marginTop: -5
}


registerFieldClass(FIELD_5_BOOL, class BooleanField extends fieldMixins {

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
					return ReactDOM.span({
						style: {
							fontSize: '130%',
							color: '#4a2'
						}
					},
						renderIcon('check')
					)
				} else {
					return ReactDOM.span(null);
				}
			} else {
				return ReactDOM.span(null,
					value ? L('YES') : L('NO')
				);
			}
		}
	}
});