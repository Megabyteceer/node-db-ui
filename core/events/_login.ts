import { throwError } from '../../www/client-core/src/assert';
import type { RecordDataWrite, UserSession } from "../../www/client-core/src/bs-utils";
import { authorizeUserByID, getPasswordHash } from "../auth";
import type { NodeEventsHandlers } from "../describe-node";
import { L } from "../locale";
import { loginWithGoogle } from "../login-social";
import { mysqlExec } from "../mysql-connection";

const handlers: NodeEventsHandlers = {
	beforeCreate: async function (data: RecordDataWrite, userSession: UserSession): Promise<any> {
		const username = data.username;
		const password = data.password;
		if(username === 'google-auth-sign-in') {
			return await loginWithGoogle(password, userSession);
		}

		const users = await mysqlExec("SELECT id, salt, EXTRACT(SECOND FROM (blocked_to - NOW())) AS blocked, password, mistakes FROM _users WHERE email='" + username + "' AND _users.status=1 LIMIT 1");
		const user = users[0];
		if(user) {

			const userID = user.id;

			const blocked = user.blocked;

			if(blocked > 0) {
				throwError(L('USER_BLOCKED', userSession, blocked));
			} else {
				const mistakes = user.mistakes;

				const key = await getPasswordHash(password, user.salt);
				if(key !== user.password) {
					if(mistakes <= 1) {
						await mysqlExec("UPDATE _users SET blocked_to=DATE_ADD( NOW(),INTERVAL 1 MINUTE), mistakes=3 WHERE id='" + userID + "'");
					} else {
						await mysqlExec("UPDATE _users SET mistakes=(mistakes-1) WHERE id='" + userID + "'");
					}
					throwError(L('WRONG_PASS', userSession));
				}
				return await authorizeUserByID(userID);
			}
		}
		throwError(L('WRONG_PASS', userSession));
	}
}
export default handlers;