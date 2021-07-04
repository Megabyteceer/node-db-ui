const {mysqlExec, mysqlStartTransaction} = require("./mysql-connection");
const crypto = require('crypto');
const {shouldBeAuthorized} = require("../www/both-side-utils");
const {getLangs, GUEST_USER_SESSION} = require("./desc-node");


const sessions = new Map();
const sessionsByUserId = new Map();

function createSession(userSession, sessionToken) {
	assert(!sessionsByUserId.has(userSession.id), "session already exists" + userSession.id);
	
	if(!sessionToken) {
		sessionToken = crypto.randomBytes(24).toString('base64');
	}
	while(sessions.has(sessionToken)) {
		sessionToken = crypto.randomBytes(24).toString('base64');
	}
	userSession.sessionToken = sessionToken;
	sessions.set(sessionToken, userSession);
	sessionsByUserId.set(userSession.id, userSession);
	return sessionToken;
}

//TODO: clear autdated sessions

async function startSession(sessionToken) {
	if(!sessionToken) {
		return Promise.resolve(GUEST_USER_SESSION);
	}
	if(!sessions.has(sessionToken)) {
		throw new Error('session expired')
	}
	const userSession = sessions.get(sessionToken);
	if(!userSession.hasOwnProperty('_isStarted')) {
		userSession._isStarted = true;
		return Promise.resolve(userSession);
	}
	return new Promise((resolve, rejects) => {
		let i = setInterval(() => {
			if(!userSession.hasOwnProperty('_isStarted')) {
				clearInterval(i);
				if(userSession.id === 0) {
					rejects(new Error('session expired'));
				}
				userSession._isStarted = true;
				resolve(userSession);
			}
		}, 500);
	});
}

function finishSession(sessionToken) {
	const userSession = sessions.get(sessionToken);
	if(userSession) {
		delete userSession._isStarted;
	}
}

function killSession(userSession) {
	sessions.delete(userSession.sessionToken);
	sessionsByUserId.delete(userSession.id);
	userSession.id = 0;
}

function getServerHref() {
	return process.env.SERVER_NAME;
}

async function registerUser(reqData) {

	const r_name = process.env.REQUIRE_NAME;
	const r_company = process.env.REQUIRE_COMPANY;

	const login = reqData.login_username;
	const password = reqData.login_password;
	const password_r = reqData.password_r;
	const company = r_company ? reqData.company : '';
	const name = r_name ? reqData.name : '';

	if (password !== password_r) {
		throw new Error('PASS_NOT_SAME');
	} else {
		
		let pgs = await mysqlExec("SELECT id FROM _users WHERE _users.status=1 AND email='" + login + "' LIMIT 1");
		if (pgs.length > 0) {
			throw new Error('EMAIL_ALREADY');
		} else {
			
			let actKey = crypto.randomBytes(24).toString('base64');
			
			let href = getServerHref() + '?activate_user&key=' + actKey;
			
			require_once('core/mail_utf8.php');
			mail_utf8(login, L('CONFIRM_EMAIL_SUBJ'), L('CONFIRM_EMAIL', APP_TITLE) + href);
			
			await mysqlExec("INSERT INTO `_users` (status, `name`, `PASS`, `email`, `company`, `activation`) VALUES (2,'" + name + "','" + (await getPasswordHash(password)) + "','" + login + "','" + company + "','" + actKey + "');");
			
			return L('EMAIL_SENDED', login);
		}
	}
}

async function activateUser(key) {
	if(key) {
		let user = await mysqlExec("SELECT id, pass, company, email FROM _users WHERE status = 2 AND activation='" + key + "' LIMIT 1");
		user = user[0];
		if (user) {
			let userID = user.id;
			//create company for new user
			await mysqlExec("INSERT INTO `_organ` (`name`, `status`, `_usersID`) VALUES ('" + user.company + "', '1', " + userID + ")");
			let orgId = await mysqlInsertedID("SELECT id FROM _organ WHERE _usersID = " + userID);
			orgId = orgId[0].id;
			await mysqlExec("UPDATE _users SET status=1, activation='', _organID=" + orgId + ", _usersID = " + userID + " WHERE id=" + userID);
			await mysqlExec("UPDATE _organ SET _organID=" + orgId + " WHERE id=" + orgId);
			return authorizeUserByID(userID);
		}
	}
	throw new Error('REG_EXPIRED');
}

async function resetPassword(key) {
	if(key) {
		let user = await mysqlExec("SELECT id FROM _users WHERE status = 1 AND activation='" + key + "' AND reset_time > DATE_ADD(CURDATE(), INTERVAL -1 DAY)  LIMIT 1");
		user = user[0];
		if (user) {
			let userID = user.id;
			await mysqlExec("UPDATE _users SET activation='' WHERE id='" + userID + "'");
			return authorizeUserByID(userID);
		}
	}
	throw new Error('RECOVERY_EXPIRED');
}

function getPasswordHash(password, salt) {
	return new Promise((resolve, rejects) => {
		crypto.pbkdf2(password, salt, 1000, 64, `sha512`, (err, key) => {
			if(err) {
				rejects(err);
			} else {
				resolve(key.toString(`hex`));
			}
		});
	});
}

async function login(username, password) {

	let user = await mysqlExec("SELECT id, activation, salt, TIMESTAMPDIFF(SECOND, NOW(), blocked_to) AS blocked, PASS, mistakes FROM _users WHERE email='" + username + "' AND _users.status=1 LIMIT 1");
	user = user[0];
	if(user) {

		let userID = user.id;
		
		let blocked = user.blocked;
		
		if(blocked > 0) {
			throw new Error('USER_BLOCKED', blocked);
		} else {
			
			let mistakes = user.mistakes;
			
			let key = await getPasswordHash(password, user.salt);
			
			if(key !== user.PASS) {
				if (mistakes <= 1) {
					await mysqlExec("UPDATE _users SET blocked_to=DATE_ADD( NOW(),INTERVAL 1 MINUTE), mistakes=3 WHERE id='" + userID + "'");
				} else {
					await mysqlExec("UPDATE _users SET mistakes=(mistakes-1) WHERE id='" + userID + "'");
				}
				throw new Error('WRONG_PASS');
			}

			return authorizeUserByID(userID);
		}
	}
	throw new Error('WRONG_PASS');
}

async function authorizeUserByID(userID, isItServerSideRole, sessionToken) {

	if(sessionsByUserId.has(userID)) {
		return sessionsByUserId.get(userID);
	}

	const query = "SELECT _users.name as userName, multilangEnabled, avatar, _users._organID AS orgID, company, defaultOrg, _organ.name AS organName, email, language FROM _users LEFT JOIN _organ ON (_users._organID = _organ.id) WHERE (_users.id = " + userID + ") AND _users.status=1 LIMIT 1";
	let pag = await mysqlExec(query);
	pag = pag[0];
	if(!pag) {
		throw new Error("user activation error " +  userID);
	}
	
	let organID = pag.orgID;

// fix user's org if undefined
	if (organID === 0) {
		await mysqlExec("INSERT INTO `_organ` (`name`, `status`, `_usersID`) VALUES ('" + pag.company + "', '1', " + userID + ")");
		await mysqlExec("UPDATE _users SET _organID=" + orgId + ", _usersID = "+ userID + " WHERE id=" + userID);
		await mysqlExec("UPDATE _organ SET _organID=" + orgId + " WHERE id=" + orgId);
		return authorizeUserByID(userID);
	}

	let organID_def = pag.defaultOrg || organID;
	let organName = pag.organName;

	const roles = await mysqlExec("SELECT _rolesID FROM _userroles WHERE _userroles._usersID=" + userID + " ORDER BY _rolesID");
	
	let cacheKeyGenerator;
	let userRoles = {};
	if(userID === 2) {
		userRoles[GUEST_ROLE_ID] = 1;
		cacheKeyGenerator = [GUEST_ROLE_ID]
	} else {
		userRoles[USER_ROLE_ID] = 1;
		cacheKeyGenerator = [USER_ROLE_ID]
	}
	for(role of roles) {
		cacheKeyGenerator.push(role._rolesID);
		userRoles[role._rolesID] = 1;
	}


	let orgs = {
		[organID]: organName
	}
	const pgs = await mysqlExec("SELECT _organ.id, _organ.name FROM `_organ__users` LEFT JOIN _organ ON (_organ.id = _organ__users._organID) WHERE _organ__users._usersID=" + userID + " ORDER BY _organ.id");
	for(let org of pgs) {
		orgs[org.id] = org.name;
	}

	const lang = getLang(pag.language);

	const userSession = {
		id: userID,
		name: pag.userName,
		avatar: pag.avatar,
		email: pag.email,
		userRoles,
		orgs,
		lang,
		cacheKey: cacheKeyGenerator.join() + lang.prefix
	};
	
	if(!await setCurrentOrg(organID_def, userSession)) {
		await setCurrentOrg(organID, userSession, true);
	}
	createSession(userSession, sessionToken);
	if(isItServerSideRole) {
		userSession.__temporaryServerSideSession = true
		Object.freeze(userSession);
	} else {
		await setMultiLang(pag.multilangEnabled, userSession);
	}
	return userSession;
}

function getLang(langId) {
	let ls = getLangs();
	for(let l of ls) {
		if (l.id === langId) {
			return l;
		}
	}
}

async function setCurrentOrg(organID, userSession, updateInBd) {
	if(userSession.orgs.hasOwnProperty(organID)) {
		userSession.orgId=organID;
		userSession.org=userSession.orgs[organID];
		if(updateInBd) {
			shouldBeAuthorized(userSession);
			await mySQLexec("UPDATE _users SET defaultOrg=organID WHERE id=" + userSession.id);
		}
		return 1;
	}
	return 0;
}

async function setMultiLang(enable, userSession) {
	shouldBeAuthorized(userSession);
	if(enable && defined('ENABLE_MULTILANG')) {
		userSession.langs = getLangs();
	} else {
		delete userSession.langs;
	}
	await mysqlExec('UPDATE _users SET multilangEnabled=' + (enable ? '1' : '0') + " WHERE id=" + userSession.id + " LIMIT 1");
	return 1;
}

module.exports = {setCurrentOrg, setMultiLang, login, authorizeUserByID, resetPassword, activateUser, registerUser, startSession, finishSession, killSession, getPasswordHash, createSession, getServerHref};