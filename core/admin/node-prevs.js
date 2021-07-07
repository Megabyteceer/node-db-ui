"use strict";

const {isAdmin} = require("../../www/both-side-utils");
const {getNodeDesc, reInitNodesData} = require("../desc-node");
const {mysqlExec} = require("../mysql-connection");

async function nodePrevs(reqData, userSession) {
	isAdmin(userSession);
	const nodeId = reqData.nodeId;
	if(reqData.prevs) {//set node prevs
		const prevs = reqData.prevs;
		await setRolePrevsForNode(nodeId, prevs, reqData.hasOwnProperty('toChild'), userSession);
		await reInitNodesData();
		return 1;
	} else { //get node prevs
		const prevs = await mysqlExec('SELECT id, name, (SELECT prevs FROM _roleprevs WHERE (nodeID=' + nodeId + ') AND (_roles.id=roleID) LIMIT 1) AS prevs FROM _roles WHERE ID <>1 AND ID <> 7 AND status = 1', userSession);
		return {prevs, isDoc: getNodeDesc(nodeId).isDoc}
	}
}

async function setRolePrevsForNode(nodeID, roleprevs, toChild, userSession) {

	await mysqlExec('DELETE FROM `_roleprevs` WHERE `nodeID`=' + nodeID + ';', userSession);
	
	for(let p of roleprevs) {
		if(p.prevs) {
			await mysqlExec('INSERT INTO _roleprevs SET nodeID=' + nodeID + ', roleID=' + p.id + ', prevs=' + p.prevs + ';', userSession);
		}
	}
	if(toChild) {
		//apply to sub sections
		const pgs = await mysqlExec( "SELECT id FROM _nodes WHERE _nodesID =" + nodeID, userSession);
		for(let pg of pgs) {
			await setRolePrevsForNode(pg.id, roleprevs, toChild, userSession);
		}
	}
}

module.exports = {nodePrevs};