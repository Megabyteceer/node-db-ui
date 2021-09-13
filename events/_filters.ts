import { reloadMetadataSchedule } from "../core/desc-node";
import { RecordData, RecordDataWrite, UserSession } from "../www/js/bs-utils";

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
}
