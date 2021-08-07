import {reloadMetadataSchedule} from "../core/desc-node.js";
import {getRecords} from "../core/get-records.js";
import {createFieldInTable} from "./_fields.js";
import {throwError} from "../core/utils.js";

export default {

	afterCreate: async function(data, userSession) {
		debugger;
		let fields = await getRecords(6, 1, false, true, {multilang: 1, p: '*'});
		fields = fields.items;
		for(let f of fields) {
			f.node_fields_linker = f.node_fields_linker.id;
			f.fieldName = f.fieldName + '$' + data.code;
			f.uniqu = 0;
			await createFieldInTable(f);
		}
		reloadMetadataSchedule();
	},

	beforeUpdate: async function(currentData, newData, userSession) {
		throwError('_languages beforeUpdate event is not implemented');
	},

	beforeDelete: async function(data, userSession) {
		throwError('_languages beforeCreate deletion event is not implemented');
	}
}
