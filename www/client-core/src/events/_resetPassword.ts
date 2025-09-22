import { E, NODE_ID, type IRegistrationFilter } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import { clientOn } from '../events-handle';
import { User } from '../user';
import { getData, goToHome, L } from '../utils';
import { showMessageAboutEmailSent } from './_registration';

clientOn(E._resetPassword.afterSave, (form) => {
	showMessageAboutEmailSent(L('RESET_EMAIL_SENT'), form);
	form.isPreventCloseFormAfterSave = true;
});

clientOn(E._resetPassword.onLoad, (form) => {
	form.hideCancelButton();
	const activationKey = (form.formFilters as IRegistrationFilter).activationKey;
	const resetCode = (form.formFilters as any as KeyedMap<string>).resetCode; // resetCode taken from activation link url
	if (activationKey || resetCode) {
		form.hideField('email');
		form.hideFooter();
		if (activationKey) {
			getData('api/activate', form.formFilters)
				.then((userSession) => {
					User.setUserData(userSession);
					goToHome();
				})
				.catch((_er) => {});
		} else {
			getData('api/reset', form.formFilters)
				.then((userSession) => {
					User.setUserData(userSession);
					globals.Stage.showForm(NODE_ID.USERS, userSession.id, { tab: 'passwordTab' }, true);
				})
				.catch((_er) => {});
		}
	}
});

clientOn(E._resetPassword.backToLogin.onClick, (_form) => {
	globals.Stage.showForm(NODE_ID.LOGIN);
});
