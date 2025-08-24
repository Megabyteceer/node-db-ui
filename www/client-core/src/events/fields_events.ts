import ReactDOM from "react-dom";
import { FIELD_TYPE, NODE_ID, NODE_TYPE, VIEW_MASK } from "../bs-utils";

import { L } from "../utils";
import { FormEvents } from "./forms_events";
/// #if DEBUG
import { makeReactClassSelectionField, removeReactClassSelectionField } from "../admin/admin-utils";
/// #endif

class FieldsEvents extends FormEvents {

	removeWrongCharactersInField(fieldName: string) {
		let pv = this.fieldValue(fieldName);
		if(pv) {
			var newValue = pv.replace(/ /g, '_').replace(/[^0-9a-zA-Z_]/g, '');
			if(pv != newValue) {
				this.setFieldValue(fieldName, newValue);
			}
		}
	}

	_html_title_onChange() {
		this.removeWrongCharactersInField('title');
		let href = location.protocol + '//' + location.host + '/custom/html/' + this.fieldValue('title') + '.html';
		this.setFieldValue('link', href);

		let e: HTMLDivElement = ReactDOM.findDOMNode(this) as HTMLDivElement;
		(e.querySelector('.clickable-link') as HTMLAnchorElement).href = href;
		(e.querySelector('.clickable-link-text') as HTMLAnchorElement).innerText = href;
	}

	_users_passwordConfirm_onChange() {
		this.checkPasswordConfirmation();
	}

	/// #if DEBUG
	_nodes_nodeType_onChange() {

		const node_type = this.fieldValue("node_type");

		if(node_type === NODE_TYPE.DOCUMENT) {
			this.showField('creation_name', 'single_name', 'captcha',
				'reverse', 'draftable', 'add_created_on_filed', 'add_creator_user_fld', 'addCreatedByFiled',
				'store_forms', 'rec_per_page',
				'data_storage_group', 'appearance_group', 'create_fields');
			this.makeFieldRequired('single_name');
		} else {
			this.hideField('creation_name', 'singleName', 'captcha',
				'reverse', 'draftable', 'add_created_on_filed', 'add_creator_user_fld', 'addCreatedByFiled',
				'store_forms', 'recPerPage',
				'dataStorageGroup', 'appearanceGroup', 'createFields');
			this.makeFieldRequired('singleName', false);
		}

		if(node_type === NODE_TYPE.DOCUMENT || node_type === NODE_TYPE.REACT_CLASS) {
			this.makeFieldRequired('table_name');
			this.showField('table_name');
		} else {
			this.hideField('table_name');
			this.makeFieldRequired('table_name', false);
		}

		if(node_type === NODE_TYPE.REACT_CLASS) {
			this.setFieldLabel('table_name', L("REACT_CLASS_NAME"));
			makeReactClassSelectionField(this, 'table_name');
		} else {
			this.setFieldLabel('table_name');
			removeReactClassSelectionField(this, 'table_name');
		}

		this._nodes_recalculateFieldsVisibility();
	}

	_fields_fieldName_onChange() {
		this.removeWrongCharactersInField('fieldName');
		this.check12nFieldName();
	}

	_fields_fieldType_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_fields_noStore_onChange() {
		if(this.isFieldVisible('store_in_db')) {
			if(!this.fieldValue('store_in_db') || this.fieldValue('send_to_server')) {
				this.hideField('for_search', 'unique');
			} else {
				this.showField('for_search', 'unique');
			}
		}
	}

	_fields_clientOnly_onChange() {
		this._fields_noStore_onChange();
	}

	_fields_visibility_create_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("visibility_create"))
			shv |= VIEW_MASK.EDITABLE;
		else
			shv &= (VIEW_MASK.ALL - VIEW_MASK.EDITABLE);

		this.setFieldValue("show", shv);
	}

	_fields_visibility_list_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("visibility_list"))
			shv |= VIEW_MASK.LIST;
		else
			shv &= (VIEW_MASK.ALL - VIEW_MASK.LIST);

		this.setFieldValue("show", shv);
	}

	_fields_visibility_customList_onChange() {
		var shv = this.fieldValue("show");

		if(this.fieldValue("visibility_customList"))
			shv |= VIEW_MASK.CUSTOM_LIST;
		else
			shv &= (VIEW_MASK.ALL - VIEW_MASK.CUSTOM_LIST);

		this.setFieldValue("show", shv);
	}

	_fields_visibility_view_onChange() {
		var shv = this.fieldValue("show");
		if(this.fieldValue("visibility_view")) {
			shv |= VIEW_MASK.READONLY;
		} else {
			shv &= (VIEW_MASK.ALL - VIEW_MASK.READONLY);
		}

		this.setFieldValue("show", shv);
	}

	_fields_visibility_dropdownList_onChange() {
		var shv = this.fieldValue("show");
		if(this.fieldValue("visibility_dropdownList")) {
			shv |= VIEW_MASK.DROPDOWN_LIST;
		} else {
			shv &= (VIEW_MASK.ALL - VIEW_MASK.DROPDOWN_LIST);
		}

		this.setFieldValue("show", shv);
	}

	_fields_visibility_subFormList_onChange() {
		var shv = this.fieldValue("show");
		if(this.fieldValue("visibility_subFormList")) {
			shv |= VIEW_MASK.SUB_FORM;
		} else {
			shv &= (VIEW_MASK.ALL - VIEW_MASK.SUB_FORM);
		}

		this.setFieldValue("show", shv);
	}

	_fields_nodeRef_onChange() {
		this.check12nFieldName();
	}

	_nodes_tableName_onChange() {
		this.removeWrongCharactersInField('table_name');
	}
	/// #endif

	_registration_passwordConfirm_onChange() {
		this.checkPasswordConfirmation();
	}

	_registration_alreadyHaveAccountBtn_onChange() {
		window.crudJs.Stage.showForm(NODE_ID.LOGIN);
	}

	_login_signUpLinkBtn_onChange() {
		window.crudJs.Stage.showForm(NODE_ID.REGISTER, 'new', undefined, true);
	}

	_login_forgotPasswordButton_onChange() {
		window.crudJs.Stage.showForm(NODE_ID.RESET, 'new', undefined, true);
	}

	_resetPassword_backToLogin_onChange() {
		this._registration_alreadyHaveAccountBtn_onChange();
	}

	_fields_recalculateFieldsVisibility() {


		const fieldType = this.fieldValue("fieldType");

		this.showField('max_length', 'requirement', 'store_in_db', 'send_to_server', 'unique', 'for_search');
		this.hideField('multilingual', 'node_ref', 'width', 'height', "select_field_name", "lookup_icon", "enum");
		this.setFieldLabel("description");

		this.enableField("visibility_list");
		this.enableField("visibility_customList");
		this.enableField("visibility_dropdownList");
		this.enableField("visibility_subFormList");
		this.enableField("store_in_db");
		this.enableField("send_to_server");
		this.enableField('unique');
		this.enableField('for_search');

		if(fieldType === FIELD_TYPE.LOOKUP_NtoM) {
			this.getField('node_ref').setLookupFilter('excludeIDs', [this.fieldValue("node_fields_linker").id]);
		} else {
			this.getField('node_ref').setLookupFilter('excludeIDs', undefined);
		}
		switch(fieldType) {
			case FIELD_TYPE.STATIC_TEXT:
				this.setFieldLabel("description", L("CONTENT"));
			case FIELD_TYPE.BUTTON:
			case FIELD_TYPE.TAB:
			case FIELD_TYPE.SPLITTER:
				this.hideField("storage_setting_splitter", "max_length", "send_to_server", "store_in_db", "requirement", "unique", "for_search");
				this.setFieldValue("send_to_server", 0);
				this.disableField("send_to_server");
				this.setFieldValue("store_in_db", 0);
				this.disableField("store_in_db");
				this.disableField("requirement");
				break;
			case FIELD_TYPE.LOOKUP_NtoM:
			case FIELD_TYPE.LOOKUP_1toN:
				this.disableField("visibility_list");
				this.setFieldValue("visibility_list", 0);
				this.disableField("visibility_customList");
				this.setFieldValue("visibility_customList", 0);
				this.disableField("visibility_dropdownList");
				this.setFieldValue("visibility_dropdownList", 0);
				this.disableField("visibility_subFormList");
				this.setFieldValue("visibility_subFormList", 0);

				this.disableField("send_to_server");
				this.setFieldValue('send_to_server', 1);
				this.disableField("store_in_db");
				this.setFieldValue('store_in_db', 1);
				this.hideField('for_search', 'requirement', 'unique');
			case FIELD_TYPE.LOOKUP:
				this.hideField("max_length", "unique");
				this.setFieldValue("unique", false);
				this.showField("node_ref");
				break;

			case FIELD_TYPE.ENUM:
				this.showField('enum');
				this.hideField('max_length');
				break;
			case FIELD_TYPE.RICH_EDITOR:
			case FIELD_TYPE.PICTURE:
				this.showField("width", "height");
				this.hideField("max_length");
				break;
			case FIELD_TYPE.BOOL:
			case FIELD_TYPE.DATE_TIME:
			case FIELD_TYPE.DATE:
			case FIELD_TYPE.COLOR:
			case FIELD_TYPE.FILE:
				this.hideField("max_length");
				break;

		}

		if(this.isUpdateRecord) {
			this.disableField("fieldName");
			this.disableField("fieldType");
			this.disableField("node_ref");
			this.disableField("node_fields_linker");
			this.disableField("store_in_db");
			this.disableField("send_to_server");
		}

		if(this.fieldValue('fieldType') === FIELD_TYPE.LOOKUP) {
			this.disableField('for_search');
			this.setFieldValue('for_search', 1);
		}

		if(fieldType === FIELD_TYPE.TEXT || fieldType === FIELD_TYPE.RICH_EDITOR) {
			this.showField('multilingual');
		} else {
			this.hideField('multilingual');
			this.setFieldValue('multilingual', false);
		}
		this.check12nFieldName();

		if(!this.fieldValue('send_to_server')) {
			this.disableField('store_in_db');
			this.setFieldValue('store_in_db', 0);
		}

		if(!this.fieldValue('store_in_db')) {
			this.disableField('for_search');
			this.setFieldValue('for_search', 0);
		}

		if(!this.fieldValue('for_search')) {
			this.disableField('unique');
			this.setFieldValue('unique', 0);
		}

		this.makeFieldRequired('max_length', this.isFieldVisible('max_length'));
	}

	_fields_storeInDB_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_fields_sendToServer_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_fields_forSearch_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_login_signInBtn_onChange() {
		this.save();
	}

	_nodes_storeForms_onChange() {
		this._nodes_nodeType_onChange();
	}

	//_insertNewHandlersHere_
}

export { FieldsEvents };
