
import api from './api';
import { startSession, finishSession, isUserHaveRole } from './auth';
import { initNodesData } from './describe-node';
import { performance } from 'perf_hooks';
import './locale';
import { mysqlDebug } from "./mysql-connection";
import { ROLE_ID } from "../www/src/bs-utils";

/// #if DEBUG
import { DPromise } from "../www/src/debug-promise";
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

const handleRequest = (req, res) => {
	/// #if DEBUG
	/*
	/// #endif
	try {
	//*/
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

		const onError = (error) => {
			/// #if DEBUG
			console.log(error.stack);
			res.end(JSON.stringify({ error: error.stack }));
			/*
			/// #endif
			res.writeHead(500);
			error = true;
			res.end("{error:1}");
			//*/
		}

		startSession(body.sessionToken, req.headers['accept-language']).then((session) => {
			userSession = session;
			handler(body, session).then((result) => {

				const resHeaders = {
					'content-type': 'application/json'
				};
				let ret: any = {
					result, isGuest: false,
					/// #if DEBUG
					debug: null
					/// #endif
				};
				/// #if DEBUG
				resHeaders['Access-Control-Allow-Origin'] = 'http://node-db-ui.com:3000';
				resHeaders['Access-Control-Allow-Methods'] = 'POST';
				if(mysqlDebug.debug) {
					ret.debug = mysqlDebug.debug;
					delete mysqlDebug.debug;
					ret.debug.timeElapsed_ms = performance.now() - startTime;
				}
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

initNodesData().then(async function() {
	app.listen(1443)
	console.log('HTTP listen 1443...');
});

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
