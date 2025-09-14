/// #if DEBUG
import { createNodeForMenuItem, NodeAdmin } from './admin/admin-control';
import { FieldAdmin } from './admin/field-admin';
/// #endif
import { Component, h } from 'preact';
import type { TreeItem } from '../../../core/describe-node';
import { NODE_TYPE } from '../../../types/generated';
import { globals } from '../../../types/globals';
import { assert } from './assert';
import type { RecId } from './bs-utils';
import type { FormFull__olf } from './forms/form-full';
import { Modal } from './modal';
import { R } from './r';
import { Stage } from './stage';
import { iAdmin, User } from './user';
import { isLitePage, L, renderIcon } from './utils';

const isNeedCollapse = () => {
	return window.document.body.clientWidth < 1300;
};
let collapsed = isNeedCollapse();

function isMustBeExpanded(i: TreeItem): boolean {
	if (i.children) {
		for (const k in i.children) {
			const j = i.children[k];
			if (isCurrentlyShowedLeftBarItem(j) || isMustBeExpanded(j)) {
				return true;
			}
		}
		return false;
	} else {
		return !!isCurrentlyShowedLeftBarItem(i);
	}
}

const allGroups: BarItem[] = [];

const SELECTED_LIST = 'selected_list';

let activeItem: BarItem | null;

function isCurrentlyShowedLeftBarItem(item: TreeItem): boolean | typeof SELECTED_LIST | undefined {
	const currentFormParameters = Stage.currentForm;
	if (!currentFormParameters) {
		return;
	}

	if (item.nodeType !== NODE_TYPE.STATIC_LINK) {
		if (currentFormParameters.nodeId === item.id) {
			if (!currentFormParameters.recId) {
				return SELECTED_LIST;
			}
			return true;
		}
	} else {
		return isStrictlySelected(item);
	}
}

function isStrictlySelected(item: TreeItem) {
	if (item) {
		if (item.hasOwnProperty('children')) {
			return item.children.some(isStrictlySelected);
		} else {
			if (item.nodeType === NODE_TYPE.STATIC_LINK) {
				return location.hash === item.staticLink;
			}
		}
	}
}

interface BarItemState {
	expanded?: boolean;
}

interface BarItemProps {
	item: TreeItem;
	level: number;
}

class BarItem extends Component<BarItemProps, BarItemState> {
	constructor(props: BarItemProps) {
		super(props);
		itemsById.set(props.item.id, this);
		this.state = {};
	}

	componentDidMount() {
		if (this.props.item.nodeType !== NODE_TYPE.DOCUMENT) {
			allGroups.push(this);
		}
	}

	componentWillUnmount() {
		if (this.props.item.nodeType !== NODE_TYPE.DOCUMENT) {
			const i = allGroups.indexOf(this);
			assert(i >= 0, 'BarItem registration is corrupted.');
			allGroups.splice(i, 1);
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
		let height: number;
		let timer = setInterval(() => {
			height = element.clientHeight;
			if (height > 0) {
				clearInterval(timer);
				element.style.maxHeight = '0px';
				element.style.position = 'unset';
				element.style.opacity = '1';
				element.style.transition = 'all 0.1s';
				timer = setInterval(() => {
					if (element.clientHeight <= 6) {
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
		return (this.base as HTMLDivElement).querySelector('.left-bar-children') as HTMLElement;
	}

	toggle(ev: MouseEvent) {
		const group: HTMLDivElement = ((ev.target as HTMLDivElement)
			.closest('.left-bar-group-container') as HTMLDivElement)
			.querySelector('.left-bar-children') as HTMLDivElement;
		if (group.classList.contains('hidden')) {
			this.expand();
		} else {
			this.collapse();
		}
	}

	closeMenuIfNeed() {
		if (!collapsed && isNeedCollapse()) {
			LeftBar.instance!.toggleCollapse();
		}
	}

	render() {
		const item = this.props.item;

		/// #if DEBUG
		let adminControl;
		if (iAdmin()) {
			if (item.field) {
				adminControl = R.div(
					{ className: 'left-bar-admin-button' },
					h(FieldAdmin, { field: item.field, form: item.form as FormFull__olf })
				);
			} else {
				adminControl = R.div(
					{ className: 'left-bar-admin-button' },
					h(NodeAdmin, { menuItem: item })
				);
			}
		}
		/// #endif

		if (
			item.nodeType !== NODE_TYPE.DOCUMENT &&
			(!item.children || item.children.length === 0) &&
			/// #if DEBUG
			false // in debug build always show empty nodes
			/// #endif
		) {
			return R.div(null);
		}
		/*
		if(item.children && item.children.length === 1) {
			return h(BarItem, {item: item.children[0], key: this.props.key, level: this.props.level});
		} */

		const itemsIcon = R.div(
			{ className: 'left-bar-item-icon' },
			renderIcon(item.icon + (item.nodeType === NODE_TYPE.DOCUMENT ? ' brand-color' : ' no-icon'))
		);

		let className =
			'left-bar-item ' +
			(item.nodeType === NODE_TYPE.DOCUMENT ? 'left-bar-item-doc' : 'left-bar-group');

		const isActive = isCurrentlyShowedLeftBarItem(item);

		if (isActive) {
			activeItem = this;
			className += ' left-bar-item-active';
		}

		let caret;

		let children;

		const _isMustBeExpanded = isMustBeExpanded(this.props.item);
		const isExpanded = this.state.expanded || _isMustBeExpanded;
		if (isExpanded != this.state.expanded) {
			this.setState({ expanded: isExpanded });
		}

		if (item.nodeType === NODE_TYPE.SECTION) {
			if (!_isMustBeExpanded) {
				caret = R.span(
					{ className: 'left-bar-group-caret' },
					renderIcon('caret-' + (isExpanded ? 'up' : 'down'))
				);
				className += ' clickable';
			} else {
				className += ' not-clickable';
			}
			children = R.div(
				{ className: isExpanded ? 'left-bar-children' : 'left-bar-children hidden' },
				renderItemsArray(item.children, this.props.level + 1, item)
			);
		} else {
			if (isActive === SELECTED_LIST) {
				className += ' not-clickable';
			} else if (!isActive) {
				className += ' clickable';
			} else {
				className += ' clickable left-bar-active-group';
			}
		}

		const itemBody = R.div(
			{
				onClick: (ev) => {
					if (!_isMustBeExpanded) {
						if (item.nodeType === NODE_TYPE.SECTION) {
							this.toggle(ev);
							return;
						}
						this.closeMenuIfNeed();
					}
				},
				className
			},
			itemsIcon,
			collapsed ? undefined : R.div({ className: 'left-bar-item-body' }, item.name),
			caret
		);

		if (item.nodeType !== NODE_TYPE.SECTION && item.id) {
			const props = {
				className: 'left-bar-item-container',
				onClick: undefined as (() => void) | undefined,
				href: undefined as string | undefined
			};
			if (item.nodeType === NODE_TYPE.STATIC_LINK) {
				props.href = item.staticLink;
			} else {
				props.onClick =
					(isActive === SELECTED_LIST)
						? undefined
						: () => {
							// TODO: form tabs as menu items
							globals.Stage.showForm(item.id);
						};
			}
			return R.a(
				props,
				/// #if DEBUG
				adminControl,
				/// #endif
				itemBody
			);
		} else {
			return R.div(
				{ className: 'left-bar-group-container left-bar-group-container-node-' + item.id },
				/// #if DEBUG
				adminControl,
				/// #endif
				itemBody,
				children
			);
		}
	}
}

const itemsById = new Map() as Map<RecId, BarItem>;

function renderItemsArray(itemsArray: TreeItem[], level: number, item?: TreeItem) {
	/// #if DEBUG
	if ((!itemsArray || itemsArray.length === 0) && level > 0) {
		return [
			R.div(
				{
					key: 'empty-section',
					className: 'clickable left-bar-empty-section',
					onClick: () => {
						createNodeForMenuItem(item!);
					}
				},
				L('EMPTY_SECTION')
			)
		];
	}
	/// #endif

	const ret = [];

	for (const k in itemsArray) {
		const item = itemsArray[k];
		if (typeof item === 'string') {
			if (!collapsed) {
				ret.push(R.h5({ key: ret.length, className: 'left-bar-tabs-header' }, item));
			}
		} else {
			ret.push(h(BarItem, { item, key: ret.length, level }));
		}
	}
	return ret;
}

interface LeftBarProps {
	menuItems: TreeItem[];
}

class LeftBar extends Component<LeftBarProps,
	{
	// state
	}> {
	static instance?: LeftBar;

	constructor(props: LeftBarProps) {
		super(props);
		this.state = {};
		LeftBar.instance = this;
		this.toggleCollapse = this.toggleCollapse.bind(this);
	}

	toggleCollapse() {
		collapsed = !collapsed;
		this.forceUpdate();
	}

	static refreshLeftBarActive() {
		LeftBar.instance?.refreshLeftBarActive();
	}

	refreshLeftBarActive() {
		this.forceUpdate();
		setTimeout(() => {
			if (!activeItem) return;
			let item = activeItem.props.item;
			while (item.parent) {
				const itemElement: BarItem = itemsById.get(item.parent)!;
				if (!itemElement) {
					break;
				}
				item = itemElement.props.item;
				if (item.nodeType === NODE_TYPE.SECTION) {
					const e = itemElement.base as HTMLDivElement;
					const group = e.querySelector('.left-bar-children') as HTMLDivElement;
					if (group.style.maxHeight) {
						group.style.maxHeight = '';
						group.style.transform = 'scaleY(1)';
					}
				}
			}
		}, 10);
	}

	render() {
		activeItem = null;
		if (isLitePage() || !User.currentUserData) {
			return R.td(null);
		}

		const menuItems = renderItemsArray(this.props.menuItems, 0);

		menuItems.unshift(
			R.div(
				{
					key: 'toggle-collapsing',
					className: 'left-bar-collapse-button clickable',
					onClick: this.toggleCollapse
				},
				renderIcon('bars')
			)
		);

		let className = 'left-bar';

		if ((Modal.instance && Modal.instance.isShowed()) || Stage.allForms.length > 1) {
			className += ' hidden';
		}

		if (collapsed) {
			className += ' left-bar-collapsed';
		}

		return R.div({ className }, R.div({ className: 'left-bar-body' }, menuItems));
	}
}

LeftBar.instance = undefined;

export { LeftBar };
