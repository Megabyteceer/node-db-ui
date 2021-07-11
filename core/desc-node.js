"use strict";
const {mysqlExec} = require("./mysql-connection");
const fs = require('fs');
const path = require("path");
const {isUserHaveRole} = require("../www/both-side-utils");


let nodes;
let nodesById;
let langs;
let eventsHandlers;

const ADMIN_USER_SESSION = {};
const GUEST_USER_SESSION = {};

const clientSideNodes = new Map();
const nodesTreeCache = new Map();



function getNodeDesc(nodeId, userSession = ADMIN_USER_SESSION) {
	assert(!isNaN(nodeId), 'nodeId expected');
	if(!clientSideNodes.has(userSession.cacheKey)) {
		const srcNode = nodesById.get(nodeId);
		let prevs;

		if(srcNode && (prevs = getUserAccessToNode(srcNode, userSession))) {
			let landQ = userSession.lang.prefix;
			const ret = {
				id: srcNode.id,
				singleName: srcNode["singleName" + landQ],
				prevs,
				reverse: srcNode.reverse,
				creationName: srcNode["creationName" + landQ],
				matchName: srcNode["name" + landQ],
				description: srcNode["description" + landQ],
				isDoc: srcNode.isDoc,
				staticLink: srcNode.staticLink,
				tableName: srcNode.tableName,
				parentf: srcNode._nodesID,
				draftable: srcNode.draftable,
				icon: srcNode.icon,
				recPerPage: srcNode.recPerPage,
				defaultFilterId: srcNode.defaultFilterId,
				fields: srcNode.fields,
				filters: srcNode.filters,
				sortFieldName: srcNode.sortFieldName
			}
			clientSideNodes.set(nodeId, ret);
		} else {
			throw new Error("Access to node " + nodeId + " is denied");
		}
	}
	return clientSideNodes.get(nodeId);
}

function getUserAccessToNode(node, userSession) {
	let ret = 0;
	for(let role of node.rolesToAccess) {
		if(isUserHaveRole(role.roleId, userSession)) {
			ret |= role.prevs;
		}
	}
	return ret;
}

function getNodesTree(userSession) { // get nodes tree visible to user
	let langId = userSession.lang.prefix;
	let cacheKey = userSession.cacheKey;

	if(!nodesTreeCache.has(cacheKey)) {
		let ret = [];
		for(let nodeSrc of nodes) {
			let prevs = getUserAccessToNode(nodeSrc, userSession);
			if(prevs) {
				ret.push({
					icon: nodeSrc.icon,
					id: nodeSrc.id,
					name: nodeSrc['name' + langId],
					isDoc: nodeSrc.isDoc,
					parent: nodeSrc._nodesID,
					prevs,
					staticLink: nodeSrc.staticLink
				});
			}
		}
		nodesTreeCache.set(cacheKey, ret)
	}
	return nodesTreeCache.get(cacheKey);
}

async function reInitNodesData() {
	const {setMainTainMode} = require("./auth");
	setMainTainMode(true);
	await initNodesData();
	setMainTainMode(false);
}

async function initNodesData() { // load whole nodes data in to memory
	let nodes_new;
	let nodesById_new;
	let langs_new;
	let eventsHandlers_new = new Map();

	nodesById_new = new Map();
	/// #if DEBUG
	await mysqlExec('-- ======== NODES RELOADING STARTED ===================================================================================================================== --');
	/// #endif

	let query = "SELECT * FROM _nodes WHERE status=1";
	nodes_new = await mysqlExec(query);

	for(let nodeData of nodes_new) {
		nodesById_new.set(nodeData.id, nodeData);
		nodeData.sortFieldName = 'createdOn';
		
		let rolesToAccess = await mysqlExec("SELECT roleId, prevs FROM _rolePrevs WHERE nodeID = 0 OR nodeID = " + nodeData.id);
		
		/// #if DEBUG
		nodeData.__preventToStringify = nodeData; // circular structure to fail when try to stringify
		/// #endif

		nodeData.rolesToAccess = rolesToAccess;
		nodeData.prevs = 65535;
		if(nodeData.prevs & PREVS_CREATE) {
			nodeData.canCreate = 1;
		}
		let sortField = nodeData._fieldsID;

		if(nodeData.isDoc) {
			let query = ("SELECT * FROM _fields WHERE node_fields_linker=" + nodeData.id + " AND status=1 ORDER BY prior");
			let fields = await mysqlExec(query);
			for(let field of fields) {
				
				if(field.id === sortField) {
					nodeData.sortFieldName = field.fieldName;
				}

				if(field.fieldType === FIELD_6_ENUM && field.show) {
					let enums = await mysqlExec("SELECT value,name FROM _enum_values WHERE values_linker=" + field.nodeRef + " ORDER BY value");
					let enData = {};
					for(let i of enums) {
						enData[i.value] = i.name;
					}
					field.enum = enData;
				}
			}
			nodeData.fields = fields;
			const filtersRes = await mysqlExec("SELECT id,filter,name,view,hiPriority, fields FROM _filters WHERE _nodesID=" + nodeData.id);
			
			const filters = {};
			for(let f of filtersRes) {
				if(!nodeData.defaultFilterId) {
					nodeData.defaultFilterId = f.id;
				}
				filters[f.id] = f;
			}
			nodeData.filters = filters;

			//events handlers
			let moduleFileName = path.join(__dirname, '../events/' + nodeData.tableName + '.js');
			if(fs.existsSync(moduleFileName)) {
				let handler = require(moduleFileName);
				eventsHandlers_new.set(nodeData.id, handler);
			}
		}
	}

	langs_new = await mysqlExec("SELECT id, name, code FROM _languages WHERE id <> 0");
	for(let l of langs_new) {
		l.prefix = l.code ? ('_' + l.code) : '';
	}

	nodes = nodes_new;
	nodesById = nodesById_new;
	langs = langs_new;
	eventsHandlers = eventsHandlers_new;
	clientSideNodes.clear();
	nodesTreeCache.clear();
}

function getLangs() {
	return langs;
}

function getEventHandler(nodeId, eventName) {
	if(eventsHandlers.has(nodeId)) {
		return eventsHandlers.get(nodeId)[eventName];
	}
}

module.exports = {getNodeDesc, initNodesData, getNodesTree, getEventHandler, getLangs, ADMIN_USER_SESSION, GUEST_USER_SESSION, reInitNodesData};
