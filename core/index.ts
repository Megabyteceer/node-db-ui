import { ENV, SERVER_ENV } from './ENV';

import api, { type APIHandler } from './api';
import { finishSession, isUserHaveRole, startSession, type UserSession } from './auth';
import { initNodesData, registerServerSideFieldTypeDescriber } from './describe-node';

import { ROLE_ID, type ApiResponse, type APIResult } from '../www/client-core/src/bs-utils';
import './locale';
import { mysqlDebug } from './mysql-connection';

import '../www/client-core/src/locales/en/lang-server';
import '../www/client-core/src/locales/ru/lang-server';

/// #if DEBUG
import { performance } from 'perf_hooks';
/// #endif

import bodyParser from 'body-parser';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { serverOn } from '../www/client-core/src/events-handle';
import { E, FIELD_TYPE } from '../www/client-core/src/types/generated';
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const upload = multer();

const upload2 = upload.single('file');

/// #if DEBUG
function addDebugDataToResponse(ret: ApiResponse, startTime: number) {
	if (mysqlDebug.debugOutPut) {
		ret.debug = mysqlDebug.debugOutPut;
		delete mysqlDebug.debugOutPut;
		ret.debug.timeElapsed_ms = performance.now() - startTime;
	}
}
/// #endif

const handleRequest = (req: express.Request, res: express.Response) => {
	/// #if DEBUG
	const startTime = performance.now();
	/// #endif

	let handlerName = req.url.substring(6);
	if (api.hasOwnProperty(handlerName)) {
		const handler = api[handlerName as keyof typeof api] as APIHandler;
		const body = req.body;
		/// #if DEBUG
		// console.log(req.url);
		// console.dir(body);
		/// #endif

		let userSession: UserSession;
		/// #if DEBUG
		mysqlDebug.debugOutPut = {};
		/// #endif

		const resHeaders = {
			'content-type': 'application/json',
			'Access-Control-Allow-Origin': ENV.ALLOW_ORIGIN,
			'Access-Control-Allow-Methods': 'POST'
		};

		/// #if DEBUG
		/*
		/// #endif
		const onError = (error) => {
			let ret;
			console.error(error.stack);
			ret = { error: error.message };
			res.set(resHeaders);
			res.end(JSON.stringify(ret));
		};
		// */
		startSession(body.sessionToken, req.headers['accept-language'])
			.then((session) => {
				userSession = session;
				handler(body, session).then((result: APIResult) => {
					const ret = {
						result,
						/// #if DEBUG
						debug: undefined
						/// #endif
					} as ApiResponse;
					/// #if DEBUG
					addDebugDataToResponse(ret, startTime);
					/// #endif

					if (isUserHaveRole(ROLE_ID.GUEST, userSession)) {
						ret.isGuest = true;
					}

					res.set(resHeaders);

					if (userSession.hasOwnProperty('notifications')) {
						ret.notifications = userSession.notifications;
						delete userSession.notifications;
					}
					res.end(JSON.stringify(ret));
				});
				/// #if DEBUG
				/*
					/// #endif
					.catch(onError);
					// */
			})
			/// #if DEBUG
			/*
					/// #endif
					.catch(onError);
					// */
			.finally(() => {
				finishSession(body.sessionToken);
			});
	} else {
		res.writeHead(404);
		res.end('wrong api request: ' + handlerName);
	}
};

const handleUpload = (req: express.Request, res: express.Response) => {
	upload2(req, res, () => {
		req.body.filename = req.file!.originalname;
		req.body.fileContent = req.file!.buffer;
		handleRequest(req, res);
	});
};

app.options('/core/*', (_req, res) => {
	res.set({
		'Access-Control-Allow-Origin': ENV.ALLOW_ORIGIN,
		'Access-Control-Allow-Credentials': true,
		'Access-Control-Allow-Methods': 'POST',
		'Access-Control-Allow-Headers': 'Content-Type'
	});
	res.end();
});

app.post('/core/api/uploadFile', handleUpload);
app.post('/core/api/uploadImage', handleUpload);

app.post('/core/*', handleRequest);

app.use('/dist/images/', express.static(path.join(__dirname, '../../www/images')));
app.use('/assets/', express.static(path.join(__dirname, '../../www/dist/assets')));
app.use('/', express.static(path.join(__dirname, '../../www')));

async function startServer() {

	await initNodesData();
	await import('./events/index.js');
	app.listen(SERVER_ENV.PORT);
	console.log('HTTP listen ' + SERVER_ENV.PORT + '...');
}

export { app, E, serverOn, startServer };
if (require.main === module) {
	startServer();
}

registerServerSideFieldTypeDescriber(FIELD_TYPE.TAB, 'BaseField', '../base-field');
registerServerSideFieldTypeDescriber(FIELD_TYPE.TEXT, 'TextField', '../fields/field-1-text-default');
registerServerSideFieldTypeDescriber(FIELD_TYPE.LOOKUP_N_TO_M, 'LookupManyToManyFiled', '../fields/field-14-many-to-many');
registerServerSideFieldTypeDescriber(FIELD_TYPE.LOOKUP_1_TO_N, 'LookupOneToManyFiled', '../fields/field-15-one-to-many');
registerServerSideFieldTypeDescriber(FIELD_TYPE.NUMBER, 'NumericField', '../fields/field-2-numeric');
registerServerSideFieldTypeDescriber(FIELD_TYPE.DATE_TIME, 'FieldDateTime', '../fields/field-4-date-time');
registerServerSideFieldTypeDescriber(FIELD_TYPE.BOOL, 'BooleanField', '../fields/field-5-bool');
registerServerSideFieldTypeDescriber(FIELD_TYPE.ENUM, 'EnumField', '../fields/field-6-enum');
registerServerSideFieldTypeDescriber(FIELD_TYPE.LOOKUP, 'LookupManyToOneFiled', '../fields/field-7-many-to-one');
registerServerSideFieldTypeDescriber(FIELD_TYPE.PASSWORD, 'PasswordField', '../fields/field-10-password');
registerServerSideFieldTypeDescriber(FIELD_TYPE.DATE, 'DateField', '../fields/field-11-date');
registerServerSideFieldTypeDescriber(FIELD_TYPE.IMAGE, 'PictureField', '../fields/field-12-picture');
registerServerSideFieldTypeDescriber(FIELD_TYPE.BUTTON, 'ButtonField', '../fields/field-18-button');
registerServerSideFieldTypeDescriber(FIELD_TYPE.HTML_EDITOR, 'RichEditorField', '../fields/field-19-rich-editor');
registerServerSideFieldTypeDescriber(FIELD_TYPE.COLOR, 'ColorField', '../fields/field-20-color');
registerServerSideFieldTypeDescriber(FIELD_TYPE.FILE, 'FileField', '../fields/field-21-file');
registerServerSideFieldTypeDescriber(FIELD_TYPE.SPLITTER, 'SplitterField', '../fields/field-22-splitter');
registerServerSideFieldTypeDescriber(FIELD_TYPE.STATIC_HTML_BLOCK, 'StaticTextField', '../fields/field-8-static-text');
