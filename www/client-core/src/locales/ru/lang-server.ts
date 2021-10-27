import { initDictionaryServerSide } from "../../../../core/locale";

const LANGS = {
	'UPL_ERROR_WFN': 'Ошибка загрузки файла. Недопустимое имя файла.',
	'FILE_TYPE_NA': 'Тип файла % не поддерживается.',
	'NO_TRANSLATION': 'Не найден перевод для ключа "%"',
	'IMAGE_WRONG_FORMAT': 'Неподдерживаемый формат изображения.',
	'CLIENT_ONLY_ON_SERVER': 'Поле "%" не должно отправляться на сервер',
	'SIZE_FLD_BLOCKED': 'Изменение этого поля запрещено из-за длинны 16 в метаданных и 33 в БД.',
	'FIELD_NAME': 'Название',
	'FIELD_CREATED_ON': 'Дата создания',
	'FIELD_ORGANIZATION': 'Организация',
	'FIELD_OWNER': 'Автор',
	'REG_EXPIRED': 'Код регистрации истек. Требуется повторная регистрация.',
	'USER_BLOCKED': 'Пользователь заблокирован. Повторите попытку через % сек.',
	'WRONG_PASS': 'Ошибка логина или пароля.',
	'LOGIN': 'Вход',
	'RECOVERY_EXPIRED': 'Ссылка для сброса пароля истекла.',
	'PASSWORD_RESET_EMAIL_HEADER': 'Запрос на сброс пароля для системы %',
	'PASSWORD_RESET_EMAIL_BODY': 'Перейдите по ссылке для смены пароля: %',
	'EMAIL_ALREADY': 'Этот e-mail уже занят.',
	'CONFIRM_EMAIL': `требуется подтверждение регистрации в системе %
Перейдите по ссылке для подтверждения регистрации: `,
	'CONFIRM_EMAIL_SUBJ': 'Подтверждение регистрации.',
	'CAPTCHA_ERROR': 'Ошибка защиты от спама.'
};

initDictionaryServerSide(LANGS, 'ru');
