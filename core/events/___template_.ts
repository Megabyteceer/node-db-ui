import type { RecordDataWrite, UserSession } from '../../www/client-core/src/bs-utils';
import type { NodeEventsHandlers } from '../describe-node';

type T = any/*$RECORD_TYPE*/;

const handlers: NodeEventsHandlers = {

	beforeCreate: async function(data: RecordDataWrite<T>, userSession: UserSession) {

	},

	afterCreate: async function(data: RecordDataWrite<T>, userSession: UserSession) {

	},

	beforeUpdate: async function(currentData: T, newData: RecordDataWrite<T>, userSession: UserSession) {

	},

	afterUpdate: async function(data: T, userSession: UserSession) {

	},

	beforeDelete: async function(data: T, userSession: UserSession) {

	},


	afterDelete: async function(data: T, userSession: UserSession) {

	}
};
export default handlers;
