const {mail_utf8} = require("../core/auth.js");

module.exports = {
	post: async function (data, userSession) {
		debugger;
		if(process.env.ERROR_NOTIFY_EMAIL) {
			let emails = process.env.ERROR_NOTIFY_EMAIL.split(',');
			for(let email of emails) {
				if(email) {
					mail_utf8(email, 'Error. ' + data.name, data.stack); //TODO add error email template
				}
			}
		}
	}
}