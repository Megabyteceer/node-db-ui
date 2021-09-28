import { R } from "../r";
import { Component } from "react";
import { L, renderIcon } from "../utils";
import ReactDOM from "react-dom";

class Select extends Component<any, any> {
	constructor(props) {
		super(props);
		this.state = {};
		this.toggle = this.toggle.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
	}


	componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside, true);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside, true);
	}

	handleClickOutside(event) {
		const domNode = ReactDOM.findDOMNode(this);
		if(!domNode || !domNode.contains(event.target)) {
			if(this.state.expanded) {
				this.toggle();
			}
		}
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
			if(this.state.curVal !== v) {
				this.setState({
					curVal: v
				});
			}
		}
	}

	render() {

		var curVal = ((this.state.curVal === 0) || this.state.curVal) ? this.state.curVal : this.props.defaultValue;
		for(let o of this.props.options) {
			if(o.value === curVal) {
				curVal = o.name;
				break;
			}
		}

		var optionsList;
		if(this.state.expanded) {

			let options = this.props.options;

			let searchInput;
			if(options.length > 5) {
				searchInput = R.input({
					className: 'select-search-input',
					autoFocus: true,
					defaultValue: this.state.search || '',
					placeholder: L("SEARCH"),
					onChange: (ev) => {
						this.setState({ search: ev.target.value.toLowerCase() });
					}
				});
			}

			if(this.state.search) {
				options = options.filter((i) => {
					return (i.search || i.name).toLowerCase().indexOf(this.state.search) >= 0;
				});
			}

			optionsList = R.div({
				className: 'select-control-list'
			},
				searchInput,
				options.map((o) => {
					return R.div({
						className: 'clickable select-control-item',
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
			className: 'select-control-caret'
		}, renderIcon('caret-down'));

		return R.span({
			className: 'select-control-wrapper'
		},
			R.div({
				className: (this.props.disabled || this.props.readOnly) ? 'not-clickable disabled select-control' : 'clickable select-control',
				onClick: this.toggle
			},
				curVal || '\xa0',
				downCaret
			), optionsList
		)
	}
}

export { Select };