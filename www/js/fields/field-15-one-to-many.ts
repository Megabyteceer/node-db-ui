import { R } from "../r";
import React from "react";
import { List } from "../forms/list";
import { deleteRecord, L } from "../utils";
import { registerFieldClass } from "../utils";
import { fieldLookupMixins } from "./field-lookup-mixins";
import { FIELD_15_1toN, RecId, RecordData, RecordsData } from "../bs-utils";

class LookpuOneToManyFiled extends fieldLookupMixins {

	inlineListRef: List;

	constructor(props) {
		super(props);
		var filters = this.generateDefaultFiltersByProps(props);
		this.state = { filters };
	}

	setValue(val) {
		if(this.state.inlineEditing) {
			this.forceUpdate();
		}
	}

	getBackupData() {
		var ret = [];
		var i;
		if(this.state.inlineEditing) {
			var subForms = this.inlineListRef.getSubforms();
			for(i = 0; i < subForms.length; i++) {
				var form = subForms[i];
				form.prepareToBackup();
				ret.push(form.currentData);
			}
		}
		return ret;
	}

	valueChoosed(recordData?: RecordData, isNewCreated?: boolean, noToggleList?: boolean);
	valueChoosed() {
	}

	toggleCreateDialogue(recIdToEdit?: RecId | 'new') {
		const filters = {
			[this.getLinkerFieldName()]: { id: this.props.form.recId }
		};
		window.crudJs.Stage.showForm(this.props.field.nodeRef, recIdToEdit, filters, true, true, () => {
			this.inlineListRef.refreshData();
		});
	}

	inlineEditable() {
		this.setState({ inlineEditing: true });
	}

	async getMessageIfInvalid(): Promise<string | false | true> {
		if(this.state.inlineEditing) {
			let ret;
			let forms = this.inlineListRef.getSubforms();
			for(let subForm of forms) {
				let res = await subForm.validate();
				if(!res) {
					ret = L('INVALID_DATA_LIST');
				}
			}
			return ret;
		}
	}

	async afterSave() {
		if(this.state.inlineEditing) {
			var listData = this.inlineListRef.state.data;
			var field = this.props.field;
			for(let item of listData.items) {
				if(item.hasOwnProperty('__deleted_901d123f')) {
					if(item.hasOwnProperty('id')) {
						await deleteRecord('', field.nodeRef, item.id, true);
					}
				}
			}
			var subForms = this.inlineListRef.getSubforms();
			for(let form of subForms) {
				var initialData = form.props.initialData;
				var linkerName = this.getLinkerFieldName();
				if(!initialData.hasOwnProperty(linkerName) || initialData[linkerName] === 'new') {
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

	render() {
		var field = this.props.field;
		var askToSaveParentBeforeCreation = !this.props.form.props.initialData.hasOwnProperty('id');
		let initialData: RecordsData = (typeof this.props.form.recId === 'number') ? undefined : {
			items: [],
			total: 0
		};
		return R.div(null,
			React.createElement(List, {
				ref: (r) => { this.inlineListRef = r; },
				hideControlls: this.state.hideControlls,
				noPreviewButton: this.state.noPreviewButton || this.props.noPreviewButton,
				disableDrafting: this.state.disableDrafting,
				additionalButtons: this.state.additionalButtons || this.props.additionalButtons,
				isLookup: true,
				initialData,
				preventCreateButton: this.state.preventCreateButton,
				askToSaveParentBeforeCreation,
				editable: this.state.inlineEditing,
				nodeId: field.nodeRef,
				parentForm: this,
				filters: this.state.filters
			})
		);
	}
}

registerFieldClass(FIELD_15_1toN, LookpuOneToManyFiled);

export { LookpuOneToManyFiled };