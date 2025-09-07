import { NODE_ID } from '../../types/generated';
import { throwError } from '../../www/client-core/src/assert';
import { VIEW_MASK } from '../../www/client-core/src/bs-utils';

import { serverOn } from '../../www/client-core/src/events-handle';
import { shouldBeAdmin } from '../admin/admin';
import { reloadMetadataSchedule } from '../describe-node';
import { getRecords } from '../get-records';
import { createFieldInTable } from './_fields';

serverOn('_languages.afterCreate', async (data, _userSession) => {
	shouldBeAdmin();
	const fieldsData = await getRecords(NODE_ID.FIELDS, VIEW_MASK.EDITABLE, undefined, undefined, {
		multilingual: 1,
		p: '*',
	});
	const fields = fieldsData.items;
	for (const f of fields) {
		f.fieldName = f.fieldName + '$' + data.code;
		f.unique = 0;
		await createFieldInTable(f);
	}
	reloadMetadataSchedule();
});

serverOn('_languages.beforeUpdate', async (_currentData, newData, _userSession) => {
	if (newData.hasOwnProperty('code')) {
		throwError('Cant change \'code\' of language.');
	}
	reloadMetadataSchedule();
});
serverOn('_languages.beforeDelete', async (_data, _userSession) => {
	throwError('_languages beforeCreate deletion event is not implemented');
});
