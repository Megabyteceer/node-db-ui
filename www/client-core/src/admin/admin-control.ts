import React, { Component } from 'react';
import { NODE_ID, type IFieldsRecord, type INodesFilter, type INodesRecord } from '../../../../types/generated';
import type { NodeDesc } from '../bs-utils';
import { NODE_TYPE } from '../bs-utils';
import { R } from '../r';
import { CLIENT_SIDE_FORM_EVENTS, getNode, getNodeData, keepInWindow, L, reloadLocation, renderIcon, sp } from '../utils';
import { admin_editSource } from './admin-event-editor';
import { admin } from './admin-utils';
import { FieldAdmin } from './field-admin';

let showedNodeId;

/// #if DEBUG
/*
/// #endif
throw new Error("admin-control imported in release build.");
//*/
class NodeAdmin extends Component<any, any> {
	private timeout: NodeJS.Timeout;
	node: NodeDesc;

	constructor(props) {
		super(props);

		if (this.props.form) {
			this.state = {
				show: this.props.form.props.node && showedNodeId === this.props.form.props.node.id,
			};
		} else {
			this.state = {
				show: showedNodeId === this.props.menuItem.id,
			};
		}
		this.timeout = null;

		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.toggleLock = this.toggleLock.bind(this);
		this.toggleAllFields = this.toggleAllFields.bind(this);
	}

	componentDidMount() {
		if (this.props.form && !this.props.form.props.node) {
			getNode(this.props.form.props.nodeId).then((node) => {
				this.node = node;
				this.forceUpdate();
			});
		}
	}

	componentWillUnmount() {
		showedNodeId = -1;
	}

	show() {
		if (this.timeout) {
			clearTimeout(this.timeout);
			delete this.timeout;
		}
		if (!this.state.show) {
			this.setState({
				show: true,
			});
		}
	}

	hide() {
		if (this.state.show) {
			this.setState({
				show: false,
			});
		}
	}

	toggleAllFields() {
		this.setState({
			allFieldsVisible: !this.state.allFieldsVisible,
		});
	}

	toggleLock() {
		this.setState({
			locked: !this.state.locked,
		});
	}

	render() {
		let node;
		let form;
		let item;

		if (this.props.form) {
			node = this.props.form.props.node || this.node;
			form = this.props.form;
			if (!node) {
				return R.div();
			}
		} else {
			node = {};
			item = this.props.menuItem; //left-bar-item
		}

		const nodeId = node && (node.id || item.id);

		let borderOnSave;
		let borderOnAfterSave;
		let borderOnLoad;

		if (
			form &&
			form._getFormEventHandler &&
			form._getFormEventHandler(CLIENT_SIDE_FORM_EVENTS.ON_FORM_SAVE)
		) {
			borderOnSave = ' admin-button-highlighted';
		} else {
			borderOnSave = '';
		}

		if (
			form &&
			form._getFormEventHandler &&
			form._getFormEventHandler(CLIENT_SIDE_FORM_EVENTS.ON_FORM_AFTER_SAVE)
		) {
			borderOnAfterSave = ' admin-button-highlighted';
		} else {
			borderOnAfterSave = '';
		}

		if (
			form &&
			form._getFormEventHandler &&
			form._getFormEventHandler(CLIENT_SIDE_FORM_EVENTS.ON_FORM_LOAD)
		) {
			borderOnLoad = ' admin-button-highlighted';
		} else {
			borderOnLoad = '';
		}

		let body;

		const bodyVisible = this.state.show || this.state.locked;

		if (bodyVisible) {
			let buttons;
			let allFields;
			if (!item) {
				if (this.state.allFieldsVisible) {
					allFields = [];
					for (const f of node.fields) {
						if (f.lang) continue;

						allFields.push(
							R.span({
								key: f.id + 'a',
								className: 'admin-form-header',
							})
						);
						allFields.push(
							R.div(
								{
									key: f.id,
									className: 'admin-form-all-fields',
								},
								R.div(
									{
										className: 'admin-form-all-fields-name',
									},
									f.fieldName + '; (' + f.id + ')'
								),
								renderIcon(f.show & 1 ? 'eye' : 'eye-slash half-visible'),
								renderIcon(f.show & 2 ? 'eye' : 'eye-slash half-visible'),
								renderIcon(f.show & 16 ? 'eye' : 'eye-slash half-visible'),
								renderIcon(f.show & 4 ? 'eye' : 'eye-slash half-visible'),
								renderIcon(f.show & 8 ? 'eye' : 'eye-slash half-visible'),

								renderIcon(f.forSearch ? 'search-plus' : 'search half-visible'),
								React.createElement(FieldAdmin, {
									field: f,
									form: form,
									x: 370,
									zIndex: 10,
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
							title: 'Show full list of fields document contains.',
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
							title: 'Edit client side script which execute on form open.',
						},
						'onLoad...'
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn' + borderOnSave,
							onClick: () => {
								admin_editSource(CLIENT_SIDE_FORM_EVENTS.ON_FORM_SAVE, node, undefined);
							},
							title: 'Edit client side script which execute before form save.',
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
							title: 'Edit client side script which execute after form save.',
						},
						'onAfterSave...'
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							title: L('FLD_ADD'),
							onClick: () => {
								crudJs.Stage.showForm(
									NODE_ID.FIELDS,
									'new',
									{
										nodeFieldsLinker: {
											id: node.id,
											name: node.singleName,
										},
									} as IFieldsRecord,
									true,
									true,
									reloadLocation
								);
							},
						},
						renderIcon('plus')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							title: L('FLD_SHOW_ALL'),
							onClick: () => {
								if (form) {
									form.showAllDebug = !form.showAllDebug;
									form.forceUpdate();
								}
							},
						},
						renderIcon('eye')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							title: L('ADD_RATING_FLD'),
							onClick: () => {
								// TODO: implement ratings creation process
							},
						},
						renderIcon('plus'),
						renderIcon('bar-chart')
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
							},
						},
						renderIcon('plus')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							onClick: () => {
								getNodeData(NODE_ID.NODES, undefined, {
									_nodesID: item.parent,
								} as INodesFilter).then((data) => {
									(data.items as INodesRecord[]).sort((a, b) => {
										return a.prior - b.prior;
									});
									const index = data.items.findIndex((i) => i.id === item.id);
									admin.exchangeNodes(data.items[index], data.items[index + 1]);
								});
							},
							title: 'Move node down',
						},
						renderIcon('arrow-down')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							onClick: () => {
								getNodeData(NODE_ID.NODES, undefined, {
									_nodesID: item.parent,
								} as INodesFilter).then((data) => {
									(data.items as INodesRecord[]).sort((a, b) => {
										return a.prior - b.prior;
									});
									const index = data.items.findIndex((i) => i.id === item.id);
									admin.exchangeNodes(data.items[index], data.items[index - 1]);
								});
							},
							title: 'Move node up',
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
						clearTimeout(this.timeout);
						delete this.timeout;
						showedNodeId = nodeId;
					},
					onMouseLeave: () => {
						this.hide();
					},
				},
				L('NODE_SETTINGS'),
				R.b({ className: 'admin-form-header' }, node.tableName),
				R.span(null, '; (' + (node.matchName || item.name) + '); id: ' + nodeId),
				R.div(
					{
						className: 'admin-form-content',
					},
					buttons,
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							title: L('EDIT_NODE'),
							onClick: () => {
								crudJs.Stage.showForm(NODE_ID.NODES, nodeId, undefined, true, true, reloadLocation);
							},
						},
						renderIcon('pencil')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							title: L('EDIT_ACCESS'),
							onClick: () => {
								crudJs.Stage.showForm(
									NODE_ID.RIGHT_ACCESS_FORM,
									nodeId,
									undefined,
									true,
									true,
									reloadLocation
								);
							},
						},
						renderIcon('user')
					),
					R.span(
						{
							className: 'clickable admin-form-lock-btn',
							onClick: this.toggleLock,
						},
						renderIcon(this.state.locked ? 'lock' : 'unlock')
					)
				),
				allFields
			);
		}

		return R.div(
			{
				className:
					'admin-control admin-form-wrap' + (bodyVisible ? ' admin-form-wrap-visible' : ''),
				onClick: sp,
			},
			R.span(
				{
					className: 'half-visible admin-form-open-btn clickable' + (borderOnLoad || borderOnSave),
					onClick: this.show,
				},
				renderIcon('wrench')
			),
			body
		);
	}
}

function createNodeForMenuItem(item) {
	const isBasedOnDocument = item.nodeType === NODE_TYPE.DOCUMENT;
	getNodeData(NODE_ID.NODES, (isBasedOnDocument ? item.parent : item.id) as number).then((data) => {
		crudJs.Stage.showForm(
			NODE_ID.NODES,
			'new',
			{
				prior: 100000,
				_nodesId: {
					id: data.id,
					name: data.name,
				},
			} as INodesRecord,
			true,
			true,
			reloadLocation
		);
	});
}

export { createNodeForMenuItem, NodeAdmin };

