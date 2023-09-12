
import api from './api';
import { startSession, finishSession, isUserHaveRole } from './auth';
import { initNodesData } from './describe-node';

import './locale';
import { mysqlDebug, mysql_real_escape_object } from "./mysql-connection";
import { ROLE_ID } from "../www/client-core/src/bs-utils";

import "../www/client-core/src/locales/en/lang-server";
import "../www/client-core/src/locales/ru/lang-server";

import ENV from './ENV';

/// #if DEBUG
import { performance } from 'perf_hooks';
import { DPromise } from "../www/client-core/src/debug-promise";
//@ts-ignore
global.Promise = DPromise;
/// #endif

const express = require('express');
var bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const multer = require('multer')
const upload = multer()

const path = require('path')

const upload2 = upload.single('file');

function addDebugDataToResponse(resHeaders, ret, startTime) {
	if(mysqlDebug.debug) {
		ret.debug = mysqlDebug.debug;
		delete mysqlDebug.debug;
		ret.debug.timeElapsed_ms = performance.now() - startTime;
	}
}

const handleRequest = (req, res) => {
	/// #if DEBUG
	let startTime = performance.now();
	/// #endif

	let handler = req.url.substr(6);
	if(api.hasOwnProperty(handler)) {

		handler = api[handler];
		const body = req.body;
		/// #if DEBUG
		//console.log(req.url);
		//console.dir(body);
		/// #endif
		mysql_real_escape_object(body);
		let userSession;
		/// #if DEBUG
		mysqlDebug.debug = { requestTime: new Date(), stack: [] };
		/// #endif

		const resHeaders = {
			'content-type': 'application/json',
			'Access-Control-Allow-Origin': ENV.ALLOW_ORIGIN,
			'Access-Control-Allow-Methods': 'POST'
		};

		const onError = (error) => {
			var ret;
			/// #if DEBUG
			ret = { error: error.stack };
			addDebugDataToResponse(resHeaders, ret, startTime );
			console.error(error.stack);
			/*
			/// #endif
			console.error(error.stack);
			ret = { error: error.message };
			//*/
			res.set(resHeaders);
			res.end(JSON.stringify(ret));
		}
		startSession(body.sessionToken, req.headers['accept-language']).then((session) => {
			userSession = session;
			handler(body, session).then((result) => {

				
				let ret: any = {
					result, isGuest: false,
					/// #if DEBUG
					debug: null
					/// #endif
				};
				/// #if DEBUG
				addDebugDataToResponse(resHeaders, ret, startTime );
				/// #endif

				if(isUserHaveRole(ROLE_ID.GUEST, userSession)) {
					ret.isGuest = true;
				}

				res.set(resHeaders);

				if(userSession.hasOwnProperty('notifications')) {
					ret.notifications = userSession.notifications;
					delete userSession.notifications;
				}
				res.end(JSON.stringify(ret));
			}).catch(onError);
		})
			.catch(onError)
			.finally(() => {
				finishSession(body.sessionToken);
			});
	} else {
		res.writeHead(404);
		res.end("wrong api request");
	}
};

const handleUpload = (req, res) => {
	upload2(req, res, () => {
		req.body.filename = req.file.originalname;
		req.body.fileContent = req.file.buffer;
		handleRequest(req, res);
	});
};

app.options("/core/*", (req, res) => {
	res.set({
		'Access-Control-Allow-Origin': ENV.ALLOW_ORIGIN,
		'Access-Control-Allow-Credentials': true,
		'Access-Control-Allow-Methods': 'POST',
		'Access-Control-Allow-Headers': 'Content-Type'
	});
	res.end();
});

app.post("/core/api/uploadFile", handleUpload);
app.post("/core/api/uploadImage", handleUpload);

app.post("/core/*", handleRequest);

app.use('/dist/images/', express.static(path.join(__dirname, '../../www/images')));
app.use('/assets/', express.static(path.join(__dirname, '../../www/dist/assets')));
app.use('/', express.static(path.join(__dirname, '../../www')));


function crudJSServer() {
	initNodesData().then(async function() {
		app.listen(ENV.PORT)
		console.log('HTTP listen ' + ENV.PORT + '...');
	});
}

export default crudJSServer;
if(require.main === module) {
	crudJSServer();
}
