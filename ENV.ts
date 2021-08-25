const ENV = {
	SERVER_NAME: "http://distrib.ru",
	DEBUG: true,
	ADMIN_ENABLED_DEFAULT: true,
	ERROR_NOTIFY_EMAIL: "vasiliy.p.kostin@gmail.com,example@example.com",

	EMAIL_FROM: "test@test.com",

	APP_TITLE: "distrib engine",

	DB_HOST: "127.0.0.1",
	DB_USER: "root",
	DB_PASS: "",
	DB_NAME: "node_distrib",

	DEPLOY_TO: "http: //test.server.org",
	DEPLOYMENT_KEY_LOCAL: '',
	DEPLOYMENT_KEY_REMOTE: "test_OHIwqd09uOHIsdw0eoihwehp0PPEH(WPEwe09wed;pH(O{WE230723(*28i",

	DEPLOYMENT_KEEP_DEBUG: true,

	HOME_NODE: 82,

	REQUIRE_NAME: true,
	REQUIRE_COMPANY: true,

	DEFAULT_LANG: "en",
	ALLOW_GUEST: true,
	ENABLE_MULTILANG: false,
	GOOGLE_PLUS: true,
	TERMS_URL: "https: //org.uforum.pro/custom/html/terms_of_use.html",
	MAX_FILESIZE_TO_UPLOAD: 3000000,

	ALLOWED_UPLOADS: ["gif", "jpg", "jpeg", "jpe", "png", "zip", "rar", "doc", "docx", "xls", "xlsx", "pdf", "ppt", "pptx", "txt", "wav"],

	BLOCK_RICH_EDITOR_TAGS: ["script"]
};

export default ENV;