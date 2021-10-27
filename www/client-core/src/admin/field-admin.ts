import { R } from "../r";
import { Component } from "react";
import { CLIENT_SIDE_FORM_EVENTS, getNodeData, keepInWindow, L, reloadLocation, renderIcon, sp } from "../utils";
import { admin_editSource } from "./admin-event-editor";
import { admin } from "./admin-utils";
import { FieldDesc, NodeDesc, NODE_ID } from "../bs-utils";
import { List } from "../forms/list";

var showedFieldId;

class FieldAdmin extends Component<any, any> {

	private timeout: NodeJS.Timeout;

	constructor(props) {
		super(props);
		this.state = {
			show: showedFieldId === this.props.field.id
		};
		this.onShow = this.onShow.bind(this);
		this.hide = this.hide.bind(this);
		this.toggleLock = this.toggleLock.bind(this);
		this.timeout = null;
	}

	onShow() {
		if(this.timeout) {
			clearTimeout(this.timeout);
			delete (this.timeout);
		}
		if(!this.state.show) {

			this.setState({
				show: true
			});
		}
	}

	hide() {
		if(this.state.show) {
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

		var field: FieldDesc = this.props.field;
		var node: NodeDesc = field.node;
		var form = this.props.form;
		var body;
		var border;

		if(form._getFieldEventHandler && form._getFieldEventHandler(field)) {
			border = " admin-button-highlighted";
		} else {
			border = "";
		}

		var bodyVisible = this.state.show || this.state.locked;

		if(bodyVisible) {
			var extendedInfo;
			if(form.fieldsRefs && form.fieldsRefs[field.fieldName] && form.fieldsRefs[field.fieldName].fieldRef && form.getField(field.fieldName).fieldRef.state.filters) {
				extendedInfo = R.div(null,
					'filters:',
					R.input({
						defaultValue: JSON.stringify(form.getField(field.fieldName).fieldRef.state.filters)
					})
				);
			}
			let isList = this.props.form instanceof List;

			body = R.div({
				ref: keepInWindow,
				className: "admin-form-body",
				onClick: () => {
					clearTimeout(this.timeout);
					delete (this.timeout);
					showedFieldId = this.props.field.id
				},
				onMouseLeave: () => {
					this.hide()
				}
			},
				L('FLD_SETTINGS'),
				R.b({ className: "admin-form-header" },
					field.fieldName
				),
				R.div(null,
					'type: ' + field.fieldType + '; id: ' + field.id + '; len:' + field.maxLength
				),
				R.div({
					className: "admin-form-content"
				},
					R.button({
						className: 'clickable tool-btn admin-form-btn' + border,
						onClick: () => {

							admin_editSource(CLIENT_SIDE_FORM_EVENTS.ON_FIELD_CHANGE, node, field);

						},
						title: "Edit client side script which execute on field value change."
					},
						'onChange...'
					),
					R.button({
						className: 'clickable tool-btn admin-form-btn',
						onClick: () => {
							var i = field.index;
							if(i > 0) {
								admin.moveField(i, form, node, -1).then(reloadLocation);
							}
						},
						title: "Increase field priority"
					},
						renderIcon(isList ? 'arrow-left' : 'arrow-up')
					),
					R.button({
						className: 'clickable tool-btn admin-form-btn',
						onClick: () => {
							var i = field.index;
							if(i < (node.fields.length - 1)) {
								admin.moveField(i, form, node, + 1).then(reloadLocation);
							}
						},
						title: "Decrease field priority"
					},
						renderIcon(isList ? 'arrow-right' : 'arrow-down')
					),
					R.button({
						className: 'clickable tool-btn admin-form-btn',
						onClick: () => {

							getNodeData(6, field.id).then((data) => {
								window.crudJs.Stage.showForm(NODE_ID.FIELDS, 'new', {
									prior: data.prior,
									node_fields_linker: {
										id: node.id,
										name: node.singleName
									}
								}, true, true, reloadLocation);
							});
						},
						title: "Add new field"
					},
						renderIcon('plus')
					),
					R.button({
						onClick: () => {
							window.crudJs.Stage.showForm(NODE_ID.FIELDS, field.id, undefined, true, true, reloadLocation);
						},
						className: 'clickable tool-btn admin-form-btn',
						title: "Edit field properties"
					},
						renderIcon('pencil')
					),
					R.span({
						className: 'clickable admin-form-lock-btn',
						onClick: this.toggleLock
					},
						renderIcon(this.state.locked ? 'lock' : 'unlock')

					)
				),
				extendedInfo
			);
		}

		return R.span({
			className: 'admin-control admin-control-field admin-form-wrap ' + (bodyVisible ? ' admin-form-wrap-visible' : ''),
			onClick: sp
		},
			R.span({
				className: 'half-visible admin-form-open-btn clickable' + border,
				onClick: this.onShow
			},
				renderIcon('wrench')
			),
			body
		)
	}
}

export { FieldAdmin };