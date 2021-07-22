
const {mysqlExec} = require("../core/mysql-connection");
const {isAdmin} = require("../www/both-side-utils");
const {getPasswordHash} = require("../core/auth");
const crypto = require('crypto');
const {submitRecord} = require("../core/submit");

async function clearUserParams(data, currentData, userSession) {

	if(!isAdmin(userSession)) {
		delete data._organID;
		delete data._userRolesm2n;
	}

	if(data.hasOwnProperty('PASS')) {
		const p = data.PASS;
		if(p !== 'nc_l4DFn76ds5yhg') {
			let salt = crypto.randomBytes(16).toString('hex');
			await mysqlExec("UPDATE _users SET salt='" + salt + "' WHERE id=" + currentData.id);
			data.PASS = await getPasswordHash(data.PASS, salt);
		} else {
			delete data.PASS;
		}
	}

	if(currentData) {
		delete data.email;
		currentData = Object.assign(currentData, data);
	} else {
		currentData = data;
	}

	data.public_email = currentData.show_email ? currentData.email : 'hidden_91d2g7';
	data.public_phone = currentData.show_phone ? currentData.PHONE : 'hidden_91d2g7';
	data.public_vk = currentData.show_vk ? currentData.soc_vk : 'hidden_91d2g7';
	data.public_fb = currentData.show_facebook ? currentData.soc_fb : 'hidden_91d2g7';
	data.public_google = currentData.show_google ? currentData.soc_google : 'hidden_91d2g7';
}

module.exports = {
	beforeUpdate: async function(currentData, newData, userSession) {
		if(!isAdmin(userSession)) {
			delete newData.email;
		}

		if(newData.hasOwnProperty('company')) {
			if(currentData._organID.id) {
				await submitRecord(7, {name: newData.company}, currentData._organID.id);
			}
		}
		return clearUserParams(newData, currentData, userSession);
	}
}