import { throwError } from "../../www/src/bs-utils";
import { mysqlExec, mysqlRowsResult } from "../mysql-connection";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import ENV from "../../ENV";
import type { UserSession } from '../../www/src/bs-utils';
import { isAdmin } from "../auth";

async function getDeployPackage(reqData, userSession: UserSession) {
	isAdmin(userSession);

	const tablesSettings = reqData.tablesSettings || {};
	const isFull = reqData.isFull || true;

	const source_db = ENV.DB_NAME;

	let exist = await mysqlExec("SHOW DATABASES LIKE '" + source_db + "'") as mysqlRowsResult;
	if(exist.length !== 1) {
		throwError("source database `" + source_db + "` is not exists.");
	}

	var tmpName = path.join(os.tmpdir(), 'deploy_' + Date.now().toString());

	var dbTables = {};

	var sourceTables = await mysqlExec("SHOW FULL TABLES IN `" + source_db + "`") as mysqlRowsResult;
	if(!tablesSettings.tables) {
		tablesSettings.tables = {};
	}

	var filesToZip = [];

	for(var t of sourceTables) {
		var tableName = t['Tables_in_' + source_db];

		if(!tablesSettings.tables[tableName]) {
			tablesSettings.tables[tableName] = 'n';
		}
		var tableOptions = tablesSettings['tables'][tableName];

		if(isFull) {
			tableOptions = 'd';
		}

		if(tableOptions === 's') { //skip
			continue;
		}

		var tableData;
		var SQL;
		if(t.Table_type === 'VIEW') {
			SQL = await mySqlGetCreateViewSql(source_db, tableName);
			if(!SQL) {
				throwError("can't get CREATE script for view `" + source_db + "`.`" + tableName + "`");
			}
			tableData = { type: 'VIEW', SQL };
		} else {//copy table

			SQL = await mySqlGetCreateTableSql(source_db, tableName);

			if(!SQL) {
				throwError("can't get CREATE script for table `" + source_db + "`.`" + tableName + "`");
			}

			tableData = { type: 'TABLE', SQL };

			if(tableOptions === 'd') {//include table [d]ata

				tableData['isData'] = 1;
				var ts = await mysqlExec("SHOW TABLE STATUS FROM `" + source_db + "` LIKE '" + tableName + "'");
				if(!ts[0]['Auto_increment']) {
					tableData.autoIncrement = 0;
				} else {
					tableData.autoIncrement = ts[0]['Auto_increment'];
				}

				var tmpFilesDirName = tmpName + 'dumps';

				if(!fs.existsSync(tmpFilesDirName)) {
					fs.mkdirSync(tmpFilesDirName);
					fs.chmodSync(tmpFilesDirName, '777');
				}

				var tmpFileNameSQL = tmpFilesDirName + '/sql' + tableName + Math.random() + '.sql';

				if(!await mysqlExec("SELECT * FROM `" + source_db + "`.`" + tableName + "` INTO OUTFILE '" + tmpFileNameSQL + "'")) {
					var rows = await mysqlExec("SELECT * FROM `" + source_db + "`.`" + tableName + "`") as mysqlRowsResult;
					if(rows.length > 0) {
						throwError("have no privileges to dump table `" + source_db + "`.`" + tableName + "` in to file '" + tmpFileNameSQL + "'");
					}
				}

				filesToZip.push({ fileName: tmpFileNameSQL, tableName });
			}
		}
		dbTables[tableName] = tableData;
	}

	//get stored functions
	var dbFunctions = {};
	var dbFunctionsSrc = await mysqlExec("SHOW FUNCTION STATUS WHERE Db='" + source_db + "'") as mysqlRowsResult;
	if(!tablesSettings.functions) {
		tablesSettings.functions = [];
	}
	for(var t of dbFunctionsSrc) {
		var procName = t.Name;
		if(!tablesSettings.functions[procName]) {
			tablesSettings.functions[procName] = 'n'; //save settings
		}
		var opts = tablesSettings.functions[procName];
		if(opts === 's') { //skip item
			continue;
		}
		SQL = mySqlGetCreateFunctionSql(source_db, procName);
		if(!SQL) {
			throwError("can't get CREATE script for function `" + source_db + "`.`" + procName + "`");
		}
		dbFunctions[procName] = { SQL };
	}

	//get stored procedures
	var dbProcedures = {};
	var storedProcedures = await mysqlExec("SHOW PROCEDURE STATUS WHERE Db='" + source_db + "'") as mysqlRowsResult;
	if(!tablesSettings.procedures) {
		tablesSettings.procedures = [];
	}
	for(var t of storedProcedures) {
		procName = t['Name'];

		if(!tablesSettings.procedures[procName]) {
			tablesSettings.procedures[procName] = 'n'; //save settings
		}
		opts = tablesSettings['procedures'][procName];

		if(opts === 's') { //skip item
			continue;
		}

		SQL = mySqlGetCreateProcedureSql(source_db, procName);
		if(!SQL) {
			throwError("can't get CREATE script for procedure `" + source_db + "`.`" + procName + "`");
		}
		dbProcedures[procName] = { SQL };
	}

	//get events
	var dbEvents = {};
	var storedEvents = await mysqlExec("SHOW EVENTS IN `" + source_db + "`") as mysqlRowsResult;
	if(!tablesSettings.events) {
		tablesSettings.events = {};
	}
	for(t of storedEvents) {
		var eventName = t.Name;

		if(!tablesSettings.events[eventName]) {
			tablesSettings.events[eventName] = 'n'; //save settings
		}
		opts = tablesSettings['events'][eventName];

		if(opts === 's') { //skip item
			continue;
		}

		SQL = mySqlGetCreateEventSql(source_db, eventName);
		if(!SQL) {
			throwError("can't get CREATE script for event `" + source_db + "`.`" + eventName + "`");
		}
		dbEvents[eventName] = { SQL };
	}

	//get triggers
	var dbTriggers = {};
	var storedEvents = await mysqlExec("show triggers IN `" + source_db + "`") as mysqlRowsResult;
	if(tablesSettings.triggers) {
		tablesSettings.triggers = {};
	}
	for(t of storedEvents) {
		var triggerName = t.Trigger;

		if(!tablesSettings.triggers[triggerName]) {
			tablesSettings.triggers[triggerName] = 'n'; //save settings
		}
		opts = tablesSettings.triggers[triggerName];

		if(opts === 's') { //skip item
			continue;
		}

		SQL = mySqlGetCreateTriggerSql(source_db, triggerName);
		if(!SQL) {
			throwError("can't get CREATE script for trigger `" + source_db + "`.`" + triggerName + "`");
		}
		dbTriggers[triggerName] = { SQL };
	}

	var zipName = tmpName + '.zip';

	var archiver = require('archiver');

	var output = fs.createWriteStream(zipName);
	var archive = archiver('zip');


	archive.on('error', function(err) {
		throw err;
	});
	archive.pipe(output);

	var deployData = {
		sourceServer: mySqlGetHeaderInfo(),
		tables: dbTables,
		functions: dbFunctions,
		procedures: dbProcedures,
		events: dbEvents,
		triggers: dbTriggers
	};

	archive.append(JSON.stringify(deployData), { name: 'tables.json' });

	for(var f of filesToZip) {
		archive.append(JSON.stringify(deployData), { name: f.fileName });
		archive.file(f.fileName, { name: f.tableName + '.data' });
	}

	var prevFiles;

	var files = walkSync(path.join(__dirname, '../..'));

	var prevFilesFileName = path.join(__dirname, "/settings_store/", encodeURIComponent(ENV.DEPLOY_TO), "_files_tree.json");

	if(!isFull && fs.existsSync(prevFilesFileName)) {
		prevFiles = JSON.parse(fs.readFileSync(prevFilesFileName, 'utf8'));
	} else {
		prevFiles = [];
	}

	packFiles(archive, files, prevFiles, isFull);

	if(!isFull) {
		fs.writeFileSync(path.join(__dirname, "../../../core/admin/settings_store/" + source_db + ".json"), JSON.stringify(tablesSettings));
	}

	return new Promise((resolve) => {
		output.on('close', function() {
			deployToRemoteServer(zipName).then(() => {
				fs.unlinkSync(zipName);
				fs.writeFileSync(prevFilesFileName, JSON.stringify(prevFiles));
				resolve(1);
			});
		});
		archive.finalize();
	});
}

async function deployToRemoteServer(fileName) {


}

const walkSync = (dir, fileList = []) => {
	fs.readdirSync(dir).forEach(file => {
		let fullPath = path.join(dir, file);
		let stats = fs.statSync(fullPath);
		if(stats.isDirectory()) {
			fileList = walkSync(fullPath, fileList);
		} else if(stats.size > 0) {
			fileList.push({ name: fullPath, mtime: stats.mtimeMs });
		}
	});
	return fileList;
};


//TODO: ignore files
var skipFiles = [
	/.*\/.js.map$/,
	/.*\/uploads\/*/,
	/.*\/src\/*/,
	/.*..\/deploy\/settings_store\/*/,
	/.*\/ENV.js/,
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

	let prevFilesMap = {};
	for(let pf of prevFiles) {
		prevFilesMap[pf.name] = pf;
	}
	for(let file of files) {
		var fname = file.name;
		if(!prevFilesMap[fname]) {
			var f = {
				mtime: 0,
				name: fname
			};
			prevFilesMap[fname] = f;
			prevFiles.push(f);
		}
		var prevFile = prevFilesMap[fname];
		if(!isSkipFile(file.name)) {
			var sFile = file.name.replace(path.join(__dirname, '../../'), '');
			var fileTime = isFull ? Number.MAX_VALUE : fs.statSync(file.name).mtimeMs;
			if(prevFile.mtime < fileTime) {
				prevFile.mtime = fileTime;
				archive.file(file.name, { name: sFile });
			}
		}
	}
}

async function mySqlGetCreateViewSql(dbName, viewName) {
	var SQL = await mysqlExec("SHOW CREATE VIEW `" + dbName + "`.`" + viewName);
	var SQLstring = SQL[0]['Create View'];
	if(!SQLstring) {
		return false;
	}
	//remove target db name.
	SQLstring = SQLstring.replaceAll("`" + dbName + "`.", '');
	//remove definer.
	var a = SQLstring.split("VIEW `" + viewName + "` AS");
	if(a[1]) {
		return false;
	}
	return "CREATE VIEW `" + viewName + "` AS" + a[1];
}

async function mySqlGetCreateTableSql(dbName, tableName) {
	var SQL = await mysqlExec("SHOW CREATE TABLE `" + dbName + "`.`" + tableName + "`");
	var SQLstring = SQL[0]['Create Table'];
	if(!SQLstring) {
		return false;
	}
	SQLstring = SQLstring.replace(/ AUTO_INCREMENT=\d+/, '');
	SQLstring = SQLstring.replaceAll("`" + dbName + ".", '');
	return SQLstring;
}

async function mySqlGetCreateFunctionSql(dbName, functionName) {
	var SQL = await mysqlExec("SHOW CREATE FUNCTION `" + dbName + "`.`" + functionName + "`");
	var SQLstring = SQL[0]['Create Function'];

	if(!SQLstring) {
		return false;
	}
	SQLstring = SQLstring.replaceAll("`" + dbName + ".", '');


	var a = SQLstring.split("FUNCTION `" + functionName + "`");
	if(!a[1]) {
		return false;
	}
	return "CREATE FUNCTION `" + functionName + "`" + a[1];
}

async function mySqlGetCreateProcedureSql(dbName, procedureName) {
	var SQL = await mysqlExec("SHOW CREATE PROCEDURE `" + dbName + "`.`" + procedureName + "`");
	var SQLstring = SQL[0]['Create Procedure'];
	if(!SQLstring) {
		return false;
	}
	SQLstring = SQLstring.replaceAll("`" + dbName + ".", '');

	var a = SQLstring.split("PROCEDURE `" + procedureName + "`");
	if(!a[1]) {
		return false;
	}
	return "CREATE PROCEDURE `" + procedureName + "`" + a[1];
}

async function mySqlGetCreateEventSql(dbName, eventName) {
	var SQL = await mysqlExec("SHOW CREATE EVENT `" + dbName + "`.`" + eventName + "`");
	var SQLstring = SQL[0]['Create Event'];
	if(!SQLstring) {
		return false;
	}
	//remove target db name.
	SQLstring = SQLstring.replaceAll("`" + dbName + "`.", '');
	//remove definer.
	var a = SQLstring.split("EVENT `" + eventName + "`");
	if(!a[1]) {
		return false;
	}
	return "CREATE EVENT `" + eventName + "`" + a[1];
}

async function mySqlGetCreateTriggerSql(dbName, triggerName) {
	var SQL = await mysqlExec("SHOW CREATE TRIGGER `" + dbName + "`.`" + triggerName + "`") as mysqlRowsResult;
	var SQLstring = SQL[0]['SQL Original Statement'];
	if(!SQLstring) {
		return false;
	}
	//remove target db name.
	SQLstring = SQLstring.replaceAll("`" + dbName + "`.", '');
	//remove definer.
	var a = SQLstring.split("TRIGGER `" + triggerName + "`");
	if(!a[1]) {
		return false;
	}
	return "CREATE TRIGGER `" + triggerName + "`" + a[1];
}

async function mySqlGetHeaderInfo() {
	var v = await mysqlExec('SELECT version()');
	return {
		'PMD.version': 'v0.0.3', 'SQL.version': v[0]['version()']
	};
}

export { getDeployPackage };