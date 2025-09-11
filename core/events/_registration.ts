import { randomBytes } from 'crypto';
import { generateSalt, getPasswordHash, getServerHref, mail_utf8 } from '../auth';

import { ENV } from '../../core/ENV';

import { E, NODE_ID } from '../../types/generated';
import { throwError } from '../../www/client-core/src/assert';
import { serverOn } from '../../www/client-core/src/events-handle';
import { L } from '../locale';
import { mysqlExec } from '../mysql-connection';

serverOn(E._registration.beforeCreate, async (data, userSession) => {
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
});
