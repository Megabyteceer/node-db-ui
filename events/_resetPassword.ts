import { getServerHref, mail_utf8 } from "../core/auth";
import { L } from "../core/locale";
import { mysqlExec, mysqlRowsResult } from "../core/mysql-connection";
import { NODE_ID, RecordDataWrite } from "../www/src/bs-utils";
import { UserSession } from "../core/auth";
import { randomBytes } from "crypto";

export default {
	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		const email = data.email;
		if(email) {
			let pgs = await mysqlExec("SELECT id FROM _users WHERE _users.status=1 AND email='" + email + "' LIMIT 1") as mysqlRowsResult;
			if(pgs.length > 0) {
				let user = pgs[0];
				const resetCode = randomBytes(24).toString('base64');
				await mysqlExec("UPDATE _users SET reset_time=NOW(), resetCode = '" + resetCode + "' WHERE id=" + user.id + " LIMIT 1");
				let href = getServerHref() + '#n/' + NODE_ID.RESET + '/r/new/e/f/userId/' + user.id + '/resetCode/' + encodeURIComponent(resetCode);
				await mail_utf8(data.email, L('PASSWORD_RESET_EMAIL_HEADER', userSession), L('PASSWORD_RESET_EMAIL_BODY', userSession, href));
			}
		}
	}
}