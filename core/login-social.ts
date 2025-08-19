
import { OAuth2Client } from 'google-auth-library';

import { throwError, UserSession } from "../www/client-core/src/bs-utils";
import { authorizeUserByID, createUser } from './auth';
import { ENV } from './ENV';
import { L } from "./locale";
import { mysql_real_escape_string, mysqlExec } from './mysql-connection';

const client = new OAuth2Client(ENV.clientOptions.googleSigninClientId);

async function loginWithGoogle(token, userSession: UserSession) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: ENV.clientOptions.googleSigninClientId,
	});
	const payload = ticket.getPayload();
	if(!payload.email_verified) {
		throwError(L("WRONG_PASS", userSession));
	}
	const email = payload.email;
	var users = await mysqlExec("SELECT id FROM _users WHERE status = 1 AND email='" + email + "'");
	if(users.length > 0) {
		return authorizeUserByID(users[0].id);
	} else {
		const userId = await createUser({
			name: payload.name,
			email
		}, userSession);

		let ret = await authorizeUserByID(userId);
		if(payload.picture) {
			ret.avatar = payload.picture;
			await mysqlExec("UPDATE _users SET avatar = '" + mysql_real_escape_string(payload.picture) + "' WHERE id = " + userId);
		}
		return ret;
	}
}


export { loginWithGoogle };
