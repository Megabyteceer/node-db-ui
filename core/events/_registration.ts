import { randomBytes } from "crypto";
import { NODE_ID, RecordDataWrite } from "../../www/client-core/src/bs-utils";
import { generateSalt, getPasswordHash, getServerHref, mail_utf8, UserSession } from "../auth";

import { ENV } from '../../core/ENV';

import { throwError } from '../../www/client-core/src/assert';
import { L } from "../locale";
import { mysqlExec } from "../mysql-connection";

export default {
	beforeCreate: async function (data: RecordDataWrite, userSession: UserSession) {

		data.salt = generateSalt();
		data.activation_key = randomBytes(24).toString('base64');
		data.password = await getPasswordHash(data.password, data.salt);

		let pgs = await mysqlExec("SELECT id FROM _users WHERE _users.status=1 AND email='" + data.email + "' LIMIT 1");
		if(pgs.length > 0) {
			throwError(L('EMAIL_ALREADY', userSession));
		} else {
			let href = getServerHref() + '#n/' + NODE_ID.RESET + '/r/new/e/f/activation_key/' + encodeURIComponent(data.activation_key);
			await mail_utf8(data.email, L('CONFIRM_EMAIL_SUBJ', userSession), L('CONFIRM_EMAIL', userSession, ENV.APP_TITLE) + href);
		}
	}
}