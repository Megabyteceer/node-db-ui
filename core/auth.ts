import { pbkdf2, randomBytes } from 'crypto';
import { NODE_ID } from '../types/generated';
import { assert, ESCAPE_BEGIN, ESCAPE_END, throwError } from '../www/client-core/src/assert';
import type { RecId, UserLangEntry, UserRoles, UserSession } from '../www/client-core/src/bs-utils';
import { ROLE_ID, USER_ID } from '../www/client-core/src/bs-utils';
import { DEFAULT_LANGUAGE, getGuestUserForBrowserLanguage, getLangs } from './describe-node';
import { ENV, SERVER_ENV } from './ENV';
import { L } from './locale';
import { D, escapeString, mysqlExec, NUM_0, NUM_1 } from './mysql-connection';
import { submitRecord } from './submit';

const sessions = new Map();
const sessionsByUserId = new Map();

function createSession(userSession, sessionToken) {
	assert(
		!sessionsByUserId.has(userSession.id),
		'session already exists' + userSession.id
	);

	if (!sessionToken) {
		sessionToken = randomBytes(24).toString('base64');
	}
	while (sessions.has(sessionToken)) {
		sessionToken = randomBytes(24).toString('base64');
	}
	userSession.sessionToken = sessionToken;
	sessions.set(sessionToken, userSession);
	sessionsByUserId.set(userSession.id, userSession);
	return sessionToken;
}

//TODO: clear outdated sessions

/// #if DEBUG
const SESSION_START_REATTEMPT_DELAY = 100;
const SESSION_START_MAINTAIN_REATTEMPT_DELAY = 500;
/*
/// #endif
const SESSION_START_REATTEMPT_DELAY = 1000;
const SESSION_START_MAINTAIN_REATTEMPT_DELAY = 5000;
//*/

let maintenanceMode = 0;
let startedSessionsCount = 0;
const usersSessionsStartedCount = () => {
	return startedSessionsCount;
};

function setMaintenanceMode(val) {
	/// #if DEBUG
	console.log('setMaintenanceMode ' + val);
	//console.log((new Error('')).stack.replace('Error', '').trim());
	/// #endif
	return; // TODO: Maintenance
	if (val) {
		maintenanceMode++;
	} else {
		maintenanceMode--;
		assert(
			maintenanceMode >= 0,
			'Maintain mode disable attempt when it was not enabled.'
		);
	}
}

async function startSession(sessionToken, browserLanguageId: string) {
	if (!sessionToken) {
		return getGuestUserForBrowserLanguage(browserLanguageId);
	}
	let userSession;
	if (!sessions.has(sessionToken)) {
		if (sessionToken !== 'guest-session') {
			throwError('<auth> session expired');
		} else {
			return getGuestUserForBrowserLanguage(browserLanguageId);
		}
	} else {
		userSession = sessions.get(sessionToken);
	}

	if (!userSession._isStarted && !maintenanceMode) {
		userSession._isStarted = true;
		startedSessionsCount++;
		return Promise.resolve(userSession);
	}
	return new Promise((resolve, rejects) => {
		const i = setInterval(
			() => {
				if (!userSession._isStarted && !maintenanceMode) {
					clearInterval(i);
					if (userSession.id === 0) {
						rejects(new Error('<auth> session expired'));
					}
					userSession._isStarted = true;
					startedSessionsCount++;
					resolve(userSession);
				}
			},
			maintenanceMode
				? SESSION_START_MAINTAIN_REATTEMPT_DELAY
				: SESSION_START_REATTEMPT_DELAY
		);
	});
}

function finishSession(sessionToken) {
	const userSession = sessions.get(sessionToken);
	if (userSession) {
		userSession._isStarted = false;
		startedSessionsCount--;
		assert(startedSessionsCount >= 0, 'Sessions counter is corrupted.');
	}
}

function killSession(userSession) {
	sessions.delete(userSession.sessionToken);
	sessionsByUserId.delete(userSession.id);
	userSession.id = 0;
}

function getServerHref() {
	return SERVER_ENV.SERVER_NAME;
}

function generateSalt() {
	return randomBytes(16).toString('hex');
}

async function activateUser(key, userSession: UserSession) {
	if (key) {
		const registrations = await mysqlExec(
			'SELECT * FROM _registration WHERE status = 1 AND "activationKey"=\'' +
				key +
				'\' AND "_createdOn" > DATE_ADD(CURDATE(), INTERVAL -1 DAY) LIMIT 1'
		);
		const registration = registrations[0];
		if (registration) {
			const registrationID = registration.id;
			delete registration.id;
			delete registration.activationKey;
			delete registration._createdOn;
			delete registration._organizationId;
			delete registration._usersId;
			const ret = await authorizeUserByID(
				await createUser(registration as any, userSession)
			);
			await mysqlExec(
				'UPDATE _registration SET activationKey = \'\', status = 0 WHERE id = ' +
					registrationID
			);
			return ret;
		}
	}
	throwError(L('REG_EXPIRED', userSession));
}

async function createUser(
	userData: {
		email: string;
		name: string;
		salt?: string;
	},
	userSession: UserSession
) {
	const existingUser = await mysqlExec(
		'SELECT id FROM _users WHERE status = 1 AND email=\'' +
			userData.email +
			'\' LIMIT 1'
	);
	if (existingUser.length > 0) {
		throwError(L('EMAIL_ALREADY', userSession));
	}
	if (!userData.name) {
		userData.name = userData.email.split('@')[0];
	}
	const salt = userData.salt || '';
	delete userData.salt;
	const result = await submitRecord(NODE_ID.USERS, userData);
	const userID: RecId = result.recId;
	const organizationID = (
		await mysqlExec(
			'INSERT INTO "_organization" ("name", "status", "_usersId") VALUES (\'\', \'1\', ' +
				userID +
				') RETURNING id'
		)
	)[0].id;
	await mysqlExec(
		'UPDATE _organization SET "_usersId" = ' +
			userID +
			', "_organizationId" = ' +
			organizationID +
			' WHERE id = ' +
			organizationID
	);
	await mysqlExec(
		'UPDATE _users SET "salt"= \'' +
			salt +
			'\', "_usersId" = ' +
			userID +
			', "_organizationId" = ' +
			organizationID +
			' WHERE id = ' +
			userID
	);
	return userID;
}

async function resetPassword(key, userId, userSession) {
	if (key && userId) {
		const users = await mysqlExec(
			'SELECT id FROM _users WHERE id= ' +
				D(userId) +
				/// #if DEBUG
				ESCAPE_BEGIN +
				/// #endif
				' AND status = 1 AND "resetCode"=' +
				/// #if DEBUG
				ESCAPE_END +
				/// #endif
				escapeString(key) +
				/// #if DEBUG
				ESCAPE_BEGIN +
				/// #endif
				' AND "resetTime" > (NOW() + interval \'-1\' day) LIMIT 1'
				/// #if DEBUG
				+ ESCAPE_END
				/// #endif

		);
		if (users.length === 1) {
			await mysqlExec(
				'UPDATE _users SET "resetCode" = ' + escapeString('') + ' WHERE id =' +
					D(userId)
			);
			return authorizeUserByID(userId);
		}
	}
	throwError(L('RECOVERY_EXPIRED', userSession));
}

function getPasswordHash(password, salt):Promise<string> {
	return new Promise((resolve, rejects) => {
		pbkdf2(password, salt, 1000, 64, 'sha512', (err, key) => {
			if (err) {
				rejects(err);
			} else {
				resolve(key.toString('hex'));
			}
		});
	});
}

async function authorizeUserByID(
	userID,
	isItServerSideSession: boolean = false,
	sessionToken: string | null = null
): Promise<UserSession> {
	if (sessionsByUserId.has(userID)) {
		return sessionsByUserId.get(userID);
	}

	const query =
		'SELECT _users.name AS "userName", _users."multilingualEnabled", _users.avatar, _users."_organizationId" AS "userOrganizationId", _users.company, _users."defaultOrg", _organization.name AS "organName", _users.email, _users.language FROM _users LEFT JOIN _organization ON (_users."_organizationId" = _organization.id) WHERE (_users.id = ' +
		D(userID) +
		') AND _users.status=' +
		NUM_1 +
		' LIMIT ' +
		NUM_1;
	const users = await mysqlExec(query);
	const user = users[0];
	if (!user) {
		throwError('user activation error ' + userID);
	}

	const organID: number = user.userOrganizationId;

	// fix user's org if undefined
	if (organID === 0) {
		const orgId = await mysqlExec(
			'INSERT INTO "_organization" ("name", "status", "_usersId") VALUES (\'' +
				user.company +
				'\', \'1\', ' +
				userID +
				')'
		);
		await mysqlExec(
			'UPDATE _users SET "_organizationId"=' +
				orgId +
				', "_usersId" = ' +
				userID +
				' WHERE id=' +
				userID
		);
		await mysqlExec(
			'UPDATE _organization SET "_organizationId"=' +
				orgId +
				' WHERE id=' +
				orgId
		);
		return authorizeUserByID(userID);
	}

	const organID_def = user.defaultOrg || organID;
	const organName = user.organname;

	const roles = await mysqlExec(
		'SELECT "_rolesId" FROM "_userRoles" WHERE "_usersId"=' +
			D(userID) +
			' ORDER BY "_rolesId"'
	);

	let cacheKeyGenerator: string[];
	const userRoles: UserRoles = {};
	if (userID === USER_ID.GUEST) {
		userRoles[ROLE_ID.GUEST] = 1;
		cacheKeyGenerator = [ROLE_ID.GUEST as unknown as string];
	} else {
		userRoles[ROLE_ID.USER] = 1;
		cacheKeyGenerator = [ROLE_ID.USER as unknown as string];
	}
	for (const role of roles) {
		cacheKeyGenerator.push(role._rolesId);
		userRoles[role._rolesId] = 1;
	}

	const organizations = {
		[organID]: organName,
	};
	const pgs = await mysqlExec(
		'SELECT _organization.id, _organization.name FROM "_organizationUsers" LEFT JOIN _organization ON (_organization.id = "_organizationUsers"."_organizationId") WHERE "_organizationUsers"."_usersId"=' +
			D(userID) +
			' ORDER BY _organization.id'
	);
	for (const org of pgs) {
		organizations[org.id] = org.name;
	}

	const lang = getLang(user.language);

	cacheKeyGenerator.push('l', lang.prefix);
	cacheKeyGenerator.push('m', user.multilingualEnabled);

	const userSession: UserSession = {
		id: userID,
		orgId: 0,
		name: user.userName,
		avatar: user.avatar,
		email: user.email,
		userRoles,
		organizations,
		lang,
		cacheKey: cacheKeyGenerator.join(),
	};

	if (user.multilingualEnabled) {
		userSession.multilingualEnabled = 1;
	}

	if (!(await setCurrentOrg(organID_def, userSession))) {
		await setCurrentOrg(organID, userSession, true);
	}
	createSession(userSession, sessionToken);
	if (isItServerSideSession) {
		/// #if DEBUG
		/*
		/// #endif
			userSession.__temporaryServerSideSession = true
			userSession._isStarted = false
			Object.seal(userSession);
		//*/
	} else {
		await setMultilingual(user.multilingualEnabled, userSession);
	}
	return userSession;
}

function getLang(langId): UserLangEntry {
	const ls = getLangs();
	for (const l of ls) {
		if (l.id === langId) {
			return l;
		}
	}
	return DEFAULT_LANGUAGE;
}

async function setCurrentOrg(
	organID: number,
	userSession: UserSession,
	updateInBd?
) {
	if (userSession.organizations.hasOwnProperty(organID)) {
		userSession.orgId = organID;
		if (updateInBd) {
			shouldBeAuthorized(userSession);
			await mysqlExec(
				'UPDATE _users SET "defaultOrg"="_organizationId" WHERE id=' +
					userSession.id
			);
		}
		return 1;
	}
	return 0;
}

async function setMultilingual(enable, userSession) {
	shouldBeAuthorized(userSession);
	if (ENV.ENABLE_MULTILINGUAL) {
		userSession.multilingualEnabled = enable;
	}
	await mysqlExec(
		'UPDATE _users SET "multilingualEnabled"=' +
			(enable ? NUM_1 : NUM_0) +
			' WHERE id=' +
			D(userSession.id)
	);
	return 1;
}

let transporter;
async function mail_utf8(email, subject, text): Promise<void> {
	return new Promise((resolve, rejects) => {
		/// #if DEBUG
		console.log('E-mail sent: ' + subject);
		console.log(text);
		resolve();
		return;
		/// #endif
		if (!transporter) {
			transporter = require('nodemailer').createTransport({ // eslint-disable-line @typescript-eslint/no-require-imports
				sendmail: true,
				newline: 'unix',
				path: '/usr/sbin/sendmail',
			});
		}
		transporter.sendMail(
			{
				from: SERVER_ENV.EMAIL_FROM,
				to: email,
				subject,
				text,
			},
			(err) => {
				if (err) {
					rejects(err);
				} else {
					resolve();
				}
			}
		);
	});
}

function mustBeUnset(obj, fieldName) {
	if (obj.hasOwnProperty(fieldName)) {
		throwError('Forbidden field "' + fieldName + '" detected.');
	}
}

const notificationOut = (userSession: UserSession, text: string) => {
	if (!userSession || userSession.__temporaryServerSideSession) {
		console.log(text);
	} else {
		if (!userSession.notifications) {
			userSession.notifications = [text];
		} else {
			userSession.notifications.push(text);
		}
	}
};

const shouldBeAuthorized = (userSession: UserSession) => {
	if (
		!userSession ||
		userSession.__temporaryServerSideSession ||
		isUserHaveRole(ROLE_ID.GUEST, userSession)
	) {
		throwError('operation permitted for authorized user only');
	}
};

const isAdmin = (userSession: UserSession) => {
	return !userSession || isUserHaveRole(ROLE_ID.ADMIN, userSession);
};

const isUserHaveRole = (roleId: ROLE_ID, userSession: UserSession) => {
	return userSession && userSession.userRoles[roleId];
};

export {
	activateUser,
	authorizeUserByID,
	createSession,
	createUser,
	finishSession,
	generateSalt,
	getGuestUserForBrowserLanguage,
	getPasswordHash,
	getServerHref,
	isAdmin,
	isUserHaveRole,
	killSession,
	mail_utf8,
	mustBeUnset,
	notificationOut,
	resetPassword,
	setCurrentOrg,
	setMaintenanceMode,
	setMultilingual,
	shouldBeAuthorized,
	startSession,
	UserLangEntry,
	UserSession,
	usersSessionsStartedCount
};
