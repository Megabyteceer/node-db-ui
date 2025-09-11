import { h, type Component } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import type { NodeDesc, RecordData } from '../bs-utils';
import type { AdditionalButtonsRenderer } from '../fields/field-lookup-mixins';
import { FieldWrap } from '../fields/field-wrap';
import { R, type ComponentProps } from '../r';
import { deleteRecord, draftRecord, isRecordRestrictedForDeletion, L, publishRecord, renderIcon, sp } from '../utils';
import { BaseForm } from './base-form';

const publishClick = (draft, node, data) => {
	if (draft) {
		return draftRecord(node.id, data.id);
	} else {
		return publishRecord(node.id, data.id);
	}
};

const renderItemsButtons: AdditionalButtonsRenderer = (
	node: NodeDesc,
	data: RecordData,
	refreshFunction?: () => void,
	formItem?: FormListItem
): Component[] => {
	let buttons;
	if (formItem && formItem.props.isLookup) {
		if (data.hasOwnProperty('isE')) {
			buttons = [
				R.button(
					{
						key: 2,
						className: 'clickable tool-btn edit-btn',
						title: L('EDIT'),
						onMouseDown: (e) => {
							sp(e);
							formItem.props.parentForm.toggleCreateDialogue(data.id);
						}
					},
					renderIcon('pencil')
				)
			];
		}
	} else {
		let itemName;
		if (node.draftable && data.status !== 1) {
			itemName = ' ' + L('TEMPLATE');
		} else {
			itemName = '';
		}
		const isRestricted = isRecordRestrictedForDeletion(node.id, data.id);
		buttons = [];
		if (data.hasOwnProperty('isP') && (!formItem || !formItem.props.disableDrafting)) {
			if (data.status === 1) {
				buttons.push(
					R.button(
						{
							key: 1,
							className: isRestricted
								? 'clickable tool-btn unpublish-btn restricted'
								: 'clickable tool-btn unpublish-btn',
							title: L('UNPUBLISH'),
							onClick: () => {
								publishClick(true, node, data).then(refreshFunction);
							}
						},
						renderIcon('eye')
					)
				);
			} else {
				buttons.push(
					R.button(
						{
							key: 1,
							className: 'clickable tool-btn publish-btn',
							title: L('PUBLISH'),
							onClick: () => {
								publishClick(false, node, data).then(refreshFunction);
							}
						},
						renderIcon('eye-slash')
					)
				);
			}
		}

		if (data.hasOwnProperty('isE')) {
			if (!formItem || !formItem.props.list || !formItem.props.list.state.noEditButton) {
				buttons.push(
					R.button(
						{
							className: 'clickable tool-btn edit-btn',
							title: L('EDIT', itemName),
							key: 2,
							onClick: (_ev: PointerEvent) => {
								if (formItem && formItem.props.parentForm) {
									formItem.props.parentForm.toggleCreateDialogue(data.id);
								} else {
									globals.Stage.showForm(node.id, data.id, undefined, true);
								}
							}
						},
						renderIcon('pencil')
					)
				);
			}
		} else if (
			!formItem ||
			!formItem.props.list ||
			!(formItem.props.list.state.noPreviewButton || formItem.props.list.props.noPreviewButton)
		) {
			buttons.push(
				R.button(
					{
						className: 'clickable tool-btn view-btn',
						title: L('DETAILS') + itemName,
						key: 2,
						onClick: (_ev: MouseEvent) => {
							globals.Stage.showForm(node.id, data.id);
						}
					},
					renderIcon('search')
				)
			);
		}

		if (data.hasOwnProperty('isD')) {
			buttons.push(
				R.button(
					{
						key: 3,
						className: isRestricted
							? 'clickable tool-btn danger-btn restricted'
							: 'clickable tool-btn danger-btn',
						title: L('DELETE') + itemName,
						onClick: async () => {
							await deleteRecord(data.name, node.id, data.id);
							if (formItem && formItem.isSubForm()) {
								formItem.props.parentForm.valueSelected();
							} else {
								refreshFunction();
							}
						}
					},
					renderIcon('times')
				)
			);
		}
	}
	return buttons;
};

class FormListItem extends BaseForm {
	constructor(props) {
		super(props);
	}

	isFieldVisibleByFormViewMask(field) {
		return (field.show & this.props.viewMask) > 0;
	}

	render() {
		const fields = [];
		const data = this.props.initialData;
		const nodeFields = this.props.node.fields;
		for (const k in nodeFields) {
			const field = nodeFields[k];
			if (this.isFieldVisibleByFormViewMask(field)) {
				let className = 'form-item-row';
				if (field.fieldType === FIELD_TYPE.NUMBER) {
					className += ' form-item-row-num';
				} else if (
					field.fieldType !== FIELD_TYPE.TEXT &&
					field.fieldType !== FIELD_TYPE.HTML_EDITOR &&
					field.fieldType !== FIELD_TYPE.LOOKUP
				) {
					className += ' form-item-row-misc';
				}

				fields.push(
					R.td(
						{ key: field.id, className },
						h(FieldWrap, {
							key: k,
							field,
							initialValue: data[field.fieldName],
							form: this,
							isCompact: true,
							isTable: true
						})
					)
				);
			}
		}

		/** @type any */
		const itemProps: ComponentProps = {};
		itemProps.className = 'list-item list-item-id-' + data.id;
		if (this.props.node.draftable && data.status !== 1) {
			itemProps.className += ' list-item-draft';
		}

		if (this.props.isLookup) {
			itemProps.title = L('SELECT');
			itemProps.className += ' clickable';
			itemProps.onClick = () => {
				this.props.parentForm.valueSelected(data);
			};
		}

		let buttons;
		if (!this.props.hideControls && !this.state.hideControls) {
			buttons = renderItemsButtons(this.props.node, data, this.props.list.refreshData, this);
		}

		let additionalButtons;
		if (this.props.additionalButtons) {
			additionalButtons = this.props.additionalButtons(
				this.props.node,
				data,
				this.props.list.refreshData,
				this
			);
		}
		fields.push(
			R.td(
				{ key: 'b', className: 'form-item-row form-item-row-buttons' },
				buttons,
				additionalButtons
			)
		);

		return R.tr(itemProps, fields);
	}
}

export { FormListItem, renderItemsButtons };
