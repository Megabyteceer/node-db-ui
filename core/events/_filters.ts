import type { RecordData, RecordDataWrite, UserSession } from '../../www/client-core/src/bs-utils';
import { reloadMetadataSchedule } from '../describe-node';

export default {

	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		reloadMetadataSchedule();
	},

	beforeUpdate: async function(currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {
		reloadMetadataSchedule();
	},

	beforeDelete: async function(data: RecordData, userSession: UserSession) {
		reloadMetadataSchedule();
	}
};
