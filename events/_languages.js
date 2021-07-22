const {reloadMetadataSchedule} = require("../core/desc-node.js");
const {getRecords} = require("../core/get-records.js");
const {createFieldInTable} = require("./_fields.js");

module.exports = {

	afterCreate: async function(data, userSession) {
		debugger;
		const fields = await getRecords(6, 1, false, true, {multilang: 1, p: '*'});
		fields = fields.items;
		for(let f of fields) {
			f.node_fields_linker = f.node_fields_linker.id;
			f.fieldName = f.fieldName + '_' + data.code;
			f.uniqu = 0;
			await createFieldInTable(f);
		}
		reloadMetadataSchedule();
	},

	beforeUpdate: async function(currentData, newData, userSession) {
		throw new Error('_languages beforeUpdate event is not implemented');
	},

	beforeDelete: async function(data, userSession) {
		throw new Error('_languages beforeCreate deletion event is not implemented');
	}
}
