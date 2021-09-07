
import { getNodeDesc, reloadMetadataSchedule, ADMIN_USER_SESSION, getFieldDesc } from "../desc-node";
import { mysqlExec, mysqlRowsResult } from "../mysql-connection";

import { throwError } from "../../www/js/bs-utils";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import { isAdmin } from "../auth.js";
const open = require("open");

async function nodePrevs(reqData, userSession) {
	shouldBeAdmin(userSession);
	const nodeId = reqData.nodeId;
	if(reqData.prevs) {//set node prevs
		const prevs = reqData.prevs;
		await setRolePrevsForNode(nodeId, prevs, reqData.toChild, userSession);
		reloadMetadataSchedule();
		return 1;
	} else { //get node prevs
		const prevs = await mysqlExec('SELECT id, name, (SELECT prevs FROM _roleprevs WHERE (nodeID=' + nodeId + ') AND (_roles.id=roleID) LIMIT 1) AS prevs FROM _roles WHERE ID <>1 AND ID <> 7 AND status = 1');
		return { prevs, isDoc: getNodeDesc(nodeId).isDoc }
	}
}

const NEW_FUNCTION_MARKER = '//_insertNewHandlersHere_';

async function clearCache(userSession) {
	shouldBeAdmin(userSession);
	reloadMetadataSchedule();
	return 1;
}

const shouldBeAdmin = (userSession = ADMIN_USER_SESSION) => {
	if(!isAdmin(userSession)) {
		throwError('Access denied');
	}
}

async function setRolePrevsForNode(nodeID, roleprevs, toChild, userSession) {
	shouldBeAdmin(userSession);
	await mysqlExec('DELETE FROM `_roleprevs` WHERE `nodeID`=' + nodeID + ';');

	for(let p of roleprevs) {
		if(p.prevs) {
			await mysqlExec('INSERT INTO _roleprevs SET nodeID=' + nodeID + ', roleID=' + p.id + ', prevs=' + p.prevs + ';');
		}
	}
	if(toChild) {
		//apply to sub sections
		const pgs = await mysqlExec("SELECT id FROM _nodes WHERE _nodesID =" + nodeID) as mysqlRowsResult;
		for(let pg of pgs) {
			await setRolePrevsForNode(pg.id, roleprevs, toChild, userSession);
		}
	}
}

function substrCount(string, subString) {
	let n = -1;
	let pos = 0;
	while(pos >= 0) {
		pos = string.indexOf(subString, pos);
		n++;
		if(pos >= 0) {
			pos++;
		}
	}
	return n;
}

function editFunction(fileName, functionName) {

	fileName = join(__dirname, fileName);

	let text = readFileSync(fileName, 'utf8').replaceAll("\r\n", "\n");

	const c1 = substrCount(text, functionName + '() {');

	if(c1 > 1) {
		throwError("function (" + functionName + ") present more that once in file: " + fileName);
	} else if(!c1) {
		// TODO: add function and got to source
		let i = text.indexOf(NEW_FUNCTION_MARKER);
		if(i < 0) {
			throwError("marker (" + NEW_FUNCTION_MARKER + ") is not detected in file: " + fileName);
		}
		text = text.substr(0, i) + 'async ' + functionName + `() {
		
	}

	` + text.substr(i);
		writeFileSync(fileName, text);
	}

	let a = text.split('\n');
	let line = a.findIndex(s => s.indexOf(functionName + '() {') >= 0);
	line += 2;
	try {
		//open(fileName);
		let arg = fileName + ':' + line + ':2';
		open('', {
			app: {
				name: 'code',
				arguments: ['-r', '-g', arg]
			}
		});
	} catch(err) {
		return 'Can not open file to edit: ' + fileName
	};
	return 1;
}

async function getClientEventHandler({
	handler,
	nodeId,
	fieldId
}, userSession) {
	shouldBeAdmin(userSession);

	let node = getNodeDesc(nodeId);
	if(fieldId) {
		let field = getFieldDesc(fieldId);
		return editFunction('../../../www/js/events/fields_events.ts', node.tableName + '_' + field.fieldName + '_' + handler);
	} else {
		return editFunction('../../../www/js/events/forms_events.ts', node.tableName + '_' + handler);
	}
}

export { nodePrevs, getClientEventHandler, shouldBeAdmin, clearCache };