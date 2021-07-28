import FieldWrap from "../fields/field-wrap.js";
import {deleteRecord, draftRecord, L, loactionToHash, publishRecord, renderIcon, sp} from "../utils.js";
import BaseForm from "./form-mixins.js";

var rowStyle = {
	borderBottom: '1px solid #ddd',
	padding: '0 15px',
	verticalAlign: 'middle',
	overflow: 'hidden',
	whiteSpace: 'normal'
}

var rowStyleNoWrap = {
	borderBottom: '1px solid #ddd',
	padding: '0 15px',
	whiteSpace: 'nowrap',
	verticalAlign: 'middle',
	overflow: 'hidden'
}
var rowStyleNum = {
	textAlign: 'right',
	borderBottom: '1px solid #ddd',
	padding: '0 15px',
	whiteSpace: 'nowrap',
	verticalAlign: 'middle',
	overflow: 'hidden'
}


const publishClick = (draft, node, data) => {
	if(draft) {
		return draftRecord(node.id, data.id);
	} else {
		return publishRecord(node.id, data.id);
	}
}

const renderItemsButtons = (node, data, refreshFunction, formItem, editButtonFilters) => {
	if(formItem && formItem.props.isLookup) {
		if(data.hasOwnProperty('isE')) {

			buttons = [
				R.button({
					key: 2, style: {background: window.constants.EDIT_COLOR}, className: 'clickable clickable-edit toolbtn', title: L('EDIT'), onMouseDown: (e) => {
						sp(e);
						formItem.props.parentForm.toggleCreateDialogue(data.id)
					}
				},
					renderIcon('pencil')
				)
			];

		}
	} else {

		var itemName;
		if(node.draftable && (data.status !== 1)) {
			itemName = ' ' + L('TEMPLATE');
		} else {
			itemName = '';
		}

		var buttons = [];
		if(data.hasOwnProperty('isP') && (!formItem || !formItem.props.disableDrafting)) {
			if(data.status === 1) {
				buttons.push(
					R.button({key: 1, style: {background: window.constants.PUBLISH_COLOR}, className: 'clickable clickable-edit toolbtn', title: L('UNPUBLISH'), onClick: () => {publishClick(true, node, data).then(refreshFunction)}},
						renderIcon('eye')
					)
				)
			} else {
				buttons.push(
					R.button({key: 1, style: {background: window.constants.UNPUBLISH_COLOR}, className: 'clickable clickable-del toolbtn', title: L('PUBLISH'), onClick: () => {publishClick(false, node, data).then(refreshFunction)}},
						renderIcon('eye-slash')
					)
				)
			}
		}
		if(editButtonFilters != 'noed') {
			if(data.hasOwnProperty('isE')) {
				if(!formItem || !formItem.props.list || !formItem.props.list.state.noEditButton) {
					buttons.push(
						R.a({
							key: 2, href: loactionToHash(node.id, data.id, editButtonFilters, true), onClick: (e) => {
								if(formItem && formItem.props.parentForm) {
									sp(e);
									formItem.props.parentForm.toggleCreateDialogue(data.id)
								}
							}
						},
							R.button({style: {background: window.constants.EDIT_COLOR}, className: 'clickable clickable-edit toolbtn', title: L('EDIT', itemName)},
								renderIcon('pencil')
							)
						)
					)
				}

			} else if(!formItem || !formItem.props.list || !(formItem.props.list.state.noPreviewButton || formItem.props.list.props.noPreviewButton)) {
				buttons.push(
					R.a({key: 2, href: loactionToHash(node.id, data.id, undefined)},
						R.button({style: {background: '#00a5bf'}, className: 'clickable toolbtn', title: L('DETAILS') + itemName},
							renderIcon('search')
						)
					)
				)

			}
		}
		if(data.hasOwnProperty('isD')) {
			buttons.push(
				R.button({
					key: 3, style: {background: window.constants.DELETE_COLOR}, className: 'clickable clickable-del toolbtn', title: L('DELETE') + itemName, onClick: async () => {
						await deleteRecord(data.name, node.id, data.id);
						if(formItem && formItem.props.parentForm) {
							formItem.props.parentForm.valueChoosed();
						} else {
							refreshFunction();
						}
					}
				},
					renderIcon('times')
				)
			)

		}
	}
	return buttons;
}

export default class FormItem extends BaseForm {

	isVisibleField(field) {
		if(this.props.isLookup) {
			return field.show & 8;
		} else {
			return field.show & 2;
		}
	}

	render() {

		var fields = [];
		var data = this.props.initialData;
		var flds = this.props.node.fields;
		for(var k in flds) {

			var field = flds[k];
			if(this.isVisibleField(field)) {
				var styl;
				if(field.fieldType === FIELD_1_TEXT || field.fieldType === FIELD_19_RICHEDITOR || field.fieldType === FIELD_7_Nto1) {
					styl = rowStyle;
				} else if(field.fieldType === FIELD_2_INT) {
					styl = rowStyleNum;
				} else {
					styl = rowStyleNoWrap
				}

				fields.push(
					R.td({key: field.id, style: styl},
						React.createElement(FieldWrap, {key: k, field, initialValue: data[field.fieldName], form: this, isCompact: true, isTable: true})
					)
				);
			}
		}

		var itemProps;
		if(this.props.node.draftable && (data.status !== 1)) {
			itemProps = {style: {background: '#eee', opacity: 1}}
		} else {
			itemProps = {};
		}
		itemProps.className = 'form-item-' + this.props.node.id;

		if(this.props.isLookup) {

			itemProps.title = L('SELECT');
			itemProps.className += ' clickable';
			itemProps.onClick = () => {this.props.parentForm.valueChoosed(data)};
		} else {
			if(this.props.onClick) {
				itemProps.className = 'clickable';
				itemProps.onClick = this.props.onClick;
			}
		}

		var buttons;
		if(!this.props.hideControlls && !this.state.hideControlls) {
			buttons = renderItemsButtons(this.props.node, data, this.props.list.refreshData, this);
		}

		var additionalButtons;
		if(this.props.additionalButtons) {
			additionalButtons = this.props.additionalButtons(this.props.node, data, this.props.list.refreshData, this);
		}
		fields.push(R.td({key: 'b', style: rowStyleNoWrap}, R.div({style: {textAlign: 'right'}}, buttons, additionalButtons)));

		return R.tr(itemProps,
			fields
		);
	}
}
