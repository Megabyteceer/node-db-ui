import { randomBytes } from 'crypto';

import { serverOn } from '../../www/client-core/src/events-handle';
import { E, NODE_ID, type IResetPasswordFilter } from '../../www/client-core/src/types/generated';
import { getServerHref, mail_utf8 } from '../auth';
import { L } from '../locale';
import { D, escapeString, mysqlExec, NUM_1 } from '../mysql-connection';

export interface ResetPasswordData extends IResetPasswordFilter { // TODO remove type
	activationKey: string;
	resetCode: string;
}

serverOn(E._resetPassword.onSubmit, async (data, userSession) => {
	const email = data.email;
	if (email) {
		const pgs = await mysqlExec(
			'SELECT id FROM _users WHERE _users.status=' + NUM_1 + ' AND email=' + escapeString(email) + ' LIMIT ' + NUM_1
		);
		if (pgs.length > 0) {
			const user = pgs[0];
			const resetCode = randomBytes(24).toString('base64');
			await mysqlExec(
				'UPDATE _users SET "resetTime"=NOW(), "resetCode" = ' + escapeString(resetCode) + ' WHERE id=' + D(user.id)
			);
			const href
				= getServerHref()
					+ '#n/'
					+ NODE_ID.RESET_PASSWORD
					+ '/r/new/e/f/userId/'
					+ user.id
					+ '/resetCode/'
					+ encodeURIComponent(resetCode);
			await mail_utf8(
				data.email,
				L('PASSWORD_RESET_EMAIL_HEADER', userSession),
				L('PASSWORD_RESET_EMAIL_BODY', userSession, href)
			);
		}
	}
});