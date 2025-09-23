// @ts-nocheck

// TODO: deploy is not implemented

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { escapeString, mysqlExec, NUM_1 } from '../mysql-connection';

import { createHash } from 'crypto';
import { SERVER_ENV } from '../../core/ENV';
import { throwError } from '../../www/client-core/src/assert';
import type { UserSession } from '../../www/client-core/src/bs-utils';
import type { NODE_ID } from '../../www/client-core/src/types/generated';
import { isAdmin } from '../auth';
import { getNodeDesc } from '../describe-node';
import { shouldBeAdmin } from './admin';

async function getDeployPackage(reqData, userSession: UserSession) {
	isAdmin(userSession);

	const tablesSettings = reqData.tablesSettings || {};
	const isFull = reqData.isFull || true;

	const source_db = SERVER_ENV.DB_NAME;

	const exist = await mysqlExec('SHOW DATABASES LIKE \'' + source_db + '\'');
	if (exist.length !== 1) {
		throwError('source database "' + source_db + '" is not exists.');
	}

	const tmpName = path.join(os.tmpdir(), 'deploy_' + Date.now().toString());

	const dbTables = {};

	const sourceTables = await mysqlExec('SHOW FULL TABLES IN "' + source_db + '"');
	if (!tablesSettings.tables) {
		tablesSettings.tables = {};
	}

	const filesToZip = [];

	for (const t of sourceTables) {
		const tableName = t['Tables_in_' + source_db];

		if (!tablesSettings.tables[tableName]) {
			tablesSettings.tables[tableName] = 'n';
		}
		let tableOptions = tablesSettings['tables'][tableName];

		if (isFull) {
			tableOptions = 'd';
		}

		if (tableOptions === 's') {
			// skip
			continue;
		}

		let tableData;
		let SQL;
		if (t.Table_type === 'VIEW') {
			SQL = await mySqlGetCreateViewSql(source_db, tableName);
			if (!SQL) {
				throwError('can\'t get CREATE script for view "' + source_db + '"."' + tableName + '"');
			}
			tableData = { type: 'VIEW', SQL };
		} else {
			// copy table

			SQL = await mySqlGetCreateTableSql(source_db, tableName);

			if (!SQL) {
				throwError('can\'t get CREATE script for table "' + source_db + '"."' + tableName + '"');
			}

			tableData = { type: 'TABLE', SQL };

			if (tableOptions === 'd') {
				// include table [d]ata

				tableData['isData'] = 1;
				const ts = await mysqlExec(
					'SHOW TABLE STATUS FROM "' + source_db + '" LIKE \'' + tableName + '\''
				);
				if (!ts[0]['Auto_increment']) {
					tableData.autoIncrement = 0;
				} else {
					tableData.autoIncrement = ts[0]['Auto_increment'];
				}

				const tmpFilesDirName = tmpName + 'dumps';

				if (!fs.existsSync(tmpFilesDirName)) {
					fs.mkdirSync(tmpFilesDirName);
					fs.chmodSync(tmpFilesDirName, '777');
				}

				const tmpFileNameSQL = tmpFilesDirName + '/sql' + tableName + Math.random() + '.sql';

				if (
					!(await mysqlExec(
						'SELECT * FROM "'
						+ source_db
						+ '"."'
						+ tableName
						+ '" INTO OUTFILE \''
						+ tmpFileNameSQL
						+ '\''
					))
				) {
					const rows = await mysqlExec('SELECT * FROM "' + source_db + '"."' + tableName + '"');
					if (rows.length > 0) {
						throwError(
							'have no privileges to dump table "'
							+ source_db
							+ '"."'
							+ tableName
							+ '" in to file \''
							+ tmpFileNameSQL
							+ '\''
						);
					}
				}

				filesToZip.push({ fileName: tmpFileNameSQL, tableName });
			}
		}
		dbTables[tableName] = tableData;
	}

	// get stored functions
	const dbFunctions = {};
	const dbFunctionsSrc = await mysqlExec('SHOW FUNCTION STATUS WHERE Db=\'' + source_db + '\'');
	if (!tablesSettings.functions) {
		tablesSettings.functions = [];
	}
	for (const t of dbFunctionsSrc) {
		const procName = t.Name;
		if (!tablesSettings.functions[procName]) {
			tablesSettings.functions[procName] = 'n'; // save settings
		}
		const opts = tablesSettings.functions[procName];
		if (opts === 's') {
			// skip item
			continue;
		}
		const SQL = mySqlGetCreateFunctionSql(source_db, procName);
		if (!SQL) {
			throwError('can\'t get CREATE script for function "' + source_db + '"."' + procName + '"');
		}
		dbFunctions[procName] = { SQL };
	}

	// get stored procedures
	const dbProcedures = {};
	const storedProcedures = await mysqlExec('SHOW PROCEDURE STATUS WHERE Db=\'' + source_db + '\'');
	if (!tablesSettings.procedures) {
		tablesSettings.procedures = [];
	}
	for (const t of storedProcedures) {
		const procName = t['Name'];

		if (!tablesSettings.procedures[procName]) {
			tablesSettings.procedures[procName] = 'n'; // save settings
		}
		const opts = tablesSettings['procedures'][procName];

		if (opts === 's') {
			// skip item
			continue;
		}

		const SQL = mySqlGetCreateProcedureSql(source_db, procName);
		if (!SQL) {
			throwError('can\'t get CREATE script for procedure "' + source_db + '"."' + procName + '"');
		}
		dbProcedures[procName] = { SQL };
	}

	// get events
	const dbEvents = {};
	let storedEvents = await mysqlExec('SHOW EVENTS IN "' + source_db + '"');
	if (!tablesSettings.events) {
		tablesSettings.events = {};
	}
	for (const t of storedEvents) {
		const eventName = t.Name;

		if (!tablesSettings.events[eventName]) {
			tablesSettings.events[eventName] = 'n'; // save settings
		}
		const opts = tablesSettings['events'][eventName];

		if (opts === 's') {
			// skip item
			continue;
		}

		const SQL = mySqlGetCreateEventSql(source_db, eventName);
		if (!SQL) {
			throwError('can\'t get CREATE script for event "' + source_db + '"."' + eventName + '"');
		}
		dbEvents[eventName] = { SQL };
	}

	// get triggers
	const dbTriggers = {};
	storedEvents = await mysqlExec('show triggers IN "' + source_db + '"');
	if (tablesSettings.triggers) {
		tablesSettings.triggers = {};
	}
	for (const t of storedEvents) {
		const triggerName = t.Trigger;

		if (!tablesSettings.triggers[triggerName]) {
			tablesSettings.triggers[triggerName] = 'n'; // save settings
		}
		const opts = tablesSettings.triggers[triggerName];

		if (opts === 's') {
			// skip item
			continue;
		}

		const SQL = mySqlGetCreateTriggerSql(source_db, triggerName);
		if (!SQL) {
			throwError('can\'t get CREATE script for trigger "' + source_db + '"."' + triggerName + '"');
		}
		dbTriggers[triggerName] = { SQL };
	}

	const zipName = tmpName + '.zip';

	const archiver = require('archiver'); // eslint-disable-line @typescript-eslint/no-require-imports

	const output = fs.createWriteStream(zipName);
	const archive = archiver('zip');

	archive.on('error', function (err) {
		throw err;
	});
	archive.pipe(output);

	const deployData = {
		sourceServer: mySqlGetHeaderInfo(),
		tables: dbTables,
		functions: dbFunctions,
		procedures: dbProcedures,
		events: dbEvents,
		triggers: dbTriggers
	};

	archive.append(JSON.stringify(deployData), { name: 'tables.json' });

	for (const f of filesToZip) {
		archive.append(JSON.stringify(deployData), { name: f.fileName });
		archive.file(f.fileName, { name: f.tableName + '.data' });
	}

	let prevFiles;

	const files = walkSync(path.join(__dirname, '../..'));
	const hash = createHash('md5').update(SERVER_ENV.DEPLOY_TO).digest('hex');

	const prevFilesFileName = path.join(__dirname, '/settings_store/', hash + '_files_tree.json');

	if (!isFull && fs.existsSync(prevFilesFileName)) {
		prevFiles = JSON.parse(fs.readFileSync(prevFilesFileName, 'utf8'));
	} else {
		prevFiles = [];
	}

	packFiles(archive, files, prevFiles, isFull);

	if (!isFull) {
		fs.writeFileSync(
			path.join(__dirname, '../../../core/admin/settings_store/' + source_db + '.json'),
			JSON.stringify(tablesSettings)
		);
	}

	return new Promise((resolve) => {
		output.on('close', function () {
			deployToRemoteServer(zipName).then(() => {
				fs.unlinkSync(zipName);
				fs.writeFileSync(prevFilesFileName, JSON.stringify(prevFiles));
				resolve(1);
			});
		});
		archive.finalize();
	});
}

async function deployToRemoteServer(_fileName: string) {
	debugger;
	// TODO
}

export const isFiledExists = async (reqData: { fieldName: string; nodeId: NODE_ID }, userSession: UserSession) => {
	shouldBeAdmin(userSession);
	const tableName = getNodeDesc(reqData.nodeId, userSession).tableName!;

	const exists = await mysqlExec(`SELECT column_name 
FROM information_schema.columns 
WHERE table_name=${escapeString(tableName)} and column_name=${escapeString(reqData.fieldName)}`);
	return (await exists).length === 0;
};

export const isTableExists = async (reqData: { tableName: string }, userSession: UserSession) => {
	shouldBeAdmin(userSession);

	const exists = await mysqlExec(`
    SELECT ${NUM_1}
    FROM pg_tables
    WHERE schemaname = ${escapeString('public')}
    AND tablename = ${escapeString(reqData.tableName)}`);

	return (await exists).length === 0;
};

const walkSync = (dir: string, fileList = []) => {
	fs.readdirSync(dir).forEach((file) => {
		const fullPath = path.join(dir, file);
		const stats = fs.statSync(fullPath);
		if (stats.isDirectory()) {
			fileList = walkSync(fullPath, fileList);
		} else if (stats.size > 0) {
			fileList.push({ name: fullPath, mtime: stats.mtimeMs });
		}
	});
	return fileList;
};

// TODO: ignore files
const skipFiles = [
	/.*\/.js.map$/,
	/.*\/uploads\/*/,
	/.*\/src\/*/,
	/.*..\/deploy\/settings_store\/*/,
	/.*\/ENV.json/,
	/.*\/.git\/*/,
	/.*\/.vscode\/*/,
	/.*.log/,
	/.*.bak/,
	/.*.pem/
];

function isSkipFile(fn) {
	return skipFiles.some((regex) => {
		return regex.exec(fn);
	});
}

function packFiles(archive, files, prevFiles, isFull) {
	const prevFilesMap = {};
	for (const pf of prevFiles) {
		prevFilesMap[pf.name] = pf;
	}
	for (const file of files) {
		const fname = file.name;
		if (!prevFilesMap[fname]) {
			const f = {
				mtime: 0,
				name: fname
			};
			prevFilesMap[fname] = f;
			prevFiles.push(f);
		}
		const prevFile = prevFilesMap[fname];
		if (!isSkipFile(file.name)) {
			const sFile = file.name.replace(path.join(__dirname, '../../'), '');
			const fileTime = isFull ? Number.MAX_VALUE : fs.statSync(file.name).mtimeMs;
			if (prevFile.mtime < fileTime) {
				prevFile.mtime = fileTime;
				archive.file(file.name, { name: sFile });
			}
		}
	}
}

async function mySqlGetCreateViewSql(dbName, viewName) {
	const SQL = await mysqlExec('SHOW CREATE VIEW "' + dbName + '"."' + viewName);
	let SQLstring = SQL[0]['Create View'];
	if (!SQLstring) {
		return false;
	}
	// remove target db name.
	SQLstring = SQLstring.replaceAll('"' + dbName + '".', '');
	// remove definer.
	const a = SQLstring.split('VIEW "' + viewName + '" AS');
	if (a[1]) {
		return false;
	}
	return 'CREATE VIEW "' + viewName + '" AS' + a[1];
}

async function mySqlGetCreateTableSql(dbName, tableName) {
	const SQL = await mysqlExec('SHOW CREATE TABLE "' + dbName + '"."' + tableName + '"');
	let SQLstring = SQL[0]['Create Table'];
	if (!SQLstring) {
		return false;
	}
	SQLstring = SQLstring.replace(/ AUTO_INCREMENT=\d+/, '');
	SQLstring = SQLstring.replaceAll('"' + dbName + '.', '');
	return SQLstring;
}

async function mySqlGetCreateFunctionSql(dbName, functionName) {
	const SQL = await mysqlExec('SHOW CREATE FUNCTION "' + dbName + '"."' + functionName + '"');
	let SQLstring = SQL[0]['Create Function'];

	if (!SQLstring) {
		return false;
	}
	SQLstring = SQLstring.replaceAll('"' + dbName + '.', '');

	const a = SQLstring.split('FUNCTION "' + functionName + '"');
	if (!a[1]) {
		return false;
	}
	return 'CREATE FUNCTION "' + functionName + '"' + a[1];
}

async function mySqlGetCreateProcedureSql(dbName, procedureName) {
	const SQL = await mysqlExec('SHOW CREATE PROCEDURE "' + dbName + '"."' + procedureName + '"');
	let SQLstring = SQL[0]['Create Procedure'];
	if (!SQLstring) {
		return false;
	}
	SQLstring = SQLstring.replaceAll('"' + dbName + '.', '');

	const a = SQLstring.split('PROCEDURE "' + procedureName + '"');
	if (!a[1]) {
		return false;
	}
	return 'CREATE PROCEDURE "' + procedureName + '"' + a[1];
}

async function mySqlGetCreateEventSql(dbName, eventName) {
	const SQL = await mysqlExec('SHOW CREATE EVENT "' + dbName + '"."' + eventName + '"');
	let SQLstring = SQL[0]['Create Event'];
	if (!SQLstring) {
		return false;
	}
	// remove target db name.
	SQLstring = SQLstring.replaceAll('"' + dbName + '".', '');
	// remove definer.
	const a = SQLstring.split('EVENT "' + eventName + '"');
	if (!a[1]) {
		return false;
	}
	return 'CREATE EVENT "' + eventName + '"' + a[1];
}

async function mySqlGetCreateTriggerSql(dbName, triggerName) {
	const SQL = await mysqlExec('SHOW CREATE TRIGGER "' + dbName + '"."' + triggerName + '"');
	let SQLstring = SQL[0]['SQL Original Statement'];
	if (!SQLstring) {
		return false;
	}
	// remove target db name.
	SQLstring = SQLstring.replaceAll('"' + dbName + '".', '');
	// remove definer.
	const a = SQLstring.split('TRIGGER "' + triggerName + '"');
	if (!a[1]) {
		return false;
	}
	return 'CREATE TRIGGER "' + triggerName + '"' + a[1];
}

async function mySqlGetHeaderInfo() {
	const v = await mysqlExec('SELECT version()');
	return {
		'PMD.version': 'v0.0.3',
		'SQL.version': v[0]['version()']
	};
}

export { getDeployPackage };
