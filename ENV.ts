const ENV = {
	SERVER_NAME: 'http://node-db-ui.com:1443/',
	ADMIN_ENABLED_DEFAULT: true,
	ERROR_NOTIFY_EMAIL: '',

	EMAIL_FROM: 'test@test.com',

	APP_TITLE: 'CRUD-js',

	DB_HOST: '127.0.0.1',
	DB_USER: 'root',
	DB_PASS: '',
	DB_NAME: 'crud_js_base',
	DB_CONNECTIONS_COUNT: 10,

	DEPLOY_TO: 'http: //test.server.org',
	DEPLOYMENT_KEY_LOCAL: '',
	DEPLOYMENT_KEY_REMOTE: '',

	DEPLOYMENT_KEEP_DEBUG: true,

	HOME_NODE: 20,

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

	CAPTCHA_CLIENT_SECRET: '', /** add recaptcha v3 keys to enable captcha forms */
	CAPTCHA_SERVER_SECRET: '', /** add recaptcha v3 keys to enable captcha forms */
};

import * as fs from "fs";
import * as path from "path";

const envPath = path.join(__dirname, '../ENV.json')
if(fs.existsSync(envPath)) {
	let env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
	Object.assign(ENV, env);
}

export default ENV;