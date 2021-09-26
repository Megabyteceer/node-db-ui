import { generateSalt, getPasswordHash, getServerHref, mail_utf8 } from "../core/auth";
import { L } from "../core/locale";
import { mysqlExec, mysqlRowsResult } from "../core/mysql-connection";
import ENV from "../ENV";
import { NODE_ID_RESET, RecordDataWrite, throwError } from "../www/js/bs-utils";
import { randomBytes } from "crypto";
import { UserSession } from "../core/auth";

export default {
	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession) {

		data.salt = generateSalt();
		data.activationKey = randomBytes(24).toString('base64');
		data.password = await getPasswordHash(data.password, data.salt);

		let pgs = await mysqlExec("SELECT id FROM _users WHERE _users.status=1 AND email='" + data.email + "' LIMIT 1") as mysqlRowsResult;
		if(pgs.length > 0) {
			throwError(L('EMAIL_ALREADY', userSession));
		} else {
			let href = getServerHref() + '#n/' + NODE_ID_RESET + '/r/new/e/f/activationKey/' + encodeURIComponent(data.activationKey);
			await mail_utf8(data.email, L('CONFIRM_EMAIL_SUBJ', userSession), L('CONFIRM_EMAIL', userSession, ENV.APP_TITLE) + href);
		}
	}
}