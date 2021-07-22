"use strict";
require('dotenv').config()
const http = require('http');
const api = require('./core/api.js');
const {startSession, authorizeUserByID, finishSession, createSession} = require('./core/auth.js');
const {initNodesData, ADMIN_USER_SESSION, GUEST_USER_SESSION} = require('./core/desc-node.js');
const server = http.createServer();
const performance = require('perf_hooks').performance;
const multipart = require('parse-multipart-data');
const {isUserHaveRole} = require("./www/both-side-utils.js");
require('./core/locale.js');

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
				try {
					/// #if DEBUG
					let startTime = performance.now();
					/// #endif


					if(isMultipart) {
						let boundary = multipart.getBoundary(req.headers['content-type']);
						if(Array.isArray(body)) {
							body = Buffer.concat(body);
						}
						let parts = multipart.parse(body, boundary);
						body = {};
						for(let part of parts) {
							if(part.filename) {
								body.filename = part.filename;
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
					console.log(req.url);
					console.dir(body);
					/// #endif
					mysql_real_escape_object(body);
					let userSession;
					const onResult = (result, error) => {
						const resHeaders = {
							'content-type': 'application/json'
						};

						let ret = {result, error};
						/// #if DEBUG
						resHeaders['Access-Control-Allow-Origin'] = '*';
						if(process.debug) {
							ret.debug = process.debug;
							delete process.debug;
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
					}
					/// #if DEBUG
					process.debug = {requestTime: new Date(), stack: []};
					/// #endif
					startSession(body.sessionToken).then((session) => {
						userSession = session;
						handler(body, session, onResult);
					})
						.catch((error) => {
							console.log(error.stack);
							onResult(undefined, error.message);
						})
						//*/
						.finally(() => {
							finishSession(body.sessionToken);
						});

				} catch(error) {
					res.writeHead(500);
					/// #if DEBUG
					res.end(JSON.stringify({error}));
					/*
					/// #endif
					res.end('{"error":"error"}');
					//*/
				}
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
	Object.assign(ADMIN_USER_SESSION, await authorizeUserByID(1, true
		/// #if DEBUG
		, "dev-admin-session-token"
		/// #endif
	));
	assert(isUserHaveRole(ADMIN_ROLE_ID, ADMIN_USER_SESSION), "User with id 1 expected to be admin.");
	Object.assign(GUEST_USER_SESSION, await authorizeUserByID(2, true));
	assert(isUserHaveRole(GUEST_ROLE_ID, GUEST_USER_SESSION), "User with id 2 expected to be guest.");
	/// #if DEBUG
	await authorizeUserByID(3, undefined, "dev-user-session-token");
	/// #endif

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
