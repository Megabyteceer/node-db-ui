
import { mysqlExec } from "../mysql-connection";
import { generateSalt, getPasswordHash, isAdmin } from "../auth";
import { submitRecord } from "../submit";

async function clearUserParams(data, currentData, userSession) {
	if(!isAdmin(userSession)) {
		delete data._organizationID;
		delete data._user_roles;
	}

	if(data.hasOwnProperty('password')) {
		const p = data.password;
		if(p !== 'nc_l4DFn76ds5yhg') {
			const salt = generateSalt();
			await mysqlExec("UPDATE _users SET salt='" + salt + "' WHERE id=" + currentData.id);
			data.password = await getPasswordHash(data.password, salt);
		} else {
			delete data.password;
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

export default {
	beforeUpdate: async function(currentData, newData, userSession) {
		if(!isAdmin(userSession)) {
			delete newData.email;
		}

		if(newData.hasOwnProperty('company')) {
			if(currentData._organizationID.id) {
				await submitRecord(7, { name: newData.company }, currentData._organizationID.id);
			}
		}
		return clearUserParams(newData, currentData, userSession);
	}
}