const {mail_utf8} = require("../core/auth.js");
const ENV = require("../ENV.js");

module.exports = {
	post: async function(data, userSession) {
		debugger;
		if(ENV.ERROR_NOTIFY_EMAIL) {
			let emails = ENV.ERROR_NOTIFY_EMAIL.split(',');
			for(let email of emails) {
				if(email) {
					mail_utf8(email, 'Error at ' + ENV.SERVER_NAME + '; ' + data.name, data.stack);
				}
			}
		}
	}
}