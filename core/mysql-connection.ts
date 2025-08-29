/// #if DEBUG
import { performance } from 'perf_hooks';
import { assert, ESCAPE_BEGIN, ESCAPE_END, SQLInjectionsCheck, throwError } from '../www/client-core/src/assert';
import { getCurrentStack } from '../www/client-core/src/bs-utils';
/// #endif

import type { QueryResultRow } from 'pg';
import { escapeLiteral, Pool } from 'pg';

/** escape number */
const D = (val: number): string => {
	if (typeof val !== 'number') {
		throwError('Number expected');
	}
	return (
		/// #if DEBUG
		ESCAPE_BEGIN +
		/// #endif
		val +
		/// #if DEBUG
		ESCAPE_END
		/// #endif
	);
};

/** escaped 0 for SQL */
const NUM_0 = D(0);
/** escaped 1 for SQL */
const NUM_1 = D(1);

const pool = new Pool();

const mysqlDebug = {
	debug: null
};

const mysqlExec = (query: string): Promise<QueryResultRow[]> => {
	/// #if DEBUG

	SQLInjectionsCheck(query);
	query = query.split(ESCAPE_BEGIN).join('').split(ESCAPE_END).join('')

	const SQL = {
		timeElapsed_ms: performance.now(),
		SQL: query,
		stack: getCurrentStack()
	};
	if (mysqlDebug.debug) {
		if (!mysqlDebug.debug.SQLs) {
			mysqlDebug.debug.SQLs = [];
		}
		mysqlDebug.debug.SQLs.push(SQL);
	}
	/// #endif
	return new Promise((resolve) => {
		return pool
			.query(query)
			.then((res) => {
				SQL.timeElapsed_ms = performance.now() - SQL.timeElapsed_ms;
				resolve(res.rows);
			})
			.catch((er) => {
				console.error(query);
				console.error(er.message);
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
	if (mysqlTransactStarted) {
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
	if (transactionsQue.length) {
		transactionsQue.shift()();
	}
}

async function mysqlCommit() {
	assert(mysqlTransactStarted, 'transaction is not started');
	//await mysqlExec("COMMIT;");
	mysqlTransactStarted = false;
	nextTransaction();
}

async function mysqlRollback() {
	if (mysqlTransactStarted) {
		//await mysqlExec("ROLLBACK;");
		mysqlTransactStarted = false;
		nextTransaction();
	}
}

/** escape numbers array */
const A = (val: number[]) => {
	return val.map(D).join(',');
};

/** deprecated - use D() shortcut instead */
const escapeNumber = D;
/** deprecated - use A() shortcut instead */
const escapeNumbersArray = A;

const escapeString = (str: string): string => {
	return (
		/// #if DEBUG
		ESCAPE_BEGIN +
		/// #endif
		escapeLiteral(str) +
		/// #if DEBUG
		ESCAPE_END
		/// #endif
	);
};

export { A, D, escapeNumber, escapeNumbersArray, escapeString, mysqlCommit, mysqlDebug, mysqlExec, mysqlRollback, mysqlStartTransaction, NUM_0, NUM_1 };
