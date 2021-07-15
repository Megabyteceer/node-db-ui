import {renderIcon} from "../utils.js";

var style = {
	position: 'relative',
	padding: '2px 8px',
	height: 32,
	width: '100%',
	color: '#333',
	border: '2px solid rgb(204, 204, 204)',
	borderRadius: 4
}

var optionStyle = {
	width: '100%',
	height: 32,
	padding: '2px 20px',
	borderTop: '1px solid #ddd'
}

export default class Select extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.toggle = this.toggle.bind(this);
		this.toggle = this.toggle.bind(this);
	}

	toggle() {
		if(!this.props.disabled) {
			this.setState({
				expanded: !this.state.expanded
			});
		}
	}

	setValue(v) {
		if(this.state.curVal !== v) {
			this.props.onChange(v);
			this.setState({
				curVal: v
			});
		}
	}

	onBlur() {
		if(this.state.expanded) {
			this.toggle();
		}
	}

	render() {

		var w;
		if(this.props.isCompact) {
			w = 230;
		} else {
			w = '100%';
		}

		var curVal;
		if(this.state.curVal) {
			curVal = this.props.options[this.state.curVal];
		} else {
			curVal = this.props.options[this.props.defaultValue];
		}

		var options;
		if(this.state.expanded) {
			options = ReactDOM.div({
				style: {
					position: 'absolute',
					marginTop: -2,
					zIndex: 2,
					background: this.props.disabled ? undefined : '#fff',
					color: '#333',
					border: '1px solid #ddd',
					boxShadow: '0px 2px 5px 0px rgba(0,0,0,0.26)'
				}
			},
				Object.keys(this.props.options).map((k) => {
					return ReactDOM.div({
						style: optionStyle,
						className: this.props.disabled ? 'unclickable disabled' : 'clickable',
						key: k,
						title: this.props.options[k],
						onClick: () => {
							this.setValue(k);
							this.toggle();
						}
					},
						this.props.options[k]);
				})
			)
		}

		var downCaret = ReactDOM.div({
			style: {
				position: 'absolute',
				right: 0,
				top: 0
			}
		}, renderIcon('caret-down'));

		return ReactDOM.span({
			style: {
				display: 'inline-block',
				width: w,
				background: this.props.disabled ? undefined : '#fff',
				borderRadius: 4,
				verticalAlign: 'middle',
				textAlign: 'left',
				whiteSpace: 'nowrap',
				overflow: 'hidden'
			},
			onBlur: this.onBlur
		},
			ReactDOM.div({
				style: this.props.style || style,
				className: this.props.disabled ? 'unclickable disabled' : 'clickable',
				onClick: this.toggle
			},

				curVal,
				downCaret

			), options

		)


	}
}