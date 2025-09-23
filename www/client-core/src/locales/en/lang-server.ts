import { initDictionaryServerSide } from '../../../../../core/locale';

const LANGS = {
	UPL_ERROR_WFN: 'File uploading error. Wrong file name.',
	FILE_TYPE_NA: 'File type % is not allowed.',
	NO_TRANSLATION: 'No translation for key "%"',
	IMAGE_WRONG_FORMAT: 'Unsupported image format.',
	CLIENT_ONLY_ON_SERVER: 'Field "%" is client only, but was sended to server.',
	SIZE_FLD_BLOCKED: 'Size of this field is blocked by technical reasons.',
	FIELD_NAME: 'Name',
	FIELD_CREATED_ON: 'Created on',
	FIELD_ORGANIZATION: 'Organization',
	FIELD_OWNER: 'Owner',
	REG_EXPIRED: 'Registration has expired. New registration is required.',
	USER_BLOCKED: 'User has blocked. Please try again after % seconds.',
	WRONG_PASS: 'Wrong login or password.',
	LOGIN: 'Login',
	RECOVERY_EXPIRED: 'Recovery link has expired.',
	PASSWORD_RESET_EMAIL_HEADER: 'Password reset request %.',
	PASSWORD_RESET_EMAIL_BODY: 'Please go to link to reset your password: %',
	EMAIL_ALREADY: 'This e-mail already in usage.',
	CONFIRM_EMAIL: `Please confirm your registration in %
Link for confirmation: `,
	CONFIRM_EMAIL_SUBJ: 'Registration confirmation'
};

initDictionaryServerSide(LANGS, 'en');

type LANG_KEYS_SERVER_SIDE = keyof typeof LANGS;
export { LANG_KEYS_SERVER_SIDE };
