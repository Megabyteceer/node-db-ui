import api from './api';
import { finishSession, isUserHaveRole, startSession } from './auth';
import { initNodesData } from './describe-node';

import { ROLE_ID } from '../www/client-core/src/bs-utils';
import './locale';
import { mysqlDebug } from './mysql-connection';

import '../www/client-core/src/locales/en/lang-server';
import '../www/client-core/src/locales/ru/lang-server';

import { ENV, SERVER_ENV } from './ENV';

/// #if DEBUG
import { performance } from 'perf_hooks';
/// #endif

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const multer = require('multer');
const upload = multer();

const path = require('path');

const upload2 = upload.single('file');

function addDebugDataToResponse(resHeaders, ret, startTime) {
	if (mysqlDebug.debug) {
		ret.debug = mysqlDebug.debug;
		delete mysqlDebug.debug;
		ret.debug.timeElapsed_ms = performance.now() - startTime;
	}
}

const handleRequest = (req, res) => {
	/// #if DEBUG
	const startTime = performance.now();
	/// #endif

	let handler = req.url.substr(6);
	if (api.hasOwnProperty(handler)) {
		handler = api[handler];
		const body = req.body;
		/// #if DEBUG
		//console.log(req.url);
		//console.dir(body);
		/// #endif

		let userSession;
		/// #if DEBUG
		mysqlDebug.debug = { requestTime: new Date(), stack: [] };
		/// #endif

		const resHeaders = {
			'content-type': 'application/json',
			'Access-Control-Allow-Origin': ENV.ALLOW_ORIGIN,
			'Access-Control-Allow-Methods': 'POST'
		};

		//@ts-ignore
		const onError = (error) => {
			let ret;
			/// #if DEBUG
			ret = { error: error.stack };
			addDebugDataToResponse(resHeaders, ret, startTime);
			console.error(error.stack);
			/*
			/// #endif
			console.error(error.stack);
			ret = { error: error.message };
			//*/
			res.set(resHeaders);
			res.end(JSON.stringify(ret));
		};
		startSession(body.sessionToken, req.headers['accept-language'])
			.then((session) => {
				userSession = session;
				handler(body, session).then((result) => {
					const ret: any = {
						result,
						isGuest: false,
						/// #if DEBUG
						debug: null
						/// #endif
					};
					/// #if DEBUG
					addDebugDataToResponse(resHeaders, ret, startTime);
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
					//*/
			})
			/// #if DEBUG
			/*
					/// #endif
					.catch(onError);
					//*/
			.finally(() => {
				finishSession(body.sessionToken);
			});
	} else {
		res.writeHead(404);
		res.end('wrong api request');
	}
};

const handleUpload = (req, res) => {
	upload2(req, res, () => {
		req.body.filename = req.file.originalname;
		req.body.fileContent = req.file.buffer;
		handleRequest(req, res);
	});
};

app.options('/core/*', (req, res) => {
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

function crudJSServer() {
	initNodesData().then(async function () {
		app.listen(SERVER_ENV.PORT);
		console.log('HTTP listen ' + SERVER_ENV.PORT + '...');
	});
}

export default crudJSServer;
if (require.main === module) {
	crudJSServer();
}
