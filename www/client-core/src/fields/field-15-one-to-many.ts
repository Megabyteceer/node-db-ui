import { h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import type { GetRecordsFilter, RecId, RecordData, RecordsData } from '../bs-utils';
import { VIEW_MASK } from '../bs-utils';
import { NEW_RECORD } from '../consts';
import Form, { type FormProps } from '../form';
import { R } from '../r';
import { assignFilters, deleteRecordClient, registerFieldClass } from '../utils';
import BaseLookupField from './base-lookup-field';

class LookupOneToManyFiled extends BaseLookupField {

	setValue(_val: any) {
		if (this.state.inlineEditing) {
			this.forceUpdate();
		}
	}

	getSubForms<FormType extends Form>() {
		return this.children[0].children as FormType[];
	}

	isEmpty(): boolean {
		return this.children.length < 1;
	}

	valueSelected(recordData?: RecordData, isNewCreated?: boolean, noToggleList?: boolean): void;
	valueSelected() {}

	toggleCreateDialogue(recIdToEdit?: RecId | typeof NEW_RECORD) {
		const filters = {
			[this.getLinkerFieldName()]: { id: this.parentForm.recId }
		};
		globals.Stage.showForm(this.props.fieldDesc.nodeRef!.id, recIdToEdit, filters, true, true, () => {
			this.lookupListForm.refreshData();
		});
	}

	inlineEditable() {
		this.setState({ inlineEditing: true });
	}

	async afterSave() {
		if (this.state.inlineEditing) {
			const listData = this.lookupListForm.listData!;
			const field = this.props.fieldDesc;
			for (const item of listData.items) {
				if (item.hasOwnProperty('__deleted_901d123f')) {
					if (item.hasOwnProperty('id')) {
						await deleteRecordClient('', field.nodeRef!.id, item.id!, true);
					}
				}
			}
			const subForms = this.getSubForms();
			for (const form of subForms) {
				const initialData = form.savedFormData!;
				const linkerName = this.getLinkerFieldName();
				if (!initialData.hasOwnProperty(linkerName) || (initialData as KeyedMap<any>)[linkerName] === NEW_RECORD) {
					form.formData![linkerName] = { id: this.parentForm.formData!.id };
				}
				await form.saveForm();
			}
		}
	}

	async saveParentFormBeforeCreation() {
		await this.parentForm.saveForm();
		const linkerFieldName = this.getLinkerFieldName();
		(this.fieldFilters as KeyedMap<any>)[linkerFieldName] = this.parentForm.formData!.id;
	}

	get lookupListForm() {
		return this.children[0] as Form;
	}

	setLookupFilter(filtersObjOrName: string | GetRecordsFilter, val?: any) {
		super.setLookupFilter(filtersObjOrName, val);
		assignFilters(this.lookupListForm.formFilters, this.fieldFilters!);
	}

	renderFieldEditable() {
		const field = this.props.fieldDesc;
		const askToSaveParentBeforeCreation = this.parentForm.recId === NEW_RECORD;
		const listData: RecordsData | undefined =
			typeof this.parentForm.recId === 'number'
				? undefined
				: {
					items: [],
					total: 0
				};
		return R.div(
			null,
			h(Form, {
				hideControls: this.props.hideControls || this.state.hideControls,
				listData,
				isLookup: true,
				nodeId: field.nodeRef!.id,
				viewMask: VIEW_MASK.SUB_FORM,
				askToSaveParentBeforeCreation,
				editable: this.state.inlineEditing,
				parentForm: this.parentForm,
				parent: this,
				filters: this.fieldFilters
			} as FormProps)
		);
	}
}

registerFieldClass(FIELD_TYPE.LOOKUP_1_TO_N, LookupOneToManyFiled);

export { LookupOneToManyFiled };
