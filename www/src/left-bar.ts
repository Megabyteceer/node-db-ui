import React, { Component } from "react";
import ReactDOM from "react-dom";
import { FieldAdmin } from "./admin/field-admin";
import { NodeAdmin, createNodeForMenuItem } from "./admin/node-admin";
import { assert } from "./bs-utils";
import { R } from "./r";
import { Stage } from "./stage";
import { iAdmin, User } from "./user";
import { isLitePage, L, renderIcon } from "./utils";

let collapsed;

function isMustBeExpanded(i) {
	if(i.children) {
		for(var k in i.children) {
			var j = i.children[k];
			if(isCurrentlyShowedLeftBarItem(j) || isMustBeExpanded(j)) {
				return true;
			}
		}
		return false;
	} else {
		return isCurrentlyShowedLeftBarItem(i);
	}
}

const allGroups: BarItem[] = [];

let activeItem;

function isCurrentlyShowedLeftBarItem(item) {
	const currentFormParameters = Stage.currentForm;
	if(!currentFormParameters) {
		return;
	}

	if(!item.staticLink) {
		return currentFormParameters.nodeId === item.id;
	} else {
		return isStrictlySelected(item);
	}
}

function isStrictlySelected(item) {
	if(item) {
		if(item.hasOwnProperty('children')) {
			return item.children.some(isStrictlySelected);
		} else {
			if(item.staticLink) {
				return location.hash === item.staticLink;
			}
		}
	}
}

class BarItem extends Component<any, any> {

	constructor(props) {
		super(props);
		itemsById[props.item.id] = this;
		this.state = {};
		this.collapseOtherGroups = this.collapseOtherGroups.bind(this);
	}

	componentDidMount() {
		if(!this.props.item.isDocument) {
			allGroups.push(this);
		}
	}

	componentWillUnmount() {
		if(!this.props.item.isDocument) {
			let i = allGroups.indexOf(this);
			assert(i >= 0, 'BarItem registration is corrupted.');
			allGroups.splice(i, 1);
		}
	}

	collapseOtherGroups() {
		for(let g of allGroups) {
			if(g.props.item.children && g.props.item.children.indexOf(this.props.item) < 0) {
				g.collapse();
			}
		}
	}

	expand() {
		const element = this._findGroupContainer();
		element.classList.remove('hidden');
		this.setState({ expanded: true });
		element.style.transition = 'unset';
		element.style.opacity = '0.001';
		element.style.position = 'absolute';
		element.style.maxHeight = 'unset';
		element.style.transform = 'scaleY(0)';
		element.style.transformOrigin = 'top left';
		let height;
		let timer = setInterval(() => {
			height = element.clientHeight;
			if(height > 0) {
				clearInterval(timer);
				element.style.maxHeight = '0px';
				element.style.position = 'unset';
				element.style.opacity = '1';
				element.style.transition = 'all 0.1s';
				timer = setInterval(() => {
					if(element.clientHeight <= 6) {
						clearInterval(timer);
						element.style.transform = 'scaleY(1)';
						element.style.maxHeight = height + 'px';
						setTimeout(() => {
							element.style.maxHeight = 'unset';
						}, 114);
					}
				}, 1);
			}
		}, 1);
	}

	collapse() {
		const element = this._findGroupContainer();
		element.style.transform = 'scaleY(1)';
		element.style.transformOrigin = 'top left';
		element.style.transition = 'unset';
		element.style.maxHeight = element.clientHeight + 'px';
		element.style.transition = 'all 0.1s';
		setTimeout(() => {
			element.style.transform = 'scaleY(0)';
			element.style.maxHeight = '0px';
		}, 1);
		setTimeout(() => {
			element.classList.add('hidden');
			this.setState({ expanded: false });
		}, 114);
	}

	_findGroupContainer(): HTMLElement {
		return (ReactDOM.findDOMNode(this) as HTMLDivElement).querySelector('.left-bar-children');
	}

	toggle(ev) {
		let group: HTMLDivElement = ev.target.closest('.left-bar-group-container').querySelector('.left-bar-children');
		if(group.classList.contains('hidden')) {
			this.expand();
		} else {
			this.collapse();
		}
	}

	closeMenuIfNeed() {
		if(collapsable && !collapsed) {
			LeftBar.instance.toggleCollapse();
		}
	}

	render() {
		var item = this.props.item;

		/// #if DEBUG
		var adminControl;
		if(iAdmin()) {
			if(item.field) {
				adminControl = R.div({ className: "left-bar-admin-button" }, React.createElement(FieldAdmin, { field: item.field, form: item.form, x: -10, y: 0 }));
			} else {
				adminControl = R.div({ className: "left-bar-admin-button" }, React.createElement(NodeAdmin, { menuItem: item, x: -10, y: 0 }));
			}
		}
		/// #endif

		if(!item.isDocument && (!item.children || (item.children.length === 0))
			/// #if DEBUG
			&& false// in debug build always show empty nodes
			/// #endif
		) {
			return R.div(null);
		}
		/*
		if(item.children && item.children.length === 1) {
			return React.createElement(BarItem, {item: item.children[0], key: this.props.key, level: this.props.level});
		}*/

		var itemsIcon = R.div({ className: "left-bar-item-icon" },
			renderIcon(item.icon + (item.isDocument ? ' brand-color' : ' no-icon'))
		)

		let className = 'left-bar-item ' + (item.isDocument ? 'left-bar-item-doc' : 'left-bar-group');

		const isActive = isCurrentlyShowedLeftBarItem(item);

		if(isActive) {
			activeItem = this;
			className += ' left-bar-item-active not-clickable';
		}

		var caret;

		var children;

		const _isMustBeExpanded = isMustBeExpanded(this.props.item);
		const isExpanded = this.state.expanded || _isMustBeExpanded;
		if(isExpanded) {
			//@ts-ignore
			this.state.expanded = isExpanded;
		}

		if(!item.isDocument) {
			if(!_isMustBeExpanded) {
				caret = R.span({ className: "left-bar-group-caret" },
					renderIcon('caret-' + (isExpanded ? 'up' : 'down'))
				)
			}
			children = R.div({ className: isExpanded ? 'left-bar-children' : 'left-bar-children hidden' },
				renderItemsArray(item.children, this.props.level + 1, item)
			)
		}

		const isMustBeExpandedVal = isMustBeExpanded(this.props.item);
		if(!isMustBeExpandedVal) {
			if(!isActive) {
				className += ' clickable';
			}
		} else {
			className += ' not-clickable left-bar-active-group';
		}

		const itemBody = R.div({
			onClick: (ev) => {
				if(!isMustBeExpandedVal) {
					if(!item.isDocument) {
						this.toggle(ev);
						return;
					}
					this.closeMenuIfNeed();
				}
			}, className
		},
			itemsIcon,
			collapsed ? undefined : R.div({ className: 'left-bar-item-body' },
				item.name,
				caret
			)
		);

		if(item.isDocument && (item.id !== false)) {
			const props = {
				className: 'left-bar-item-container',
				onClick: this.collapseOtherGroups
			}
			if(item.staticLink && item.staticLink !== 'reactClass') {
				///@ts-ignore
				props.href = item.staticLink;
			} else {
				props.onClick = (isActive ? undefined : () => {
					window.crudJs.Stage.showForm(item.id, item.recId, item.filters, item.editable);
				})
			}
			return R.a(props,
				adminControl,
				itemBody
			)
		} else {
			return R.div({ className: 'left-bar-group-container' },
				adminControl,
				itemBody,
				children
			);
		}
	}
}

const itemsById = {};

function renderItemsArray(itemsArray, level, item?) {
	/// #if DEBUG
	if((!itemsArray || itemsArray.length === 0) && (level > 0)) {
		return [R.div({
			key: 'empty-section',
			className: 'clickable left-bar-empty-section', onClick: () => {
				createNodeForMenuItem(item);
			}
		}, L("EMPTY_SECTION"))];
	}
	/// #endif

	var ret = [];

	for(var k in itemsArray) {
		var item = itemsArray[k];
		if(typeof item === 'string') {
			if(!collapsed) {
				ret.push(R.h5({ key: ret.length, className: 'left-bar-tabs-header' }, item));
			}
		} else {
			ret.push(React.createElement(BarItem, { item, key: ret.length, level }));
		}
	}
	return ret;
}

class LeftBar extends Component<any, any> {
	static instance: LeftBar;

	constructor(props) {
		super(props);
		this.state = {};
		LeftBar.instance = this;
		this.toggleCollapse = this.toggleCollapse.bind(this);
	}

	toggleCollapse() {
		collapsed = !collapsed;
		this.forceUpdate();
	}

	refreshLeftBarActive() {
		this.forceUpdate();
		setTimeout(() => {
			let item = activeItem.props.item;
			activeItem.collapseOtherGroups();
			while(item.parent) {
				const itemElement: BarItem = itemsById[item.parent];
				if(!itemElement) {
					break;
				}
				item = itemElement.props.item;
				if(!item.isDocument) {
					const e = ReactDOM.findDOMNode(itemElement) as HTMLDivElement;
					let group = e.querySelector('.left-bar-children') as HTMLDivElement;
					if(group.style.maxHeight) {
						group.style.maxHeight = '';
						group.style.transform = 'scaleY(1)';
					}
				}
			}
		}, 10);
	}

	render() {
		if(isLitePage() || !User.currentUserData) {
			return R.td(null);
		}

		var menuItems = collapsed ? [] : renderItemsArray(this.props.menuItems, 0);

		if(collapsable) {
			menuItems.unshift(R.div({ key: 'toggle-collapsing', className: "left-bar-collapse-button clickable", onClick: this.toggleCollapse }, renderIcon('bars')));
		}

		return R.td({ className: collapsed ? 'left-bar left-bar-collapsed' : 'left-bar ' },
			R.div({ className: "left-bar-body" },
				menuItems
			)
		);
	}
}

/** @type LeftBar */
LeftBar.instance = null;

let collapsable;
function renewIsCollapsable() {
	collapsable = window.innerWidth < 1330;
	collapsed = collapsable;
	if(LeftBar.instance) {
		LeftBar.instance.forceUpdate();
	}
};

window.addEventListener('resize', renewIsCollapsable);
renewIsCollapsable();

export { LeftBar };