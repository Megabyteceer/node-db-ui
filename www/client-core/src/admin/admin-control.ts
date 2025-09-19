import { Component, h } from 'preact';
import { NODE_ID, NODE_TYPE, type IFieldsRecord, type INodesFilter, type INodesRecord } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import { VIEW_MASK, type NodeDesc, type TreeItem } from '../bs-utils';
import { NEW_RECORD } from '../consts';
import type Form from '../form';
import { R } from '../r';
import { CLIENT_SIDE_FORM_EVENTS, getRecordClient, getRecordsClient, keepInWindow, L, reloadLocation, renderIcon, sp } from '../utils';
import { admin_editSource } from './admin-event-editor';
import { admin } from './admin-utils';
import { FieldAdmin } from './field-admin';

let showedNodeId: NODE_ID | -1;

/// #if DEBUG
/*
/// #endif
throw new Error("admin-control imported in release build.");
// */

interface NodeAdminProps {
	form?: Form;
	menuItem?: TreeItem;
}

interface NodeAdminState {
	show?: boolean;
	allFieldsVisible?: boolean;
	locked?: boolean;
}

class NodeAdmin extends Component<NodeAdminProps, NodeAdminState> {

	node!: NodeDesc;

	constructor(props: NodeAdminProps) {
		super(props);

		if (this.props.form) {
			this.state = {
				show: showedNodeId === this.props.form.nodeId
			};
		} else {
			this.state = {
				show: showedNodeId === this.props.menuItem!.id
			};
		}

		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.toggleLock = this.toggleLock.bind(this);
		this.toggleAllFields = this.toggleAllFields.bind(this);
	}

	componentWillUnmount() {
		showedNodeId = -1;
	}

	show() {
		if (!this.state.show) {
			this.setState({
				show: true
			});
		}
	}

	hide() {
		if (this.state.show) {
			this.setState({
				show: false
			});
		}
	}

	toggleAllFields() {
		this.setState({
			allFieldsVisible: !this.state.allFieldsVisible
		});
	}

	toggleLock() {
		this.setState({
			locked: !this.state.locked
		});
	}

	render() {
		let node: NodeDesc;
		let form: Form | undefined;
		let item: TreeItem | undefined;

		if (this.props.form) {
			node = this.props.form.nodeDesc;
			form = this.props.form!;
			if (!node) {
				return R.div();
			}
		} else {
			node = {} as any;
			item = this.props.menuItem!; // left-bar-item
		}

		const nodeId = node && (node.id || item!.id);

		let borderOnSave;
		let borderOnAfterSave;
		let borderOnLoad;

		if (
			form?._getFormEventHandler(CLIENT_SIDE_FORM_EVENTS.ON_FORM_SAVE)
		) {
			borderOnSave = ' admin-button-highlighted';
		} else {
			borderOnSave = '';
		}

		if (
			form?._getFormEventHandler(CLIENT_SIDE_FORM_EVENTS.ON_FORM_AFTER_SAVE)
		) {
			borderOnAfterSave = ' admin-button-highlighted';
		} else {
			borderOnAfterSave = '';
		}

		if (
			form?._getFormEventHandler(CLIENT_SIDE_FORM_EVENTS.ON_FORM_LOAD)
		) {
			borderOnLoad = ' admin-button-highlighted';
		} else {
			borderOnLoad = '';
		}

		let body;
		let info = [];

		const bodyVisible = this.state.show || this.state.locked;

		if (bodyVisible) {

			if (form) {

				const dataToSend = form.getDataToSend('keepStatus') as KeyedMap<any>;
				const a = Object.keys(dataToSend);
				if (a.length) {
					info.push(R.div(null, 'DATA TO SEND:'));
					for (let key of a) {
						let val = dataToSend[key];
						if (typeof val === 'string' && val.length > 100) {
							val = val.substring(0, 100) + '...';
						} else if (typeof val === 'object') {
							val = JSON.stringify(val);
						}
						info.push(R.div(null, key + ': ' + val));
					}
				}
			}
			let buttons;
			let allFields;
			if (!item) {
				if (this.state.allFieldsVisible) {
					allFields = [];
					for (const f of node.fields!) {
						if (f.lang) continue;

						allFields.push(
							R.span({
								key: f.id + 'a',
								className: 'admin-form-header'
							})
						);
						allFields.push(
							R.div(
								{
									key: f.id,
									className: 'admin-form-all-fields'
								},
								R.div(
									{
										className: 'admin-form-all-fields-name'
									},
									f.fieldName + '; (' + f.id + ')'
								),
								R.span({ title: 'EDITABLE' }, renderIcon(f.show & VIEW_MASK.EDITABLE ? 'eye' : 'eye-slash half-visible')),
								R.span({ title: 'LIST' }, renderIcon(f.show & VIEW_MASK.LIST ? 'eye' : 'eye-slash half-visible')),
								R.span({ title: 'CUSTOM_LIST' }, renderIcon(f.show & VIEW_MASK.CUSTOM_LIST ? 'eye' : 'eye-slash half-visible')),
								R.span({ title: 'READONLY' }, renderIcon(f.show & VIEW_MASK.READONLY ? 'eye' : 'eye-slash half-visible')),
								R.span({ title: 'DROPDOWN_LIST' }, renderIcon(f.show & VIEW_MASK.DROPDOWN_LIST ? 'eye' : 'eye-slash half-visible')),

								renderIcon(f.forSearch ? 'search-plus' : 'search half-visible'),
								h(FieldAdmin, {
									field: f,
									form: form
								})
							)
						);
					}
				}

				buttons = R.span(
					null,
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							onClick: () => {
								this.toggleAllFields();
							},
							title: 'Show full list of fields document contains.'
						},
						'all fields ',
						renderIcon('caret-down')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn' + borderOnLoad,
							onClick: () => {
								admin_editSource(CLIENT_SIDE_FORM_EVENTS.ON_FORM_LOAD, node, undefined);
							},
							title: 'Edit client side script which execute on form open.'
						},
						'onLoad...'
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn' + borderOnSave,
							onClick: () => {
								admin_editSource(CLIENT_SIDE_FORM_EVENTS.ON_FORM_SAVE, node, undefined);
							},
							title: 'Edit client side script which execute before form save.'
						},
						'onSave...'
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn' + borderOnAfterSave,
							onClick: () => {
								admin_editSource(
									CLIENT_SIDE_FORM_EVENTS.ON_FORM_AFTER_SAVE,
									node,
									undefined,
									'saveResult: RecordSubmitResult'
								);
							},
							title: 'Edit client side script which execute after form save.'
						},
						'onAfterSave...'
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							title: L('FLD_ADD'),
							onClick: () => {
								globals.Stage.showForm(
									NODE_ID.FIELDS,
									NEW_RECORD,
									{
										nodeFieldsLinker: {
											id: node.id,
											name: node.singleName
										}
									} as IFieldsRecord,
									true,
									true,
									reloadLocation
								);
							}
						},
						renderIcon('plus')
					)
				);
			} else {
				buttons = R.span(
					null,
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							title: L('ADD_NODE'),
							onClick: () => {
								createNodeForMenuItem(item);
							}
						},
						renderIcon('plus')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							onClick: () => {
								getRecordsClient(NODE_ID.NODES, undefined, {
									_nodesID: item.parent
								} as INodesFilter).then((data) => {
									(data.items as INodesRecord[]).sort((a, b) => {
										return a.prior - b.prior;
									});
									const index = data.items.findIndex(i => i.id === item.id);
									admin.exchangeNodes(data.items[index], data.items[index + 1]);
								});
							},
							title: 'Move node down'
						},
						renderIcon('arrow-down')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							onClick: () => {
								getRecordsClient(NODE_ID.NODES, undefined, {
									_nodesID: item.parent
								} as INodesFilter).then((data) => {
									(data.items as INodesRecord[]).sort((a, b) => {
										return a.prior - b.prior;
									});
									const index = data.items.findIndex(i => i.id === item.id);
									admin.exchangeNodes(data.items[index], data.items[index - 1]);
								});
							},
							title: 'Move node up'
						},
						renderIcon('arrow-up')
					)
				);
			}

			body = R.div(
				{
					ref: keepInWindow,
					className: 'admin-form-body',
					onClick: () => {
						showedNodeId = nodeId;
					},
					onMouseLeave: () => {
						this.hide();
					}
				},
				L('NODE_SETTINGS'),
				R.b({ className: 'admin-form-header' }, node.tableName),
				R.span(null, '; (' + (node.matchName || item!.name) + '); id: ' + nodeId),
				R.div(
					{
						className: 'admin-form-content'
					},
					buttons,
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							title: L('EDIT_NODE'),
							onClick: () => {
								globals.Stage.showForm(NODE_ID.NODES, nodeId, undefined, true, true, reloadLocation);
							}
						},
						renderIcon('pencil')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							title: L('EDIT_ACCESS'),
							onClick: () => {
								globals.Stage.showForm(
									NODE_ID.ADMIN_ROLE_PRIVILEGES_FORM,
									nodeId,
									undefined,
									true,
									true,
									reloadLocation
								);
							}
						},
						renderIcon('user')
					),
					R.span(
						{
							className: 'clickable admin-form-lock-btn',
							onClick: this.toggleLock
						},
						renderIcon(this.state.locked ? 'lock' : 'unlock')
					)
				),
				allFields,
				info
			);
		}

		return R.div(
			{
				className:
					'admin-control admin-form-wrap' + (bodyVisible ? ' admin-form-wrap-visible' : ''),
				onClick: sp
			},
			R.span(
				{
					className: 'half-visible admin-form-open-btn clickable' + (borderOnLoad || borderOnSave),
					onClick: this.show
				},
				renderIcon('wrench')
			),
			body
		);
	}
}

function createNodeForMenuItem(item: TreeItem) {
	const isBasedOnDocument = item.nodeType === NODE_TYPE.DOCUMENT;
	getRecordClient(NODE_ID.NODES, (isBasedOnDocument ? item.parent : item.id) as number).then((data) => {
		globals.Stage.showForm(
			NODE_ID.NODES,
			NEW_RECORD,
			{
				prior: 100000,
				_nodesId: {
					id: data.id,
					name: data.name
				}
			} as INodesRecord,
			true,
			true,
			reloadLocation
		);
	});
}

export { createNodeForMenuItem, NodeAdmin };
