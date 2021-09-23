import { authorizeUserByID, getPasswordHash } from "../core/auth";
import { L } from "../core/locale";
import { mysqlExec, mysqlRowResultSingle } from "../core/mysql-connection";
import { NodeEventsHandlers } from "../core/describe-node"
import { RecordDataWrite, throwError, UserSession } from "../www/js/bs-utils";

const handlers: NodeEventsHandlers = {
	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession): Promise<any> {
		const username = data.username;
		const password = data.password;
		let user = await mysqlExec("SELECT id, activation, salt, TIMESTAMPDIFF(SECOND, NOW(), blocked_to) AS blocked, password, mistakes FROM _users WHERE email='" + username + "' AND _users.status=1 LIMIT 1") as mysqlRowResultSingle;
		user = user[0];
		if(user) {

			let userID = user.id;

			let blocked = user.blocked;

			if(blocked > 0) {
				throwError(L('USER_BLOCKED', blocked));
			} else {
				let mistakes = user.mistakes;

				let key = await getPasswordHash(password, user.salt);
				if(key !== user.password) {
					if(mistakes <= 1) {
						await mysqlExec("UPDATE _users SET blocked_to=DATE_ADD( NOW(),INTERVAL 1 MINUTE), mistakes=3 WHERE id='" + userID + "'");
					} else {
						await mysqlExec("UPDATE _users SET mistakes=(mistakes-1) WHERE id='" + userID + "'");
					}
					throwError('WRONG_PASS');
				}
				return await authorizeUserByID(userID);
			}
		}
		throwError('WRONG_PASS');
	}
}
export default handlers;