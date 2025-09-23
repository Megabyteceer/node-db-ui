import type { UserSession } from '../../www/client-core/src/bs-utils';
import type { IFiltersRecord, IFiltersRecordWrite } from '../../www/client-core/src/types/generated';
import { reloadMetadataSchedule } from '../describe-node';

export default {

	afterCreate: async function (_data: IFiltersRecordWrite, _userSession: UserSession) {
		reloadMetadataSchedule();
	},

	beforeUpdate: async function (_currentData: IFiltersRecord, _newData: IFiltersRecordWrite, _userSession: UserSession) {
		reloadMetadataSchedule();
	},

	beforeDelete: async function (_data: IFiltersRecord, _userSession: UserSession) {
		reloadMetadataSchedule();
	}
};
