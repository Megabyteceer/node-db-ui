
import api from './api';
import { startSession, finishSession, isUserHaveRole } from './auth';
import { initNodesData } from './describe-node';

import './locale';
import { mysqlDebug } from "./mysql-connection";
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
	resHeaders['Access-Control-Allow-Origin'] = 'http://node-db-ui.com:3000';
	resHeaders['Access-Control-Allow-Methods'] = 'POST';
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
			'content-type': 'application/json'
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

const mysql_real_escape_object = (o) => {
	for(let key in o) {
		if(key !== '__UNSAFE_UNESCAPED') {
			let val = o[key];
			switch(typeof val) {
				case 'string':
					o[key] = mysql_real_escape_string(val);
					break;
				case 'object':
					if(val) {
						mysql_real_escape_object(val);
					}
			}
		}
	}
}


const mysql_real_escape_string = (str) => {
	return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function(char) {
		switch(char) {
			case "\0":
				return "\\0";
			case "\x08":
				return "\\b";
			case "\x09":
				return "\\t";
			case "\x1a":
				return "\\z";
			case "\n":
				return "\\n";
			case "\r":
				return "\\r";
			case "\"":
			case "'":
			case "\\":
			case "%":
				return "\\" + char; // prepends a backslash to backslash, percent,
			// and double/single quotes
			default:
				return char;
		}
	});
}
