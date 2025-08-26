
/// #if DEBUG
import { performance } from 'perf_hooks';
import { assert } from '../www/client-core/src/assert';
import { getCurrentStack } from "../www/client-core/src/bs-utils";
/// #endif

import { Pool, QueryResultRow } from 'pg';

const pool = new Pool();

const mysqlDebug = {
	debug: null
};

const mysqlExec = (query: string, params?: string[]): Promise<QueryResultRow[]> => {
	/// #if DEBUG

	let SQL = { timeElapsed_ms: performance.now(), SQL: query, stack: getCurrentStack() };
	if(mysqlDebug.debug) {
		if(!mysqlDebug.debug.SQLs) {
			mysqlDebug.debug.SQLs = [];
		}
		mysqlDebug.debug.SQLs.push(SQL)
	}
	/// #endif
	return new Promise((resolve) => {
		return pool.query(query, params).then((res) => {
			SQL.timeElapsed_ms = performance.now() - SQL.timeElapsed_ms;
			resolve(res.rows);
		}).catch((er) => {
			console.error(query);
			console.error(er);
			/// #if DEBUG
			debugger;
			//throw er;
			/// #endif
		}) as any;
	});
};

let mysqlTransactStarted = false;
const transactionsQue = [];

function waitPrevTransactionFinish() {
	return new Promise((resolve) => {
		transactionsQue.push(resolve);
	});
}

async function mysqlStartTransaction() {
	if(mysqlTransactStarted) {
		await waitPrevTransactionFinish();
		/// #if DEBUG
		//debugger;
		/// #endif
	}
	//const ret = mysqlExec("START TRANSACTION;");
	mysqlTransactStarted = true;
	//return ret;
	return Promise.resolve();
}

function nextTransaction() {
	if(transactionsQue.length) {
		transactionsQue.shift()();
	}
}

async function mysqlCommit() {
	assert(mysqlTransactStarted, "transaction is not started");
	//await mysqlExec("COMMIT;");
	mysqlTransactStarted = false;
	nextTransaction();
}

async function mysqlRollback() {
	if(mysqlTransactStarted) {
		//await mysqlExec("ROLLBACK;");
		mysqlTransactStarted = false;
		nextTransaction();
	}
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
};
const mysql_real_escape_string = (str) => { //TODO remove
	return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
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
				return "\\" + char; // prepends a backslash to backslash, percent,
			// and double/single quotes
			default:
				return char;
		}
	});
};

export { mysql_real_escape_object, mysql_real_escape_string, mysqlCommit, mysqlDebug, mysqlExec, mysqlRollback, mysqlStartTransaction };

