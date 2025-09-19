import { E, NODE_ID, type IUsersRecord, type IUsersRecordWrite } from '../../types/generated';
import { serverOn } from '../../www/client-core/src/events-handle';
import { generateSalt, getPasswordHash, isAdmin, type UserSession } from '../auth';
import { D, escapeString, mysqlExec } from '../mysql-connection';
import { submitRecord } from '../submit';

async function clearUserParams(data: IUsersRecordWrite, currentData: IUsersRecord, userSession: UserSession) {
	if (!isAdmin(userSession)) {
		delete data._organizationId;
		delete data._userRoles;
	}

	if (data.hasOwnProperty('password')) {
		const salt = generateSalt();
		await mysqlExec('UPDATE _users SET salt=' + escapeString(salt) + ' WHERE id=' + D(currentData.id!));
		data.password = await getPasswordHash(data.password!, salt);
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

serverOn(E._users.beforeUpdate, async (currentData, newData, userSession) => {
	if (!isAdmin(userSession)) {
		delete newData.email;
	}

	if (newData.avatar && currentData.id === userSession.id) {
		userSession.avatar = newData.avatar!;
	}

	if (newData.hasOwnProperty('company')) {
		if (currentData._organizationId!.id) {
			await submitRecord(NODE_ID.ORGANIZATION, { name: newData.company }, currentData._organizationId!.id);
		}
	}
	return clearUserParams(newData, currentData, userSession);
});