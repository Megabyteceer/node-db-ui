const throwError = (message) => {
	debugger;

	throw new Error(message);
}

global.throwError = throwError;

const notificationOut = (userSession, text) => {
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

module.exports = {throwError, notificationOut};