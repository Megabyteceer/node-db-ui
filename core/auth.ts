import ENV from "../ENV";
import { mysqlExec, mysqlInsertResult, mysqlRowsResult } from "./mysql-connection";
import { DEFAULT_LANGUAGE, getGuestUserForBrowserLanguage, getLangs } from "./describe-node";
import { throwError, NODE_ID, assert, UserLangEntry, UserRoles, UserSession, ROLE_ID } from "../www/src/bs-utils";
import { pbkdf2, randomBytes } from "crypto";
import { L } from "./locale";
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
	console.log((new Error('')).stack.replace('Error', '').trim());
	/// #endif

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
		return getGuestUserForBrowserLanguage(browserLanguageId);
	} else {
		userSession = sessions.get(sessionToken);
	}

	if(!userSession.hasOwnProperty('_isStarted') && !maintenanceMode) {
		userSession._isStarted = true;
		startedSessionsCount++;
		return Promise.resolve(userSession);
	}
	return new Promise((resolve, rejects) => {
		let i = setInterval(() => {
			if(!userSession.hasOwnProperty('_isStarted') && !maintenanceMode) {
				clearInterval(i);
				if(userSession.id === 0) {
					rejects(new Error('session expired'));
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
		delete userSession._isStarted;
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
	return ENV.SERVER_NAME;
}

function generateSalt() {
	return randomBytes(16).toString('hex');
}

async function activateUser(key, userSession: UserSession) {
	if(key) {
		const registrations = await mysqlExec("SELECT * FROM _registration WHERE status = 1 AND activationKey='" + key + "' AND _createdON > DATE_ADD(CURDATE(), INTERVAL -1 DAY) LIMIT 1") as mysqlRowsResult;
		const registration = registrations[0];
		if(registration) {
			let existingUser = await mysqlExec("SELECT id FROM _users WHERE status = 1 AND email='" + registration.email + "' LIMIT 1") as mysqlRowsResult;
			if(existingUser.length > 0) {
				throwError(L('EMAIL_ALREADY', userSession));
			}
			if(!registration.name) {
				registration.name = registration.email.split('@')[0];
			}
			let registrationID = registration.id;
			delete registration.id;
			delete registration.activationKey;
			delete registration._createdON;
			const userID = await submitRecord(NODE_ID.USERS, registration);
			let organizationID = (await mysqlExec("INSERT INTO `_organization` (`name`, `status`, `_usersID`) VALUES ('', '1', " + userID + ")") as mysqlInsertResult).insertId;
			await mysqlExec("UPDATE _organization SET _usersID = " + userID + ", _organizationID = " + organizationID + " WHERE id = " + organizationID);
			await mysqlExec("UPDATE _users SET _usersID = " + userID + ", _organizationID = " + organizationID + " WHERE id = " + userID);
			await mysqlExec("UPDATE _registration SET activationKey = '', status = 0 WHERE id = " + registrationID);
			return authorizeUserByID(userID);
		}
	}
	throwError(L('REG_EXPIRED', userSession));
}

async function resetPassword(key, userId, userSession) {
	if(key && userId) {
		const users = await mysqlExec("SELECT id FROM _users WHERE id= " + userId + " AND status = 1 AND resetCode='" + key + "' AND reset_time > DATE_ADD(CURDATE(), INTERVAL -1 DAY) LIMIT 1") as mysqlRowsResult;
		if(users.length === 1) {
			await mysqlExec("UPDATE _users SET resetCode = '' WHERE id ='" + userId + "'");
			return authorizeUserByID(userId);
		}
	}
	throwError(L('RECOVERY_EXPIRED', userSession));
}

function getPasswordHash(password, salt) {
	return new Promise((resolve, rejects) => {
		pbkdf2(password, salt, 1000, 64, `sha512`, (err, key) => {
			if(err) {
				rejects(err);
			} else {
				resolve(key.toString(`hex`));
			}
		});
	});
}


async function authorizeUserByID(userID, isItServerSideRole: boolean = false, sessionToken: string | null = null): Promise<UserSession> {

	if(sessionsByUserId.has(userID)) {
		return sessionsByUserId.get(userID);
	}

	const query = "SELECT _users.name as userName, multilingualEnabled, avatar, _users._organizationID AS user_organizationID, company, defaultOrg, _organization.name AS organName, email, language FROM _users LEFT JOIN _organization ON (_users._organizationID = _organization.id) WHERE (_users.id = " + userID + ") AND _users.status=1 LIMIT 1";
	const users = await mysqlExec(query) as mysqlRowsResult;
	const user = users[0];
	if(!user) {
		throwError("user activation error " + userID);
	}

	let organID: number = user.user_organizationID;

	// fix user's org if undefined
	if(organID === 0) {
		const orgId = await mysqlExec("INSERT INTO `_organization` (`name`, `status`, `_usersID`) VALUES ('" + user.company + "', '1', " + userID + ")");
		await mysqlExec("UPDATE _users SET _organizationID=" + orgId + ", _usersID = " + userID + " WHERE id=" + userID);
		await mysqlExec("UPDATE _organization SET _organizationID=" + orgId + " WHERE id=" + orgId);
		return authorizeUserByID(userID);
	}

	let organID_def = user.defaultOrg || organID;
	let organName = user.organName;

	const roles = await mysqlExec("SELECT _rolesID FROM _user_roles WHERE _user_roles._usersID=" + userID + " ORDER BY _rolesID") as mysqlRowsResult;

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
		cacheKeyGenerator.push(role._rolesID);
		userRoles[role._rolesID] = 1;
	}


	let organizations = {
		[organID]: organName
	}
	const pgs = await mysqlExec("SELECT _organization.id, _organization.name FROM `_organization_users` LEFT JOIN _organization ON (_organization.id = _organization_users._organizationID) WHERE _organization_users._usersID=" + userID + " ORDER BY _organization.id") as mysqlRowsResult;
	for(let org of pgs) {
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
		cacheKey: cacheKeyGenerator.join()
	};

	if(user.multilingualEnabled) {
		userSession.multilingualEnabled = 1;
	}

	if(!await setCurrentOrg(organID_def, userSession)) {
		await setCurrentOrg(organID, userSession, true);
	}
	createSession(userSession, sessionToken);
	if(isItServerSideRole) {
		/// #if DEBUG

		/*
		/// #endif
			userSession.__temporaryServerSideSession = true
			Object.freeze(userSession);
		//*/
	} else {
		await setMultilingual(user.multilingualEnabled, userSession);
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
			await mysqlExec("UPDATE _users SET defaultOrg=organID WHERE id=" + userSession.id);
		}
		return 1;
	}
	return 0;
}

async function setMultilingual(enable, userSession) {
	shouldBeAuthorized(userSession);
	if(ENV.ENABLE_MULTILINGUAL) {
		userSession.multilingualEnabled = enable;
	}
	await mysqlExec('UPDATE _users SET multilingualEnabled=' + (enable ? '1' : '0') + " WHERE id=" + userSession.id + " LIMIT 1");
	return 1;
}

let transporter;
async function mail_utf8(email, subject, text): Promise<void> {
	return new Promise((resolve, rejects) => {
		if(ENV.DEBUG) {
			console.log('E-mail sent: ' + subject);
			console.log(text);
			resolve();
			return;
		}
		if(!transporter) {
			require("nodemailer").createTransport({
				sendmail: true,
				newline: 'unix',
				path: '/usr/sbin/sendmail'
			})
		}
		transporter.sendMail({
			from: ENV.EMAIL_FROM,
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

function mustBeUnset(obj, fieldName) {
	if(obj.hasOwnProperty(fieldName)) {
		throwError('Forbidden field "' + fieldName + '" detected.');
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

export { UserSession, getGuestUserForBrowserLanguage, generateSalt, notificationOut, shouldBeAuthorized, isAdmin, isUserHaveRole, UserLangEntry, usersSessionsStartedCount, mustBeUnset, setCurrentOrg, setMultilingual, authorizeUserByID, resetPassword, activateUser, startSession, finishSession, killSession, getPasswordHash, createSession, getServerHref, mail_utf8, setMaintenanceMode };