const {ADMIN_USER_SESSION, mysqlExec} = require("./mysql-connection");

function setCurrentOrg(organID, userSession) {
	shouldBeAuthorized(userSession);
	if(userSession.orgs[organID]) {
		userSession.orgId=organID;
		userSession.org=userSession.orgs[organID];
		mySQLexec("UPDATE _users SET defaultOrg=organID WHERE id=" + userSession.id);
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

module.exports = {setCurrentOrg, setMultiLang};