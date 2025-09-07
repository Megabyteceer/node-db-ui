const SERVER_ENV = {
	PORT: 1443,
	SERVER_NAME: 'http://node-db-ui.com:5173/',
	ADMIN_ENABLED_DEFAULT: true,
	ERROR_NOTIFY_EMAIL: '',

	EMAIL_FROM: 'test@test.com',

	DB_HOST: '127.0.0.1',
	DB_USER: 'root',
	DB_PASS: '',
	DB_NAME: 'crud_js_base',
	DB_CONNECTIONS_COUNT: 10,

	DEPLOY_TO: 'http: //test.server.org',
	DEPLOYMENT_KEY_LOCAL: '',
	DEPLOYMENT_KEY_REMOTE: '',

	DEPLOYMENT_KEEP_DEBUG: true,
};

const ENV = {

	langs: undefined as string[] | undefined,

	APP_TITLE: 'CRUD-js',

	HOME_NODE_GUEST: 20,
	HOME_NODE: 5,

	ALLOW_ORIGIN: '*',

	REQUIRE_NAME: true,
	REQUIRE_COMPANY: true,

	DEFAULT_LANG_CODE: 'en',
	ALLOW_GUEST: true,
	ENABLE_MULTILINGUAL: false,
	GOOGLE_PLUS: true,
	TERMS_URL: '',
	MAX_FILE_SIZE_TO_UPLOAD: 3000000,

	ALLOWED_UPLOADS: ['gif', 'jpg', 'jpeg', 'jpe', 'png', 'zip', 'rar', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'ppt', 'pptx', 'txt', 'wav'],

	BLOCK_RICH_EDITOR_TAGS: ['script'],

	clientOptions: {
		googleSigninClientId: ''
	}
};

import * as fs from 'fs';

const envPath = './ENV.json';
if (fs.existsSync(envPath)) {
	const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
	if (env.clientOptions) {
		Object.assign(ENV.clientOptions, env.clientOptions);
	}
	Object.assign(ENV, env);
}

export { ENV, SERVER_ENV };

type ENV_TYPE = typeof ENV;

export type { ENV_TYPE };
