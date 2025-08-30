import { throwError } from '../../www/client-core/src/assert';
import type { RecordDataWrite, UserSession } from '../../www/client-core/src/bs-utils';
import { authorizeUserByID, getPasswordHash } from '../auth';
import type { NodeEventsHandlers } from '../describe-node';
import { L } from '../locale';
import { loginWithGoogle } from '../login-social';
import { D, mysqlExec, NUM_1 } from '../mysql-connection';

const LOGIN_SQL_PART = '\' AND _users.status=' + NUM_1 + ' LIMIT ' + NUM_1;
const LOGIN_SQL_UPDATE_PART = 'UPDATE _users SET blockedTo=DATE_ADD( NOW(),INTERVAL ' + NUM_1 + ' MINUTE), mistakes=' + D(3) + ' WHERE id=';
const LOGIN_UPDATE_SQL_PART2 = 'UPDATE _users SET mistakes=(mistakes-' + NUM_1 + ') WHERE id=';
const handlers: NodeEventsHandlers = {
	beforeCreate: async function (data: RecordDataWrite, userSession: UserSession): Promise<any> {
		const username = data.username;
		const password = data.password;
		if (username === 'google-auth-sign-in') {
			return await loginWithGoogle(password, userSession);
		}

		const users = await mysqlExec('SELECT id, salt, EXTRACT(SECOND FROM ("blockedTo" - NOW())) AS blocked, password, mistakes FROM _users WHERE email=\'' + username + LOGIN_SQL_PART);
		const user = users[0];
		if (user) {

			const userID = user.id;

			const blocked = user.blocked;

			if (blocked > 0) {
				throwError(L('USER_BLOCKED', userSession, blocked));
			} else {
				const mistakes = user.mistakes;

				const key = await getPasswordHash(password, user.salt);
				if (key !== user.password) {
					if (mistakes <= 1) {
						await mysqlExec(LOGIN_SQL_UPDATE_PART + D(userID));
					} else {
						await mysqlExec(LOGIN_UPDATE_SQL_PART2 + D(userID));
					}
					throwError(L('WRONG_PASS', userSession));
				}
				return await authorizeUserByID(userID);
			}
		}
		throwError(L('WRONG_PASS', userSession));
	}
};
export default handlers;
