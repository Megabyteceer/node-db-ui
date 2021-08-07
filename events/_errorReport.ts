import { mail_utf8, UserSession } from "../core/auth";
import { NodeEventsHandlers } from "../core/desc-node.js";
import ENV from "../ENV";
import { RecordDataWrite } from "../www/js/bs-utils.js";

const handlers: NodeEventsHandlers = {
	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		debugger;
		if(ENV.ERROR_NOTIFY_EMAIL) {
			let emails = ENV.ERROR_NOTIFY_EMAIL.split(',');
			for(let email of emails) {
				if(email) {
					mail_utf8(email, 'Error at ' + ENV.SERVER_NAME + '; ' + data.name, data.stack);
				}
			}
		}
	}
};
export default handlers;