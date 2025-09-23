import { Component, type ComponentChild } from 'preact';
import { R } from '../r';
import { L, renderIcon } from '../utils';

export interface SelectItem {
	name: string | ComponentChild;
	search?: string;
	value: any;
}

interface SelectState {
	search?: string;
	expanded?: boolean;
	curVal?: any;
}

export interface SelectProps {
	disabled?: boolean;
	isCompact?: boolean;
	defaultValue?: any;
	title?: string;
	readOnly?: boolean;
	onInput: (val: any) => void;
	options: SelectItem[];
}

class Select extends Component<SelectProps, SelectState> {
	constructor(props: SelectProps) {
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

	handleClickOutside(event: MouseEvent) {
		const domNode = this.base;
		if (!domNode || !domNode.contains(event.target as HTMLDivElement)) {
			if (this.state.expanded) {
				this.toggle();
			}
		}
	}

	toggle() {
		if (!this.props.disabled) {
			this.setState({
				expanded: !this.state.expanded
			});
		}
	}

	setValue(v: any) {
		if (this.state.curVal !== v) {
			this.props.onInput(v);
			if (this.state.curVal !== v) {
				this.setState({
					curVal: v
				});
			}
		}
	}

	render() {

		let curVal = ((this.state.curVal === 0) || this.state.curVal) ? this.state.curVal : this.props.defaultValue;
		let curItem: SelectItem | undefined;
		for (const o of this.props.options) {
			if (o.value === curVal) {
				curVal = o.name;
				curItem = o;
				break;
			}
		}

		let optionsList;
		if (this.state.expanded) {

			let options = this.props.options;

			let searchInput;
			if (options.length > 5) {
				searchInput = R.input({
					className: 'select-search-input',
					autoFocus: true,
					defaultValue: this.state.search || '',
					placeholder: L('SEARCH'),
					onInput: (ev: InputEvent) => {
						this.setState({ search: (ev.target as HTMLInputElement).value.toLowerCase() });
					}
				});
			}

			if (this.state.search) {
				options = options.filter((i) => {
					return (i.search || i.name as string).toLowerCase().indexOf(this.state.search!) >= 0;
				});
			}

			optionsList = R.div({
				className: 'select-control-list'
			},
			searchInput,
			options.map((o) => {
				return R.div({
					className: 'clickable select-control-item select-control-item-value-' + (o.search || o.value),
					key: o.value,
					title: o.name,
					onClick: () => {
						this.setValue(o.value);
						this.toggle();
					}
				},
				o.name);
			})
			);
		}

		const downCaret = R.div({
			className: 'select-control-caret'
		}, renderIcon('caret-down'));

		return R.span({
			className: 'select-control-wrapper'
		},
		R.div({
			className: (this.props.disabled || this.props.readOnly) ? 'not-clickable disabled select-control' : 'clickable select-control',
			onClick: this.toggle
		},
		R.span({ className: 'select-control-item-value-' + (curItem?.search || curItem?.value || 'unselected') },
			curVal || '\xa0'
		),
		downCaret
		), optionsList
		);
	}
}

export { Select };
