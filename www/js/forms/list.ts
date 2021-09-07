import { R } from "../r";
import { FIELD_2_INT, FIELD_7_Nto1, PREVS_CREATE } from "../bs-utils";
import { FieldAdmin } from "../admin/field-admin";
import { NodeAdmin } from "../admin/node-admin";
import { LeftBar } from "../left-bar";
import { consoleLog, createRecord, deleteRecord, getNode, getNodeData, L, renderIcon, scrollToVisible, sp, UID, updateHashLocation } from "../utils";
import { FormFull } from "./form-full";
import { FormItem } from "./form-item";
import { BaseForm, FormProps, FormState } from "./form-mixins";
import React from "react";
import { iAdmin } from "../user";
import { RefToInput } from "../fields/field-mixins.js";
import { AdditionalButtonsRenderer } from "../fields/field-lookup-mixins.js";

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
		return R.button({ key: page, className: 'page-btn page-btn-active' },
			page + 1
		);
	}
	return R.button({
		key: page, className: 'clickable page-btn', onClick: () => {
			self.changeFilter('p', page, true);
		}
	},
		page + 1
	);
}

interface ListProps extends FormProps {
	omitHeader?: boolean;
	preventCreateButton?: boolean;
	askToSaveParentBeforeCreation?: boolean;
	hideSearch?: boolean;
	additionalButtons?: AdditionalButtonsRenderer;
	noPreviewButton?: boolean;
}

interface ListState extends FormState {
	noEditButton?: boolean;
	hideSearch?: boolean;
	additionalButtons?: AdditionalButtonsRenderer;
	hideControlls?: boolean;
	noPreviewButton?: boolean;
}

class List extends BaseForm<ListProps, ListState> {

	private searchInput: RefToInput;
	private subformsRefs: { [key: number]: FormFull };
	private currentFechingNodeId: number;
	private unmounted: boolean;
	private searchTimeout: NodeJS.Timeout;

	constructor(props) {
		super(props);
		this.filters = Object.assign({}, props.filters);
		//@ts-ignore
		this.state.node = props.node;
		//@ts-ignore
		this.state.data = props.initialData;
		this.refreshData = this.refreshData.bind(this);
		this.changeSearch = this.changeSearch.bind(this);
		this.subFormRef = this.subFormRef.bind(this);
	}

	componentDidMount() {
		this.subformsRefs = {};
		this.onShow();
	}

	UNSAFE_componentWillReceiveProps(newProps) {
		super.UNSAFE_componentWillReceiveProps(newProps);
		this.filters = $.extend({}, newProps.filters);
		this.setSearchInputValue(this.filters.s as string);
		//@ts-ignore
		this.state.node = newProps.node;
		//@ts-ignore
		this.state.data = newProps.initialData;
		this.onShow();
	}

	onShow() {
		if(!this.state.data) {
			setTimeout(() => { this.refreshData(); }, 1);
		} else if(!this.props.node) {
			getNode(this.props.nodeId).then((node) => {
				this.setState({ node });
				if(this.props.parentForm) {
					this.props.parentForm.savedNode = node;
				}
			});
		}

		if(!this.isSubForm()) {
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

	async refreshData() {
		if(!this.isSubForm()) {
			updateHashLocation(this.filters);
		}
		var nodeIdToFetch = this.props.nodeId || this.props.node.id;
		if(nodeIdToFetch !== this.currentFechingNodeId) {
			this.currentFechingNodeId = nodeIdToFetch;

			if(this.props.editable) {
				this.filters.p = '*';
			}

			let data = await getNodeData(nodeIdToFetch, undefined, this.filters, this.props.editable, this.props.isLookup, this.isCustomListRenering());

			if(this.unmounted) {
				return;
			}

			this.currentFechingNodeId = -1;
			var sorting = data.items.length && data.items[0].hasOwnProperty('order');
			if(sorting) {
				data.items.sort(sortByOrder);
			}

			if(!this.props.node) {
				const node = await getNode(this.props.nodeId);
				if(this.isSubForm()) {
					this.props.parentForm.saveNodeDataAndFilters(node, data, this.filters);
				}
				this.setState({ data, node });
				this.scrollIfNeed();
			} else {
				if(this.isSubForm()) {
					this.props.parentForm.saveNodeDataAndFilters(this.props.node, data, this.filters);
				}
				this.setState({ data });
				this.scrollIfNeed();
			}

		}
	}

	scrollIfNeed() {
		if(this.isSubForm() && this.props.parentForm.props.field.fieldType === FIELD_7_Nto1) {
			scrollToVisible(this, true);
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

	setSearchInputValue(v?: string) {
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

	getSubforms(includeDeleted?: boolean) {
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
		return (!this.props.filters.noCustomList && !this.props.isLookup && isPresentListRenderer(this.props.nodeId || this.props.node.id));
	}

	renderEditableList() {
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
							R.div({ key: UID(item), className: 'inline-editable-item' },
								React.createElement(FormFull, { ref: this.subFormRef, inlineEditable: true, editable: true, isCompact: true, filters: filters, parentForm: this.props.parentForm, isLookup: this.props.isLookup, list: this, node, initialData: item, overrideOrderData: sorting ? itemNum : -1 })
							)
						);
						var btns = [];

						btns.push(R.button({
							className: 'clickable toolbtn danger-btn', title: L('DELETE'), key: 'b' + UID(item), onClick: async () => {
								if(item.hasOwnProperty('id')) {
									//TODO: check deletion in 1toN lookup list
									await deleteRecord(item.name, node.id, 0, false, () => {
										item.__deleted_901d123f = true;
										this.forceUpdate();
									});
								}
							}
						}, renderIcon('times')));

						if(sorting) {
							var _uidM1: number = 0;
							var _uidP1: number = 0;
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

							if(_uidM1) {
								(() => {
									var uid = UID(data.items[itemNum]);
									var itemNumM1 = _itemNumM1;
									var uidM1 = _uidM1;
									btns.push(R.button({
										className: 'clickable toolbtn edit-btn', title: L('MOVE_UP'), key: 'bu' + UID(item), onClick: () => {
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
							if(_uidP1) {

								(() => {
									var uid = UID(data.items[itemNum]);
									var itemNumP1 = _itemNumP1;
									var uidP1 = _uidP1;

									btns.push(R.button({
										className: 'clickable toolbtn edit-btn', title: L('MOVE_DOWN'), key: 'bd' + UID(item), onClick: () => {
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
							R.span({ key: UID(item) + 'btns', className: 'btns' },
								btns
							)
						);
					}
				})()

			}
		}

		var nodeAdmin;
		if(iAdmin()) {
			nodeAdmin = React.createElement(NodeAdmin, { form: this, x: 400, y: 0 });
		}

		var createBtn;
		if(node.prevs & PREVS_CREATE) {
			createBtn = R.div(null,
				R.button({ title: L('ADD', (node.creationName || node.singleName)), className: 'clickable toolbtn create-btn', onClick: () => { data.items.push({}); this.forceUpdate(); } },
					renderIcon('plus')
				)
			);
		}

		return R.div(null,
			nodeAdmin,
			lines,
			createBtn
		);



	}

	render() {
		var node = this.state.node;
		var data = this.state.data;
		if(!node || !data) {
			return R.div({ className: 'field-lookup-loading-icon-container' },
				renderIcon('cog fa-spin fa-2x')
			);
		}

		if(this.props.editable) {
			return this.renderEditableList();
		} else {
			return this.renderList();
		}
	}

	renderList() {
		var node = this.state.node;
		var data = this.state.data;
		var filters = this.filters;
		var header;

		if(!this.props.omitHeader) {
			var createButton;
			if((node.prevs & PREVS_CREATE) && !this.props.preventCreateButton && !this.filters.preventCreateButton && !this.state.preventCreateButton) {
				if(this.isSubForm()) {
					createButton = R.button({
						className: 'clickable create-button', onClick: async () => {
							if(this.props.askToSaveParentBeforeCreation) {
								await this.props.parentForm.saveParentFormBeforeCreation();
								this.props.parentForm.toggleCreateDialogue();
							} else {
								this.props.parentForm.toggleCreateDialogue();
							}
						}
					},
						renderIcon('plus'), ' ' + L('CREATE') + ' ' + (node.creationName || node.singleName)
					);
				} else {
					createButton = R.button({ className: 'clickable create-button', onClick: () => { createRecord(node.id, filters); } },
						renderIcon('plus'), ' ' + L('CREATE') + ' ' + (node.creationName || node.singleName)
					);
				}
			}

			var searchPanel;

			if(!this.props.hideSearch && !this.state.hideSearch && (this.filters.s || data.items.length > 2)) {
				searchPanel = R.div({ className: 'list-search' },
					R.input({ ref: (input) => { this.searchInput = input; }, className: 'list-search-input', placeholder: L('SEARCH_LIST'), onChange: this.changeSearch, defaultValue: this.filters.s }),
					R.a({
						className: 'clickable toolbtn default-btn', onClick: (e) => {
							this.clearSearch();
							sp(e);
						}
					},
						renderIcon('times')
					)
				)

			}


			if(createButton || searchPanel) {
				header = R.div({ className: 'list-header' },
					createButton,
					searchPanel
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
						fieldAdmin = React.createElement(FieldAdmin, { field, form: this, x: 80 });
					}

					var rowHeader;
					if(field.forSearch === 1) {
						rowHeader = R.span({
							className: (filters.o === field.fieldName) ? 'clickable list-row-header-sorting' : 'clickable', onClick: () => {
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
					}


					if(this.isVisibleField(field)) {
						tableHeader.push(R.td({ key: field.id, className: (field.fieldType === FIELD_2_INT) ? 'list-row-header list-row-header-num' : 'list-row-header' },
							rowHeader,
							fieldAdmin
						));
					}
				});
				tableHeader.push(R.td({ key: 'holder', className: 'list-row-header' }, ' '));


				var additionalButtons;
				if(this.state.additionalButtons || this.props.additionalButtons) {
					additionalButtons = this.props.additionalButtons;
					if(typeof (additionalButtons) !== 'function') {
						additionalButtons = window[additionalButtons];
					}
				}

				var hideControlls = this.props.hideControlls || this.state.hideControlls || (this.props.filters && this.props.filters.hideControlls);

				var lines = data.items.map((item) => {
					return React.createElement(FormItem, { key: Math.random() + '_' + item.id, disableDrafting: this.props.disableDrafting, noPreviewButton: this.props.noPreviewButton, parentForm: this.props.parentForm, additionalButtons, hideControlls: hideControlls, isLookup: this.props.isLookup, list: this, node, initialData: item });
				});

				body = R.table({ className: 'list-table' },
					R.thead(null, R.tr(null, tableHeader)),
					R.tbody({ className: 'list-body' }, lines)
				);
			}

		} else {

			var t1, t2;
			if(filters.s || filters.s === 0) {
				t1 = L('NO_RESULTS', filters.s);
				t2 = '';
			} else if(createButton) {
				t1 = L('PUSH_CREATE', (node.creationName || node.singleName));
				t2 = L(this.isSubForm() ? 'TO_CONTINUE' : 'TO_START');
			} else {
				t1 = L('LIST_EMPTY');
			}

			var emptyIcon;
			if(node.icon) {
				emptyIcon = renderIcon((node.icon || 'plus') + ((this.isSubForm() ? ' fa-3x' : ' fa-5x') + ' list-empty-icon'))
			}

			body = R.div({ className: 'list-emty' },
				emptyIcon,
				R.div(null, t1),
				R.div(null, t2)
			)
		}

		var pages = [];
		var recPerPage;
		if(this.filters && this.filters.n) {
			recPerPage = this.filters.n;
		}

		var totalPages = Math.ceil(data.total / (recPerPage || node.recPerPage));
		var curPage = parseInt(filters.p as string) || 0;

		var pageNums = { 0: 1, 1: 1, 2: 1 };

		let p;
		for(p = 0; p <= 2; p++) {
			pageNums[curPage + p] = 1;
			pageNums[curPage - p] = 1;
			pageNums[totalPages - 1 - p] = 1;
		}
		var prevP = -1;
		for(p in pageNums) {
			p = parseInt(p);
			if(p >= 0 && p < totalPages) {
				if((p - prevP) !== 1) {
					pages.push(R.span({ key: 'dots' + p }, ' ... '));
				}
				prevP = p;
				pages.push(createPageButton(this, p, p === curPage));
			}
		}

		let paginator;
		if(pages.length > 1) {
			paginator = R.span({ className: 'list-paginator-items' },
				pages
			)
		}

		var footer;
		var paginatorText = L('SHOWED_LIST', data.items.length).replace('%', data.total);

		if(this.filters.s) {
			paginatorText += L('SEARCH_RESULTS', this.filters.s);
		}

		if(data.items.length > 0 && data.items.length < data.total) {
			footer = R.span({ className: 'list-paginator' },
				paginatorText,
				paginator
			)
		}

		var nodeAdmin;
		if(iAdmin()) {
			nodeAdmin = React.createElement(NodeAdmin, { form: this, x: 400, y: 0 });
		}

		var title;
		if(!this.props.isCompact) {
			var hdr = this.header || this.filters.formTitle;
			if(hdr) {
				title = R.h4({ className: 'form-header' }, hdr);
			}
		}

		return R.div({ className: 'list-container form-node-' + node.id },
			nodeAdmin,
			title,
			header,
			footer,
			body,
			footer
		);
	}
}
export { isPresentListRenderer, registerListRenderer, List };