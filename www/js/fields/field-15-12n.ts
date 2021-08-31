import { R } from "../r";
import React from "react";
import { FormFull } from "../forms/form-full";
import { List } from "../forms/list";
import { deleteRecord, getNodeData, L, renderIcon } from "../utils";
import { registerFieldClass } from "../utils";
import { fieldLookupMixins } from "./field-lookup-mixins";
import { FIELD_15_1toN } from "../bs-utils";


// @ts-ignore
registerFieldClass(FIELD_15_1toN, class Lookup1toNField extends fieldLookupMixins {

	inlineListRef: List;

	constructor(props) {
		super(props);
		if(!props.form.props.initialData.id) {
			this.savedData = { items: [] };
		}
		var filters = this.generateDefaultFiltersByProps(props);
		this.state = { filters };
	}

	setValue(val) {
		if(this.state.inlineEditing) {
			this.savedData = { items: val };
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

	valueChoosed() {
		this.saveNodeDataAndFilters(this.savedNode, undefined, this.savedFilters);
		this.setState({ creationOpened: false });
	}

	toggleCreateDialogue(itemIdToEdit) {
		this.setState({ creationOpened: !this.state.creationOpened, dataToEdit: undefined, itemIdToEdit: itemIdToEdit });
		if(typeof itemIdToEdit !== 'undefined') {
			getNodeData(this.props.field.nodeRef, itemIdToEdit, undefined, true).then((data) => {
				this.setState({ dataToEdit: data, itemIdToEdit: undefined });
			});
		}
	}

	inlineEditable() {
		this.setState({ inlineEditing: true });
	}

	async getMessageIfInvalid(): Promise<string | false> {
		if(this.state.inlineEditing) {
			let ret;
			await Promise.all(this.inlineListRef.getSubforms().map((subForm) => {
				return subForm.validate().catch(() => {
					ret = L('INVALID_DATA_LIST')
				});
			}));
			return ret;
		}
		else if(this.state.creationOpened) {
			return L("SAVE_SUB_FIRST");
		} else {
			return false;
		}
	}

	async afterSave() {
		if(this.state.inlineEditing) {
			var subForms = this.inlineListRef.getSubforms(true);
			var field = this.props.field;
			for(let form of subForms) {
				var initialData = form.props.initialData;
				if(initialData.hasOwnProperty('__deleted_901d123f')) {
					if(initialData.hasOwnProperty('id')) {
						await deleteRecord('', field.nodeRef, initialData.id, true);
					}
				} else {
					var ln = field.fieldName + '_linker';
					if(!initialData.hasOwnProperty(ln) || initialData[ln] === 'new') {
						form.currentData[ln] = { id: this.props.form.currentData.id };
					}
					await form.saveForm();
				}
			}
		}
	}

	async saveParentFormBeforeCreation() {
		await this.props.form.saveForm();
		const linkerFieldName = this.props.field.fieldName + '_linker';
		this.state.filters[linkerFieldName] = this.props.form.currentData.id;
	}

	render() {
		var field = this.props.field;
		var body;
		if(this.state.creationOpened) {
			if(this.state.itemIdToEdit) {
				body = R.div({ className: 'field-lookup-loading-icon-container' },
					renderIcon('cog fa-spin fa-2x')
				);
			} else {
				body = React.createElement(FormFull, { node: this.savedNode, initialData: this.state.dataToEdit || {}, parentForm: this, isLookup: true, filters: this.state.filters, editable: true });
			}

		} else {
			var askToSaveParentBeforeCreation = !this.props.form.props.initialData.hasOwnProperty('id');
			body = R.div(null,
				React.createElement(List, { ref: (r) => { this.inlineListRef = r; }, hideControlls: this.state.hideControlls, noPreviewButton: this.state.noPreviewButton || this.props.noPreviewButton, disableDrafting: this.state.disableDrafting, additionalButtons: this.state.additionalButtons || this.props.additionalButtons, node: this.savedNode, omitHeader: this.state.creationOpened, initialData: this.savedData, preventCreateButton: this.state.preventCreateButton, askToSaveParentBeforeCreation, editable: this.state.inlineEditing, nodeId: field.nodeRef, parentForm: this, filters: this.savedFilters || this.state.filters })
			);
		}
		return body;
	}
});