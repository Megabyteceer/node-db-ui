
import { getNodeDesc, reloadMetadataSchedule, ADMIN_USER_SESSION, getFieldDesc } from "../describe-node";

import { USER_ID, throwError } from "../../www/client-core/src/bs-utils";
import { join } from "path";
import * as fs from "fs";
import { readFileSync, writeFileSync } from "fs";
import { isAdmin } from "../auth.js";
import { mysqlExec } from '../mysql-connection';


const { exec } = require('child_process');

async function nodePrivileges(reqData, userSession) {
	shouldBeAdmin(userSession);
	const nodeId = reqData.nodeId;
	if(reqData.privileges) {//set node privileges
		const privileges = reqData.privileges;
		await setRolePrivilegesForNode(nodeId, privileges, reqData.toChild, userSession);
		reloadMetadataSchedule();
		return 1;
	} else { //get node privileges
		const privileges = await mysqlExec('SELECT id, name, (SELECT privileges FROM _role_privileges WHERE (node_id=' + nodeId + ') AND (_roles.id=role_id) LIMIT 1) AS privileges FROM _roles WHERE id <> ' + USER_ID.SUPER_ADMIN + ' AND id <> ' + USER_ID.VIEW_ALL + ' AND status = 1');
		return { privileges, node_type: getNodeDesc(nodeId).node_type }
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

async function setRolePrivilegesForNode(node_id, rolePrivileges, toChild, userSession) {
	shouldBeAdmin(userSession);
	await mysqlExec('DELETE FROM \"_role_privileges\" WHERE \"node_id\"=' + node_id + ';');

	for(let p of rolePrivileges) {
		if(p.privileges) {
			await mysqlExec('INSERT INTO _role_privileges SET node_id=' + node_id + ', role_id=' + p.id + ', privileges=' + p.privileges + ';');
		}
	}
	if(toChild) {
		//apply to sub sections
		const pgs = await mysqlExec("SELECT id FROM _nodes WHERE _nodes_id =" + node_id);

		for(let pg of pgs) {
			await setRolePrivilegesForNode(pg.id, rolePrivileges, toChild, userSession);
		}
	}
}

function editFunction(fileName, functionName, args = '') {

	fileName = join(__dirname, fileName);

	let text = readFileSync(fileName, 'utf8').replaceAll("\r\n", "\n");

	const functionSearchPattern = new RegExp('\\s+' + functionName + '\\(', 'gi');
	const c1 = (text.match(functionSearchPattern) || []).length;

	if(c1 > 1) {
		throwError("function (" + functionName + ") present more that once in file: " + fileName);
	} else if(!c1) {
		// TODO: add function and got to source
		let i = text.indexOf(NEW_FUNCTION_MARKER);
		if(i < 0) {
			throwError("marker (" + NEW_FUNCTION_MARKER + ") is not detected in file: " + fileName);
		}
		text = text.substr(0, i) + functionName + `(` + args + `) {
		
	}

	` + text.substr(i);
		writeFileSync(fileName, text);
	}

	let a = text.split('\n');
	let line = a.findIndex(s => s.match(functionSearchPattern));
	line += 2;
	try {
		let arg = fileName + ':' + line + ':2';
		exec('code -r -g "' + arg + '"');
	} catch(err) {
		return 'Can not open file to edit: ' + fileName
	};
	return 1;
}

async function getClientEventHandler({
	handler,
	nodeId,
	fieldId,
	args
}, userSession) {
	shouldBeAdmin(userSession);

	let node = getNodeDesc(nodeId);
	if(fieldId) {
		let field = getFieldDesc(fieldId);
		let customPath = '../../../www/src/events/fields_events_custom.ts';
		return editFunction(fs.existsSync(join(__dirname, customPath)) ? customPath : '../../../www/client-core/src/events/fields_events.ts', node.table_name + '_' + field.field_name + '_' + handler, args);
	} else {
		let customPath = '../../../www/src/events/forms_events_custom.ts';
		return editFunction(fs.existsSync(join(__dirname, customPath)) ? customPath : '../../../www/client-core/src/events/forms_events.ts', node.table_name + '_' + handler, args);
	}
}

export { nodePrivileges, getClientEventHandler, shouldBeAdmin, clearCache };