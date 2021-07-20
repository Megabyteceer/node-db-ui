"use strict";
const ENV = require("../ENV.js");
const mysql = require('mysql2');
const performance = require('perf_hooks').performance;
const connection = mysql.createConnection({
	user: ENV.DB_USER,
	database: ENV.DB_NAME,
	host: ENV.DB_HOST,
	password: ENV.DB_PASS,
	multipleStatements: true
});
const {getCurrentStack} = require("../www/both-side-utils");


const mysqlExec = (query) => {
	/// #if DEBUG
	let preparedError = new Error();

	let SQL = {timeElapsed_ms: performance.now(), SQL: query, stack: getCurrentStack()};
	if(process.debug) {
		if(!process.debug.SQLs) {
			process.debug.SQLs = [];
		}
		process.debug.SQLs.push(SQL)
	}
	/// #endif

	return new Promise((resolve, reject) => {
		connection.query(query, (er, rows) => {
			if(er) {
				/// #if DEBUG
				er.stack = preparedError.stack;

				/// #endif
				debugger;
				reject(er, preparedError, query);
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
const transactionsqueq = [];

function waitPrevTransactionFinish() {
	return new Promise((resolve) => {
		transactionsqueq.push(resolve);
	});
}

async function mysqlStartTransaction() {
	if(mysqlTransactStarted) {
		await waitPrevTransactionFinish();
	}
	const ret = mysqlExec("START TRANSACTION;");
	mysqlTransactStarted = true;
	return ret;
}

function nextTrasnsaction() {
	if(transactionsqueq.length) {
		transactionsqueq.shift()();
	}
}

async function mysqlCommit() {
	assert(mysqlTransactStarted, "transaction is not started");
	await mysqlExec("COMMIT;");
	mysqlTransactStarted = false;
	nextTrasnsaction();
}

async function mysqlRollback() {
	if(mysqlTransactStarted) {
		await mysqlExec("ROLLBACK;");
		mysqlTransactStarted = false;
		nextTrasnsaction();
	}
}

module.exports = {mysqlExec, mysqlStartTransaction, mysqlCommit, mysqlRollback};
