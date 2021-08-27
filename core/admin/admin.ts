
import { getNodeDesc, reloadMetadataSchedule, ADMIN_USER_SESSION, getFieldDesc } from "../desc-node";
import { mysqlExec, mysqlRowsResult } from "../mysql-connection";

import { throwError, isAdmin, EVENT_HANDLER_TYPE_FIELD } from "../../www/js/bs-utils";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";

async function nodePrevs(reqData, userSession) {
	shouldBeAdmin(userSession);
	const nodeId = reqData.nodeId;
	if(reqData.prevs) {//set node prevs
		const prevs = reqData.prevs;
		await setRolePrevsForNode(nodeId, prevs, reqData.hasOwnProperty('toChild'), userSession);
		reloadMetadataSchedule();
		return 1;
	} else { //get node prevs
		const prevs = await mysqlExec('SELECT id, name, (SELECT prevs FROM _roleprevs WHERE (nodeID=' + nodeId + ') AND (_roles.id=roleID) LIMIT 1) AS prevs FROM _roles WHERE ID <>1 AND ID <> 7 AND status = 1');
		return { prevs, isDoc: getNodeDesc(nodeId).isDoc }
	}
}

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
	/// #if DEBUG




	// TODO: add function and got to source

	/*
	fileName = join(__dirname, fileName);

	let text = readFileSync(fileName, 'utf8').replaceAll("\r\n", "\n");

	const c1 = substrCount(text, startMarker);
	const c2 = substrCount(text, endMarker);
	if((c1 !== c2) || (c1 > 1)) {
		throwError("Begin or end marker for handler is corrupted or duplicated. Begin entries (" + startMarker + "): " + c1 + " End entries (" + endMarker + "): " + c2);
	}

	let start = text.indexOf(startMarker);
	let end = text.indexOf(endMarker);

	if(start >= 0) {
		start += startMarker.length;
	}

	if(newSource === false) {
		if(start >= 0) {
			return text.substring(start + 1, end - 1);
		} else {
			return '';
		}
	} else {

		if(start >= 0) { //replace handler
			const re = new RegExp("[^\\n]*" + startMarker.replaceAll('/', '\\/') + ".*" + endMarker.replaceAll('/', '\\/'), 'sm');
			if(!newSource.trim()) { // remove handler
				writeFileSync(fileName, text.replace(re, '')); //can use sync, because events update is very rare and admin only operation
			} else {
				writeFileSync(fileName, text.substring(0, start) + '\n' + newSource + '\n' + text.substring(end));
			}
		} else if(newSource) {
			//add new handler

			start = text.indexOf("//insertNewhandlersHere_adsqw09");
			if(start < 0) {
				throwError('new handlers marker is corrupted.');
			}
			let functionStart;
			if(type === 'field') {
				functionStart = "fieldsEvents[" + itemId + "] = function " + functionName + "() {" + startMarker;
			} else {
				if(handler === 'onload') {
					functionStart = "formsEventsOnLoad[" + itemId + "] = function " + functionName + "() {" + startMarker;
				} else {
					functionStart = "formsEventsOnSave[" + itemId + "] = async function " + functionName + "() {" + startMarker;
				}
			}
			writeFileSync(fileName, text.substring(0, start) + functionStart + '\n' + newSource + '\n' + endMarker + '\n\n' + text.substring(start));
		}
		return 1;
	}*/


	/// #endif

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
		return editFunction('../../../www/js/events/fields_events.js', node.tableName + '_' + field.fieldName + '_' + handler);
	} else {
		return editFunction('../../../www/js/events/fields_events.js', node.tableName + '_' + handler);
	}
}

export { nodePrevs, getClientEventHandler, shouldBeAdmin, clearCache };