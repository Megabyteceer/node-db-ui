/* global React */

import FieldAdmin from "../admin/field-admin.js";
import NodeAdmin from "../admin/node-admin.js";
import constants from "../custom/consts.js";
import LeftBar from "../left-bar.js";
import {iAdmin} from "../user.js";
import {consoleLog, getNode, getNodeData, L, renderIcon, scrollToVisible, sp, UID, updateHashLocation} from "../utils.js";
import FormItem from "./form-item.js";
import BaseForm from "./form-mixins.js";

var style = {

};

var headerStyle = {
	verticalAlign: 'middle',
	fontWeight: 'bold',
	borderBottom: '3px solid #ddd',
	padding: '10px 15px'
};
var headerStyleNum = {
	textAlign: 'right',
	verticalAlign: 'middle',
	fontWeight: 'bold',
	borderBottom: '3px solid #ddd',
	padding: '10px 15px'
};

const sortByOrder = (a, b) => {
	return a.order - b.order;
}

var listRenderers = [];

function registerListRenderer(nodeId, renderFunction) {
	if(listRenderers.hasOwnProperty(nodeId)) {
		throw 'List renderer redifinition for node ' + nodeId;
	}
	listRenderers[nodeId] = renderFunction;
}

function isPresentListRenderer(nodeId) {
	return listRenderers.hasOwnProperty(nodeId);
}

function createPageButton(self, page, isActive) {
	if(isActive) {
		return ReactDOM.button({key: page, style: {background: '#ebe5e8', borderBottom: '5px solid ' + constants.BRAND_COLOR_DARK, color: '#555', margin: 0, borderRadius: 0}},
			page + 1
		);
	}
	return ReactDOM.button({
		key: page, className: 'clickable', style: {background: '#fff', color: '#555', margin: 0, borderRadius: 0}, onClick: () => {
			self.changeFilter('p', page, true);
		}
	},
		page + 1
	);
}

export default class List extends BaseForm {

	constructor(props) {
		super(props);
		this.filters = Object.assign({}, props.filters);
		this.state.node = props.node;
		this.state.data = props.initialData;
		this.refreshData = this.refreshData.bind(this);
	}

	componentDidMount() {
		this.subformsRefs = {};
		this.higlightResults();
		this.onShow();
	}

	UNSAFE_componentWillReceiveProps(newProps) {
		super.UNSAFE_componentWillReceiveProps(newProps);
		consoleLog('LIST receive props');
		this.filters = $.extend({}, newProps.filters);
		this.setSearchInputValue(this.filters.s);
		this.state.node = newProps.node;
		this.state.data = newProps.initialData;
		this.onShow();
	}

	higlightResults() {
		if((this.filters && this.filters.s) || this.prevHiglightedTerm) {
			var c = $('.list-body', ReactDOM.findDOMNode(this.refs.this));

			var src_str = c.html();
			if(src_str) {

				src_str = src_str.replace(/<mark>/g, '');
				src_str = src_str.replace(/<\/mark>/g, '');


				var term = this.filters.s;
				if(term) {


					term = term.replace(/(\s+)/, "(<[^>]+>)*$1(<[^>]+>)*");
					var pattern = new RegExp("(" + term + ")", "gi");

					src_str = src_str.split('>').map((s) => {
						var b = s.split('<');
						b[0] = b[0].replace(pattern, "<mark>$1</mark>");
						return b.join('<')
					}).join('>');
				}
				c.html(src_str)

				this.prevHiglightedTerm = this.filters.s;

			} else {
				this.prevHiglightedTerm = false;
			}
		}
	}

	componentDidUpdate() {
		this.higlightResults();
	}

	onShow() {
		if(!this.state.data) {
			setTimeout(this.refreshData, 1);
		} else if(!this.props.node) {
			getNode(this.props.nodeId, (node) => {
				this.setState({node: node});
				if(this.props.parentForm) {
					this.props.parentForm.savedNode = node;
				}
			});
		}

		if(!this.isSlave() && !this.props.noSetHash) {
			LeftBar.instance.setLeftBar();
		}
	}

	isVisibleField(field) {
		if(this.props.isLookup) {
			return field.show & 8;
		} else {
			return field.show & 2;
		}
	}

	refreshData() {
		if(!this.isSlave() && !this.props.noSetHash) {
			updateHashLocation(this.filters);
		}
		var nodeIdToFetch = this.props.nodeId || this.props.node.id;
		if(nodeIdToFetch !== this.currentFechingNodeId) {
			this.currentFechingNodeId = nodeIdToFetch;

			var getFilters;
			if(this.props.editable) {
				this.filters.p = '*';
			}

			getNodeData(nodeIdToFetch, undefined, (data) => {

				if(this.unmounted) {
					return;
				}

				this.currentFechingNodeId = -1;
				var sorting = data.items.length && data.items[0].hasOwnProperty('order');
				if(sorting) {
					data.items.sort(sortByOrder);
				}

				if(!this.props.node) {
					getNode(this.props.nodeId, (node) => {
						if(this.isSlave()) {
							this.props.parentForm.saveNodeDataAndFilters(node, data, this.filters);
						}
						this.setState({data: data, node: node});
						this.scrollIfNeed();
					});
				} else {
					if(this.isSlave()) {
						this.props.parentForm.saveNodeDataAndFilters(this.props.node, data, this.filters);
					}
					this.setState({data: data});
					this.scrollIfNeed();
				}
			}, this.filters, this.props.editable, this.props.isLookup, this.isCustomListRenering());
		}
	}

	scrollIfNeed() {
		if(this.isSlave() && this.props.parentForm.props.field.fieldType === FIELD_7_Nto1) {
			scrollToVisible(this);
		}
	}

	changeSearch(event) {
		var val = event.target.value;
		this.clearSearchInterval();
		this.searchTimeout = setTimeout(() => {
			delete (this.searchTimeout);
			if(this.changeFilter('s', val)) {
				if(this.filters.p !== '*') {
					this.changeFilter('p');
				}
				this.refreshData();
			}
		}, 500);
	}

	clearSearchInterval() {
		if(this.hasOwnProperty('searchTimeout')) {
			clearTimeout(this.searchTimeout);
		}

	}

	componentWillUnmount() {
		this.unmounted = true;
		this.clearSearchInterval();
	}

	setSearchInputValue(v) {
		if(this.searchInput) {
			if(!v) {
				v = '';
			}
			this.searchInput.value = v;
			this.clearSearchInterval();
		}
	}

	clearSearch() {
		this.setSearchInputValue();
		if(this.changeFilter('s')) {
			if(this.filters.p !== '*') {
				this.changeFilter('p');
			}
			this.refreshData();
		}
	}

	subFormRef(ref) {
		if(ref) {
			this.subformsRefs[UID(ref.props.initialData)] = (ref);
		}
	}

	getSubforms(includeDeleted) {
		var ret = [];
		for(var k in this.subformsRefs) {
			if(this.subformsRefs.hasOwnProperty(k)) {
				var f = this.subformsRefs[k];
				if(includeDeleted || !f.props.initialData.__deleted_901d123f) {
					ret.push(f);
				}
			}
		}
		return ret;
	}

	isCustomListRenering() {
		return (!this.props.onItemClick && !this.props.filters.noCustomList && !this.props.isLookup && isPresentListRenderer(parseInt(this.props.nodeId || this.props.node.id)));
	}

	renderEditableList() { //TODO: renderEditableList
		var node = this.state.node;
		var data = this.state.data;
		var filters = this.filters;
		var lines = [];
		if(data.items.length > 0) {
			var sorting = data.items[0].hasOwnProperty('order');


			for(var i = 0; i < data.items.length; i++) {
				(() => {
					var itemNum = i;
					var item = data.items[i];


					if(!item.__deleted_901d123f) {

						lines.push(
							ReactDOM.div({key: UID(item), className: 'inline-item', style: {display: 'inline-block', width: '80%', marginBottom: 4, marginTop: 4}},
								React.createElement(FormFull, {ref: this.subFormRef, inlineEditable: true, editable: true, isCompact: true, filters: filters, parentForm: this.props.parentForm, isLookup: this.props.isLookup, list: this, node: node, initialData: item, overrideOrderData: sorting ? itemNum : -1})
							)
						);
						var btns = [];

						btns.push(ReactDOM.button({
							className: 'clickable clickable-del toolbtn', title: L('DELETE'), key: 'b' + UID(item), style: {color: '#fff', background: constants.DELETE_COLOR}, onClick: () => {

								var deleteItem = () => {

									item.__deleted_901d123f = true;
									this.forceUpdate();
								};
								if(item.hasOwnProperty('id') && !this.state.noPromptDelete) {
									deleteRecord(item.name, node.id, 0, undefined, false, deleteItem);
								} else {
									deleteItem();
								}
							}
						}, renderIcon('times')));

						if(sorting) {
							var _uidM1 = false;
							var _uidP1 = false;
							var _itemNumM1;
							var _itemNumP1;
							for(var j = itemNum - 1; j >= 0; j--) {
								if(!data.items[j].__deleted_901d123f) {
									_itemNumM1 = j;
									_uidM1 = UID(data.items[j]);
									break;
								}
							}

							for(var j = itemNum + 1; j < (data.items.length); j++) {
								if(!data.items[j].__deleted_901d123f) {
									_itemNumP1 = j;
									_uidP1 = UID(data.items[j]);
									break;
								}
							}





							if(_uidM1 !== false) {
								(() => {
									var uid = UID(data.items[itemNum]);
									var itemNumM1 = _itemNumM1;
									var uidM1 = _uidM1;
									btns.push(ReactDOM.button({
										className: 'clickable toolbtn', title: L('MOVE_UP'), key: 'bu' + UID(item), style: {color: '#fff', background: constants.EDIT_COLOR}, onClick: () => {
											var t = data.items[itemNum];
											data.items[itemNum] = data.items[itemNumM1];
											data.items[itemNumM1] = t;
											this.subformsRefs[uid].setFieldValue('order', itemNumM1);
											this.subformsRefs[uid].saveForm();
											this.subformsRefs[uidM1].setFieldValue('order', itemNum);
											this.subformsRefs[uidM1].saveForm();
											this.forceUpdate();

										}
									}, renderIcon('arrow-up')));
								})();
							}
							if(_uidP1 !== false) {

								(() => {
									var uid = UID(data.items[itemNum]);
									var itemNumP1 = _itemNumP1;
									var uidP1 = _uidP1;

									btns.push(ReactDOM.button({
										className: 'clickable toolbtn', title: L('MOVE_DOWN'), key: 'bd' + UID(item), style: {color: '#fff', background: constants.EDIT_COLOR}, onClick: () => {
											var t = data.items[itemNum];
											data.items[itemNum] = data.items[itemNumP1];
											data.items[itemNumP1] = t;

											this.subformsRefs[uid].setFieldValue('order', itemNumP1);
											this.subformsRefs[uid].saveForm();
											this.subformsRefs[uidP1].setFieldValue('order', itemNum);
											this.subformsRefs[uidP1].saveForm();
											this.forceUpdate();

										}
									}, renderIcon('arrow-down')));
								})();
							}
						}

						lines.push(
							ReactDOM.span({key: UID(item) + 'btns', className: 'btns', style: {whiteSpace: 'nowrap', display: 'inline-block', width: 0}},
								btns
							)

						);



					}
				})()

			}
		}


		var nodeAdmin;
		if(iAdmin()) {
			nodeAdmin = React.createElement(NodeAdmin, {form: this, x: 400, y: 0});
		}

		var createBtn;
		if(node.canCreate) {
			createBtn = ReactDOM.div(null,
				ReactDOM.button({style: {background: constants.CREATE_COLOR}, title: L('ADD', (node.creationName || node.singleName)), className: 'clickable clickable-neg toolbtn', onClick: () => {data.items.push({}); this.forceUpdate();}},
					renderIcon('plus')
				)
			);
		}

		return ReactDOM.div({style: style},
			nodeAdmin,
			lines,
			createBtn
		);



	}

	render() {
		var node = this.state.node;
		var data = this.state.data;
		if(!node || !data) {
			return ReactDOM.div({style: {textAlign: 'center', color: '#ccc', padding: '5px'}},
				renderIcon('cog fa-spin fa-2x')
			);
		}

		if(this.props.editable) {
			return this.renderEditableList();
		} else {
			return this.renderList();
		}
	}

	renderList() { //TODO: renderList
		var node = this.state.node;
		var data = this.state.data;
		var filters = this.filters;
		var header;

		if(!this.props.omitHeader) {
			var createButton;
			if(node.canCreate && !this.props.preventCreateButton && !this.filters.preventCreateButton && !this.state.preventCreateButton) {
				if(this.isSlave()) {


					createButton = ReactDOM.button({style: {padding: '5px 15px', background: constants.CREATE_COLOR}, className: 'clickable clickable-neg', onClick: () => {this.props.parentForm.toggleCreateDialogue();}},
						renderIcon('plus'), ' ' + L('CREATE') + ' ' + (node.creationName || node.singleName)
					);
					if(node.id === 21) {
						createButton = ReactDOM.span(null,
							ReactDOM.button({style: {padding: '5px 15px', background: constants.CREATE_COLOR}, className: 'clickable clickable-neg', onClick: () => {this.props.parentForm.toggleCreateDialogue(undefined, {isGroupDivider: 0})}},
								renderIcon('plus'), ' ' + L('CREATE') + ' ' + (node.creationName || node.singleName)
							),
							ReactDOM.button({style: {padding: '5px 15px', background: constants.CREATE_COLOR}, className: 'clickable clickable-neg', onClick: () => {this.props.parentForm.toggleCreateDialogue(undefined, {isGroupDivider: 1});}},
								renderIcon('plus'), ' ' + L('CREATE_DELIMITER')
							)
						);

					}

				} else {
					createButton = ReactDOM.button({style: {background: constants.CREATE_COLOR, color: '#fff', padding: '15px 40px'}, className: 'clickable clickable-neg', onClick: () => {createRecord(node.id, filters);}},
						renderIcon('plus'), ' ' + L('CREATE') + ' ' + (node.creationName || node.singleName)
					);
				}
			}

			var searchPanel;

			if(!this.props.hideSearch && !this.state.hideSearch && (this.filters.s || data.items.length > 2)) {
				searchPanel = ReactDOM.div({style: {display: 'block', border: '1px solid #a8a8a8', marginTop: '10px', borderRadius: '6px'}},
					ReactDOM.input({ref: (input) => {this.searchInput = input;}, style: {width: '200px', borderRadius: '6px', verticalAlign: 'middle', padding: '2px 8px', border: 'none', borderRight: '1px solid #a8a8a8', borderTopRightRadius: 0, borderBottomRightRadius: 0}, placeholder: L('SEARCH_LIST'), onChange: this.changeSearch, defaultValue: this.filters.s}),
					ReactDOM.a({
						className: 'clickable', style: {color: '#ccc', verticalAlign: 'middle', fontSize: '120%'}, onClick: (e) => {
							this.clearSearch();
							sp(e);
						}
					},
						renderIcon('times')
					)
				)

			}


			if(createButton || searchPanel) {
				header = ReactDOM.div({style: {marginBottom: 30, display: 'flex', justifyContent: 'space-between'}},
					ReactDOM.div(null,
						createButton
					),
					ReactDOM.div({style: {}},
						searchPanel
					)
				);
			}
		}

		var body;
		data.total = parseInt(data.total);
		if(data.total > 0) {

			if(this.isCustomListRenering()) {
				body = listRenderers[node.id].call(this);
			}
			if(!body) {


				var tableHeader = [];

				node.fields.some((field) => {


					var fieldAdmin;
					if(iAdmin()) {
						fieldAdmin = React.createElement(FieldAdmin, {field: field, form: this.ref ? (this.ref.inlineList || this) : this, x: 80});
					}

					var rowHeader;
					if(field.forSearch === 1) {
						rowHeader = ReactDOM.span({
							className: 'clickable', style: {color: (filters.o === field.fieldName) ? '#259' : ''}, onClick: () => {
								if(filters.o === field.fieldName) {
									this.changeFilter('r', filters.r ? undefined : 1, true);
								} else {
									this.changeFilter('o', field.fieldName, true);
								}

							}
						},
							field.name,
							renderIcon((!filters.r && (filters.o === field.fieldName)) ? 'caret-up' : 'caret-down')
						);
					} else {
						rowHeader = field.name;
						rowHeader = field.name;
					}


					if(this.isVisibleField(field)) {
						tableHeader.push(ReactDOM.td({key: field.id, style: (field.fieldType === FIELD_2_INT) ? headerStyleNum : headerStyle},
							fieldAdmin,
							rowHeader
						));
					}
				});
				tableHeader.push(ReactDOM.td({key: 'holder', style: headerStyle}, ' '));


				var additionalButtons;
				if(this.state.additionalButtons || this.props.additionalButtons) {
					additionalButtons = this.props.additionalButtons;
					if(typeof (additionalButtons) !== 'function') {
						additionalButtons = window[additionalButtons];
					}
				}

				var hideControlls = this.props.hideControlls || this.state.hideControlls || (this.props.filters && this.props.filters.hideControlls);

				var lines = data.items.map((item) => {
					return React.createElement(FormItem, {key: Math.random() + '_' + item.id, disableDrafting: this.props.disableDrafting, noPreviewButton: this.props.noPreviewButton, onClick: this.props.onItemClick ? () => {this.props.onItemClick(item)} : undefined, parentForm: this.props.parentForm, additionalButtons: additionalButtons, hideControlls: hideControlls, isLookup: this.props.isLookup, list: this, node: node, initialData: item});
				});

				body = ReactDOM.table({style: {width: '100%'}},
					ReactDOM.thead(null, ReactDOM.tr(null, tableHeader)),
					ReactDOM.tbody({className: 'list-body'}, lines)
				);
			}

		} else if(!this.props.hideIfEmpty) {

			var t1, t2;
			if(filters.s || filters.s === 0) {
				t1 = L('NO_RESULTS', filters.s);
				t2 = '';
			} else if(createButton) {
				t1 = L('PUSH_CREATE', (node.creationName || node.singleName));
				t2 = L(this.isSlave() ? 'TO_CONTINUE' : 'TO_START');
			} else {
				t1 = L('LIST_EMPTY');

			}

			var emptyIcon;
			if(node.icon) {
				emptyIcon = ReactDOM.div({style: {margin: '50px'}},
					renderIcon((node.icon || 'plus') + (this.isSlave() ? ' fa-3x' : ' fa-5x'))
				)
			}

			body = ReactDOM.div({style: {color: '#ccc', textAlign: 'center', fontSize: '140%'}},
				emptyIcon,
				t1,
				ReactDOM.br(),
				t2
			)
		}

		var paginator = [];
		var recPerPage;
		if(this.filters && this.filters.n) {
			recPerPage = this.filters.n;
		}

		var totalPages = Math.ceil(data.total / (recPerPage || node.recPerPage));
		var curPage = parseInt(filters.p | 0);

		var pageNums = {0: 1, 1: 1, 2: 1};

		for(var p = 0; p <= 2; p++) {
			pageNums[curPage + p] = 1;
			pageNums[curPage - p] = 1;
			pageNums[totalPages - 1 - p] = 1;
		}
		var prevP = -1;
		for(p in pageNums) {
			p = parseInt(p);
			if(p >= 0 && p < totalPages) {
				if((p - prevP) !== 1) {
					paginator.push(ReactDOM.span({key: 'dots' + p}, ' ... '));
				}
				prevP = p;
				paginator.push(createPageButton(this, p, p === curPage));
			}
		}

		if(paginator.length > 1) {
			paginator = ReactDOM.div({style: {paddingTop: '10px', marginLeft: 15, display: 'inline-block'}},
				paginator
			)
		} else {
			paginator = undefined;
		}

		var footer;
		var footerText = L('SHOWED_LIST', data.items.length).replace('%', data.total);

		if(this.filters.s) {
			footerText += L('SEARCH_RESULTS', this.filters.s);
		}

		if(data.items.length > 0 && data.items.length < data.total) {
			footer = ReactDOM.div({style: {marginTop: this.isSlave() ? 5 : 30, fontSize: '75%'}},
				footerText,
				paginator
			)
		} else {
			footer = undefined;
		}

		var nodeAdmin;
		if(iAdmin()) {
			nodeAdmin = React.createElement(NodeAdmin, {form: this, x: 400, y: 0});
		}

		var title;
		if(!this.props.isCompact) {
			var hdr = this.header || this.filters.formTitle;
			if(hdr) {
				title = ReactDOM.h4({style: {color: constants.BRAND_COLOR_HEADER, margin: 10}}, hdr);
			}
		}

		return ReactDOM.div({style: style, ref: 'this'},
			nodeAdmin,
			title,
			header,
			footer,
			body,
			footer
		);
	}
}
export {isPresentListRenderer};