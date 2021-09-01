import React, { Component } from "react";
import { FieldAdmin } from "./admin/field-admin";
import { NodeAdmin, createNodeForMenuItem } from "./admin/node-admin";
import { R } from "./r";
import { iAdmin } from "./user";
import { currentFormParameters, isLitePage, L, locationToHash, renderIcon, setFormFilter } from "./utils";

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

interface LeftBarItem {

}

function isCurrentlyShowedLeftbarItem(item) {

	if(item.id === false) {
		if(!currentFormParameters.filters || (Object.keys(currentFormParameters.filters).length === 0)) {
			return item.isDefault;
		}
		return item.tab === currentFormParameters.filters.tab;
	}

	if(!item.staticLink) {

		var allItems = LeftBar.instance.props.staticItems.concat(LeftBar.instance.state.items);
		excludeItem = item;
		if(allItems.some(isStrictlySelected)) {
			return false;
		}

		return currentFormParameters.nodeId === item.id &&
			currentFormParameters.recId === item.recId &&
			currentFormParameters.editable === item.editable;
	} else {
		excludeItem = null;
		return isStrictlySelected(item);
	}
}

var excludeItem;
function isStrictlySelected(item) {
	if(item) {
		if(item.hasOwnProperty('children')) {
			return item.children.some(isStrictlySelected);
		} else {
			if(item !== excludeItem && item.staticLink) {
				return location.hash === item.staticLink;
			}
		}
	}
}

class BarItem extends Component<any, any> {

	constructor(prosp) {
		super(prosp);
		this.state = {};
	}

	toggle(ev) {
		let group = ev.target.closest('.left-bar-group-container').querySelector('.left-bar-children');
		if(!this.state.expanded) {
			group.classList.remove('hidden');
			group.style.transition = 'unset';
			group.style.opacity = 0.001;
			group.style.position = 'absolute';
			group.style.maxHeight = 'unset';
			group.style.transform = 'scaleY(0)';
			group.style.transformOrigin = 'top left';
			let height;
			let timer = setInterval(() => {
				height = group.clientHeight;
				if(height > 0) {
					clearInterval(timer);
					group.style.maxHeight = '0px';
					group.style.position = 'unset';
					group.style.opacity = 1;
					group.style.transition = 'all 0.1s';
					timer = setInterval(() => {
						if(group.clientHeight <= 6) {
							clearInterval(timer);
							group.style.transform = 'scaleY(1)';
							group.style.maxHeight = height + 'px';
							setTimeout(() => {
								group.style.maxHeight = 'unset';
							}, 114);
						}
					}, 1);
				}
			}, 1);
		} else {
			group.style.transform = 'scaleY(1)';
			group.style.transformOrigin = 'top left';
			group.style.transition = 'unset';
			group.style.maxHeight = group.clientHeight + 'px';
			group.style.transition = 'all 0.1s';
			setTimeout(() => {
				group.style.transform = 'scaleY(0)';
				group.style.maxHeight = '0px';
			}, 1);
			setTimeout(() => {
				group.classList.add('hidden');
			}, 114);
		}

		//@ts-ignore
		this.state.expanded = !this.state.expanded;

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

		const isExpanded = this.state.expanded || isMustBeExpanded(this.props.item);
		if(isExpanded) {
			//@ts-ignore
			this.state.expanded = isExpanded;
		}

		if(!item.isDoc) {
			if(isExpanded) {
				caret = 'up';

			} else if(!item.isDoc) {
				caret = 'down';
			}

			if(caret) {
				caret = R.div({ className: "left-bar-group-caret" },
					renderIcon('caret-' + caret)
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
							setFormFilter('tab', item.tab);
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
			collapsed ? undefined : item.name,
			collapsed ? undefined : caret
		);


		if(item.isDoc && (item.id !== false)) {
			var href;
			if(item.staticLink && item.staticLink !== 'reactClass') {
				href = item.staticLink;
			} else {
				href = locationToHash(item.id, item.recId, item.filters, item.editable);
			}
			return R.a({ href: href },
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

	setLeftBar(menuData?: LeftBarItem[]) {
		this.setState({ items: menuData });
	}

	render() {
		if(isLitePage()) {
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