import React from 'react';
import { FIELD_TYPE } from '../../../../types/generated';
import type { GetRecordsFilter, RecId, RecordData, RecordsData } from '../bs-utils';
import { VIEW_MASK } from '../bs-utils';
import { List } from '../forms/list';
import { R } from '../r';
import { assignFilters, deleteRecord, L, registerFieldClass } from '../utils';
import { fieldLookupMixins } from './field-lookup-mixins';

class LookupOneToManyFiled extends fieldLookupMixins {
	inlineListRef: List;

	constructor(props) {
		super(props);
		const filters = this.generateDefaultFiltersByProps(props);
		this.state = { filters };
	}

	setValue(_val: any) {
		if (this.state.inlineEditing) {
			this.forceUpdate();
		}
	}

	getBackupData() {
		const ret = [];
		let i;
		if (this.state.inlineEditing) {
			const subForms = this.inlineListRef.getSubForms();
			for (i = 0; i < subForms.length; i++) {
				const form = subForms[i];
				form.prepareToBackup();
				ret.push(form.currentData);
			}
		}
		return ret;
	}

	isEmpty(): boolean {
		const subForms = this.inlineListRef.getSubForms();
		return subForms.length < 1;
	}

	valueSelected(recordData?: RecordData, isNewCreated?: boolean, noToggleList?: boolean);
	valueSelected() {}

	toggleCreateDialogue(recIdToEdit?: RecId | 'new') {
		const filters = {
			[this.getLinkerFieldName()]: { id: this.props.form.recId },
		};
		crudJs.Stage.showForm(this.props.field.nodeRef.id, recIdToEdit, filters, true, true, () => {
			this.inlineListRef.refreshData();
		});
	}

	inlineEditable() {
		this.setState({ inlineEditing: true });
	}

	async getMessageIfInvalid(): Promise<string | false | true> {
		if (this.state.inlineEditing) {
			let ret;
			const forms = this.inlineListRef.getSubForms();
			for (const subForm of forms) {
				const res = await subForm.validate();
				if (!res) {
					ret = L('INVALID_DATA_LIST');
				}
			}
			return ret;
		}
	}

	async afterSave() {
		if (this.state.inlineEditing) {
			const listData = this.inlineListRef.state.data;
			const field = this.props.field;
			for (const item of listData.items) {
				if (item.hasOwnProperty('__deleted_901d123f')) {
					if (item.hasOwnProperty('id')) {
						await deleteRecord('', field.nodeRef.id, item.id, true);
					}
				}
			}
			const subForms = this.inlineListRef.getSubForms();
			for (const form of subForms) {
				const initialData = form.props.initialData;
				const linkerName = this.getLinkerFieldName();
				if (!initialData.hasOwnProperty(linkerName) || initialData[linkerName] === 'new') {
					form.currentData[linkerName] = { id: this.props.form.currentData.id };
				}
				await form.saveForm();
			}
		}
	}

	async saveParentFormBeforeCreation() {
		await this.props.form.saveForm();
		const linkerFieldName = this.getLinkerFieldName();
		this.state.filters[linkerFieldName] = this.props.form.currentData.id;
	}

	setLookupFilter(filtersObjOrName: string | GetRecordsFilter, val?: any) {
		super.setLookupFilter(filtersObjOrName, val);
		if (this.inlineListRef) {
			assignFilters(this.state.filters, this.inlineListRef.filters);
		}
	}

	forceBouncingTimeout() {
		if (this.inlineEditable) {
			for (const subForm of this.inlineListRef.getSubForms()) {
				subForm.forceBouncingTimeout();
			}
		}
	}

	render() {
		const field = this.props.field;
		const askToSaveParentBeforeCreation = !this.props.form.props.initialData.hasOwnProperty('id');
		const initialData: RecordsData =
			typeof this.props.form.recId === 'number'
				? undefined
				: {
					items: [],
					total: 0,
				  };
		return R.div(
			null,
			React.createElement(List, {
				ref: (r) => {
					this.inlineListRef = r;
				},
				hideControls: this.state.hideControls,
				noPreviewButton: this.state.noPreviewButton || this.props.noPreviewButton,
				disableDrafting: this.state.disableDrafting,
				additionalButtons: this.state.additionalButtons || this.props.additionalButtons,
				initialData,
				viewMask: VIEW_MASK.SUB_FORM,
				preventCreateButton: this.state.preventCreateButton,
				askToSaveParentBeforeCreation,
				editable: this.state.inlineEditing,
				nodeId: field.nodeRef.id,
				parentForm: this,
				filters: this.state.filters,
			})
		);
	}
}

registerFieldClass(FIELD_TYPE.LOOKUP_1_TO_N, LookupOneToManyFiled);

export { LookupOneToManyFiled };

