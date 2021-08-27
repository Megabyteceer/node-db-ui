import { NodeEventsHandlers } from "../core/desc-node"
import { RecordData, RecordDataWrite, UserSession } from "../www/js/bs-utils";

const handlers: NodeEventsHandlers = {

	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession) {

	},

	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {

	},

	beforeUpdate: async function(currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {

	},

	beforeDelete: async function(data: RecordData, userSession: UserSession) {

	}
}
export default handlers;