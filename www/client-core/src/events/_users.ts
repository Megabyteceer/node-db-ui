import { clientOn } from '../events-handle';
import type Form from '../form';
import { ENV } from '../main-frame';
import { E, type ILanguagesFilter, type IUsersRecord, type TRegistrationFieldsList, type TUsersFieldsList } from '../types/generated';
import { iAdmin, User } from '../user';
import { isAdmin, L, showPrompt } from '../utils';

let uiLanguageIsChanged = false;

export const checkPasswordConfirmation = (form: Form<TUsersFieldsList> | Form<TRegistrationFieldsList>) => {
	const p = form.getFieldValue('password');
	const p2 = form.getFieldValue('passwordConfirm');
	if (p && p !== p2) {
		form.fieldAlert('passwordConfirm', L('PASS_NOT_MACH'));
	} else {
		form.fieldAlert('passwordConfirm');
	}
};

const PASSWORD_PLACE_HOLDER = 'nc_l4DFn76ds5yhg';

clientOn(E._users.onLoad, (form) => {
	if (!ENV.langs) {
		form.hideField('language');
	} else {
		form.addLookupFilters('language', {
			isUILanguage: 1
		} as ILanguagesFilter);
	}

	if (!iAdmin()) {
		form.hideField('_userRoles');
	}
	if ((form.recId as number) < 4) {
		form.hideField('_userRoles');
	}

	form.disableField('_organizationId');

	if (!iAdmin()) {
		form.hideField('_organizationId');
	}

	const myName = form.getFieldValue('name');

	if (!isAdmin()) {
		form.disableField('email');
	}

	if (form.isUpdateRecord || form.isNewRecord) {
		form.addLookupFilters('_userRoles', {
			excludeIDs: [2, 3]
		});
	}

	if (form.isUpdateRecord) {
		form.setHeader (L('EDIT_USER_PROFILE', myName));
		form.setFieldValue('password', PASSWORD_PLACE_HOLDER);
		form.savedFormData!.password = PASSWORD_PLACE_HOLDER;
		form.setFieldValue('passwordConfirm', PASSWORD_PLACE_HOLDER);
	}

	if (form.isNewRecord) {
		form.hideField('mailing');
		form.hideField('_organizationId');
		form.savedFormData!.password = PASSWORD_PLACE_HOLDER;
		form.setFieldValue('password', PASSWORD_PLACE_HOLDER);
		form.setFieldValue('passwordConfirm', PASSWORD_PLACE_HOLDER);
	}
});

clientOn(E._users.onSave, (form) => {
	checkPasswordConfirmation(form);
	const pass = form.getFieldValue('password');
	if (pass.length < ENV.MIN_PASS_LEN) {
		form.fieldAlert('password', L('PASS_LEN', ENV.MIN_PASS_LEN));
	}

	if (User.currentUserData?.id === form.recId) {
		let pLang = (form.savedFormData as IUsersRecord).language!;
		let nLang = (form.formData as IUsersRecord).language!;

		uiLanguageIsChanged = nLang.id != pLang.id;
	}
});

clientOn(E._users.afterSave, (form) => {
	if (uiLanguageIsChanged) {
		showPrompt(L('RESTART_NOW')).then((isYes) => {
			if (isYes) {
				window.location.href = 'login';
			}
		});
	}
	if (form.recId === User.currentUserData?.id) {
		User.currentUserData!.avatar = form.getFieldValue('avatar');
		User.instance!.forceUpdate();
	}
});

clientOn(E._users.passwordConfirm.onChange, (form) => {
	checkPasswordConfirmation(form);
});