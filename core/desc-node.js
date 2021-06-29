const {mysqlExec, ADMIN_USER_SESSION} = require("./mysql-connection");
const fs = require('fs');
const path = require("path");

let nodes;
let nodesById;

const clientSideNodes = new Map();
const nodesTreeCache = new Map();

const eventsHandlers = new Map();

function getNodeDesc(nodeId, userSession = ADMIN_USER_SESSION) {
	assert(!isNaN(nodeId), 'nodeId expected');
	
	if(!clientSideNodes.has(userSession.cacheKey)) {
		clientSideNodes.set(userSession.cacheKey, new Map());
	}
	const userCache = clientSideNodes.get(userSession.cacheKey);


	if(!userCache.has(nodeId)) {
		const srcNode = nodesById.get(nodeId);

		//TODO: prepare node for clientSide
		// check access to node
		//filter fields


		userCache.set(nodeId, srcNode);

	}
	return userCache.get(nodeId);

	
/*
	let landQ;
	if(userSession && userSession.lang.id) {
		landQ = userSession.lang.id;
	} else {
		landQ = '';
	}
		/*
	$ret = array(
		'prevs' => $prevs,
		'id' => $nodeId,
		'singleName' => $pag["singleName" + landQ + ""],
		'reverse' => $pag['reverse'],
		'creationName' => $pag["creationName" + landQ + ""],
		'matchName' => $pag["name" + landQ + ""],
		'description' => $pag["description" + landQ + ""],
		'isDoc' => $isDoc,
		'staticLink' => $pag['staticLink'],
		'tableName' => $pag['tableName'],
		'parentf' => $pag['_nodesID'],
		'draftable' => $pag['draftable'],
		'icon' => $pag['icon'],
		'recPerPage' => $pag['recPerPage'],
		'sortFieldName' => 'createdOn'
	);*/

	odeData.canCreate = true; // TODO:
}

function getUserAccessToNode(node, userSession) {
	let ret = 0;
	for(role of node.rolesToAccess) {
		if(isUserHaveRole(userSession, role.roleId)) {
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

async function initNodesData() { // load whole nodes data in to memory

	nodesById = new Map();
	let query = "SELECT * FROM _nodes WHERE status=1";
	nodes = await mysqlExec(query);

	for(nodeData of nodes) {
		nodesById.set(nodeData.id, nodeData);
		nodeData.sortFieldName = 'createdOn';
		
		let rolesToAccess = await mysqlExec("SELECT roleId, prevs FROM _rolePrevs WHERE nodeID = 0 OR nodeID = " + nodeData.id);

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
				eventsHandlers.set(nodeData.id, handler);
			}
		}
	}
	clientSideNodes.clear();
	nodesTreeCache.clear();
}

function getEventHandler(nodeId, eventName) {
	if(eventsHandlers.has(nodeId)) {
		return eventsHandlers.get(nodeId)[eventName];
	}
}

module.exports = {getNodeDesc, initNodesData, getNodesTree, getEventHandler};
