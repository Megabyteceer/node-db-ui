import { clientOn } from '../../../../www/client-core/src/events-handle';
import { onSystemRecordsModified } from '../admin/admin-utils';
import type { LookupOneToManyFiled } from '../fields/field-15-one-to-many';
import { E, type FormEnumValues } from '../types/generated';
import { L } from '../utils';

clientOn(E._enums.onLoad, (form) => {
	form.getField('values').inlineEditable();
});

clientOn(E._enums.onSave, (form) => {
	let ret;
	const valuesForms = (form.getField('values') as LookupOneToManyFiled).getSubForms<FormEnumValues>();

	const existsValue = {} as KeyedMap<true>;
	for (const form of valuesForms) {
		const val = form.getFieldValue('value');
		if (existsValue[val]) {
			ret = true;
			form.fieldAlert('value', L('VALUE_EXISTS'), false, true, 'enum-val-in-use');
		} else {
			form.fieldHideAlert('value', 'enum-val-in-use');
		}
		existsValue[val] = true;
	}
	const existsName = {} as KeyedMap<true>;
	for (const form of valuesForms) {
		const name = form.getFieldValue('name');
		if (existsName[name]) {
			ret = true;
			form.fieldAlert('name', L('VALUE_EXISTS'), false, true, 'enum-name-in-use');
		} else {
			form.fieldHideAlert('name', 'enum-name-in-use');
		}
		existsName[name] = true;
	}
	return ret;
});

clientOn(E._enums.afterSave, async () => {
	onSystemRecordsModified();
});