import FieldAdmin from "./admin/field-admin.js";
import NodeAdmin from "./admin/node-admin.js";
import constants from "./custom/consts.js";
import {iAdmin} from "./user.js";
import {getData, isLitePage, loactionToHash, renderIcon, setFormFilter, sp} from "./utils.js";

let collapsed;

var style = {
	width: '100%',
	boxShadow: '5px 0px 6px -3px #aaa',
	paddingTop: '10px',
	minHeight: '600px',
	verticalAlign: 'top'
};

var itemStyle = {
	display: 'block',
	color: 'inherit',
	border: 0,
	marginLeft: '7px',

	fontSize: '90%',
	fontWeight: 'bold',
	borderBottom: '1px solid #ddd'
};

var groupStyle = {
	display: 'block',
	background: constants.BRAND_COLOR,
	//textTransform: 'uppercase',
	fontWeight: 'bold',
	color: constants.BRAND_COLOR_SHINE,
	border: 0,
	padding: '5px 3px',
	fontSize: '70%',
	marginTop: '1px',
	boxShadow: '0 3px 3px -1px rgba(102,30,10,0.3)'
};

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


function isCurrentlyShowedLeftbarItem(item) {

	if(item.id === false) {
		if(!currentFormParameters.filters || (Object.keys(currentFormParameters.filters).length === 0)) {
			return item.isDefault;
		}
		return item.tab === currentFormParameters.filters.tab;
	}

	if(!item.staticLink) {

		var allItems = LeftBar.instance.state.staticItems.concat(LeftBar.instance.state.items);
		excludeItem = item;
		if(allItems.some(isStrictlySelected)) {
			return false;
		}

		return currentFormParameters.nodeId == item.id &&
			currentFormParameters.recId == item.recId &&
			currentFormParameters.editable == item.editable;
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
				return location.hash == item.staticLink;
			}
		}
	}
}


var hasInactiveItems;
class BarItem extends React.Component {
	toggle() {
		if(!this.state) {
			this.setState({expanded: true});
		} else {
			this.setState({expanded: !this.state.expanded});
		}

	}
	closeMenuIfNeed() {
		if(LeftBar.collapsable && !collapsed) {
			LeftBar.instance.toggleCollapse();
		}
	}
	render() {
		var item = this.props.item;

		var adminControl;
		if(iAdmin()) {
			if(item.field) {
				adminControl = ReactDOM.div({style: {position: 'absolute', left: '0'}}, React.createElement(FieldAdmin, {field: item.field, form: item.form, x: -10, y: 0}));
			} else {
				adminControl = ReactDOM.div({style: {position: 'absolute', left: '0'}}, React.createElement(NodeAdmin, {menuItem: item, x: -10, y: 0}));
			}
		}


		var innerItemStyle = Object.assign({}, itemStyle);

		innerItemStyle.padding = Math.max(0, (13 - this.props.level * 3)) + 'px 0';

		var itemsIcon = ReactDOM.div({style: {display: 'inline-block', textAlign: 'center', width: 40}},
			renderIcon(item.icon + (item.isDoc ? ' brand-color' : 'noicon'))
		)

		if(this.props.active) {

			return ReactDOM.div({
				style: {
					background: '#ebe5e8',
					borderLeft: '5px solid ' + constants.BRAND_COLOR_DARK,
					overflow: 'hidden',
					width: collapsed ? 33 : undefined,
				}, className: 'lb-item' + (item.tabId ? " lb-item-" + item.tabId : undefined)
			},
				adminControl,
				ReactDOM.span({
					style: innerItemStyle, className: 'unclickable'
				},
					itemsIcon,
					collapsed ? undefined : item.name
				)
			)
		} else {

			if(!item.isDoc && (!item.children || (item.children.length === 0))) {
				return ReactDOM.div();
			}

			hasInactiveItems = true;

			var caret;

			var children;
			if((this.state && this.state.expanded) || isMustBeExpanded(this.props.item)) {
				caret = 'up';
				children = ReactDOM.div({className: 'jump-in', style: {opacity: 0.85, fontSize: '85%'}},
					renderItemsArray(item.children, this.props.level + 1)
				)
			} else if(!item.isDoc) {
				caret = 'down';
			}

			if(caret) {
				caret = ReactDOM.div({style: {float: 'right', marginRight: '20px'}},
					renderIcon('caret-' + caret)
				)
			}

			var itemBody;
			if(item.subheader) {
				itemBody = ReactDOM.h6({style: {margin: 10, color: '#999', fontSize: '80%'}}, adminControl, item.name);
			} else {

				itemBody = ReactDOM.div({onClick: this.closeMenuIfNeed, className: 'lb-item' + (item.tabId ? " lb-item-" + item.tabId : undefined), style: {overflow: 'hidden', width: collapsed ? 33 : undefined}},
					adminControl,
					ReactDOM.div({
						style: (item.isDoc) ? innerItemStyle : groupStyle, className: 'clickable' + (!item.isDoc ? ' clickable-top' : ''), onClick: (event) => {
							if(item.isDoc) {
								if(item.id === false) {
									setFormFilter('tab', item.tab);
									sp(event);
								}
							} else {
								this.toggle();
								sp(event);
							}

						}
					},
						itemsIcon,
						collapsed ? undefined : item.name,
						collapsed ? undefined : caret
					),
					children
				);
			}

			if(item.isDoc && (item.id !== false)) {

				var href;

				if(item.staticLink && item.staticLink !== 'reactClass') {
					href = item.staticLink;
				} else {
					href = loactionToHash(item.id, item.recId, item.filters, item.editable);
				}

				return ReactDOM.a({href: href},
					itemBody
				)
			}
			return itemBody;
		}
	}
}

function renderItemsArray(itemsArray, level) {
	var ret = [];
	for(var k in itemsArray) {
		var i = itemsArray[k];
		if(typeof i === 'string') {
			if(!collapsed) {
				ret.push(ReactDOM.h5({key: ret.length, style: {fontWeight: 'bold', margin: '29px 0', marginLeft: '20px', color: constants.BRAND_COLOR_HEADER}}, i));
			}
		} else {
			var itemActive = isCurrentlyShowedLeftbarItem(i);
			if(!itemActive) {
				hasInactiveItems = true;
			}
			ret.push(React.createElement(BarItem, {item: i, key: ret.length, level: level, active: itemActive}));
		}
	}
	return ret;
}

export default class LeftBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		LeftBar.instance = this;
	}

	componentDidMount() {
		this.reloadLeftBar();
	}

	toggleCollapse() {
		collapsed = !collapsed;
		this.forceUpdate();
	}

	reloadLeftBar() {
		getData('api/getNodes', undefined, (data) => {

			var rootItem;
			var items = {};

			data.some((i) => {
				items[i.id] = i;
				if(i.id === 2) {
					rootItem = i;
				}
			});

			for(var k in data) {
				var i = data[k];
				if(items.hasOwnProperty(i.parent)) {
					var parent = items[i.parent];
					if(!parent.hasOwnProperty('children')) {
						parent.children = [];
					}
					parent.children.push(i);
				}
			}

			this.setState({staticItems: rootItem.children});

		});
	}

	refreshLeftBarActive() {
		this.forceUpdate();
	}

	setLeftBar(menuData) {
		this.setState({items: menuData});
	}

	render() {
		if(isLitePage()) {
			return ReactDOM.td();
		}
		hasInactiveItems = false;

		var lines;
		var staticLines;



		if(this.state) {
			staticLines = renderItemsArray(this.state.staticItems, 0);
			lines = renderItemsArray(this.state.items, 0);
			if(lines.length === 1) {
				lines = undefined;
			}
		}

		if(collapsed) {
			lines = undefined;
			staticLines = [];
		}

		if(LeftBar.collapsable) {
			staticLines.unshift(ReactDOM.div({key: 'toggle-collapsing', style: {paddingTop: 5, paddingBottom: 5}, onClick: this.toggleCollapse, className: 'clickable'}, renderIcon('bars')));
		}

		if(!hasInactiveItems) {
			return ReactDOM.td({style: {width: LeftBar.collapsable ? 33 : 300}});
		} else {

			return ReactDOM.td({className: 'left-bar', style: {width: LeftBar.collapsable ? 33 : 300, minWidth: LeftBar.collapsable ? 33 : 300}},
				ReactDOM.div({style: {position: 'absolute', zIndex: 1, background: '#fff', width: collapsed ? 33 : 300}},
					ReactDOM.div({style: style},
						staticLines,
						lines
					)
				)
			);
		}
	}
}

function renewIsCollapsable() {
	LeftBar.collapsable = window.innerWidth < 1330;
	collapsed = LeftBar.collapsable;
	if(LeftBar.instance) {
		LeftBar.instance.forceUpdate();
	}
};

window.addEventListener('resize', renewIsCollapsable);
renewIsCollapsable();