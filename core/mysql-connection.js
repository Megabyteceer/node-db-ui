const mysql = require('mysql2');
const performance = require('perf_hooks').performance;
const connection = mysql.createConnection({user: 'unfo.pro', database: 'distrib_db', host:'127.0.0.1', password: 'zBjgZW2s'});

const mysqlExec = (query, userSession = ADMIN_USER_SESSION) => {
	/// #if DEBUG
	let preparedError;
	try{
		throw new Error();
	} catch (er) {
		preparedError = er;
	}

	let SQL = {timeElapsed_ms: performance.now(), SQL : query, stack: getCurrentStack()};
	if(userSession.debug) {
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


const roles = {
	1:true,
	3:true,
	cacheKey: "1,2,3"
};

const lang = {id: 'en', prefix:''};

const ADMIN_USER_SESSION = {
	id:1,
	name:'admin',
	avatar: '0',
	email:"admin",
	orgs:{1:""},
	orgId: 1,
	org: "",
	roles,
	lang,
	cacheKey: roles.cacheKey + '|' + lang.prefix
}

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


module.exports = {mysqlExec, mysqlStartTransaction, mysqlCommit, mysqlRollback, mysqlInsertedID, ADMIN_USER_SESSION};
