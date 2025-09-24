import { existsSync } from 'fs';
import path from 'path';

const SERVER_ENV = {
	PORT: 1443,
	SERVER_NAME: 'http://node-db-ui.com:5173/',
	ADMIN_ENABLED_DEFAULT: true,
	ERROR_NOTIFY_EMAIL: '',

	EMAIL_FROM: 'test@test.com',

	DB_HOST: '',
	DB_USER: '',
	DB_PASS: '',
	DB_NAME: '',
	DB_CONNECTIONS_COUNT: 10,

	DEPLOY_TO: 'http: //test.server.org',
	DEPLOYMENT_KEY_LOCAL: '',
	DEPLOYMENT_KEY_REMOTE: '',

	SALT: '',

	DEPLOYMENT_KEEP_DEBUG: true
};

const ENV = {

	langs: undefined as string[] | undefined,

	APP_TITLE: 'CRUD-js',

	MIN_PASS_LEN: 5,

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

for (let fn of ['build-debug/ENV.js', 'ENV.js']) {
	fn = path.join(process.cwd(), fn);
	if (existsSync(fn)) {
		const env = require(fn);
		if(env.SERVER_ENV) {
			Object.assign(SERVER_ENV, env.SERVER_ENV);
		}
		if(env.ENV) {
			Object.assign(ENV, env.ENV);
		}
	}
}
export { ENV, SERVER_ENV };

type ENV_TYPE = typeof ENV;

export type { ENV_TYPE };
