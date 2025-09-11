import type { NodeDesc, RecordsData } from '../bs-utils';
import { PRIVILEGES_MASK, VIEW_MASK } from '../bs-utils';
import { R } from '../r';

/// #if DEBUG
import { NodeAdmin } from '../admin/admin-control';
import { FieldAdmin } from '../admin/field-admin';
/// #endif

import { h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import { assert } from '../assert';
import { Select } from '../components/select';
import type { RefToInput } from '../fields/base-field';
import type { AdditionalButtonsRenderer } from '../fields/field-lookup-mixins';
import { LeftBar } from '../left-bar';
import { iAdmin } from '../user';
import { deleteRecord, getListRenderer, getNode, getRecordsClient, isPresentListRenderer, isRecordRestrictedForDeletion, L, renderIcon, scrollToVisible, sp, UID, updateHashLocation } from '../utils';
import type { FormProps, FormState } from './base-form';
import { BaseForm } from './base-form';
import { FormFull } from './form-full';
import { FormListItem } from './form-list-item';

const sortByOrder = (a, b) => {
	return a.order - b.order;
};

function createPageButton(self, page, isActive) {
	if (isActive) {
		return R.button({ key: page, className: 'page-btn page-btn-active' }, page + 1);
	}
	return R.button(
		{
			key: page,
			className: 'clickable page-btn',
			onClick: () => {
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

interface ListState extends Omit<FormState, 'data'> {
	noEditButton?: boolean;
	hideSearch?: boolean;
	additionalButtons?: AdditionalButtonsRenderer;
	hideControls?: boolean;
	noPreviewButton?: boolean;
	data: RecordsData;
	node: NodeDesc;
	viewMask: VIEW_MASK;
}

class List extends BaseForm<ListProps, ListState> {
	private searchInput: RefToInput;
	private subFormsRefs: { [key: number]: FormFull<string> };
	private currentFetchingNodeId: number;
	private unmounted: boolean;
	private searchTimeout: NodeJS.Timeout;

	constructor(props) {
		assert(props.node || typeof props.nodeId === 'number', 'number expected');
		super(props);
		this.filters = Object.assign({}, props.filters);

		this.state = {
			node: props.node,
			data: props.initialData,
			viewMask: this.props.viewMask || (this.props.isLookup ? VIEW_MASK.DROPDOWN_LIST : VIEW_MASK.LIST)
		};
		this.refreshData = this.refreshData.bind(this);
		this.changeSearch = this.changeSearch.bind(this);
		this.subFormRef = this.subFormRef.bind(this);
	}

	componentDidMount() {
		this.subFormsRefs = {};
		this.onShow();
	}

	changeFilter(name: string, v?: any, refresh?: boolean) {
		if (name === 'tab') {
			this.callOnTabShowEvent(v);
		}

		const p = this.filters[name];

		if (p !== 0 && v !== 0) {
			if (!p && !v) return;
		}

		if (p !== v) {
			if (typeof v === 'undefined') {
				delete this.filters[name];
				delete this.filters[name];
			} else {
				this.filters[name] = v;
				this.filters[name] = v;
			}
			if (refresh) {
				this.refreshData();
			}
			return true;
		}
		return false;
	}

	onShow() {
		if (!this.state.data) {
			setTimeout(() => {
				this.refreshData();
			}, 1);
		} else if (!this.state.node) {
			getNode(this.props.nodeId).then((node) => {
				this.setState({ node });
			});
		}

		LeftBar.refreshLeftBarActive();
	}

	isFieldVisibleByFormViewMask(field) {
		return field.show & this.state.viewMask;
	}

	async refreshData() {
		if (!this.isSubForm()) {
			updateHashLocation();
		}
		const nodeIdToFetch = this.props.nodeId || this.props.node.id;
		if (nodeIdToFetch !== this.currentFetchingNodeId) {
			this.currentFetchingNodeId = nodeIdToFetch;

			if (this.props.editable) {
				this.filters.p = '*';
			}

			// TODO: Понять почему рефреш листа дает другой вьюмаск. this.state.viewMask отличается от того что в кастом вью
			const data = await getRecordsClient(
				nodeIdToFetch,
				undefined,
				this.filters,
				this.props.editable,
				this.state.viewMask,
				this.isCustomListRendering()
			);

			if (this.unmounted) {
				return;
			}

			if (!data.items) {
				data.items = [];
				data.total = 0;
			}

			this.currentFetchingNodeId = -1;
			const sorting = data.items.length && data.items[0].hasOwnProperty('order');
			if (sorting) {
				data.items.sort(sortByOrder);
			}

			let node = this.props.node;
			if (!node) {
				node = await getNode(this.props.nodeId);
			}
			this.setState({ data, node });
		}
	}

	scrollIfNeed() {
		if (this.isSubForm() && this.props.parentForm.props.field.fieldType === FIELD_TYPE.LOOKUP) {
			scrollToVisible(this, true);
		}
	}

	changeSearch(event) {
		const val = event.target.value;
		this.clearSearchInterval();
		this.searchTimeout = setTimeout(() => {
			delete this.searchTimeout;
			if (this.changeFilter('s', val)) {
				if (this.filters.p !== '*') {
					this.changeFilter('p');
				}
				this.refreshData();
			}
		}, 500);
	}

	clearSearchInterval() {
		if (this.hasOwnProperty('searchTimeout')) {
			clearTimeout(this.searchTimeout);
		}
	}

	componentWillUnmount() {
		this.unmounted = true;
		this.clearSearchInterval();
	}

	setSearchInputValue(v?: string) {
		if (this.searchInput) {
			if (!v) {
				v = '';
			}
			this.searchInput.value = v;
			this.clearSearchInterval();
		}
	}

	clearSearch() {
		this.setSearchInputValue();
		if (this.changeFilter('s')) {
			if (this.filters.p !== '*') {
				this.changeFilter('p');
			}
			this.refreshData();
		}
	}

	subFormRef(ref, itemNum) {
		this.subFormsRefs[itemNum] = ref;
	}

	getSubForms(): FormFull<string>[] {
		const ret = [];
		for (const k in this.subFormsRefs) {
			if (this.subFormsRefs.hasOwnProperty(k)) {
				const f = this.subFormsRefs[k];
				if (f) {
					ret.push(f);
				}
			}
		}
		return ret;
	}

	isCustomListRendering() {
		return (
			!this.props.filters.noCustomList &&
			!this.props.isLookup &&
			isPresentListRenderer(this.props.nodeId || this.props.node.id)
		);
	}

	renderEditableList() {
		const node = this.state.node;
		const data = this.state.data;
		const filters = this.filters;
		const lines = [];
		if (data.items.length > 0) {
			const sorting = data.items[0].hasOwnProperty('order');
			for (let i = 0; i < data.items.length; i++) {
				(() => {
					const itemNum = i;
					const item = data.items[i];
					const isRestricted = isRecordRestrictedForDeletion(node.id, item.id);
					if (!item.__deleted_901d123f) {
						const buttons = [];

						buttons.push(
							R.button(
								{
									className: isRestricted
										? 'clickable tool-btn danger-btn restricted'
										: 'clickable tool-btn danger-btn',
									title: L('DELETE'),
									key: 'b' + UID(item),
									onClick: async () => {
										await deleteRecord(item.name, node.id, 0, false, () => {
											item.__deleted_901d123f = true;
											this.forceUpdate();
										});
									}
								},
								renderIcon('times')
							)
						);

						if (sorting) {
							let uidM1: number;
							let uidP1: number;
							let itemNumM1;
							let itemNumP1;
							for (let j = itemNum - 1; j >= 0; j--) {
								if (!data.items[j].__deleted_901d123f) {
									itemNumM1 = j;
									uidM1 = j;
									break;
								}
							}

							for (let j = itemNum + 1; j < data.items.length; j++) {
								if (!data.items[j].__deleted_901d123f) {
									itemNumP1 = j;
									uidP1 = j;
									break;
								}
							}

							if (typeof uidM1 === 'number') {
								(() => {
									buttons.push(
										R.button(
											{
												className: 'clickable tool-btn edit-btn',
												title: L('MOVE_UP'),
												key: 'bu' + UID(item),
												onClick: () => {
													const t = data.items[itemNum];
													data.items[itemNum] = data.items[itemNumM1];
													data.items[itemNumM1] = t;
													this.subFormsRefs[itemNum].setFieldValue('order', itemNumM1);
													this.subFormsRefs[itemNum].saveForm();
													this.subFormsRefs[uidM1].setFieldValue('order', itemNum);
													this.subFormsRefs[uidM1].saveForm();
													this.forceUpdate();
												}
											},
											renderIcon('arrow-up')
										)
									);
								})();
							}
							if (uidP1) {
								(() => {
									buttons.push(
										R.button(
											{
												className: 'clickable tool-btn edit-btn',
												title: L('MOVE_DOWN'),
												key: 'bd' + UID(item),
												onClick: () => {
													const t = data.items[itemNum];
													data.items[itemNum] = data.items[itemNumP1];
													data.items[itemNumP1] = t;

													this.subFormsRefs[itemNum].setFieldValue('order', itemNumP1);
													this.subFormsRefs[itemNum].saveForm();
													this.subFormsRefs[uidP1].setFieldValue('order', itemNum);
													this.subFormsRefs[uidP1].saveForm();
													this.forceUpdate();
												}
											},
											renderIcon('arrow-down')
										)
									);
								})();
							}
						}

						lines.push(
							R.div(
								{
									key: UID(item),
									className: 'inline-editable-item inline-editable-item-rec-id-' + item.id
								},
								h(FormFull, {
									ref: (ref) => {
										this.subFormRef(ref, itemNum);
									},
									inlineEditable: true,
									editable: true,
									isCompact: true,
									filters: filters,
									parentForm: this.props.parentForm,
									isLookup: this.props.isLookup,
									list: this,
									node,
									initialData: item,
									overrideOrderData: sorting ? itemNum : -1
								}),
								R.span({ key: UID(item) + 'buttons', className: 'buttons' }, buttons)
							)
						);
					}
				})();
			}
		}
		/// #if DEBUG
		let nodeAdmin;
		if (iAdmin()) {
			nodeAdmin = h(NodeAdmin, { form: this });
		}
		/// #endif

		let createBtn;
		if (node.privileges & PRIVILEGES_MASK.CREATE) {
			createBtn = R.div(
				null,
				R.button(
					{
						title: L('ADD', node.creationName || node.singleName),
						className: 'clickable tool-btn create-btn',
						onClick: () => {
							data.items.push({});
							this.forceUpdate();
						}
					},
					renderIcon('plus')
				)
			);
		}

		return R.div(
			{ className: 'editable-list editable-list-node-' + node.id },
			/// #if DEBUG
			nodeAdmin,
			/// #endif
			lines,
			createBtn
		);
	}

	render() {
		const node = this.state.node;
		const data = this.state.data;
		if (!node || !data) {
			return R.div(
				{ className: 'field-lookup-loading-icon-container' },
				renderIcon('cog fa-spin fa-2x')
			);
		}

		if (this.props.editable) {
			return this.renderEditableList();
		} else {
			return this.renderList();
		}
	}

	renderList() {
		const node = this.state.node;
		const data = this.state.data;
		const filters = this.filters;
		let header;
		let createButton;

		if (!this.props.omitHeader) {

			if (
				node.privileges & PRIVILEGES_MASK.CREATE &&
				!this.props.preventCreateButton &&
				!this.filters.preventCreateButton &&
				!this.state.preventCreateButton
			) {
				if (this.isSubForm()) {
					createButton = R.button(
						{
							className: 'clickable create-button',
							onClick: async () => {
								if (this.props.askToSaveParentBeforeCreation) {
									await this.props.parentForm.saveParentFormBeforeCreation();
								}
								this.props.parentForm.toggleCreateDialogue('new');
							}
						},
						renderIcon('plus'),
						' ' + L('CREATE') + ' ' + (node.creationName || node.singleName)
					);
				} else {
					createButton = R.button(
						{
							className: 'clickable create-button',
							onClick: () => {
								globals.Stage.showForm(node.id, 'new', filters, true);
							}
						},
						renderIcon('plus'),
						' ' + L('CREATE') + ' ' + (node.creationName || node.singleName)
					);
				}
			}

			let searchPanel;

			if (
				!this.props.hideSearch &&
				!this.state.hideSearch &&
				(this.filters.s || data.items.length > 2)
			) {
				searchPanel = R.div(
					{ className: 'list-search' },
					R.input({
						ref: (input) => {
							this.searchInput = input;
						},
						className: 'list-search-input',
						placeholder: L('SEARCH_LIST'),
						onInput: this.changeSearch,
						defaultValue: this.filters.s
					}),
					this.filters?.s ? R.a(
						{
							className: 'clickable tool-btn default-btn search-clear-btn',
							onClick: (e) => {
								this.clearSearch();
								sp(e);
							}
						},
						R.h2(null, '×')
					) : undefined
				);
			}

			let filtersPanel;
			if (node.filtersList && node.filtersList.length > 1) {
				const options = node.filtersList;
				filtersPanel = R.div(
					{
						className: 'filter-select'
					},
					h(Select, {
						options,
						defaultValue: node.defaultFilterId
							? node.filters[this.filters.filterId || node.defaultFilterId.id].name
							: undefined,
						onInput: (val) => {
							this.changeFilter('filterId', parseInt(val), true);
						}
					})
				);
			}

			if (createButton || searchPanel || filtersPanel) {
				header = R.div(
					{ className: 'list-header' },
					createButton || R.span(),
					R.div({ className: 'list-header-right-area' }, searchPanel, filtersPanel)
				);
			}
		}

		let body;
		if (data.total > 0 || this.isCustomListRendering()) {
			if (this.isCustomListRendering()) {
				body = getListRenderer(node.id)(node, this.state.data.items, this.refreshData);
			}
			if (!body) {
				const tableHeader = [];
				node.fields.some((field) => {
					/// #if DEBUG
					let fieldAdmin;
					if (iAdmin()) {
						fieldAdmin = h(FieldAdmin, { field, form: this });
					}
					/// #endif

					let rowHeader;
					if (field.forSearch === 1) {
						rowHeader = R.span(
							{
								className:
									filters.o === field.id ? 'clickable list-row-header-sorting' : 'clickable',
								onClick: () => {
									if (filters.o === field.id) {
										this.changeFilter('r', filters.r ? undefined : 1, true);
									} else {
										this.changeFilter('o', field.id, true);
									}
								}
							},
							renderIcon(field.icon),
							field.name,
							renderIcon(!filters.r && filters.o === field.id ? 'caret-up' : 'caret-down')
						);
					} else {
						rowHeader = R.span(null, renderIcon(field.icon), field.name);
					}

					if (this.isFieldVisibleByFormViewMask(field)) {
						tableHeader.push(
							R.td(
								{
									key: field.id,
									className:
										field.fieldType === FIELD_TYPE.NUMBER
											? 'list-row-header list-row-header-num'
											: 'list-row-header'
								},
								rowHeader,
								/// #if DEBUG
								fieldAdmin
								/// #endif
							)
						);
					}
				});
				tableHeader.push(R.td({ key: 'holder', className: 'list-row-header' }, ' '));

				const additionalButtons =
					this.state.additionalButtons || this.props.additionalButtons || undefined;

				const hideControls =
					this.props.hideControls ||
					this.state.hideControls;

				const lines = data.items.map((item) => {
					return h(FormListItem, {
						key: Math.random() + '_' + item.id,
						disableDrafting: this.props.disableDrafting,
						noPreviewButton: this.props.noPreviewButton,
						viewMask: this.state.viewMask,
						parentForm: this.props.parentForm,
						additionalButtons,
						hideControls: hideControls,
						isLookup: this.props.isLookup,
						list: this,
						node,
						initialData: item
					});
				});

				body = R.table(
					{ className: 'list-table' },
					R.thead(null, R.tr(null, tableHeader)),
					R.tbody({ className: 'list-body' }, lines)
				);
			}
		} else if (!this.props.isLookup) {
			let t1, t2;
			if (filters.s) {
				t1 = L('NO_RESULTS', filters.s);
				t2 = '';
			} else if (createButton) {
				t1 = L('PUSH_CREATE', node.creationName || node.singleName);
				t2 = L(this.isSubForm() ? 'TO_CONTINUE' : 'TO_START');
			} else {
				t1 = L('LIST_EMPTY');
			}

			let emptyIcon;
			if (node.icon) {
				emptyIcon = renderIcon(
					(node.icon || 'plus') + ((this.isSubForm() ? ' fa-3x' : ' fa-5x') + ' list-empty-icon')
				);
			}

			body = R.div({ className: 'list-empty' }, emptyIcon, R.div(null, t1), R.div(null, t2));
		}

		const pages = [];
		let recPerPage;
		if (this.filters && this.filters.n) {
			recPerPage = this.filters.n;
		}

		const totalPages = Math.ceil(data.total / (recPerPage || node.recPerPage));
		const curPage = parseInt(filters.p as string) || 0;

		const pageNumbers = { 0: 1, 1: 1, 2: 1 };

		let p;
		for (p = 0; p <= 2; p++) {
			pageNumbers[curPage + p] = 1;
			pageNumbers[curPage - p] = 1;
			pageNumbers[totalPages - 1 - p] = 1;
		}
		let prevP = -1;
		for (p in pageNumbers) {
			p = parseInt(p);
			if (p >= 0 && p < totalPages) {
				if (p - prevP !== 1) {
					pages.push(R.span({ key: 'dots' + p }, ' ... '));
				}
				prevP = p;
				pages.push(createPageButton(this, p, p === curPage));
			}
		}

		let paginator;
		if (pages.length > 1) {
			paginator = R.span({ className: 'list-paginator-items' }, pages);
		}

		let footer;
		let paginatorText = L('SHOWED_LIST', data.items.length).replace('%', data.total);

		if (this.filters.s) {
			paginatorText += L('SEARCH_RESULTS', this.filters.s);
		}

		if (data.items.length > 0) {
			if (data.items.length < data.total) {
				footer = R.span({ className: 'list-paginator' }, paginatorText, paginator);
			} else {
				footer = R.span({ className: 'list-paginator' }, L('TOTAL_IN_LIST', data.items.length));
			}
		}
		/// #if DEBUG
		let nodeAdmin;
		if (iAdmin()) {
			nodeAdmin = h(NodeAdmin, { form: this });
		}
		/// #endif

		let title;
		if (!this.props.isCompact) {
			const hdr = this.header || this.filters.formTitle;
			if (hdr) {
				title = R.h4({ className: 'form-header' }, hdr);
			}
		}

		return R.div(
			{ className: 'form list-container form-node-' + node.id },
			/// #if DEBUG
			nodeAdmin,
			/// #endif
			title,
			header,
			footer,
			body,
			data.items.length > 5 ? footer : undefined
		);
	}
}
export { List };
