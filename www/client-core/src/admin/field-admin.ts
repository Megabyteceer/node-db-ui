import type { FieldDesc, NodeDesc } from '../bs-utils';

import { Component, type ComponentChild } from 'preact';
import { FIELD_TYPE, NODE_ID, type FIELD_ID, type IFieldsRecord } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import type Form from '../form';

import { R } from '../r';
import { CLIENT_SIDE_FORM_EVENTS, getRecordClient, keepInWindow, L, reloadLocation, renderIcon, sp } from '../utils';
import { admin_editSource } from './admin-event-editor';
import { admin } from './admin-utils';

let showedFieldId: FIELD_ID;

/// #if DEBUG
/*
/// #endif
throw new Error("field-admin imported in release build.");
// */

interface FieldAdminState {
	show?: boolean;
	locked?: boolean;
}

interface FieldAdminProps {
	field: FieldDesc;
	form?: Form;
}

class FieldAdmin extends Component<FieldAdminProps, FieldAdminState> {

	constructor(props: FieldAdminProps) {
		super(props);
		this.state = {
			show: showedFieldId === this.props.field.id
		};
		this.onShow = this.onShow.bind(this);
		this.hide = this.hide.bind(this);
		this.toggleLock = this.toggleLock.bind(this);
	}

	onShow() {
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

	toggleLock() {
		this.setState({
			locked: !this.state.locked
		});
	}

	render() {
		const field: FieldDesc = this.props.field;
		const node: NodeDesc = field.node!;
		const form = this.props.form!;
		let body;
		let border;

		if (form._getFieldEventHandlers(field)) {
			border = ' admin-button-highlighted';
		} else {
			border = '';
		}

		const bodyVisible = this.state.show || this.state.locked;

		if (bodyVisible) {
			let extendedInfo: ComponentChild;
			if (
				form.hasField(field.fieldName) && form.getField(field.fieldName).fieldFilters
			) {
				extendedInfo = R.div(
					null,
					'filters:',
					R.input({
						defaultValue: JSON.stringify(form.getField(field.fieldName).fieldFilters)
					})
				);
			}
			const isList = this.props.form?.isList;

			body = R.div(
				{
					ref: keepInWindow,
					className: 'admin-form-body',
					onClick: () => {
						showedFieldId = field.id;
					},
					onMouseLeave: () => {
						this.hide();
					}
				},
				L('FLD_SETTINGS'),
				R.b({ className: 'admin-form-header' }, field.fieldName),
				R.div(null, 'type: ' + FIELD_TYPE[field.fieldType] + '; id: ' + field.id + '; len:' + field.maxLength),
				R.div(
					{
						className: 'admin-form-content'
					},
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn' + border,
							onClick: () => {
								admin_editSource(CLIENT_SIDE_FORM_EVENTS.ON_FIELD_CHANGE, node, field);
							},
							title: 'Edit client side script which execute on field value change.'
						},
						'onChange...'
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							onClick: () => {
								const i = field.index!;
								if (i > 0) {
									admin.moveField(i, form, node, -1).then(reloadLocation);
								}
							},
							title: 'Increase field priority'
						},
						renderIcon(isList ? 'arrow-left' : 'arrow-up')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							onClick: () => {
								const i = field.index!;
								if (i < node.fields!.length - 1) {
									admin.moveField(i, form, node, +1).then(reloadLocation);
								}
							},
							title: 'Decrease field priority'
						},
						renderIcon(isList ? 'arrow-right' : 'arrow-down')
					),
					R.button(
						{
							className: 'clickable tool-btn admin-form-btn',
							onClick: () => {
								getRecordClient(NODE_ID.FIELDS, field.id).then((data) => {
									globals.Stage.showForm(
										NODE_ID.FIELDS,
										'new',
										{
											prior: data.prior,
											nodeFieldsLinker: {
												id: node.id,
												name: node.singleName
											}
										} as IFieldsRecord,
										true,
										true,
										reloadLocation
									);
								});
							},
							title: 'Add new field'
						},
						renderIcon('plus')
					),
					R.button(
						{
							onClick: () => {
								globals.Stage.showForm(
									NODE_ID.FIELDS,
									field.id,
									undefined,
									true,
									true,
									reloadLocation
								);
							},
							className: 'clickable tool-btn admin-form-btn',
							title: 'Edit field properties'
						},
						renderIcon('pencil')
					),
					R.span(
						{
							className: 'clickable admin-form-lock-btn',
							onClick: this.toggleLock
						},
						renderIcon(this.state.locked ? 'lock' : 'unlock')
					)
				),
				extendedInfo
			);
		}

		return R.span(
			{
				className:
					'admin-control admin-control-field admin-form-wrap' +
					(bodyVisible ? ' admin-form-wrap-visible' : ''),
				onClick: sp
			},
			R.span(
				{
					className: 'half-visible admin-field-open-btn clickable' + border,
					onClick: this.onShow
				},
				renderIcon('wrench')
			),
			body
		);
	}
}

export { FieldAdmin };
