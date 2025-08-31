import { randomBytes } from 'crypto';
import type { UserSession } from '../auth';
import { generateSalt, getPasswordHash, getServerHref, mail_utf8 } from '../auth';

import { ENV } from '../../core/ENV';

import { NODE_ID, type IRegistrationRecordWrite } from '../../types/generated';
import { throwError } from '../../www/client-core/src/assert';
import { L } from '../locale';
import { mysqlExec } from '../mysql-connection';

export default {
	beforeCreate: async function (data: IRegistrationRecordWrite, userSession: UserSession) {
		data.salt = generateSalt();
		data.activationKey = randomBytes(24).toString('base64');
		data.password = await getPasswordHash(data.password, data.salt);

		const pgs = await mysqlExec(
			'SELECT id FROM _users WHERE _users.status=1 AND email=\'' + data.email + '\' LIMIT 1'
		);
		if (pgs.length > 0) {
			throwError(L('EMAIL_ALREADY', userSession));
		} else {
			const href =
				getServerHref() +
				'#n/' +
				NODE_ID.RESET_PASSWORD +
				'/r/new/e/f/activationKey/' +
				encodeURIComponent(data.activationKey);
			await mail_utf8(
				data.email,
				L('CONFIRM_EMAIL_SUBJ', userSession),
				L('CONFIRM_EMAIL', userSession, ENV.APP_TITLE) + href
			);
		}
	},
};
