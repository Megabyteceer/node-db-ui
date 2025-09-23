import { clientOn } from '../events-handle';
import type Form from '../form';
import { R } from '../r';
import { E, NODE_ID, type TRegistrationFieldsList, type TResetPasswordFieldsList } from '../types/generated';
import { globals } from '../types/globals';
import { L, myAlert } from '../utils';
import { checkPasswordConfirmation } from './_users';

export const showMessageAboutEmailSent = (txt: string, form: Form<TRegistrationFieldsList> | Form<TResetPasswordFieldsList>) => {
	myAlert(
		R.span(null, txt, R.div({ className: 'email-highlight' }, form.fieldValue('email'))),
		true,
		false,
		true,
		() => {
			globals.Stage.showForm(NODE_ID.LOGIN);
		},
		L('GO_TO_LOGIN')
	);
};

clientOn(E._registration.onSave, (form) => {
	checkPasswordConfirmation(form);
});

clientOn(E._registration.afterSave, (form) => {
	showMessageAboutEmailSent(L('REGISTRATION_EMAIL_SENT'), form);
	form.isPreventCloseFormAfterSave = true;
});

clientOn(E._registration.onLoad, (form) => {
	form.setSaveButtonTitle(L('REGISTER'));
	form.hideCancelButton();
});

clientOn(E._registration.alreadyHaveAccountBtn.onClick, (_form) => {
	globals.Stage.showForm(NODE_ID.LOGIN);
});

clientOn(E._registration.passwordConfirm.onChange, (form) => {
	checkPasswordConfirmation(form);
});
