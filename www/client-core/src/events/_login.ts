import type { UserSession } from '../bs-utils';
import { NEW_RECORD } from '../consts';
import { clientOn } from '../events-handle';
import { ENV } from '../main-frame';
import { R } from '../r';
import { E, NODE_ID } from '../types/generated';
import { globals } from '../types/globals';
import { User } from '../user';
import { attachGoogleLoginAPI } from '../utils';

clientOn(E._login.onLoad, (form) => {
	form.hideFooter();
	if (form.hasField('socialLoginButtons') && ENV.clientOptions.googleSigninClientId) {
		/// #if DEBUG
		return;
		/// #endif

		window.onGoogleSignIn = (googleUser: any) => {
			const id_token = googleUser.getAuthResponse().id_token;
			form.setFieldValue('username', 'google-auth-sign-in');
			form.setFieldValue('password', id_token);
			form.saveClick();
		};
		form.renderToField('socialLoginButtons', 'social-buttons', R.span(null, R.div({ 'className': 'g-signin2', 'data-onsuccess': 'onGoogleSignIn' })));
		attachGoogleLoginAPI(true);
	}
});

clientOn(E._login.afterSave, (_form, result) => {
	User.setUserData(result.handlerResult as UserSession);
	if (window.onCurdJSLogin) {
		window.onCurdJSLogin(result.handlerResult as UserSession);
	}
});

clientOn(E._login.signUpLinkBtn.onClick, (_form) => {
	globals.Stage.showForm(NODE_ID.REGISTRATION, NEW_RECORD, undefined, true);
});

clientOn(E._login.forgotPasswordButton.onClick, (_form) => {
	globals.Stage.showForm(NODE_ID.RESET_PASSWORD, NEW_RECORD, undefined, true);
});

clientOn(E._login.signInBtn.onClick, (form) => {
	form.saveClick();
});
