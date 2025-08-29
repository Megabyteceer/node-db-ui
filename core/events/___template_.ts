import type { RecordData, RecordDataWrite, UserSession } from "../../www/client-core/src/bs-utils";
import type { NodeEventsHandlers } from "../describe-node";

const handlers: NodeEventsHandlers = {

	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession) {

	},

	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {

	},

	beforeUpdate: async function(currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {

	},

	afterUpdate: async function(data: RecordData, userSession: UserSession) {

	},

	beforeDelete: async function(data: RecordData, userSession: UserSession) {

	},


	afterDelete: async function(data: RecordData, userSession: UserSession) {

	}
}
export default handlers;