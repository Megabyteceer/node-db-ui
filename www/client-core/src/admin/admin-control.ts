import { Component, h, type ComponentChild } from 'preact';
import { VIEW_MASK, type NodeDesc, type TreeItem } from '../bs-utils';
import { NEW_RECORD } from '../consts';
import { CLIENT_SIDE_FORM_EVENTS, SERVER_SIDE_FORM_EVENTS } from '../events-handle';
import type Form from '../form';
import { R } from '../r';
import { NODE_ID, NODE_TYPE, type IFieldsRecord, type INodesFilter, type INodesRecord } from '../types/generated';
import { globals } from '../types/globals';
import { getRecordClient, getRecordsClient, keepInWindow, L, reloadLocation, renderIcon, sp } from '../utils';
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

		let anyHandlerExists = '';

		const clientEventsClassName = (ev: CLIENT_SIDE_FORM_EVENTS) => {
			const ret = (node.__serverSideHandlers?.[ev] || form?._getFormEventHandler(ev)) ? ' admin-button-highlighted' : '';
			if (ret) {
				anyHandlerExists = ret;
			}
			return ret;
		};

		const eventButtonsClient = [] as ComponentChild[];
		const eventButtonsServer = [] as ComponentChild[];

		const handlers =
			[
				CLIENT_SIDE_FORM_EVENTS.onLoad,
				CLIENT_SIDE_FORM_EVENTS.onSave,
				CLIENT_SIDE_FORM_EVENTS.afterSave
			] as string[];
		if (form?.nodeDesc.storeForms) {
			handlers.push(...[
				SERVER_SIDE_FORM_EVENTS.beforeCreate,
				SERVER_SIDE_FORM_EVENTS.afterCreate,
				SERVER_SIDE_FORM_EVENTS.beforeUpdate,
				SERVER_SIDE_FORM_EVENTS.afterUpdate,
				SERVER_SIDE_FORM_EVENTS.beforeDelete,
				SERVER_SIDE_FORM_EVENTS.afterDelete

			]);
		} else {
			handlers.push(SERVER_SIDE_FORM_EVENTS.onSubmit);
		}
		handlers.forEach((eventName: string) => {
			const a = (CLIENT_SIDE_FORM_EVENTS as any)[eventName] ? eventButtonsClient : eventButtonsServer;
			const exists = clientEventsClassName(eventName as any);
			a.push(
				R.button(
					{
						className: 'clickable tool-btn admin-form-btn' + exists,
						onClick: () => {
							admin_editSource(eventName as any, node);
						},
						title: 'Edit event handler.'
					},
					renderIcon(exists ? 'pencil' : 'plus'), eventName, '...'
				));
		});

		let body;
		let info = [];

		const bodyVisible = this.state.show;

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
						if (!f.show) {
							continue;
						}
						if (f.lang) continue;

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
									R.span({ className: 'admin-form-all-fields-id' }, f.id), f.fieldName
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
							className: 'clickable tool-btn admin-form-btn admin-form-all-fields-button',
							onClick: () => {
								this.toggleAllFields();
							},
							title: 'Show full list of fields document contains.'
						},
						'all fields ',
						renderIcon('caret-down')
					),
					R.span({
						className: 'admin-event-buttons-group'
					},
					'Client',
					eventButtonsClient
					),
					R.span({
						className: 'admin-event-buttons-group admin-event-buttons-group-server'
					},
					'Server',
					eventButtonsServer
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
					}
				},
				R.b({ className: 'admin-form-header' }, node.tableName),
				' ', nodeId,
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
							onClick: this.hide
						},
						renderIcon('times')
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
					className: 'half-visible admin-form-open-btn clickable' + anyHandlerExists,
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
