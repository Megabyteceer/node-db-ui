
import { ENV, SERVER_ENV } from './ENV';

import api, { type APIHandler } from './api';
import { finishSession, isUserHaveRole, startSession, type UserSession } from './auth';
import { initNodesData } from './describe-node';

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
import { E } from '../www/client-core/src/types/generated';
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
