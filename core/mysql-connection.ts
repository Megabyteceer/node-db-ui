
/// #if DEBUG
import { assert, getCurrentStack } from "../www/src/bs-utils";
import { performance } from 'perf_hooks';
/// #endif

import ENV from "../ENV";
import * as mysql from 'mysql2';

const pool = mysql.createPool({
	user: ENV.DB_USER,
	database: ENV.DB_NAME,
	host: ENV.DB_HOST,
	password: ENV.DB_PASS,
	multipleStatements: true,
	timezone: 'Z',
	waitForConnections: true,
	connectionLimit: ENV.DB_CONNECTIONS_COUNT,
	queueLimit: 0
});

const mysqlDebug = {
	debug: null
};

const mysqlExec = (query: string): Promise<mysqlRowsResult | mysqlRowsResult[] | mysql.OkPacket | mysql.OkPacket[] | mysql.ResultSetHeader> => {
	/// #if DEBUG
	let preparedError = new Error();

	let SQL = { timeElapsed_ms: performance.now(), SQL: query, stack: getCurrentStack() };
	if(mysqlDebug.debug) {
		if(!mysqlDebug.debug.SQLs) {
			mysqlDebug.debug.SQLs = [];
		}
		mysqlDebug.debug.SQLs.push(SQL)
	}
	/// #endif

	return new Promise((resolve, reject) => {
		pool.query(query, (er, rows) => {
			if(er) {
				/// #if DEBUG
				er.stack = preparedError.stack;
				debugger;
				/// #endif
				reject(er);
				console.dir(preparedError);
				console.log(query);
			}
			/// #if DEBUG
			SQL.timeElapsed_ms = performance.now() - SQL.timeElapsed_ms;
			/// #endif
			resolve(rows);
		});
	});
};

if(!String.prototype.replaceAll) {
	const expCache = new Map();
	String.prototype.replaceAll = function(str, newStr) {
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
const transactionsQue = [];

function waitPrevTransactionFinish() {
	return new Promise((resolve) => {
		transactionsQue.push(resolve);
	});
}

async function mysqlStartTransaction() {
	if(mysqlTransactStarted) {
		/// #if DEBUG
		debugger;
		/// #endif
		await waitPrevTransactionFinish();
	}
	const ret = mysqlExec("START TRANSACTION;");
	mysqlTransactStarted = true;
	return ret;
}

function nextTransaction() {
	if(transactionsQue.length) {
		transactionsQue.shift()();
	}
}

async function mysqlCommit() {
	assert(mysqlTransactStarted, "transaction is not started");
	await mysqlExec("COMMIT;");
	mysqlTransactStarted = false;
	nextTransaction();
}

async function mysqlRollback() {
	if(mysqlTransactStarted) {
		await mysqlExec("ROLLBACK;");
		mysqlTransactStarted = false;
		nextTransaction();
	}
}
type mysqlInsertResult = mysql.OkPacket;
type mysqlRowResultSingle = mysql.RowDataPacket;
type mysqlRowsResult = mysql.RowDataPacket[];
export { mysqlExec, mysqlStartTransaction, mysqlCommit, mysqlRollback, mysqlDebug, mysqlRowsResult, mysqlRowResultSingle, mysqlInsertResult };
