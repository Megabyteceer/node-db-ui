
import { createServer } from 'http';
import api from './api';
import { startSession, finishSession, isUserHaveRole } from './auth';
import { initNodesData } from './describe-node';
import { performance } from 'perf_hooks';
import { getBoundary, parse } from 'parse-multipart-data';
import './locale';
import { mysqlDebug } from "./mysql-connection";
import { GUEST_ROLE_ID } from "../www/src/bs-utils";

const server = createServer();

/// #if DEBUG
import { DPromise } from "../www/src/debug-promise";
//@ts-ignore
global.Promise = DPromise;
/// #endif

server.on('request', (req, res) => {
	if(req.method === 'POST') {
		let handler = req.url.substr(6);
		if(api.hasOwnProperty(handler)) {
			let isMultipart = req.headers['content-type'].indexOf('multipart/form-data') >= 0;

			handler = api[handler];
			let body;
			req.on('data', chunk => {
				if(!isMultipart) {
					chunk = chunk.toString();
				}
				if(body) {
					if(Array.isArray(body)) {
						body.push(chunk);
					} else {
						body = [body, chunk];
					}
				} else {
					body = chunk;
				}
			});
			req.on('end', () => {
				/// #if DEBUG
				/*
				/// #endif
				try {
				//*/
				/// #if DEBUG
				let startTime = performance.now();
				/// #endif


				if(isMultipart) {
					let boundary = getBoundary(req.headers['content-type']);
					if(Array.isArray(body)) {
						body = Buffer.concat(body);
					}
					let parts = parse(body, boundary);
					body = {};
					for(let part of parts) {
						if(part.filename) {
							// @ts-ignore
							body.filename = part.filename;
							// @ts-ignore
							body.fileContent = part.data;
						} else {
							body[part.name] = part.data.toString();
						}
					}
				} else {
					if(Array.isArray(body)) {
						if(body.length > 1) {
							body = body.join('');
						} else {
							body = body[0];
						}
					}
					body = JSON.parse(body);
				}
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
					debugger;
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
						resHeaders['Access-Control-Allow-Origin'] = '*';
						if(mysqlDebug.debug) {
							ret.debug = mysqlDebug.debug;
							delete mysqlDebug.debug;
							ret.debug.timeElapsed_ms = performance.now() - startTime;
						}
						/// #endif

						if(isUserHaveRole(GUEST_ROLE_ID, userSession)) {
							ret.isGuest = true;
						}

						res.writeHead(200, resHeaders);

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
			});
		} else {
			res.writeHead(404);
			res.end("wrong api request");
		}
	} else {
		res.writeHead(404);
		res.end("POST expected.");
	}
});

initNodesData().then(async function() {
	server.listen(7778);
	console.log('HTTPS listen 7778...');
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
