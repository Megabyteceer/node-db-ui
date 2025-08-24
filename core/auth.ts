
import { pbkdf2, randomBytes } from "crypto";
import { assert, throwError } from '../www/client-core/src/assert';
import { NODE_ID, ROLE_ID, RecId, UserLangEntry, UserRoles, UserSession } from "../www/client-core/src/bs-utils";
import { DEFAULT_LANGUAGE, getGuestUserForBrowserLanguage, getLangs } from "./describe-node";
import { ENV, SERVER_ENV } from './ENV';
import { L } from "./locale";
import { mysqlExec } from "./mysql-connection";
import { submitRecord } from "./submit";

const sessions = new Map();
const sessionsByUserId = new Map();

function createSession(userSession, sessionToken) {
	assert(!sessionsByUserId.has(userSession.id), "session already exists" + userSession.id);

	if(!sessionToken) {
		sessionToken = randomBytes(24).toString('base64');
	}
	while(sessions.has(sessionToken)) {
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
}

function setMaintenanceMode(val) {
	/// #if DEBUG
	console.log('setMaintenanceMode ' + val);
	//console.log((new Error('')).stack.replace('Error', '').trim());
	/// #endif
	return; // TODO: Maintenance
	if(val) {
		maintenanceMode++;
	} else {
		maintenanceMode--;
		assert(maintenanceMode >= 0, "Maintain mode disable attempt when it was not enabled.");
	}
}

async function startSession(sessionToken, browserLanguageId: string) {
	if(!sessionToken) {
		return getGuestUserForBrowserLanguage(browserLanguageId);
	}
	let userSession;
	if(!sessions.has(sessionToken)) {
		if(sessionToken !== 'guest-session') {
			throwError('<auth> session expired');
		} else {
			return getGuestUserForBrowserLanguage(browserLanguageId);
		}
	} else {
		userSession = sessions.get(sessionToken);
	}

	if(!userSession._isStarted && !maintenanceMode) {
		userSession._isStarted = true;
		startedSessionsCount++;
		return Promise.resolve(userSession);
	}
	return new Promise((resolve, rejects) => {
		let i = setInterval(() => {
			if(!userSession._isStarted && !maintenanceMode) {
				clearInterval(i);
				if(userSession.id === 0) {
					rejects(new Error('<auth> session expired'));
				}
				userSession._isStarted = true;
				startedSessionsCount++;
				resolve(userSession);
			}
		}, maintenanceMode ? SESSION_START_MAINTAIN_REATTEMPT_DELAY : SESSION_START_REATTEMPT_DELAY);
	});
}

function finishSession(sessionToken) {
	const userSession = sessions.get(sessionToken);
	if(userSession) {
		userSession._isStarted = false;
		startedSessionsCount--;
		assert(startedSessionsCount >= 0, "Sessions counter is corrupted.");
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
	if(key) {
		const registrations = await mysqlExec("SELECT * FROM _registration WHERE status = 1 AND activation_key='" + key + "' AND _created_on > DATE_ADD(CURDATE(), INTERVAL -1 DAY) LIMIT 1");
		const registration = registrations[0];
		if(registration) {
			let registrationID = registration.id;
			delete registration.id;
			delete registration.activation_key;
			delete registration._created_on;
			delete registration._organization_id;
			delete registration._users_id;
			let ret = await authorizeUserByID(await createUser(registration as any, userSession));
			await mysqlExec("UPDATE _registration SET activation_key = '', status = 0 WHERE id = " + registrationID);
			return ret;
		}
	}
	throwError(L('REG_EXPIRED', userSession));
}

async function createUser(userData: {
	email: string,
	name?: string,
	salt?: string
}, userSession: UserSession) {
	let existingUser = await mysqlExec("SELECT id FROM _users WHERE status = 1 AND email='" + userData.email + "' LIMIT 1");
	if(existingUser.length > 0) {
		throwError(L('EMAIL_ALREADY', userSession));
	}
	if(!userData.name) {
		userData.name = userData.email.split('@')[0];
	}
	var salt = userData.salt || '';
	delete userData.salt;
	const userID: RecId = (await submitRecord(NODE_ID.USERS, userData, undefined, userSession)).recId;
	let organizationID = (await mysqlExec("INSERT INTO \"_organization\" (\"name\", \"status\", \"_users_id\") VALUES ('', '1', " + userID + ") RETURNING id"))[0].id;
	await mysqlExec("UPDATE _organization SET _users_id = " + userID + ", _organization_id = " + organizationID + " WHERE id = " + organizationID);
	await mysqlExec("UPDATE _users SET \"salt\"= '" + salt + "', _users_id = " + userID + ", _organization_id = " + organizationID + " WHERE id = " + userID);
	return userID;
}

async function resetPassword(key, userId, userSession) {
	if(key && userId) {
		const users = await mysqlExec("SELECT id FROM _users WHERE id= " + userId + " AND status = 1 AND reset_code='" + key + "' AND reset_time > DATE_ADD(CURDATE(), INTERVAL -1 DAY) LIMIT 1");
		if(users.length === 1) {
			await mysqlExec("UPDATE _users SET reset_code = '' WHERE id ='" + userId + "'");
			return authorizeUserByID(userId);
		}
	}
	throwError(L('RECOVERY_EXPIRED', userSession));
}

function getPasswordHash(password, salt) {
	return new Promise((resolve, rejects) => {
		pbkdf2(password, salt, 1000, 64, 'sha512', (err, key) => {
			if(err) {
				rejects(err);
			} else {
				resolve(key.toString('hex'));
			}
		});
	});
}

async function authorizeUserByID(userID, isItServerSideSession: boolean = false, sessionToken: string | null = null): Promise<UserSession> {

	if(sessionsByUserId.has(userID)) {
		return sessionsByUserId.get(userID);
	}

	const query = "SELECT _users.name AS user_name, multilingual_enabled, avatar, _users._organization_id AS user_organization_id, company, default_org, _organization.name AS organ_name, email, language FROM _users LEFT JOIN _organization ON (_users._organization_id = _organization.id) WHERE (_users.id = " + userID + ") AND _users.status=1 LIMIT 1";
	const users = await mysqlExec(query);
	const user = users[0];
	if(!user) {
		throwError("user activation error " + userID);
	}

	let organID: number = user.user_organization_id;

	// fix user's org if undefined
	if(organID === 0) {
		const orgId = await mysqlExec("INSERT INTO \"_organization\" (\"name\", \"status\", \"_users_id\") VALUES ('" + user.company + "', '1', " + userID + ")");
		await mysqlExec("UPDATE _users SET _organization_id=" + orgId + ", _users_id = " + userID + " WHERE id=" + userID);
		await mysqlExec("UPDATE _organization SET _organization_id=" + orgId + " WHERE id=" + orgId);
		return authorizeUserByID(userID);
	}

	let organID_def = user.default_org || organID;
	let organName = user.organ_name;

	const roles = await mysqlExec("SELECT _roles_id FROM _user_roles WHERE _user_roles._users_id=" + userID + " ORDER BY _roles_id");

	let cacheKeyGenerator: string[];
	let userRoles: UserRoles = {};
	if(userID === 2) {
		userRoles[ROLE_ID.GUEST] = 1;
		cacheKeyGenerator = [ROLE_ID.GUEST as unknown as string]
	} else {
		userRoles[ROLE_ID.USER] = 1;
		cacheKeyGenerator = [ROLE_ID.USER as unknown as string]
	}
	for(let role of roles) {
		cacheKeyGenerator.push(role._roles_id);
		userRoles[role._roles_id] = 1;
	}


	let organizations = {
		[organID]: organName
	}
	const pgs = await mysqlExec("SELECT _organization.id, _organization.name FROM _organization_users LEFT JOIN _organization ON (_organization.id = _organization_users._organization_id) WHERE _organization_users._users_id=" + userID + " ORDER BY _organization.id");
	for(let org of pgs) {
		organizations[org.id] = org.name;
	}

	const lang = getLang(user.language);

	cacheKeyGenerator.push('l', lang.prefix);
	cacheKeyGenerator.push('m', user.multilingual_enabled);

	const userSession: UserSession = {
		id: userID,
		orgId: 0,
		name: user.user_name,
		avatar: user.avatar,
		email: user.email,
		userRoles,
		organizations,
		lang,
		cacheKey: cacheKeyGenerator.join()
	};

	if(user.multilingual_enabled) {
		userSession.multilingual_enabled = 1;
	}

	if(!await setCurrentOrg(organID_def, userSession)) {
		await setCurrentOrg(organID, userSession, true);
	}
	createSession(userSession, sessionToken);
	if(isItServerSideSession) {
		/// #if DEBUG

		/*
		/// #endif
			userSession.__temporaryServerSideSession = true
			userSession._isStarted = false
			Object.seal(userSession);
		//*/
	} else {
		await setMultilingual(user.multilingual_enabled, userSession);
	}
	return userSession;
}

function getLang(langId): UserLangEntry {
	let ls = getLangs();
	for(let l of ls) {
		if(l.id === langId) {
			return l;
		}
	}
	return DEFAULT_LANGUAGE;
}

async function setCurrentOrg(organID: number, userSession: UserSession, updateInBd?) {
	if(userSession.organizations.hasOwnProperty(organID)) {
		userSession.orgId = organID;
		if(updateInBd) {
			shouldBeAuthorized(userSession);
			await mysqlExec("UPDATE _users SET default_org=_organization_id WHERE id=" + userSession.id);
		}
		return 1;
	}
	return 0;
}

async function setMultilingual(enable, userSession) {
	shouldBeAuthorized(userSession);
	if(ENV.ENABLE_MULTILINGUAL) {
		userSession.multilingual_enabled = enable;
	}
	await mysqlExec('UPDATE _users SET multilingual_enabled=' + (enable ? '1' : '0') + " WHERE id=" + userSession.id);
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
		if(!transporter) {
			transporter = require("nodemailer").createTransport({
				sendmail: true,
				newline: 'unix',
				path: '/usr/sbin/sendmail'
			})
		}
		transporter.sendMail({
			from: SERVER_ENV.EMAIL_FROM,
			to: email,
			subject,
			text
		}, (err) => {
			if(err) {
				rejects(err);
			} else {
				resolve();
			}
		});
	});
}

function mustBeUnset(obj, field_name) {
	if(obj.hasOwnProperty(field_name)) {
		throwError('Forbidden field "' + field_name + '" detected.');
	}
}

const notificationOut = (userSession: UserSession, text: string) => {
	if(!userSession || userSession.__temporaryServerSideSession) {
		console.log(text);
	} else {
		if(!userSession.notifications) {
			userSession.notifications = [text];
		} else {
			userSession.notifications.push(text);
		}
	}
}

const shouldBeAuthorized = (userSession: UserSession) => {
	if(!userSession || userSession.__temporaryServerSideSession || isUserHaveRole(ROLE_ID.GUEST, userSession)) {
		throwError("operation permitted for authorized user only");
	}
}

const isAdmin = (userSession: UserSession) => {
	return !userSession || isUserHaveRole(ROLE_ID.ADMIN, userSession);
}

const isUserHaveRole = (roleId: ROLE_ID, userSession: UserSession) => {
	return userSession && userSession.userRoles[roleId];
}

export { UserLangEntry, UserSession, activateUser, authorizeUserByID, createSession, createUser, finishSession, generateSalt, getGuestUserForBrowserLanguage, getPasswordHash, getServerHref, isAdmin, isUserHaveRole, killSession, mail_utf8, mustBeUnset, notificationOut, resetPassword, setCurrentOrg, setMaintenanceMode, setMultilingual, shouldBeAuthorized, startSession, usersSessionsStartedCount };
