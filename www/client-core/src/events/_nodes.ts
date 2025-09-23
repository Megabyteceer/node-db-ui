import { clientOn } from '../../../../www/client-core/src/events-handle';
import { makeIconSelectionField, makeReactClassSelectionField, removeReactClassSelectionField } from '../admin/admin-utils';
import type Form from '../form';
import { E, NODE_TYPE, type FormNodes, type IFieldsFilter, type IFiltersFilter } from '../types/generated';
import { L, submitData } from '../utils';

export const removeWrongCharactersInField = (form: Form, fieldName: string) => {
	if (!form.isUpdateRecord) {
		const oldValue = form.fieldValue(fieldName);
		if (oldValue) {
			const newValue = oldValue.replace(/[^a-zA-Z0-9]/gm, '_').replace(/^\d+/, '');
			if (oldValue != newValue) {
				form.setFieldValue(fieldName, newValue);
			}
		}
	}
};

/// #if DEBUG

const checkTableExists = async (form: FormNodes) => {
	if (!form.isUpdateRecord) {
		const tableName = form.fieldValue('tableName');
		const ret = await submitData('admin/isTableExists', { tableName });
		if (!ret) {
			form.fieldAlert('tableName', 'Table with this name is already exist.', false, true, 'table-name-exists');
		} else {
			form.fieldHideAlert('tableName', 'table-name-exists');
		}
	}
};

const _nodes_recalculateFieldsVisibility = (form: FormNodes) => {
	if (!form.isNewRecord && form.fieldValue('nodeType') === NODE_TYPE.DOCUMENT) {
		form.showField('_fieldsId');
		form.showField('reverse');
		form.showField('defaultFilterId');
	} else {
		form.hideField('_fieldsId');
		form.hideField('reverse');
		form.hideField('defaultFilterId');
	}

	if (form.fieldValue('nodeType') === NODE_TYPE.STATIC_LINK) {
		form.showField('staticLink');
	} else {
		form.hideField('staticLink');
	}
};

clientOn(E._nodes.onLoad, (form) => {
	if (form.isNewRecord || form.fieldValue('nodeType') !== NODE_TYPE.DOCUMENT) {
		form.hideField('fieldsTab');
		form.hideField('filtersTab');
	}

	makeIconSelectionField(form, 'icon');

	if (form.fieldValue('nodeType') !== NODE_TYPE.DOCUMENT) {
		form.hideField('defaultFilterId');
	} else if (form.isUpdateRecord) {
		form.addLookupFilters('defaultFilterId', {
			nodeFiltersLinker: form.recId
		} as IFiltersFilter);
	} else {
		if (!form.fieldValue('storeForms')) {
			form.setFieldValue('storeForms', 1);
		}
	}

	_nodes_recalculateFieldsVisibility(form);

	if (form.isUpdateRecord) {
		form.disableField('nodeType');
		form.disableField('storeForms');
		form.disableField('tableName');
	}

	if (form.isNewRecord) {
		if (!form.fieldValue('recPerPage')) {
			form.setFieldValue('recPerPage', 25);
		}
		form.hideField('_fieldsId');
	} else {
		form.addLookupFilters('_nodesId', 'excludeIDs', [form.recId]);
		form.addLookupFilters('nodeFields', 'n', 200);
	}
	form.addLookupFilters('_nodesId', 'nodeType', NODE_TYPE.SECTION);
	form.addLookupFilters('_fieldsId', {
		nodeFieldsLinker: form.recId,
		forSearch: 1
	} as IFieldsFilter);
});

clientOn(E._nodes.onSave, (form) => {
	if (form.fieldValue('nodeType') !== NODE_TYPE.DOCUMENT) {
		const name = form.fieldValue('name');
		form.setFieldValue('singleName', name);
		form.setFieldValue('storeForms', 0);
	} else {
		if (/[^a-zA-Z_0-9]/.test(form.fieldValue('tableName'))) {
			form.fieldAlert('tableName', L('LATIN_ONLY'));
		}

		if (form.fieldValue('tableName') == parseInt(form.fieldValue('tableName')).toString()) {
			form.fieldAlert('tableName', L('NO_NUMERIC_NAME'));
		}
	}
});

const nodeTypeOnChange = (form: FormNodes) => {
	const nodeType = form.fieldValue('nodeType');

	if (nodeType === NODE_TYPE.DOCUMENT) {
		form.showField(
			'creationName',
			'singleName',
			'reverse',
			'draftable',
			'storeForms',
			'recPerPage',
			'dataStorageGroup',
			'appearanceGroup'
		);
		form.makeFieldRequired('singleName');
	} else {
		form.hideField(
			'creationName',
			'singleName',
			'reverse',
			'draftable',
			'storeForms',
			'recPerPage',
			'dataStorageGroup',
			'appearanceGroup'
		);
		form.makeFieldRequired('singleName', false);
	}

	if (nodeType === NODE_TYPE.DOCUMENT || nodeType === NODE_TYPE.REACT_CLASS) {
		form.makeFieldRequired('tableName');
		form.showField('tableName');
	} else {
		form.hideField('tableName');
		form.makeFieldRequired('tableName', false);
	}

	if (nodeType === NODE_TYPE.REACT_CLASS) {
		form.setFieldLabel('tableName', L('CLASS_NAME'));
		makeReactClassSelectionField(form, 'tableName');
	} else {
		form.setFieldLabel('tableName');
		removeReactClassSelectionField(form, 'tableName');
	}

	_nodes_recalculateFieldsVisibility(form);
};

clientOn(E._nodes.nodeType.onChange, nodeTypeOnChange);

clientOn(E._nodes.storeForms.onChange, nodeTypeOnChange);

clientOn(E._nodes.tableName.onChange, (form) => {
	removeWrongCharactersInField(form, 'tableName');
	checkTableExists(form);
	const name = form.fieldValue('tableName');
	if (!form.isUpdateRecord) {
		if (name.startsWith('_') || name.startsWith('pg_')) {
			form.fieldAlert('tableName', 'Table name can not start with "_" or "pg_"', false, true, 'prohibited-system-name');
		} else {
			form.fieldHideAlert('tableName', 'prohibited-system-name');
		}
	}
});
/// #endif
