import FieldWrap from "../fields/field-wrap.js";
import {deleteRecord, draftRecord, L, loactionToHash, publishRecord, renderIcon, sp} from "../utils.js";
import BaseForm from "./form-mixins.js";

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
					key: 2, className: 'clickable toolbtn edit-btn', title: L('EDIT'), onMouseDown: (e) => {
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
					R.button({key: 1, className: 'clickable toolbtn unpublish-btn', title: L('UNPUBLISH'), onClick: () => {publishClick(true, node, data).then(refreshFunction)}},
						renderIcon('eye')
					)
				)
			} else {
				buttons.push(
					R.button({key: 1, className: 'clickable toolbtn publish-btn', title: L('PUBLISH'), onClick: () => {publishClick(false, node, data).then(refreshFunction)}},
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
							R.button({className: 'clickable toolbtn edit-btn', title: L('EDIT', itemName)},
								renderIcon('pencil')
							)
						)
					)
				}

			} else if(!formItem || !formItem.props.list || !(formItem.props.list.state.noPreviewButton || formItem.props.list.props.noPreviewButton)) {
				buttons.push(
					R.a({key: 2, href: loactionToHash(node.id, data.id, undefined)},
						R.button({className: 'clickable toolbtn view-btn', title: L('DETAILS') + itemName},
							renderIcon('search')
						)
					)
				)
			}
		}
		if(data.hasOwnProperty('isD')) {
			buttons.push(
				R.button({
					key: 3, className: 'clickable toolbtn danger-btn', title: L('DELETE') + itemName, onClick: async () => {
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
				let className = 'form-item-row';
				if(field.fieldType === FIELD_2_INT) {
					className += ' form-item-row-num';
				} else if(field.fieldType !== FIELD_1_TEXT && field.fieldType !== FIELD_19_RICHEDITOR && field.fieldType !== FIELD_7_Nto1) {
					className += ' form-item-row-misc'
				}

				fields.push(
					R.td({key: field.id, className},
						React.createElement(FieldWrap, {key: k, field, initialValue: data[field.fieldName], form: this, isCompact: true, isTable: true})
					)
				);
			}
		}

		/** @type any */
		var itemProps = {};
		itemProps.className = 'list-item list-item-' + this.props.node.id;
		if(this.props.node.draftable && (data.status !== 1)) {
			itemProps.className += ' list-item-draft';
		}

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
		fields.push(R.td({key: 'b', className: 'form-item-row form-item-row-buttons'}, buttons, additionalButtons));

		return R.tr(itemProps,
			fields
		);
	}
}
