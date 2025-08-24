import { randomBytes } from "crypto";
import { NODE_ID, RecordDataWrite } from "../../www/client-core/src/bs-utils";
import { getServerHref, mail_utf8, UserSession } from "../auth";
import { L } from "../locale";
import { mysqlExec } from "../mysql-connection";

export default {
	beforeCreate: async function (data: RecordDataWrite, userSession: UserSession) {
		const email = data.email;
		if(email) {
			let pgs = await mysqlExec("SELECT id FROM _users WHERE _users.status=1 AND email='" + email + "' LIMIT 1");
			if(pgs.length > 0) {
				let user = pgs[0];
				const reset_code = randomBytes(24).toString('base64');
				await mysqlExec("UPDATE _users SET reset_time=NOW(), reset_code = '" + reset_code + "' WHERE id=" + user.id);
				let href = getServerHref() + '#n/' + NODE_ID.RESET + '/r/new/e/f/userId/' + user.id + '/reset_code/' + encodeURIComponent(reset_code);
				await mail_utf8(data.email, L('PASSWORD_RESET_EMAIL_HEADER', userSession), L('PASSWORD_RESET_EMAIL_BODY', userSession, href));
			}
		}
	}
}