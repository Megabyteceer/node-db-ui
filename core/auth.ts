import ENV from "../ENV";
import { mysqlExec, mysqlInsertResult, mysqlRowResultSingle, mysqlRowsResult } from "./mysql-connection";
import { getLangs, GUEST_USER_SESSION } from "./describe-node";
import { throwError, GUEST_ROLE_ID, USER_ROLE_ID, assert, UserLangEntry, UserRoles, UserSession, TRoleId, ADMIN_ROLE_ID } from "../www/js/bs-utils";
import { L } from "./locale";
import { pbkdf2, randomBytes } from "crypto";


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

let maintainMode = 0;
let startedSessionsCount = 0;
const usersSessionsStartedCount = () => {
	return startedSessionsCount;
}

function setMainTainMode(val) {
	if(val) {
		maintainMode++;
	} else {
		maintainMode--;
		assert(maintainMode >= 0, "Maintain mode disable attempt when it was not enabled.");
	}
}

async function startSession(sessionToken) {
	if(!sessionToken) {
		return Promise.resolve(GUEST_USER_SESSION);
	}
	if(!sessions.has(sessionToken)) {
		throwError('session expired')
	}
	const userSession = sessions.get(sessionToken);
	if(!userSession.hasOwnProperty('_isStarted') && !maintainMode) {
		userSession._isStarted = true;
		startedSessionsCount++;
		return Promise.resolve(userSession);
	}
	return new Promise((resolve, rejects) => {
		let i = setInterval(() => {
			if(!userSession.hasOwnProperty('_isStarted') && !maintainMode) {
				clearInterval(i);
				if(userSession.id === 0) {
					rejects(new Error('session expired'));
				}
				userSession._isStarted = true;
				startedSessionsCount++;
				resolve(userSession);
			}
		}, maintainMode ? SESSION_START_MAINTAIN_REATTEMPT_DELAY : SESSION_START_REATTEMPT_DELAY);
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

async function registerUser(reqData) {

	const r_name = ENV.REQUIRE_NAME;
	const r_company = ENV.REQUIRE_COMPANY;

	const login = reqData.login_username;
	const password = reqData.login_password;
	const password_r = reqData.password_r;
	const company = r_company ? reqData.company : '';
	const name = r_name ? reqData.name : '';

	if(password !== password_r) {
		throwError('PASS_NOT_SAME');
	} else {

		let pgs = await mysqlExec("SELECT id FROM _users WHERE _users.status=1 AND email='" + login + "' LIMIT 1") as mysqlRowsResult;
		if(pgs.length > 0) {
			throwError('EMAIL_ALREADY');
		} else {
			const salt = randomBytes(16).toString('hex');
			let actKey = randomBytes(24).toString('base64');
			let href = getServerHref() + '?activate_user&key=' + actKey;
			await mysqlExec("INSERT INTO `_users` (status, `name`, `PASS`, `salt`, `email`, `company`, `activation`) VALUES (2,'" + name + "','" + (await getPasswordHash(password, salt)) + "','" + salt + "','" + login + "','" + company + "','" + actKey + "');");
			await mail_utf8(login, L('CONFIRM_EMAIL_SUBJ'), L('CONFIRM_EMAIL', ENV.APP_TITLE) + href);
			return L('EMAIL_SENDED', login);
		}
	}
}

async function activateUser(key) {
	if(key) {
		const users = await mysqlExec("SELECT id, pass, company, email FROM _users WHERE status = 2 AND activation='" + key + "' LIMIT 1") as mysqlRowsResult;
		const user = users[0];
		if(user) {
			let userID = user.id;
			//create company for new user
			let organizationID = (await mysqlExec("INSERT INTO `_organization` (`name`, `status`, `_usersID`) VALUES ('" + user.company + "', '1', " + userID + ")") as mysqlInsertResult).insertId;
			await mysqlExec("UPDATE _users SET status=1, activation='', _organizationID=" + organizationID + ", _usersID = " + userID + " WHERE id =" + userID);
			await mysqlExec("UPDATE _organization SET _organizationID=" + organizationID + " WHERE id =" + organizationID);
			return authorizeUserByID(userID);
		}
	}
	throwError('REG_EXPIRED');
}

async function resetPassword(key) {
	if(key) {
		const users = await mysqlExec("SELECT id FROM _users WHERE status = 1 AND activation='" + key + "' AND reset_time > DATE_ADD(CURDATE(), INTERVAL -1 DAY)  LIMIT 1");
		const user = users[0];
		if(user) {
			let userID = user.id;
			await mysqlExec("UPDATE _users SET activation='' WHERE id ='" + userID + "'");
			return authorizeUserByID(userID);
		}
	}
	throwError('RECOVERY_EXPIRED');
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

async function login(username, password) {

	let user = await mysqlExec("SELECT id, activation, salt, TIMESTAMPDIFF(SECOND, NOW(), blocked_to) AS blocked, PASS, mistakes FROM _users WHERE email='" + username + "' AND _users.status=1 LIMIT 1") as mysqlRowResultSingle;
	user = user[0];
	if(user) {

		let userID = user.id;

		let blocked = user.blocked;

		if(blocked > 0) {
			throwError(L('USER_BLOCKED', blocked));
		} else {

			let mistakes = user.mistakes;

			let key = await getPasswordHash(password, user.salt);

			if(key !== user.PASS) {
				if(mistakes <= 1) {
					await mysqlExec("UPDATE _users SET blocked_to=DATE_ADD( NOW(),INTERVAL 1 MINUTE), mistakes=3 WHERE id='" + userID + "'");
				} else {
					await mysqlExec("UPDATE _users SET mistakes=(mistakes-1) WHERE id='" + userID + "'");
				}
				throwError('WRONG_PASS');
			}

			return authorizeUserByID(userID);
		}
	}
	throwError('WRONG_PASS');
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
		userRoles[GUEST_ROLE_ID] = 1;
		cacheKeyGenerator = [GUEST_ROLE_ID as unknown as string]
	} else {
		userRoles[USER_ROLE_ID] = 1;
		cacheKeyGenerator = [USER_ROLE_ID as unknown as string]
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
	for(let l of ls) {
		if(l.id === ENV.DEFAULT_LANG_ID) {
			return l;
		}
	}
	return ls[0];
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
	if(!userSession || userSession.__temporaryServerSideSession || isUserHaveRole(GUEST_ROLE_ID, userSession)) {
		throwError("operation permitted for authorized user only");
	}
}

const isAdmin = (userSession: UserSession) => {
	return isUserHaveRole(ADMIN_ROLE_ID, userSession);
}

const isUserHaveRole = (roleId: TRoleId, userSession: UserSession) => {
	return userSession && userSession.userRoles[roleId];
}

export { UserSession, notificationOut, shouldBeAuthorized, isAdmin, isUserHaveRole, UserLangEntry, usersSessionsStartedCount, mustBeUnset, setCurrentOrg, setMultilingual, login, authorizeUserByID, resetPassword, activateUser, registerUser, startSession, finishSession, killSession, getPasswordHash, createSession, getServerHref, mail_utf8, setMainTainMode };