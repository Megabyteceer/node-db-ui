const ENV = {
	SERVER_NAME: "http://distrib.ru",
	DEBUG: true,
	ADMIN_ENABLED_DEFAULT: true,
	ERROR_NOTIFY_EMAIL: "vasiliy.p.kostin@gmail.com,example@example.com",

	EMAIL_FROM: "test@test.com",

	APP_TITLE: "CRUD-js",

	DB_HOST: "127.0.0.1",
	DB_USER: "root",
	DB_PASS: "",
	DB_NAME: "crud_js_base",

	DEPLOY_TO: "http: //test.server.org",
	DEPLOYMENT_KEY_LOCAL: '',
	DEPLOYMENT_KEY_REMOTE: "test_OOPIHJWQp0du()*W9d8wpu9(z*Y@(*2yP*)d@>2H2p(*h9p@*yPlikb;",

	DEPLOYMENT_KEEP_DEBUG: true,

	HOME_NODE: 5,

	REQUIRE_NAME: true,
	REQUIRE_COMPANY: true,

	DEFAULT_LANG_ID: 1,
	ALLOW_GUEST: true,
	ENABLE_MULTILINGUAL: false,
	GOOGLE_PLUS: true,
	TERMS_URL: "",
	MAX_FILE_SIZE_TO_UPLOAD: 3000000,

	ALLOWED_UPLOADS: ["gif", "jpg", "jpeg", "jpe", "png", "zip", "rar", "doc", "docx", "xls", "xlsx", "pdf", "ppt", "pptx", "txt", "wav"],

	BLOCK_RICH_EDITOR_TAGS: ["script"]
};

export default ENV;