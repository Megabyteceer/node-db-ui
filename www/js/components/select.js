import {renderIcon} from "../utils.js";

var style = {
	position: 'relative',
	padding: '7px 8px',
	color: '#333',
	border: '1px solid #a8a8a8',
	borderRadius: '4px'
}

var optionStyle = {
	padding: '6px 20px',
	borderTop: '1px solid #ddd'
}

export default class Select extends Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.toggle = this.toggle.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
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

	onMouseLeave() {
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

		var curVal = this.state.curVal || this.props.defaultValue;
		for(let o of this.props.options) {
			if(o.value === curVal) {
				curVal = o.name;
				break;
			}
		}

		var optionsList;
		if(this.state.expanded) {
			optionsList = R.div({
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
				this.props.options.map((o) => {
					return R.div({
						style: optionStyle,
						className: this.props.disabled ? 'unclickable disabled' : 'clickable',
						key: o.value,
						title: o.name,
						onClick: () => {
							this.setValue(o.value);
							this.toggle();
						}
					},
						o.name);
				})
			)
		}

		var downCaret = R.div({
			style: {
				position: 'absolute',
				right: '2px',
				top: '8px'
			}
		}, renderIcon('caret-down'));

		return R.span({
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
			onMouseLeave: this.onMouseLeave
		},
			R.div({
				style: this.props.style || style,
				className: this.props.disabled ? 'unclickable disabled' : 'clickable',
				onClick: this.toggle
			},

				curVal || '\xa0',
				downCaret

			), optionsList

		)


	}
}