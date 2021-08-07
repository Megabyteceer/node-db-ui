import {existsSync} from "fs";
import {join} from "path";
import {mysqlExec} from "./mysql-connection";
import ENV from "../ENV.js";
import {setMainTainMode, usersSessionsStartedCount} from "./auth.js";
import {throwError, isUserHaveRole, assert, PREVS_CREATE, FIELD_6_ENUM} from "./../www/js/bs-utils.js";

const METADATA_RELOADING_ATTEMPT_INTERVAl = 500;

let fields;
let nodes;
let nodesById;
let langs;
let eventsHandlers;

const ADMIN_USER_SESSION = {};
const GUEST_USER_SESSION = {};

const clientSideNodes = new Map();
const nodesTreeCache = new Map();

function getFieldDesc(fieldId) {
	assert(fields.has(fieldId), "Unknown field id " + fieldId);
	return fields.get(fieldId);
}

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
			if(prevs & PREVS_CREATE) {
				ret.canCreate = 1;
			}
			clientSideNodes.set(nodeId, ret);
		} else {
			throwError("Access to node " + nodeId + " is denied");
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

let options;

function getNodesTree(userSession) { // get nodes tree visible to user
	let langId = userSession.lang.prefix;
	let cacheKey = userSession.cacheKey;

	if(!nodesTreeCache.has(cacheKey)) {
		let nodesTree = [];
		let ret = {nodesTree, options};
		for(let nodeSrc of nodes) {
			let prevs = getUserAccessToNode(nodeSrc, userSession);
			if(prevs) {
				nodesTree.push({
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
	if(metadataReloadingInterval) {
		clearInterval(metadataReloadingInterval);
		metadataReloadingInterval = null;
	}
	setMainTainMode(true);
	await initNodesData();
	setMainTainMode(false);
}

let metadataReloadingInterval;
function reloadMetadataSchedule() {
	if(!metadataReloadingInterval) {
		setMainTainMode(true);
		metadataReloadingInterval = setInterval(attemptToreloadMetadataSchedule, METADATA_RELOADING_ATTEMPT_INTERVAl);
	}
}

function attemptToreloadMetadataSchedule() {
	if(usersSessionsStartedCount() === 0) {
		reInitNodesData().then(() => {
			setMainTainMode(false);
		});
	}
}

async function initNodesData() { // load whole nodes data in to memory
	let fields_new = new Map();
	let nodes_new;
	let nodesById_new;
	let langs_new;
	let eventsHandlers_new = new Map();

	options = {
		DEBUG: ENV.DEBUG,
		ADMIN_ENABLED_DEFAULT: ENV.ADMIN_ENABLED_DEFAULT,
		APP_TITLE: ENV.APP_TITLE,
		HOME_NODE: ENV.HOME_NODE,
		REQUIRE_COMPANY: ENV.REQUIRE_COMPANY,
		REQUIRE_NAME: ENV.REQUIRE_NAME,
		DEFAULT_LANG: ENV.DEFAULT_LANG,
		MAX_FILESIZE_TO_UPLOAD: ENV.MAX_FILESIZE_TO_UPLOAD,
		ENABLE_MULTILANG: ENV.ENABLE_MULTILANG,
		GOOGLE_PLUS: ENV.GOOGLE_PLUS,
		TERMS_URL: ENV.TERMS_URL,
		ALLOWED_UPLOADS: ENV.ALLOWED_UPLOADS
	};

	nodesById_new = new Map();
	/// #if DEBUG
	await mysqlExec('-- ======== NODES RELOADING STARTED ===================================================================================================================== --');
	/// #endif

	let query = "SELECT * FROM _nodes WHERE status=1 ORDER BY prior";
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
		nodeData.canCreate = 1;
		let sortField = nodeData._fieldsID;

		if(nodeData.isDoc) {
			let query = ("SELECT * FROM _fields WHERE node_fields_linker=" + nodeData.id + " AND status=1 ORDER BY prior");
			let fields = await mysqlExec(query);
			for(let field of fields) {

				if(field.id === sortField) {
					nodeData.sortFieldName = field.fieldName;
				}

				if(field.fieldType === FIELD_6_ENUM && field.show) {
					let enums = await mysqlExec("SELECT value,name FROM _enum_values WHERE values_linker=" + field.nodeRef + " ORDER BY `order`");
					field.enum = enums;
				}
				fields_new.set(field.id, field);
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
			let moduleFileName = join(__dirname, '../events/' + nodeData.tableName + '.js');
			if(existsSync(moduleFileName)) {
				let handler = import(moduleFileName);
				eventsHandlers_new.set(nodeData.id, handler);
			}
		}
	}

	langs_new = await mysqlExec("SELECT id, name, code FROM _languages WHERE id <> 0");
	for(let l of langs_new) {
		l.prefix = l.code ? ('$' + l.code) : '';
	}

	fields = fields_new;
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

async function getNodeEventHandler(nodeId, eventName, d1, d2, d3) {
	if(eventsHandlers.has(nodeId)) {
		const h = eventsHandlers.get(nodeId)[eventName];
		/// #if DEBUG
		d1 = wrapObjectToDestroy(d1);
		d2 = wrapObjectToDestroy(d2);
		d3 = wrapObjectToDestroy(d3);
		/// #endif
		if(h) {
			await h(d1, d2, d3);
		}

		/// #if DEBUG
		destroyObject(d1);
		destroyObject(d2);
		destroyObject(d3);
		/// #endif
	}
}

/// #if DEBUG
const wrapObjectToDestroy = (o) => {
	let destroyed = false;
	if(o) {
		return new Proxy(o, {
			set: function(obj, prop, value, a, b, c) {
				if(destroyed) {
					throwError('Attempt to assign data after axit on eventHandler. Has eventHandler not "await" for something?');
				}
				if(prop === 'destroyObject_ONKwoiqwhd123123') {
					destroyed = true;
				} else {
					obj[prop] = value;
				}
				return true;
			}
		});
	}
}

const destroyObject = (o) => {
	if(o) {
		o.destroyObject_ONKwoiqwhd123123 = true;
	}
}

/// #endif




export {ENV, getNodeDesc, getFieldDesc, initNodesData, getNodesTree, getNodeEventHandler, getLangs, ADMIN_USER_SESSION, GUEST_USER_SESSION, reloadMetadataSchedule};
