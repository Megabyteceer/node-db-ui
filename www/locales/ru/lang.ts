import { initDictionary } from "../../js/utils";

(() => {
	initDictionary({

		'NO_TRANSLATION': 'Не найден перевод для ключа "%"',
		'OK': 'Ок',
		'CANCEL': 'Отмена',
		'CONNECTION_ERR': 'Ошибка сети',
		'CHECK_CONNECTION': 'Проверьте подключение к сети.',
		'SURE_DELETE': 'Вы уверены, что хотите удалить %',
		'ALLOW_POPUPS': 'Разрешите всплывающие окна для этого сайта.',
		'TYPES_ALLOWED': 'Для загрузки доступны только следующие типы файлов: %',
		'FILE_BIG': 'Файл слишком большой (% Мб). Допустимый размер ',
		'MB': ' Мб',
		'FLD_SETTINGS': 'Настройка поля: ',
		'FLD_ADD': 'Добавить поле',
		'FLD_SHOW_ALL': 'Показать скрытые поля',
		'ADD_RATING_FLD': 'Добавить оценку к разделу',
		'ADD_NODE': 'Добавить раздел',
		'NODE_SETTINGS': 'Настройка раздела: ',
		'EDIT_NODE': 'Редактировать настройки раздела',
		'EDIT_ACCESS': 'Настроить права доступа к разделу',
		'CONTENT': 'Содержимое',
		'FLD_DESC': 'Описание поля',
		'PASSWORDS_NOT_M': 'Пароли не совпадают',
		'FLD_EXISTS': 'Поле с таким именем уже существует в этом документе.',
		'MULTILANG': 'Мультиязычность',
		'LOGIN': 'Вход',
		'USER_PROFILE': 'Профиль пользователя',
		'LOGOUT': 'Выход',
		'NOT_IMPLEMENTED': 'В разработке',
		'DEPLOY_TO': 'Загрузить изменения на %?',
		'TESTS_ERROR': 'Ошибка тестирования.',
		'DEPLOY': 'Деплой изменений',
		'CLEAR_CACHE': 'Очистить кеш сервера',
		'CLEAR_DEBUG': 'Очистить отладочный вывод',
		'VIEW': 'Просмотр',
		'CREATE': 'Создать',
		'CREATE_DELIMITER': 'Создать разделитель',
		'DELETE': 'Удалить',
		'MOVE_UP': 'Переместить вверх',
		'MOVE_DOWN': 'Переместить вниз',
		'ADD': 'Добавить %',
		'SEARCH_LIST': 'Поиск по разделу',
		'NO_RESULTS': 'По запросу "%" ничего не найдено',
		'PUSH_CREATE': 'Нажмите кнопку "Создать %",',
		'TO_CONTINUE': 'чтобы продолжить работу...',
		'TO_START': 'чтобы начать работу...',
		'LIST_EMPTY': 'Список пуст.',
		'SHOWED_LIST': '% из %',
		'SEARCH_RESULTS': ' (результаты поиска по запросу "%")',
		'EDIT': 'Редактировать',
		'TEMPLATE': 'черновик',
		'UNPUBLISH': 'Отменить публикацию',
		'PUBLISH': 'Опубликовать',
		'DETAILS': 'Подробнее',
		'SELECT': 'Выбрать',
		'LOADING': 'Идет загрузка...',
		'REQUIRED_FLD': 'Поле бязательно к заполнению.',
		'SAVE': 'Сохранить',
		'SAVE_TEMPLATE': 'Сохранить черновик',
		'BACK': 'Назад',
		'ADM_ONCHANGEEVENT': 'onChange событие поля %',
		'ADM_FORMSEVENT': '"%" событие формы ',
		'ADM_VARS': 'Переменные:',
		'ADM_HLP_1': ' - true при создании записи false - при просмотре записи,',
		'ADM_HLP_2': ' - true при обновлении записи',
		'ADM_HLP_3': ' - ID просматриваемой записи',
		'ADM_HLP_4': ' - предыдущее значение поля при реддактировании поля',
		'ADM_HLP_5': ' - параметры, заполняемые автоматически при создании связаной записи',
		'ADM_HLP_6': ' - фильтры для просмотра списка связанных полей',
		'ADM_HLP_7': ' - false при вызове onChange поля при загрузке формы',
		'ADM_FUNCTIONS': 'Функции:',
		'ADM_FIELDS': 'Поля документа:',
		'NEW': 'Новое %',
		'ADM_NA': 'Запрещено',
		'ADM_A': 'Разрешено',
		'ADM_A_OWN': 'Разрешено свои',
		'ADM_A_ORG': 'Разрешено в пределах своей организации',
		'ADM_A_FULL': 'Полные права',
		'ADM_NODE_ACCESS': 'Разрешения для раздела ',
		'APPLY': 'Применить',
		'PREVIEW': 'Предварительный просмотр:',
		'SELECT_IMG': 'Выбрать...',
		'RECOMEND_SIZE': 'Рекомендуемый размер изображения %x% пикселей в JPG формате.',
		'LIST_REMOVE': 'Убрать из списка',
		'NORATES': 'Оценок нет',
		'CLEAR': 'Очистить',
		'+ADD': '+ Добавить',
		'YES': 'Да',
		'NO': 'нет',
		'TIME': 'Время',
		'N_TIME': '% (время)',
		'DATE': 'Дата',
		'N_DATE': '% (дата)',
		'DOWNLOAD': 'скачать',
		'FILE_SELECTED': 'выбран файл: % ',
		'FILE_SELECT': 'Выбрать... (% макс.)',
		'RICH_ED_SIZE': 'Суммарный размер изображений в поле "%" не должен превышать 2 мегабайта.',
		'RESTARTNOW': 'Чтобы изменения вступили в силу нужно заново войти на сайт. Вы хотите сделать это сейчас?',
		'INVALID_DATA_LIST': 'Дополните список данными',
		'SAVE_SUB_FIRST': 'Сперва сохраните вложенную форму',
		'PASS_LEN': 'Длинна пароля должна быть не менее % символов',
		'PASS_NOT_MACH': 'Пароли не совпадают',
		'LATIN_ONLY': 'Только латинские символы',
		'MIN_NAMES_LEN': 'Минимальная длинна % символа',
		'SAVE_TOADDSUB': 'Сохраните форму прежде чем добавить %',
		'APPLY_CHILD': 'Применить настройки для всех подразделов?',
		'TO_THIS': 'Только для этого раздела',
		'TO_ALL': 'Для всех подразделов'
	});
})();