import { initDictionaryServerSide } from "../../../core/locale";

const LANGS = {
	'UPL_ERROR_WFN': 'Ошибка загрузки файла. Недопустимое имя файла.',
	'FILE_TYPE_NA': 'Тип файла % не поддерживается.',
	'CANT_COPY_FILE': 'Ошибка загрузки файла. Не получилось скопировать файл.',
	'NO_TRANSLATION': 'Не найден перевод для ключа "%"',
	'FILE_UNKNOWN_FLD': 'Ошибка загрузки файла. Неизвестное поле.',
	'FILE_NAME_EMPTY': 'Ошибка загрузки файла. Пустое имя файла.',
	'FILE_UPLOAD_ERROR': 'Ошибка загрузки файла.',
	'IMAGE_WRONG_FORMAT': 'Неподдерживаемый формат изображения.',
	'PERFECT_IMAGE_ERROR': 'Изображение имеет идеальные параметры, но возникли проблемы с его загрузкой.',
	'IMAGE_SHOULD_BE': 'Файл должен быть в формате png, jpg, или gif.',
	'FILE_NOT_UPLOADED': 'Файл не получен.',
	'CLIENT_ONLY_ON_SERVER': 'Поле "%" не должно отправляться на сервер',
	'FIELD_SHOULD_EMPTY': 'Параметр "%" должен быть пустым.',
	'NEED_CONFIG_DEPLOY': 'Требуется настройка выгрузки для базы данных "%" (Зайти в <a href="/deploy/">/deploy</a> интерфейс и выбрать какие таблицы выгружать полностью)',
	'ACCESS_DENIED': 'Доступа нет.',
	'RATING_FLD_NO_EDIT': 'поле рейтинга не подлежит редактированию.',
	'SIZE_FLD_BLOCKED': 'Изменение этого поля запрещено из-за длинны 16 в метаданных и 33 в БД.',
	'Name': 'Название',
	'Created on': 'Дата создания',
	'Organization': 'Организация',
	'Owner': 'Автор',
	'THANKS_REG': 'СПАСИБО!<br>Регистрация подтверждена.<br>Теперь вы можете войти в свою учетную запись.',
	'REG_EXPIRED': 'Код регистрации истек. Требуется повторная регистрация.',
	'USER_BLOCKED': 'Пользователь заблокирован. Повторите попытку через % сек.',
	'WRONG_PASS': 'Ошибка логина или пароля.',
	'TRY_AS_GUEST': 'Попробовать без регистрации',
	'or': 'или',
	'LOGIN': 'Вход',
	'TERMS_OF_USE': 'Пользовательское соглашение',
	'Registration': 'Регистрация',
	'FORGOT_PASS': 'Забыли пароль?',
	'CANT_SWITCH_TO_ADMIN': 'Нельзя получить права супер админа.',
	'OLD_BROWSER': '<h3>К сожалению ваш браузер не поддерживается.</h3>Вы можете скачать новый браузер на странице по этой ссылке: <a href="https://www.google.com/chrome/" target="_blank">скачать Google chrome</a> и вернуться после обновления.',
	'RECOVERY_EXPIRED': 'Ссылка для сброса пароля истекла.',
	'PASSWORD_RESET_EMAIL_HEADER': 'Запрос на сброс пароля для системы %',
	'RESET_EML_BODY': 'Перейдите по ссылке для смены пароля: %',
	'RESET_MESSAGE': 'На указанный e-mail отправлена ссылка для сброса пароля. <a href="/login">Вход.</a>',
	'RESET_ERROR': 'e-mail % не зарегистрирован.',
	'PASS_RESET_HEADER': 'Сброс пароля',
	'EMAIL_TO_RESET': 'Введите e-mail для сброса пароля',
	'RESET_BTN': 'Сбросить пароль',
	'PASS_NOT_SAME': 'Пароли не совпадают.',
	'EMAIL_ALREADY': 'Этот e-mail уже занят.',
	'RECOVERY_PASS': 'Восстановить пароль?',
	'CONFIRM_EMAIL': `требуется подтверждение регистрации в системе %
Перейдите по ссылке для подтверждения регистрации: `,
	'CONFIRM_EMAIL_SUBJ': 'Подтверждение регистрации.',
	'USER_NAME': 'Имя',
	'USER_EMAIL': 'E-mail',
	'USER_COMPANY': 'Компания',
	'USER_PASS': 'Пароль',
	'USER_REPASS': 'Повторите пароль',
	'USER_REG': 'Зарегистрироваться'

};

initDictionaryServerSide(LANGS, 'ru');
