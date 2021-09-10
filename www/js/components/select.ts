import { R } from "../r";
import { Component } from "react";
import { renderIcon } from "../utils";

class Select extends Component<any, any> {
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
			if(this.state.curVal !== v) {
				this.setState({
					curVal: v
				});
			}
		}
	}

	onMouseLeave() {
		if(this.state.expanded) {
			this.toggle();
		}
	}

	render() {

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
				className: 'select-control-list'
			},
				this.props.options.map((o) => {
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
			className: 'select-control-wrapper',
			onMouseLeave: this.onMouseLeave
		},
			R.div({
				className: this.props.disabled ? 'unclickable disabled select-control' : 'clickable select-control',
				onClick: this.toggle
			},
				curVal || '\xa0',
				downCaret
			), optionsList
		)
	}
}

export { Select };