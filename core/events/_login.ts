import { authorizeUserByID, getPasswordHash } from "../auth";
import { L } from "../locale";
import { mysqlExec, mysqlRowResultSingle } from "../mysql-connection";
import { NodeEventsHandlers } from "../describe-node"
import { RecordDataWrite, throwError, UserSession } from "../../www/src/bs-utils";

const handlers: NodeEventsHandlers = {
	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession): Promise<any> {
		const username = data.username;
		const password = data.password;
		let user = await mysqlExec("SELECT id, salt, TIMESTAMPDIFF(SECOND, NOW(), blocked_to) AS blocked, password, mistakes FROM _users WHERE email='" + username + "' AND _users.status=1 LIMIT 1") as mysqlRowResultSingle;
		user = user[0];
		if(user) {

			let userID = user.id;

			let blocked = user.blocked;

			if(blocked > 0) {
				throwError(L('USER_BLOCKED', userSession, blocked));
			} else {
				let mistakes = user.mistakes;

				let key = await getPasswordHash(password, user.salt);
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