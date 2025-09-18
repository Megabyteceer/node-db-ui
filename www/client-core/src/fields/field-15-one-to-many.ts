import { h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import type { GetRecordsFilter, RecId, RecordData, RecordsData } from '../bs-utils';
import { VIEW_MASK } from '../bs-utils';
import Form, { type FormProps } from '../form';
import type { List__olf } from '../forms/list';
import { R } from '../r';
import { assignFilters, deleteRecordClient, L, registerFieldClass } from '../utils';
import BaseLookupField from './base-lookup-field';

class LookupOneToManyFiled extends BaseLookupField {
	inlineListRef!: List__olf;

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

	getSubForms<FormType extends Form>() {
		return this.children[0].children as FormType[];
	}

	isEmpty(): boolean {
		return this.children.length < 1;
	}

	valueSelected(recordData?: RecordData, isNewCreated?: boolean, noToggleList?: boolean): void;
	valueSelected() {}

	toggleCreateDialogue(recIdToEdit?: RecId | 'new') {
		const filters = {
			[this.getLinkerFieldName()]: { id: this.parentForm.recId }
		};
		globals.Stage.showForm(this.parentForm.nodeDesc.id, recIdToEdit, filters, true, true, () => {
			this.inlineListRef.refreshData();
		});
	}

	inlineEditable() {
		this.setState({ inlineEditing: true });
	}

	async getMessageIfInvalid(): Promise<string | undefined> {
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
			const listData = (this.children[0] as Form).listData!;
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
				if (!initialData.hasOwnProperty(linkerName) || (initialData as KeyedMap<any>)[linkerName] === 'new') {
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

	setLookupFilter(filtersObjOrName: string | GetRecordsFilter, val?: any) {
		super.setLookupFilter(filtersObjOrName, val);
		if (this.inlineListRef) {
			assignFilters(this.fieldFilters!, this.inlineListRef.filters);
		}
	}

	renderFieldEditable() {
		const field = this.props.fieldDesc;
		const askToSaveParentBeforeCreation = this.parentForm.recId === 'new';
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
				noPreviewButton: this.state.noPreviewButton || this.props.noPreviewButton,
				disableDrafting: this.state.disableDrafting,
				additionalButtons: this.state.additionalButtons || this.props.additionalButtons,
				listData,
				nodeId: field.nodeRef!.id,
				viewMask: VIEW_MASK.SUB_FORM,
				preventCreateButton: this.state.preventCreateButton,
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
