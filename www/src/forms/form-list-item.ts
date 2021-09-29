import { ComponentProps, R } from "../r";
import React from "react";
import { FIELD_TYPE_RICH_EDITOR_19, FIELD_TYPE_TEXT_1, FIELD_TYPE_NUMBER_2, FIELD_TYPE_LOOKUP_7, Filters, NodeDesc, RecordData } from "../bs-utils";
import { FieldWrap } from "../fields/field-wrap";
import { deleteRecord, draftRecord, isRecordRestrictedForDeletion, L, publishRecord, renderIcon, sp } from "../utils";
import { AdditionalButtonsRenderer } from "../fields/field-lookup-mixins";
import { BaseForm } from "./base-form";

const publishClick = (draft, node, data) => {
	if(draft) {
		return draftRecord(node.id, data.id);
	} else {
		return publishRecord(node.id, data.id);
	}
}

const renderItemsButtons: AdditionalButtonsRenderer = (node: NodeDesc, data: RecordData, refreshFunction?: () => void, formItem?: FormListItem, editButtonFilters?: Filters): React.Component[] => {
	if(formItem && formItem.props.isLookup) {
		if(data.hasOwnProperty('isE')) {
			buttons = [
				R.button({
					key: 2, className: 'clickable tool-btn edit-btn', title: L('EDIT'), onMouseDown: (e) => {
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
		const isRestricted = isRecordRestrictedForDeletion(node.id, data.id);
		var buttons = [];
		if(data.hasOwnProperty('isP') && (!formItem || !formItem.props.disableDrafting)) {
			if(data.status === 1) {
				buttons.push(
					R.button({
						key: 1, className: isRestricted ? 'clickable tool-btn unpublish-btn restricted' : 'clickable tool-btn unpublish-btn', title: L('UNPUBLISH'), onClick: () => {
							publishClick(true, node, data).then(refreshFunction);
						}
					},
						renderIcon('eye')
					)
				)
			} else {
				buttons.push(
					R.button({
						key: 1, className: 'clickable tool-btn publish-btn', title: L('PUBLISH'), onClick: () => {
							publishClick(false, node, data).then(refreshFunction);
						}
					},
						renderIcon('eye-slash')
					)
				)
			}
		}

		if(data.hasOwnProperty('isE')) {
			if(!formItem || !formItem.props.list || !formItem.props.list.state.noEditButton) {
				buttons.push(
					R.button({
						className: 'clickable tool-btn edit-btn', title: L('EDIT', itemName), key: 2, onClick: (e) => {
							if(formItem && formItem.props.parentForm) {
								formItem.props.parentForm.toggleCreateDialogue(data.id)
							} else {
								window.crudJs.Stage.showForm(node.id, data.id, undefined, true);
							}
						}
					},
						renderIcon('pencil')
					)
				)
			}
		} else if(!formItem || !formItem.props.list || !(formItem.props.list.state.noPreviewButton || formItem.props.list.props.noPreviewButton)) {
			buttons.push(
				R.button({
					className: 'clickable tool-btn view-btn', title: L('DETAILS') + itemName, key: 2, onClick: (e) => {
						window.crudJs.Stage.showForm(node.id, data.id);
					}
				},
					renderIcon('search')
				)
			)
		}

		if(data.hasOwnProperty('isD')) {
			buttons.push(
				R.button({
					key: 3, className: isRestricted ? 'clickable tool-btn danger-btn restricted' : 'clickable tool-btn danger-btn', title: L('DELETE') + itemName, onClick: async () => {
						await deleteRecord(data.name, node.id, data.id);
						if(formItem && formItem.isSubForm()) {
							formItem.props.parentForm.valueSelected();
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


class FormListItem extends BaseForm {

	constructor(props) {
		super(props);
	}

	isFieldVisibleByFormViewMask(field) {
		if(this.props.isLookup) {
			return (field.show & 8) > 0;
		} else {
			return (field.show & 2) > 0;
		}
	}

	render() {

		var fields = [];
		var data = this.props.initialData;
		var nodeFields = this.props.node.fields;
		for(var k in nodeFields) {

			var field = nodeFields[k];
			if(this.isFieldVisibleByFormViewMask(field)) {
				let className = 'form-item-row';
				if(field.fieldType === FIELD_TYPE_NUMBER_2) {
					className += ' form-item-row-num';
				} else if(field.fieldType !== FIELD_TYPE_TEXT_1 && field.fieldType !== FIELD_TYPE_RICH_EDITOR_19 && field.fieldType !== FIELD_TYPE_LOOKUP_7) {
					className += ' form-item-row-misc'
				}

				fields.push(
					R.td({ key: field.id, className },
						React.createElement(FieldWrap, { key: k, field, initialValue: data[field.fieldName], form: this, isCompact: true, isTable: true })
					)
				);
			}
		}

		/** @type any */
		var itemProps: ComponentProps = {};
		itemProps.className = 'list-item list-item-id-' + data.id;
		if(this.props.node.draftable && (data.status !== 1)) {
			itemProps.className += ' list-item-draft';
		}

		if(this.props.isLookup) {
			itemProps.title = L('SELECT');
			itemProps.className += ' clickable';
			itemProps.onClick = () => {
				this.props.parentForm.valueSelected(data);
			};
		}

		var buttons;
		if(!this.props.hideControls && !this.state.hideControls) {
			buttons = renderItemsButtons(this.props.node, data, this.props.list.refreshData, this);
		}

		var additionalButtons;
		if(this.props.additionalButtons) {
			additionalButtons = this.props.additionalButtons(this.props.node, data, this.props.list.refreshData, this);
		}
		fields.push(R.td({ key: 'b', className: 'form-item-row form-item-row-buttons' }, buttons, additionalButtons));

		return R.tr(itemProps,
			fields
		);
	}
}

export { renderItemsButtons, FormListItem };