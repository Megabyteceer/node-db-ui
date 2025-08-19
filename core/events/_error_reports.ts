import { mail_utf8, UserSession } from "../auth";
import { NodeEventsHandlers } from "../describe-node";

import { SERVER_ENV } from '../../core/ENV';
import { RecordDataWrite } from "../../www/client-core/src/bs-utils";

const handlers: NodeEventsHandlers = {
	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		/// #if DEBUG
		debugger;
		/// #endif
		if(SERVER_ENV.ERROR_NOTIFY_EMAIL) {
			let emails = SERVER_ENV.ERROR_NOTIFY_EMAIL.split(',');
			for(let email of emails) {
				if(email) {
					mail_utf8(email, 'Error at ' + SERVER_ENV.SERVER_NAME + '; ' + data.name, data.stack);
				}
			}
		}
	}
};
export default handlers;