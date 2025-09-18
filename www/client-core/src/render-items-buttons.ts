import type { Component } from 'preact';

import { globals } from '../../../types/globals';
import type { RecordData } from './bs-utils';
import type BaseLookupField from './fields/base-lookup-field';
import type Form from './form';
import { R } from './r';
import { deleteRecordClient, draftRecord, isRecordRestrictedForDeletion, L, publishRecord, renderIcon, sp } from './utils';

export type AdditionalButtonsRenderer = (
	field: NodeDesc,
	data: RecordData,
	refreshFunction?: () => void,
	formItem?: Form
) => Component[] | undefined;

const publishClick = (draft: boolean, node: NodeDesc, data: RecordData) => {
	if (draft) {
		return draftRecord(node.id, data.id!);
	} else {
		return publishRecord(node.id, data.id!);
	}
};

export const renderItemsButtons: AdditionalButtonsRenderer = (
	node: NodeDesc,
	data: RecordData,
	refreshFunction?: () => void,
	form?: Form
): Component[] | undefined => {
	let buttons;
	if (form?.props.isCompact) {
		if (data.hasOwnProperty('isE')) {
			buttons = [
				R.button(
					{
						key: 2,
						className: 'clickable tool-btn edit-btn',
						title: L('EDIT'),
						onMouseDown: (e: MouseEvent) => {
							sp(e);
							form.props.parent!.toggleCreateDialogue(data.id);
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
		const isRestricted = isRecordRestrictedForDeletion(node.id, data.id!);
		buttons = [];
		if (data.hasOwnProperty('isP') && (!form || !form.props.disableDrafting)) {
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
			if (!(form?.parent as BaseLookupField)?.state.noEditButton) {
				buttons.push(
					R.button(
						{
							className: 'clickable tool-btn edit-btn',
							title: L('EDIT', itemName),
							key: 2,
							onClick: (_ev: PointerEvent) => {
								if (form?.getParentLookupField()) {
									(form?.parent as BaseLookupField).toggleCreateDialogue(data.id);
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
			!(form?.parent as BaseLookupField)?.state.noPreviewButton
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
							await deleteRecordClient(data.name, node.id, data.id!);
							if (form?.getParentLookupField()) {
								(form.parent as BaseLookupField).valueSelected();
							} else {
								refreshFunction!();
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