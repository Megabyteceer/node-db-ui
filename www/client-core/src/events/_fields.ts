import { clientOn } from '../../../../www/client-core/src/events-handle';
import { makeIconSelectionField, onSystemRecordsModified } from '../admin/admin-utils';
import { VIEW_MASK } from '../bs-utils';
import { E, FIELD_STORAGE_MODE, FIELD_TYPE, NODE_TYPE, type FormFields, type INodesFilter } from '../types/generated';
import { getNode, L, submitData } from '../utils';
import { removeWrongCharactersInField } from './_nodes';

/// #if DEBUG

const showDecimalTips = (form: FormFields) => {
	if (form.getFieldValue('fieldType') === FIELD_TYPE.NUMBER) {
		form.showField('decimals');
		const d = form.getFieldValue('decimals');
		const l = form.getFieldValue('maxLength');
		form.fieldAlert('decimals', '9'.repeat(l) + (d ? '.' + '9'.repeat(d) : ''),
			true, false, 'num-example');
	} else {
		form.hideField('decimals');
		form.fieldHideAlert('decimals', 'num-example');
	}
};

const check12nFieldName = (form: FormFields) => {
	if (form.isNewRecord) {
		const fn = form.getFieldValue('fieldName');
		let nodeId = form.getFieldValue('nodeFieldsLinker')?.id;
		let nodeRef = form.getFieldValue('nodeRef')?.id;

		if (nodeId && fn && fn.length >= 3) {
			if (form.getFieldValue('fieldType') === FIELD_TYPE.LOOKUP_1_TO_N && nodeRef) {
				checkFieldExists(form);
			} else {
				checkFieldExists(form);
			}
		}
	}
};

const checkFieldExists = async (form: FormFields) => {
	if (!form.isUpdateRecord) {
		const fieldName = form.getFieldValue('fieldName');
		const parentNode = form.getFieldValue('nodeFieldsLinker');
		if (parentNode?.id) {
			const ret = await submitData('admin/isFiledExists', { fieldName, nodeId: parentNode.id });
			if (!ret) {
				form.fieldAlert('fieldName', L('FLD_EXISTS'), false, true, 'filed-name-exists');
			}
		} else {
			form.fieldHideAlert('fieldName', 'filed-name-exists');
		}
	}
};

clientOn(E._fields.onLoad, async (form) => {
	makeIconSelectionField(form, 'icon');

	form.hideField('forSearch', 'unique', 'sendToServer', 'storeInDb');

	if (form.isUpdateRecord) {
		if (form.getFieldValue('unique')) {
			form.setFieldValue('storageMode', FIELD_STORAGE_MODE.STORED_INDEXED_UNIQUE);
		} else if (form.getFieldValue('forSearch')) {
			form.setFieldValue('storageMode', FIELD_STORAGE_MODE.STORED_INDEXED);
		} else if (form.getFieldValue('storeInDb')) {
			form.setFieldValue('storageMode', FIELD_STORAGE_MODE.STORED);
		} else if (form.getFieldValue('sendToServer')) {
			form.setFieldValue('storageMode', FIELD_STORAGE_MODE.NOT_STORED);
		}
	}

	_fields_recalculateFieldsVisibility(form);

	const parentNodeVal = form.getFieldValue('nodeFieldsLinker');
	let parentNode: NodeDesc;
	if (parentNodeVal) {
		parentNode = await getNode(parentNodeVal.id);
		if (!parentNode.storeForms) {
			form.setFieldValue('storeInDb', 0);
			form.disableField('storeInDb');
		}
	}

	if (form.isNewRecord) {
		if (isNaN(form.getFieldValue('show'))) {
			form.setFieldValue('show', 5);
			form.setFieldValue('visibilityCreate', 1);
			form.setFieldValue('visibilityView', 1);
			form.setFieldValue('visibilityList', 1);
			form.setFieldValue('visibilityDropdownList', 0);
			form.setFieldValue('visibilitySubFormList', 1);
		}

		if (!form.getFieldValue('prior')) {
			form.setFieldValue('prior', 1);
		}
	} else {
		if (form.getFieldValue('show') & VIEW_MASK.EDITABLE) form.setFieldValue('visibilityCreate', 1);
		else form.setFieldValue('visibilityCreate', 0);

		if (form.getFieldValue('show') & VIEW_MASK.READONLY) form.setFieldValue('visibilityView', 1);
		else form.setFieldValue('visibilityView', 0);

		if (form.getFieldValue('show') & VIEW_MASK.LIST) form.setFieldValue('visibilityList', 1);
		else form.setFieldValue('visibilityList', 0);

		if (form.getFieldValue('show') & VIEW_MASK.DROPDOWN_LIST) form.setFieldValue('visibilityDropdownList', 1);
		else form.setFieldValue('visibilityDropdownList', 0);

		if (form.getFieldValue('show') & VIEW_MASK.SUB_FORM) form.setFieldValue('visibilitySubFormList', 1);
		else form.setFieldValue('visibilitySubFormList', 0);

		if (form.getFieldValue('show') & VIEW_MASK.CUSTOM_LIST) form.setFieldValue('visibilityCustomList', 1);
		else form.setFieldValue('visibilityCustomList', 0);

		if (form.getFieldValue('fieldType') === FIELD_TYPE.IMAGE || form.getFieldValue('fieldType') === FIELD_TYPE.HTML_EDITOR) {
			form.setFieldValue('height', form.getFieldValue('maxLength') % 10000);
			form.setFieldValue('width', Math.floor(form.getFieldValue('maxLength') / 10000));
		}
	}

	form.addLookupFilters('nodeFieldsLinker', {
		nodeType: NODE_TYPE.DOCUMENT
	} as INodesFilter);
	form.addLookupFilters('nodeRef', {
		nodeType: NODE_TYPE.DOCUMENT,
		storeForms: 1
	} as INodesFilter);
	form.hideField('show');
});

clientOn(E._fields.fieldName.onChange, async (form) => {
	await checkFieldExists(form);
});

clientOn(E._fields.onSave, (form) => {
	const fieldType = form.getFieldValue('fieldType');

	form.fieldHideAlert('nodeRef', 'field-required');
	form.fieldHideAlert('fieldName', 'field-required');
	form.fieldHideAlert('height', 'field-required');
	form.fieldHideAlert('width', 'field-required');
	form.fieldHideAlert('maxLength', 'field-required');
	form.fieldHideAlert('maxLength', 'field-required');

	if (fieldType === FIELD_TYPE.LOOKUP || fieldType === FIELD_TYPE.LOOKUP_N_TO_M || fieldType === FIELD_TYPE.LOOKUP_1_TO_N) {
		if (form.isFieldEmpty('nodeRef')) {
			form.fieldAlert('nodeRef', L('REQUIRED_FLD'), false, true, 'field-required');
		}
	}

	if (/[^a-zA-Z_0-9]/.test(form.getFieldValue('fieldName'))) {
		form.fieldAlert('fieldName', L('LATIN_ONLY'), false, true, 'field-required');
	}

	if (form.getFieldValue('fieldName') == parseInt(form.getFieldValue('fieldName')).toString()) {
		form.fieldAlert('fieldName', L('NO_NUMERIC_NAME'), false, true, 'field-required');
	}

	if (fieldType === FIELD_TYPE.IMAGE || fieldType === FIELD_TYPE.HTML_EDITOR) {
		if (!form.getFieldValue('height')) {
			form.fieldAlert('height', L('REQUIRED_FLD'), false, true, 'field-required');
		}
		if (!form.getFieldValue('width')) {
			form.fieldAlert('width', L('REQUIRED_FLD'), false, true, 'field-required');
		}
		const maxLength = Math.min(9999, form.getFieldValue('height')) + (form.getFieldValue('width')) * 10000;
		if (!isNaN(maxLength)) {
			form.setFieldValue('maxLength', maxLength);
		}
	}

	if (!form.getFieldValue('maxLength')) {
		form.setFieldValue('maxLength', 0);
		if (fieldType === FIELD_TYPE.TEXT || fieldType === FIELD_TYPE.NUMBER || fieldType === FIELD_TYPE.PASSWORD) {
			form.fieldAlert('maxLength', L('REQUIRED_FLD'), false, true, 'field-required');
		}
	}

	if (form.isNewRecord) {
		if (form.isNewRecord && (!form.getFieldValue('fieldName') || form.getFieldValue('fieldName').length < 3)) {
			form.fieldAlert('fieldName', L('MIN_NAMES_LEN', 3), false, true, 'field-required');
		}
	} else {
		form.hideField('selectFieldName');
	}

	if (fieldType === FIELD_TYPE.STATIC_HTML_BLOCK || fieldType === FIELD_TYPE.TAB || fieldType === FIELD_TYPE.BUTTON || fieldType === FIELD_TYPE.SPLITTER) {
		form.setFieldValue('storeInDb', 0);
	}
});

clientOn(E._fields.name.onChange, (form) => {
	removeWrongCharactersInField(form, 'fieldName');
	check12nFieldName(form);
});

clientOn(E._fields.visibilityCreate.onChange, (form) => {
	let shv = form.getFieldValue('show');

	if (form.getFieldValue('visibilityCreate')) shv |= VIEW_MASK.EDITABLE;
	else shv &= VIEW_MASK.ALL - VIEW_MASK.EDITABLE;

	form.setFieldValue('show', shv);
});

clientOn(E._fields.visibilityList.onChange, (form) => {
	let shv = form.getFieldValue('show');

	if (form.getFieldValue('visibilityList')) shv |= VIEW_MASK.LIST;
	else shv &= VIEW_MASK.ALL - VIEW_MASK.LIST;

	form.setFieldValue('show', shv);
});

clientOn(E._fields.visibilityCustomList.onChange, (form) => {
	let shv = form.getFieldValue('show');

	if (form.getFieldValue('visibilityCustomList')) shv |= VIEW_MASK.CUSTOM_LIST;
	else shv &= VIEW_MASK.ALL - VIEW_MASK.CUSTOM_LIST;

	form.setFieldValue('show', shv);
});

clientOn(E._fields.visibilityView.onChange, (form) => {
	let shv = form.getFieldValue('show');
	if (form.getFieldValue('visibilityView')) {
		shv |= VIEW_MASK.READONLY;
	} else {
		shv &= VIEW_MASK.ALL - VIEW_MASK.READONLY;
	}

	form.setFieldValue('show', shv);
});

clientOn(E._fields.visibilityDropdownList.onChange, (form) => {
	let shv = form.getFieldValue('show');
	if (form.getFieldValue('visibilityDropdownList')) {
		shv |= VIEW_MASK.DROPDOWN_LIST;
	} else {
		shv &= VIEW_MASK.ALL - VIEW_MASK.DROPDOWN_LIST;
	}

	form.setFieldValue('show', shv);
});

clientOn(E._fields.visibilitySubFormList.onChange, (form) => {
	let shv = form.getFieldValue('show');
	if (form.getFieldValue('visibilitySubFormList')) {
		shv |= VIEW_MASK.SUB_FORM;
	} else {
		shv &= VIEW_MASK.ALL - VIEW_MASK.SUB_FORM;
	}

	form.setFieldValue('show', shv);
});

clientOn(E._fields.nodeRef.onChange, (form) => {
	check12nFieldName(form);
});

const _fields_recalculateFieldsVisibility = (form: FormFields) => {
	const fieldType = form.getFieldValue('fieldType');

	form.showField('maxLength', 'requirement');

	form.hideField(
		'multilingual',
		'nodeRef',
		'width',
		'height',
		'selectFieldName',
		'lookupIcon',
		'enum'
	);
	form.setFieldLabel('description');

	form.enableField('visibilityList');
	form.enableField('visibilityCustomList');
	form.enableField('visibilityDropdownList');
	form.enableField('visibilitySubFormList');

	if (fieldType === FIELD_TYPE.LOOKUP_N_TO_M) {
		form.addLookupFilters('nodeRef', 'excludeIDs', [
			form.getFieldValue('nodeFieldsLinker').id
		]);
	} else {
		form.addLookupFilters('nodeRef', 'excludeIDs', undefined);
	}
	switch (fieldType) {
	case FIELD_TYPE.STATIC_HTML_BLOCK:
		form.setFieldLabel('description', L('CONTENT'));
	case FIELD_TYPE.BUTTON:
	case FIELD_TYPE.TAB:
	case FIELD_TYPE.SPLITTER:
		form.hideField(
			'storageSettingSplitter',
			'maxLength',
			'requirement',
			'storageMode'
		);
		form.setFieldValue('storageMode', FIELD_STORAGE_MODE.CLIENT_SIDE_ONLY);
		break;
	case FIELD_TYPE.LOOKUP_N_TO_M:
	case FIELD_TYPE.LOOKUP_1_TO_N:
		form.disableField('visibilityList');
		form.setFieldValue('visibilityList', 0);
		form.disableField('visibilityCustomList');
		form.setFieldValue('visibilityCustomList', 0);
		form.disableField('visibilityDropdownList');
		form.setFieldValue('visibilityDropdownList', 0);
		form.disableField('visibilitySubFormList');
		form.setFieldValue('visibilitySubFormList', 0);

		form.disableField('storageMode');
		form.setFieldValue('storageMode', FIELD_STORAGE_MODE.STORED);
	case FIELD_TYPE.LOOKUP:
		form.hideField('maxLength', 'unique');
		form.showField('nodeRef');
		break;

	case FIELD_TYPE.ENUM:
		form.showField('enum');
		form.hideField('maxLength');
		break;
	case FIELD_TYPE.HTML_EDITOR:
	case FIELD_TYPE.IMAGE:
		form.showField('width', 'height');
		form.hideField('maxLength');
		break;
	case FIELD_TYPE.BOOL:
	case FIELD_TYPE.DATE_TIME:
	case FIELD_TYPE.DATE:
	case FIELD_TYPE.COLOR:
	case FIELD_TYPE.FILE:
		form.hideField('maxLength');
		break;
	}

	if (form.isUpdateRecord) {
		form.disableField('fieldName');
		form.disableField('fieldType');
		form.disableField('nodeRef');
		form.disableField('nodeFieldsLinker');
	}

	if (fieldType === FIELD_TYPE.LOOKUP) {
		form.disableField('storageMode');
		form.setFieldValue('storageMode', FIELD_STORAGE_MODE.STORED_INDEXED);
	}

	if (fieldType === FIELD_TYPE.TEXT || fieldType === FIELD_TYPE.HTML_EDITOR) {
		form.showField('multilingual');
	} else {
		form.hideField('multilingual');
		form.setFieldValue('multilingual', 0);
	}

	check12nFieldName(form);

	form.makeFieldRequired('maxLength', form.isFieldVisible('maxLength'));
};

clientOn(E._fields.storageMode.onChange, async (form, value: FIELD_STORAGE_MODE) => {
	const flags = {
		[FIELD_STORAGE_MODE.CLIENT_SIDE_ONLY]: 0,
		[FIELD_STORAGE_MODE.NOT_STORED]: 1,
		[FIELD_STORAGE_MODE.STORED]: 2,
		[FIELD_STORAGE_MODE.STORED_INDEXED]: 3,
		[FIELD_STORAGE_MODE.STORED_INDEXED_UNIQUE]: 4
	}[value];

	if (flags > 1) {
		const parentNode = (await getNode(form.getFieldValue('nodeFieldsLinker').id));
		if (!parentNode.storeForms) {
			form.setFieldValue('storageMode', FIELD_STORAGE_MODE.NOT_STORED);
			return;
		}
	}

	form.setFieldValue('sendToServer', flags > 0);
	form.setFieldValue('storeInDb', flags > 1);
	form.setFieldValue('forSearch', flags > 2);
	form.setFieldValue('unique', flags > 3);

	form.fieldAlert('storageMode', {
		[FIELD_STORAGE_MODE.CLIENT_SIDE_ONLY]: 'Field`s value will not be sent to the server and no related field will be created in the database table.',
		[FIELD_STORAGE_MODE.NOT_STORED]: 'Field`s value will be sent to the server but no related field will be created in the database table.',
		[FIELD_STORAGE_MODE.STORED]: 'Field`s value will be sent to the server and related field will be created in the database table.',
		[FIELD_STORAGE_MODE.STORED_INDEXED]: 'Field`s value will be sent to the server and related field will be created in the database table. Field will be used in search and filter operations.',
		[FIELD_STORAGE_MODE.STORED_INDEXED_UNIQUE]: 'Field`s value will be sent to the server and related field will be created in the database table. Field will be used in search and filter operations, and value of the field will be forced to be globally unique.'
	}[value], true);

	_fields_recalculateFieldsVisibility(form);
});

clientOn(E._fields.fieldType.onChange, async (form) => {
	_fields_recalculateFieldsVisibility(form);
	showDecimalTips(form);
});

clientOn(E._fields.decimals.onChange, async (form) => {
	showDecimalTips(form);
});

clientOn(E._fields.maxLength.onChange, async (form) => {
	showDecimalTips(form);
});

clientOn(E._fields.afterSave, async () => {
	onSystemRecordsModified();
});
/// #endif
