const {getRecords} = require("../core/get-records.js");
const {createFieldInTable} = require("./_fields.js");

module.exports = {

	post: async function(data, userSession) {
		debugger;
		const fields = await getRecords(6, 1, false, true, {multilang: 1, p: '*'});
		fields = fields.items;
		for(let f of fields) {
			f.node_fields_linker = f.node_fields_linker.id;
			f.fieldName = f.fieldName + '_' + data.code;
			f.uniqu = 0;
			createFieldInTable(f);
		}
		reloadMetadataSchedule();
	},

	update: async function(currentData, newData, userSession) {
		throw new Error('_languages update event is not implemented');
	},

	delete: async function(data, userSession) {
		throw new Error('_languages pre deletion event is not implemented');
	}
}
