import { generateSalt, getPasswordHash, getServerHref, mail_utf8 } from "../core/auth";
import { L } from "../core/locale";
import { mysqlExec, mysqlRowsResult } from "../core/mysql-connection";
import ENV from "../ENV";
import { RecordDataWrite, throwError } from "../www/js/bs-utils";
import { randomBytes } from "crypto";
import { UserSession } from "../core/auth";

export default {
	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		data.salt = generateSalt();
		data.activationKey = randomBytes(24).toString('base64');
		data.password = await getPasswordHash(data.password, data.salt);

		let pgs = await mysqlExec("SELECT id FROM _users WHERE _users.status=1 AND email='" + data.email + "' LIMIT 1") as mysqlRowsResult;
		if(pgs.length > 0) {
			throwError('EMAIL_ALREADY');
		} else {
			let href = getServerHref() + '?activate_user&key=' + data.activationKey;
			await mail_utf8(data.email, L('CONFIRM_EMAIL_SUBJ'), L('CONFIRM_EMAIL', ENV.APP_TITLE) + href);
		}
	}
}