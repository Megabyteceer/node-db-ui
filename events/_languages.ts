import { reloadMetadataSchedule } from "../core/desc-node";
import { getRecords } from "../core/get-records";
import { createFieldInTable } from "./_fields";
import { RecordData, RecordDataWrite, throwError, UserSession } from "../www/js/bs-utils";
import { shouldBeAdmin } from "../core/admin/admin";

export default {

	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin();
		const fieldsData = await getRecords(6, 1, null, undefined, { multilingual: 1, p: '*' });
		const fields = fieldsData.items;
		for(let f of fields) {
			f.node_fields_linker = f.node_fields_linker.id;
			f.fieldName = f.fieldName + '$' + data.code;
			f.unique = 0;
			await createFieldInTable(f);
		}
		reloadMetadataSchedule();
	},

	beforeUpdate: async function(currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {
		if(newData.hasOwnProperty('code')) {
			throwError("Cant change 'code' of language.");
		}
		reloadMetadataSchedule();
	},

	beforeDelete: async function(data: RecordData, userSession: UserSession) {
		throwError('_languages beforeCreate deletion event is not implemented');
	}
}
