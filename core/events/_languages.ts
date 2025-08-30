import { NODE_ID, type ILanguagesRecord } from '../../types/generated';
import { throwError } from '../../www/client-core/src/assert';
import type { RecordDataWrite, UserSession } from '../../www/client-core/src/bs-utils';

import { shouldBeAdmin } from '../admin/admin';
import { reloadMetadataSchedule } from '../describe-node';
import { getRecords } from '../get-records';
import { createFieldInTable } from './_fields';

type T = ILanguagesRecord;

export default {
	afterCreate: async function (data: RecordDataWrite<T>, _userSession: UserSession) {
		shouldBeAdmin();
		const fieldsData = await getRecords(NODE_ID.FIELDS, 1, null, undefined, {
			multilingual: 1,
			p: '*',
		});
		const fields = fieldsData.items;
		for (const f of fields) {
			f.nodeFieldsLinker = f.nodeFieldsLinker.id;
			f.fieldName = f.fieldName + '$' + data.code;
			f.unique = 0;
			await createFieldInTable(f);
		}
		reloadMetadataSchedule();
	},

	beforeUpdate: async function (
		_currentData: ILanguagesRecord,
		newData: RecordDataWrite<T>,
		_userSession: UserSession
	) {
		if (newData.hasOwnProperty('code')) {
			throwError('Cant change \'code\' of language.');
		}
		reloadMetadataSchedule();
	},

	beforeDelete: async function (_data: T, _userSession: UserSession) {
		throwError('_languages beforeCreate deletion event is not implemented');
	},
};
