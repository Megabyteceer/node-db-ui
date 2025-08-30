import type { IFiltersRecord } from '../../types/generated';
import type { RecordDataWrite, UserSession } from '../../www/client-core/src/bs-utils';
import { reloadMetadataSchedule } from '../describe-node';

type T = IFiltersRecord;

export default {

	afterCreate: async function(_data: RecordDataWrite<T>, _userSession: UserSession) {
		reloadMetadataSchedule();
	},

	beforeUpdate: async function(_currentData: T, _newData: RecordDataWrite<T>, _userSession: UserSession) {
		reloadMetadataSchedule();
	},

	beforeDelete: async function(_data: T, _userSession: UserSession) {
		reloadMetadataSchedule();
	}
};
