import { VIEW_MASK } from '../bs-utils';

import { L } from '../utils';
import { FormEvents } from './forms_events';
/// #if DEBUG
import { FIELD_TYPE, NODE_ID, NODE_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import { makeReactClassSelectionField, removeReactClassSelectionField } from '../admin/admin-utils';
/// #endif

class FieldsEvents extends FormEvents {
	removeWrongCharactersInField(fieldName: string) {
		const oldValue = this.fieldValue(fieldName);
		if (oldValue) {
			const newValue = oldValue.toLowerCase().replace(/[^a-z0-9]/gm, '_');
			if (oldValue != newValue) {
				this.setFieldValue(fieldName, newValue);
			}
		}
	}

	_html_title_onChange() {
		this.removeWrongCharactersInField('title');
		const href =
			location.protocol +
			'//' +
			location.host +
			'/custom/html/' +
			this.fieldValue('title') +
			'.html';
		this.setFieldValue('link', href);

		const e: HTMLDivElement = this.base as HTMLDivElement;
		(e.querySelector('.clickable-link') as HTMLAnchorElement).href = href;
		(e.querySelector('.clickable-link-text') as HTMLAnchorElement).innerText = href;
	}

	_users_password_confirm_onChange() {
		this.checkPasswordConfirmation();
	}

	/// #if DEBUG
	_nodes_node_type_onChange() {
		const nodeType = this.fieldValue('nodeType');

		if (nodeType === NODE_TYPE.DOCUMENT) {
			this.showField(
				'creationName',
				'singleName',
				'captcha',
				'reverse',
				'draftable',
				'storeForms',
				'recPerPage',
				'data_storage_group',
				'appearance_group'
			);
			this.makeFieldRequired('singleName');
		} else {
			this.hideField(
				'creationName',
				'singleName',
				'captcha',
				'reverse',
				'draftable',
				'storeForms',
				'recPerPage',
				'data_storage_group',
				'appearance_group'
			);
			this.makeFieldRequired('singleName', false);
		}

		if (nodeType === NODE_TYPE.DOCUMENT || nodeType === NODE_TYPE.REACT_CLASS) {
			this.makeFieldRequired('tableName');
			this.showField('tableName');
		} else {
			this.hideField('tableName');
			this.makeFieldRequired('tableName', false);
		}

		if (nodeType === NODE_TYPE.REACT_CLASS) {
			this.setFieldLabel('tableName', L('CLASS_NAME'));
			makeReactClassSelectionField(this, 'tableName');
		} else {
			this.setFieldLabel('tableName');
			removeReactClassSelectionField(this, 'tableName');
		}

		this._nodes_recalculateFieldsVisibility();
	}

	_fields_field_name_onChange() {
		this.removeWrongCharactersInField('fieldName');
		this.check12nFieldName();
	}

	_fields_field_type_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_fields_no_store_onChange() {
		if (this.isFieldVisible('storeInDb')) {
			if (!this.fieldValue('storeInDb') || this.fieldValue('sendToServer')) {
				this.hideField('forSearch', 'unique');
			} else {
				this.showField('forSearch', 'unique');
			}
		}
	}

	_fields_clientOnly_onChange() {
		this._fields_no_store_onChange();
	}

	_fields_visibilityCreate_onChange() {
		let shv = this.fieldValue('show');

		if (this.fieldValue('visibilityCreate')) shv |= VIEW_MASK.EDITABLE;
		else shv &= VIEW_MASK.ALL - VIEW_MASK.EDITABLE;

		this.setFieldValue('show', shv);
	}

	_fields_visibilityList_onChange() {
		let shv = this.fieldValue('show');

		if (this.fieldValue('visibilityList')) shv |= VIEW_MASK.LIST;
		else shv &= VIEW_MASK.ALL - VIEW_MASK.LIST;

		this.setFieldValue('show', shv);
	}

	_fields_visibilityCustomList_onChange() {
		let shv = this.fieldValue('show');

		if (this.fieldValue('visibilityCustomList')) shv |= VIEW_MASK.CUSTOM_LIST;
		else shv &= VIEW_MASK.ALL - VIEW_MASK.CUSTOM_LIST;

		this.setFieldValue('show', shv);
	}

	_fields_visibilityView_onChange() {
		let shv = this.fieldValue('show');
		if (this.fieldValue('visibilityView')) {
			shv |= VIEW_MASK.READONLY;
		} else {
			shv &= VIEW_MASK.ALL - VIEW_MASK.READONLY;
		}

		this.setFieldValue('show', shv);
	}

	_fields_visibilityDropdownList_onChange() {
		let shv = this.fieldValue('show');
		if (this.fieldValue('visibilityDropdownList')) {
			shv |= VIEW_MASK.DROPDOWN_LIST;
		} else {
			shv &= VIEW_MASK.ALL - VIEW_MASK.DROPDOWN_LIST;
		}

		this.setFieldValue('show', shv);
	}

	_fields_visibilitySubFormList_onChange() {
		let shv = this.fieldValue('show');
		if (this.fieldValue('visibilitySubFormList')) {
			shv |= VIEW_MASK.SUB_FORM;
		} else {
			shv &= VIEW_MASK.ALL - VIEW_MASK.SUB_FORM;
		}

		this.setFieldValue('show', shv);
	}

	_fields_node_ref_onChange() {
		this.check12nFieldName();
	}

	_nodes_table_name_onChange() {
		this.removeWrongCharactersInField('tableName');
	}
	/// #endif

	_registration_password_confirm_onChange() {
		this.checkPasswordConfirmation();
	}

	_registration_already_have_account_btn_onChange() {
		globals.Stage.showForm(NODE_ID.LOGIN);
	}

	_login_sign_up_link_btn_onChange() {
		globals.Stage.showForm(NODE_ID.REGISTRATION, 'new', undefined, true);
	}

	_login_forgotPasswordButton_onChange() {
		globals.Stage.showForm(NODE_ID.RESET_PASSWORD, 'new', undefined, true);
	}

	_reset_password_back_to_login_onChange() {
		this._registration_already_have_account_btn_onChange();
	}

	_fields_recalculateFieldsVisibility() {
		const fieldType = this.fieldValue('fieldType');

		this.showField('maxLength', 'requirement', 'storeInDb', 'sendToServer', 'unique', 'forSearch');
		this.hideField(
			'multilingual',
			'nodeRef',
			'width',
			'height',
			'selectFieldName',
			'lookupIcon',
			'enum'
		);
		this.setFieldLabel('description');

		this.enableField('visibilityList');
		this.enableField('visibilityCustomList');
		this.enableField('visibilityDropdownList');
		this.enableField('visibilitySubFormList');
		this.enableField('storeInDb');
		this.enableField('sendToServer');
		this.enableField('unique');
		this.enableField('forSearch');

		if (fieldType === FIELD_TYPE.LOOKUP_N_TO_M) {
			this.getField('nodeRef').setLookupFilter('excludeIDs', [
				this.fieldValue('nodeFieldsLinker').id,
			]);
		} else {
			this.getField('nodeRef').setLookupFilter('excludeIDs', undefined);
		}
		switch (fieldType) {
		case FIELD_TYPE.STATIC_HTML_BLOCK:
			this.setFieldLabel('description', L('CONTENT'));
		case FIELD_TYPE.BUTTON:
		case FIELD_TYPE.TAB:
		case FIELD_TYPE.SPLITTER:
			this.hideField(
				'storage_setting_splitter',
				'maxLength',
				'sendToServer',
				'storeInDb',
				'requirement',
				'unique',
				'forSearch'
			);
			this.setFieldValue('sendToServer', 0);
			this.disableField('sendToServer');
			this.setFieldValue('storeInDb', 0);
			this.disableField('storeInDb');
			this.disableField('requirement');
			break;
		case FIELD_TYPE.LOOKUP_N_TO_M:
		case FIELD_TYPE.LOOKUP_1_TO_N:
			this.disableField('visibilityList');
			this.setFieldValue('visibilityList', 0);
			this.disableField('visibilityCustomList');
			this.setFieldValue('visibilityCustomList', 0);
			this.disableField('visibilityDropdownList');
			this.setFieldValue('visibilityDropdownList', 0);
			this.disableField('visibilitySubFormList');
			this.setFieldValue('visibilitySubFormList', 0);

			this.disableField('sendToServer');
			this.setFieldValue('sendToServer', 1);
			this.disableField('storeInDb');
			this.setFieldValue('storeInDb', 1);
			this.hideField('forSearch', 'requirement', 'unique');
		case FIELD_TYPE.LOOKUP:
			this.hideField('maxLength', 'unique');
			this.setFieldValue('unique', false);
			this.showField('nodeRef');
			break;

		case FIELD_TYPE.ENUM:
			this.showField('enum');
			this.hideField('maxLength');
			break;
		case FIELD_TYPE.HTML_EDITOR:
		case FIELD_TYPE.IMAGE:
			this.showField('width', 'height');
			this.hideField('maxLength');
			break;
		case FIELD_TYPE.BOOL:
		case FIELD_TYPE.DATE_TIME:
		case FIELD_TYPE.DATE:
		case FIELD_TYPE.COLOR:
		case FIELD_TYPE.FILE:
			this.hideField('maxLength');
			break;
		}

		if (this.isUpdateRecord) {
			this.disableField('fieldName');
			this.disableField('fieldType');
			this.disableField('nodeRef');
			this.disableField('nodeFieldsLinker');
			this.disableField('storeInDb');
			this.disableField('sendToServer');
		}

		if (fieldType === FIELD_TYPE.LOOKUP) {
			this.disableField('forSearch');
			this.setFieldValue('forSearch', 1);
		}

		if (fieldType === FIELD_TYPE.TEXT || fieldType === FIELD_TYPE.HTML_EDITOR) {
			this.showField('multilingual');
		} else {
			this.hideField('multilingual');
			this.setFieldValue('multilingual', false);
		}
		this.check12nFieldName();

		if (!this.fieldValue('sendToServer')) {
			this.disableField('storeInDb');
			this.setFieldValue('storeInDb', 0);
		}

		if (!this.fieldValue('storeInDb')) {
			this.disableField('forSearch');
			this.setFieldValue('forSearch', 0);
		}

		if (!this.fieldValue('forSearch')) {
			this.disableField('unique');
			this.setFieldValue('unique', 0);
		}

		this.makeFieldRequired('maxLength', this.isFieldVisible('maxLength'));
	}

	_fields_store_in_db_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_fields_send_to_server_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_fields_for_search_onChange() {
		this._fields_recalculateFieldsVisibility();
	}

	_login_signInBtn_onChange() {
		this.save();
	}

	_nodes_store_forms_onChange() {
		this._nodes_node_type_onChange();
	}

	//_insertNewHandlersHere_
}

export { FieldsEvents };

