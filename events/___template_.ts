import { NodeEventsHandlers } from "../core/describe-node"
import type { RecordData, RecordDataWrite, UserSession } from "../www/src/bs-utils";

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