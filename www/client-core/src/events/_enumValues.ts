import { E, type FormEnumValues } from '../../../../types/generated';
import { clientOn } from '../../../../www/client-core/src/events-handle';

clientOn(E._enumValues.onLoad, (form) => {
	if (form.isNewRecord && form.parent) {

		let maxEnumVal = 0;
		for (const item of form.parent.children as FormEnumValues[]) {
			const value = item.fieldValue('value');
			if (value > maxEnumVal) {
				maxEnumVal = value;
			}
		}
		form.setFieldValue('value', maxEnumVal + 1);
	}
});
