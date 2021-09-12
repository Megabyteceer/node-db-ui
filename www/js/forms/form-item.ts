import { ComponentProps, R } from "../r";
import React from "react";
import { FIELD_19_RICHEDITOR, FIELD_1_TEXT, FIELD_2_INT, FIELD_7_Nto1, Filters, NodeDesc, RecordData } from "../bs-utils";
import { FieldWrap } from "../fields/field-wrap";
import { deleteRecord, draftRecord, isRecordRestrictedForDeletion, L, locationToHash, publishRecord, renderIcon, sp } from "../utils";
import { AdditionalButtonsRenderer } from "../fields/field-lookup-mixins";
import { eventProcessingMixins } from "./event-processing-mixins";

const publishClick = (draft, node, data) => {
	if(draft) {
		return draftRecord(node.id, data.id);
	} else {
		return publishRecord(node.id, data.id);
	}
}

const renderItemsButtons: AdditionalButtonsRenderer = (node: NodeDesc, data: RecordData, refreshFunction?: () => void, formItem?: FormItem, editButtonFilters?: Filters): React.Component[] => {
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
		const isRestricted = isRecordRestrictedForDeletion(node.id, data.id);
		var buttons = [];
		if(data.hasOwnProperty('isP') && (!formItem || !formItem.props.disableDrafting)) {
			if(data.status === 1) {
				buttons.push(
					R.button({
						key: 1, className: isRestricted ? 'clickable toolbtn unpublish-btn restricted' : 'clickable toolbtn unpublish-btn', title: L('UNPUBLISH'), onClick: () => {
							publishClick(true, node, data).then(refreshFunction);
						}
					},
						renderIcon('eye')
					)
				)
			} else {
				buttons.push(
					R.button({
						key: 1, className: 'clickable toolbtn publish-btn', title: L('PUBLISH'), onClick: () => {
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
					R.a({
						key: 2, href: locationToHash(node.id, data.id, editButtonFilters, true), onClick: (e) => {
							// TODO go to edit on current level
							if(formItem && formItem.props.parentForm) {
								sp(e);
								formItem.props.parentForm.toggleCreateDialogue(data.id)
							}
						}
					},
						R.button({ className: 'clickable toolbtn edit-btn', title: L('EDIT', itemName) },
							renderIcon('pencil')
						)
					)
				)
			}
		} else if(!formItem || !formItem.props.list || !(formItem.props.list.state.noPreviewButton || formItem.props.list.props.noPreviewButton)) {
			buttons.push(
				// TODO go to watch on current level
				R.a({ key: 2, href: locationToHash(node.id, data.id) },
					R.button({ className: 'clickable toolbtn view-btn', title: L('DETAILS') + itemName },
						renderIcon('search')
					)
				)
			)
		}

		if(data.hasOwnProperty('isD')) {
			buttons.push(
				R.button({
					key: 3, className: isRestricted ? 'clickable toolbtn danger-btn restricted' : 'clickable toolbtn danger-btn', title: L('DELETE') + itemName, onClick: async () => {
						await deleteRecord(data.name, node.id, data.id);
						if(formItem && formItem.isSubForm()) {
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


class FormItem extends eventProcessingMixins {

	constructor(props) {
		super(props);
		this.isListItem = true;
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
		var flds = this.props.node.fields;
		for(var k in flds) {

			var field = flds[k];
			if(this.isFieldVisibleByFormViewMask(field)) {
				let className = 'form-item-row';
				if(field.fieldType === FIELD_2_INT) {
					className += ' form-item-row-num';
				} else if(field.fieldType !== FIELD_1_TEXT && field.fieldType !== FIELD_19_RICHEDITOR && field.fieldType !== FIELD_7_Nto1) {
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
				this.props.parentForm.valueChoosed(data);
			};
		}

		var buttons;
		if(!this.props.hideControlls && !this.state.hideControlls) {
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

export { renderItemsButtons, FormItem };