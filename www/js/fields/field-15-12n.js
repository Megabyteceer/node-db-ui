import FormFull from "../forms/form-full.js";
import List from "../forms/list.js";
import {backupCreationData, getNodeData, L, renderIcon} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldLookupMixins from "./field-lookup-mixins.js";

registerFieldClass(FIELD_15_1toN, class Lookup1toNField extends fieldLookupMixins {

	constructor(props) {
		super(props);
		if(!props.form.props.initialData.id) {
			this.savedData = {items: []};
		}
		var filters = this.generateDefaultFiltersByProps(props);
		this.state = {filters};
	}

	setValue(val) {
		if(this.state.inlineEditing) {
			this.savedData = {items: val};
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
				var initialData = form.props.initialData;
				ret.push(form.currentData);
			}
		}
		return ret;
	}

	valueChoosed() {
		this.saveNodeDataAndFilters(this.savedNode, undefined, this.savedFilters);
		this.setState({creationOpened: false});
	}

	toggleCreateDialogue(itemIdToEdit, defaultCreationData, backupPrefix) {
		if(defaultCreationData) {
			var curBackup = getBackupData(this.props.field.nodeRef, backupPrefix);
			backupCreationData(this.props.field.nodeRef, Object.assign(curBackup, defaultCreationData), backupPrefix);
		}
		this.setState({creationOpened: !this.state.creationOpened, backupPrefix: backupPrefix, dataToEdit: undefined, itemIdToEdit: itemIdToEdit});
		if(typeof itemIdToEdit !== 'undefined') {
			getNodeData(this.props.field.nodeRef, itemIdToEdit, (data) => {
				this.setState({dataToEdit: data, itemIdToEdit: undefined});
			}, undefined, true);
		}
	}

	inlineEditable() {
		this.setState({inlineEditing: true});
	}

	getMessageIfInvalid(callback) {
		if(this.state.inlineEditing) {
			var allValid = true;
			var callbacksCount = 1;
			var onSubformValidated = (isValid) => {
				if(!isValid) {
					allValid = false;
				}
				callbacksCount--;
				if(callbacksCount === 0) {
					callback(allValid ? false : L('INVALID_DATA_LIST'));
				}
			}
			this.inlineListRef.getSubforms().some((subForm) => {
				callbacksCount++;
				subForm.validate(onSubformValidated);
			});
			onSubformValidated(true);
		}
		else if(this.state.creationOpened) {
			callback(L("SAVE_SUB_FIRST"));
		} else {
			callback(false);
		}
	}

	afterSave(callback) {

		if(this.state.inlineEditing) {


			var invalidSave = false;
			var subForms = this.inlineListRef.getSubforms(true);
			var field = this.props.field;


			const handleCallbackCountingInvalid = () => {
				invalidSave = true;
				processSubForms();
			}
			//saving one by one for keep order.
			var processSubForms = () => {
				if(subForms.length > 0) {
					var form = subForms.shift();

					var initialData = form.props.initialData;

					if(initialData.hasOwnProperty('__deleted_901d123f')) {
						if(initialData.hasOwnProperty('id')) {
							deleteRecord('', field.nodeRef, initialData.id, processSubForms, true);
						}
					} else {
						var ln = field.fieldName + '_linker';
						if(!initialData.hasOwnProperty(ln) || initialData[ln] === 'new') {
							form.currentData[ln] = {id: this.props.form.currentData.id};
						}
						form.saveForm(processSubForms, handleCallbackCountingInvalid);
					}



				} else {
					callback(undefined, invalidSave);
				}
			};
			processSubForms();
		} else {
			callback();
		}
	}

	saveParentFormBeforeCreation(callback) {
		this.props.form.saveForm(() => {
			const linkerFieldName = this.props.field.fieldName + '_linker';
			this.state.filters[linkerFieldName] = this.props.form.currentData.id;
			callback();
		});
	}

	render() {

		var field = this.props.field;
		var body;
		if(this.state.creationOpened) {
			if(this.state.itemIdToEdit) {
				body = ReactDOM.div({style: {textAlign: 'center', color: '#ccc', padding: '5px'}},
					renderIcon('cog fa-spin fa-2x')
				);
			} else {
				body = React.createElement(FormFull, {node: this.savedNode, backupPrefix: this.state.backupPrefix, initialData: this.state.dataToEdit || {}, parentForm: this, isLookup: true, filters: this.state.filters, editable: true});
			}

		} else {
			var askToSaveParentBeforeCreation = !this.props.form.props.initialData.hasOwnProperty('id');
			body = ReactDOM.div(null,
				React.createElement(List, {ref: (r) => {this.inlineListRef = r;}, hideControlls: this.state.hideControlls, noPreviewButton: this.state.noPreviewButton || this.props.noPreviewButton, disableDrafting: this.state.disableDrafting, additionalButtons: this.state.additionalButtons || this.props.additionalButtons, node: this.savedNode, omitHeader: this.state.creationOpened, initialData: this.savedData, preventCreateButton: this.state.preventCreateButton, askToSaveParentBeforeCreation, editable: this.state.inlineEditing, nodeId: field.nodeRef, parentForm: this, filters: this.savedFilters || this.state.filters})
			);
		}
		return body;
	}
});