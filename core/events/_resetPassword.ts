import { randomBytes } from 'crypto';
import type { RecordDataWrite } from '../../www/client-core/src/bs-utils';

import { NODE_ID } from '../../types/generated';
import type { UserSession } from '../auth';
import { getServerHref, mail_utf8 } from '../auth';
import { L } from '../locale';
import { mysqlExec } from '../mysql-connection';

export default {
	beforeCreate: async function (data: RecordDataWrite, userSession: UserSession) {
		const email = data.email;
		if (email) {
			const pgs = await mysqlExec(
				'SELECT id FROM _users WHERE _users.status=1 AND email=\'' + email + '\' LIMIT 1'
			);
			if (pgs.length > 0) {
				const user = pgs[0];
				const resetCode = randomBytes(24).toString('base64');
				await mysqlExec(
					'UPDATE _users SET resetTime=NOW(), resetCode = \'' + resetCode + '\' WHERE id=' + user.id
				);
				const href =
					getServerHref() +
					'#n/' +
					NODE_ID.RESET_PASSWORD +
					'/r/new/e/f/userId/' +
					user.id +
					'/resetCode/' +
					encodeURIComponent(resetCode);
				await mail_utf8(
					data.email,
					L('PASSWORD_RESET_EMAIL_HEADER', userSession),
					L('PASSWORD_RESET_EMAIL_BODY', userSession, href)
				);
			}
		}
	},
};
