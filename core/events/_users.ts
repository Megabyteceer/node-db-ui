
import { NODE_ID } from '../../types/generated';
import { serverOn } from '../../www/client-core/src/events-handle';
import { generateSalt, getPasswordHash, isAdmin } from '../auth';
import { D, escapeString, mysqlExec } from '../mysql-connection';
import { submitRecord } from '../submit';

async function clearUserParams(data, currentData, userSession) {
	if (!isAdmin(userSession)) {
		delete data._organizationId;
		delete data._userRoles;
	}

	if (data.hasOwnProperty('password')) {
		const p = data.password;
		if (p !== 'nc_l4DFn76ds5yhg') {
			const salt = generateSalt();
			await mysqlExec('UPDATE _users SET salt=' + escapeString(salt) + ' WHERE id=' + D(currentData.id));
			data.password = await getPasswordHash(data.password, salt);
		} else {
			delete data.password;
		}
	}

	if (currentData) {
		if (!isAdmin(userSession)) {
			delete data.email;
		}
		currentData = Object.assign(currentData, data);
	} else {
		currentData = data;
	}
}

serverOn('_users.beforeUpdate', async (currentData, newData, userSession) => {
	if (!isAdmin(userSession)) {
		delete newData.email;
	}

	if (newData.hasOwnProperty('company')) {
		if (currentData._organizationId.id) {
			await submitRecord(NODE_ID.ORGANIZATION, { name: newData.company }, currentData._organizationId.id);
		}
	}
	return clearUserParams(newData, currentData, userSession);
});