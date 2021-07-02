const mysql = require('mysql2');
const performance = require('perf_hooks').performance;
const connection = mysql.createConnection({
	user: process.env.DB_USER,
	database: process.env.DB_NAME,
	host: process.env.DB_HOST,
	password: process.env.DB_PASS
});
const {getCurrentStack} = require("../www/both-side-utils");


const mysqlExec = (query, userSession) => {
	/// #if DEBUG
	let preparedError = new Error();

	let SQL = {timeElapsed_ms: performance.now(), SQL : query, stack: getCurrentStack()};
	if(userSession && userSession.debug) {
		if(!userSession.debug.SQLs) {
			userSession.debug.SQLs = [];
		}
		userSession.debug.SQLs.push(SQL)
	}
	/// #endif
	
	return new Promise((resolve, reject) => {
		connection.query(query, (er, rows) => {
			if(er) {
				/// #if DEBUG
				er.stack = preparedError.stack;
				
				/// #endif
				debugger;
				reject(preparedError, er, query);
			}
			/// #if DEBUG
			SQL.timeElapsed_ms = performance.now() - SQL.timeElapsed_ms;
			/// #endif
			resolve(rows);
		});
	});
};

if (!String.prototype.replaceAll) {
	const expCache = new Map();
	String.prototype.replaceAll = function(str, newStr){
		/// #if DEBUG
		assert(typeof str === 'string', "string expected")
		/// #endif
		if(!expCache.has(str)) {
			expCache.set(str, new RegExp(str, 'g'))
		}
		return this.replace(expCache.get(str), newStr);
	};
}

let mysqlTransactStarted = false;

async function mysqlStartTransaction(userSession) {
	assert(!mysqlTransactStarted, "transaction already started");
	mysqlTransactStarted = true;
	return mysqlExec("START TRANSACTION;", userSession);
}

async function mysqlCommit(userSession) {
	assert(mysqlTransactStarted, "transaction is not started");
	await mysqlExec("COMMIT;", userSession);
	mysqlTransactStarted = false;
}

async function mysqlRollback() {
	if(mysqlTransactStarted) {
		await mysqlExec("ROLLBACK;", userSession);
		mysqlTransactStarted = false;
	}
}

async function mysqlInsertedID(userSession) {
	assert(mysqlTransactStarted, "transaction is not started");
	let ret = await mysqlExec("SELECT LAST_INSERT_ID()", userSession);
	return ret[0]['LAST_INSERT_ID()'];
}


module.exports = {mysqlExec, mysqlStartTransaction, mysqlCommit, mysqlRollback, mysqlInsertedID};
