import React, { Component } from "react";
import ReactDOM from "react-dom";
import { FieldAdmin } from "./admin/field-admin";
import { NodeAdmin, createNodeForMenuItem } from "./admin/node-admin";
import { assert } from "./bs-utils";
import { R } from "./r";
import { Stage } from "./stage";
import { iAdmin, User } from "./user";
import { isLitePage, L, locationToHash, renderIcon } from "./utils";

let collapsed;

function isMustBeExpanded(i) {
	if(i.children) {
		for(var k in i.children) {
			var j = i.children[k];
			if(isCurrentlyShowedLeftbarItem(j) || isMustBeExpanded(j)) {
				return true;
			}
		}
		return false;
	} else {
		return isCurrentlyShowedLeftbarItem(i);
	}
}

const allGropus: BarItem[] = [];

interface LeftBarItemData {

}

function isCurrentlyShowedLeftbarItem(item) {
	const currentFormParameters = Stage.currentForm.formParameters;
	if(item.id === false) {
		if(!currentFormParameters.filters || (Object.keys(currentFormParameters.filters).length === 0)) {
			return item.isDefault;
		}
		return item.tab === currentFormParameters.filters.tab;
	}

	if(!item.staticLink) {
		return currentFormParameters.nodeId === item.id &&
			currentFormParameters.recId === item.recId &&
			currentFormParameters.editable === item.editable;
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

	constructor(prosp) {
		super(prosp);
		this.state = {};
		this.collapseOtherGroups = this.collapseOtherGroups.bind(this);
	}

	componentDidMount() {
		if(!this.props.item.isDoc) {
			allGropus.push(this);
		}
	}

	componentWillUnmount() {
		if(!this.props.item.isDoc) {
			let i = allGropus.indexOf(this);
			assert(i >= 0, 'BarItem registration is corrupted.');
			allGropus.splice(i, 1);
		}
	}

	collapseOtherGroups() {
		for(let g of allGropus) {
			if(g.props.item.children.indexOf(this.props.item) < 0) {
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

		if(!item.isDoc && (!item.children || (item.children.length === 0))
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
			renderIcon(item.icon + (item.isDoc ? ' brand-color' : ' noicon'))
		)

		let className = 'left-bar-item ' + (item.isDoc ? 'left-bar-item-doc' : 'left-bar-group');

		const isActive = isCurrentlyShowedLeftbarItem(item);

		if(isActive) {
			className += ' left-bar-item-active unclickable';
		}

		if(item.tabId) {
			className += ' left-bar-item-tab-' + item.tabId;
		}

		var caret;

		var children;

		const _isMustBeExpanded = isMustBeExpanded(this.props.item);
		const isExpanded = this.state.expanded || _isMustBeExpanded;
		if(isExpanded) {
			//@ts-ignore
			this.state.expanded = isExpanded;
		}

		if(!item.isDoc) {
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
			className += ' unclickable left-bar-active-group';
		}

		const itemBody = R.div({
			onClick: (ev) => {
				if(!isMustBeExpandedVal) {
					if(item.isDoc) {
						if(item.id === false) {

							Stage.rootForm.setFormFilter('tab', item.tab);
							return;
						}
					} else {
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


		if(item.isDoc && (item.id !== false)) {
			var href;
			if(item.staticLink && item.staticLink !== 'reactClass') {
				href = item.staticLink;
			} else {
				href = locationToHash(item.id, item.recId, item.filters, item.editable);
			}
			return R.a({ href: href, onClick: this.collapseOtherGroups },
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

function renderItemsArray(itemsArray, level, item?) {
	/// #if DEBUG
	if((!itemsArray || itemsArray.length === 0) && (level > 0)) {
		return [R.div({
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
	}

	setLeftBar(menuData?: LeftBarItemData[]) {
		this.setState({ items: menuData });
	}

	render() {
		if(isLitePage() || !User.currentUserData) {
			return R.td(null);
		}

		var lines;
		var staticLines;

		staticLines = renderItemsArray(this.props.staticItems, 0);
		if(this.state) {
			lines = renderItemsArray(this.state.items, 0);
			if(lines.length === 1) {
				lines = undefined;
			}
		}

		if(collapsed) {
			lines = undefined;
			staticLines = [];
		}

		if(collapsable) {
			staticLines.unshift(R.div({ key: 'toggle-collapsing', className: "left-bar-collapse-button clickable", onClick: this.toggleCollapse }, renderIcon('bars')));
		}

		return R.td({ className: collapsed ? 'left-bar left-bar-collapsed' : 'left-bar ' },
			R.div({ className: "left-bar-body" },
				staticLines,
				lines
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