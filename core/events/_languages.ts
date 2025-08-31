import { NODE_ID, type IFieldsFilter, type ILanguagesRecord, type ILanguagesRecordWrite } from '../../types/generated';
import { throwError } from '../../www/client-core/src/assert';
import { VIEW_MASK, type UserSession } from '../../www/client-core/src/bs-utils';

import { shouldBeAdmin } from '../admin/admin';
import { reloadMetadataSchedule } from '../describe-node';
import { getRecords } from '../get-records';
import { createFieldInTable } from './_fields';

type T = ILanguagesRecord;
type W = ILanguagesRecordWrite;

export default {
	afterCreate: async function (data: W, _userSession: UserSession) {
		shouldBeAdmin();
		const fieldsData = await getRecords(NODE_ID.FIELDS, VIEW_MASK.EDITABLE, undefined, undefined, {
			multilingual: 1,
			p: '*',
		} as IFieldsFilter);
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
		newData: W,
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
