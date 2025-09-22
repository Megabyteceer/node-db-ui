import { E, type FormEnumValues } from '../../../../types/generated';
import { clientOn } from '../../../../www/client-core/src/events-handle';
import type { LookupOneToManyFiled } from '../fields/field-15-one-to-many';
import { L } from '../utils';

clientOn(E._enums.onLoad, (form) => {
	form.getField('values').inlineEditable();
});

clientOn(E._enums.onSave, (form) => {
	let ret;
	const exists = {} as KeyedMap<true>;
	const valuesForms = (form.getField('values') as LookupOneToManyFiled).getSubForms<FormEnumValues>();
	for (const form of valuesForms) {
		const val = form.fieldValue('value');
		if (exists[val]) {
			ret = true;
			form.fieldAlert('value', L('VALUE_EXISTS'));
		}
		exists[val] = true;
	}
	return ret;
});
