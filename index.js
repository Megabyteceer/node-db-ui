const {assert} = require('console');
const http = require('http');
const api = require ('./core/api.js');
const {initNodesData} = require('./core/desc-node.js');
const {ADMIN_USER_SESSION} = require('./core/mysql-connection.js');
const server = http.createServer();
const performance = require('perf_hooks').performance;
const multipart = require('parse-multipart-data');
require('./www/both-side-utils.js');

server.on('request', (req, res) => {
	/// #if DEBUG
	/*
	/// #endif
	try{
	//*/

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
				if(isMultipart) {
					let boundary = multipart.getBoundary(req.headers['content-type']);
					body = multipart.parse(body , boundary);


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
				let session = ADMIN_USER_SESSION;
				//TODO: escape strings include nested https://stackoverflow.com/a/31567092/3283159
				/// #if DEBUG
				session.debug = {requestTime: new Date(), stack:[]};
				let startTime = performance.now();
				/// #endif
				assert(!session._isLocked, "Sesson is locked 205");
				session._isLocked = true;
				handler(body, session, (result, code = 200) => {
					res.writeHead(code, {
						'content-type': 'application/json'
					});
					let ret = {result};
					/// #if DEBUG
					ret.debug = session.debug;
					delete session.debug;
					ret.debug.timeElapsed_ms = performance.now() - startTime;
					/// #endif
					if(session.hasOwnProperty('notifications')) {
						ret.notifications = session.notifications;
						delete session.notifications;
					}
					res.end(JSON.stringify(ret));
					session._isLocked = false;
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
	
	/// #if DEBUG
	/*
	/// #endif
	} catch(er) {
		console.log(er);
		res.writeHead(500);
		res.end("error");
	}
	//*/
});

initNodesData().then(() => {
	server.listen(7778);
	console.log('HTTPS listen 7778...');
});