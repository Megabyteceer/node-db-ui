import { existsSync } from "fs";
import { join } from "path";
import { mysqlExec, mysqlRowsResult } from "./mysql-connection";
import ENV from "../ENV";
import { authorizeUserByID, isUserHaveRole, setMainTainMode, UserSession, usersSessionsStartedCount } from "./auth";
import { throwError, assert, FIELD_6_ENUM, NodeDesc, UserLangEntry, RecId, RecordDataWrite, RecordData, FieldDesc, VIEW_MASK_ALL, VIEW_MASK_LIST, VIEW_MASK_DROPDOWN_LOOKUP, GUEST_ROLE_ID, ADMIN_ROLE_ID } from "../www/js/bs-utils";

const METADATA_RELOADING_ATTEMPT_INTERVAl = 500;

let fields;
let nodes;
let nodesById;
let langs: UserLangEntry[];
let eventsHandlers;

const ADMIN_USER_SESSION: UserSession = {} as UserSession;
const GUEST_USER_SESSION: UserSession = {} as UserSession;

const clientSideNodes = new Map();
const nodesTreeCache = new Map();

function getFieldDesc(fieldId): FieldDesc {
	assert(fields.has(fieldId), "Unknown field id " + fieldId);
	return fields.get(fieldId);
}

function getNodeDesc(nodeId, userSession = ADMIN_USER_SESSION): NodeDesc {
	assert(!isNaN(nodeId), 'nodeId expected');
	if(!clientSideNodes.has(userSession.cacheKey)) {
		const srcNode = nodesById.get(nodeId);
		let prevs;

		if(srcNode && (prevs = getUserAccessToNode(srcNode, userSession))) {
			let landQ = userSession.lang.prefix;


			let fields = [];
			for(let srcField of srcNode.fields) {
				const field: FieldDesc = {
					id: srcField.id,
					name: srcField['name' + landQ] || srcField.name,
					description: srcField['description' + landQ] || srcField.description,
					show: srcField.show,
					prior: srcField.prior,
					fieldType: srcField.fieldType,
					fieldName: srcField.fieldName,
					selectFieldName: srcField.selectFieldName,
					maxLength: srcField.maxLength,
					requirement: srcField.requirement,
					unique: srcField.unique,
					enum: srcField.enum,
					forSearch: srcField.forSearch,
					noStore: srcField.noStore,
					nodeRef: srcField.nodeRef,
					clientOnly: srcField.clientOnly,
					icon: srcField.icon
				};

				if(field.enum) {
					field.enum = field.enum.map((item) => {
						return {
							name: item['name' + userSession.lang.prefix],
							value: item.value
						};
					});
				}

				fields.push(field);
				if(srcField.multilingual && userSession.langs) {

					const fieldName = field.fieldName;
					const fieldId = field.id;
					const langs = userSession.langs;
					for(const l of langs) {
						if(l.prefix) {
							const langFiled = Object.assign({}, field);
							langFiled.show = field.show & (VIEW_MASK_ALL - VIEW_MASK_LIST - VIEW_MASK_DROPDOWN_LOOKUP);
							langFiled.fieldName = fieldName + l.prefix;
							langFiled.id = fieldId + l.prefix;
							langFiled.lang = l.name;
							fields.push(langFiled);
						}
					}
				}
			}
			const ret: NodeDesc = {
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
				draftable: srcNode.draftable,
				icon: srcNode.icon,
				recPerPage: srcNode.recPerPage,
				defaultFilterId: srcNode.defaultFilterId,
				fields,
				filters: srcNode.filters,
				sortFieldName: srcNode.sortFieldName
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
		let ret = { nodesTree, options };
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
	let langs_new: UserLangEntry[];
	let eventsHandlers_new = new Map();

	options = {
		DEBUG: ENV.DEBUG,
		ADMIN_ENABLED_DEFAULT: ENV.ADMIN_ENABLED_DEFAULT,
		APP_TITLE: ENV.APP_TITLE,
		HOME_NODE: ENV.HOME_NODE,
		REQUIRE_COMPANY: ENV.REQUIRE_COMPANY,
		REQUIRE_NAME: ENV.REQUIRE_NAME,
		DEFAULT_LANG_ID: ENV.DEFAULT_LANG_ID,
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

	langs_new = await mysqlExec("SELECT id, name, code, uiCode FROM _languages WHERE id <> 0") as UserLangEntry[];
	for(let l of langs_new) {
		l.prefix = l.code ? ('$' + l.code) : '';
	}

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
		let sortField = nodeData._fieldsID;

		if(nodeData.isDoc) {
			let query = "SELECT * FROM _fields WHERE node_fields_linker=" + nodeData.id + " AND status=1 ORDER BY prior";
			let fields = await mysqlExec(query) as mysqlRowsResult;
			for(let field of fields) {

				if(field.id === sortField) {
					nodeData.sortFieldName = field.fieldName;
				}

				if(field.fieldType === FIELD_6_ENUM && field.show) {
					let enums = await mysqlExec("SELECT value," + langs_new.map((l) => {
						return 'name' + l.prefix;
					}).join() + " FROM _enum_values WHERE status = 1 AND values_linker=" + field.enum + " ORDER BY `order`");
					field.enum = enums;
				}
				fields_new.set(field.id, field);
			}
			nodeData.fields = fields;
			const filtersRes = await mysqlExec("SELECT id,filter,name,view,hiPriority, fields FROM _filters WHERE _nodesID=" + nodeData.id) as mysqlRowsResult;

			const filters = {};
			for(let f of filtersRes) {
				filters[f.id] = f;
			}
			nodeData.filters = filters;

			//events handlers
			let moduleFileName = join(__dirname, '../events/' + nodeData.tableName + '.js');
			if(existsSync(moduleFileName)) {
				let handler = (await import(moduleFileName)).default;
				eventsHandlers_new.set(nodeData.id, handler);
			}
		}
	}

	fields = fields_new;
	nodes = nodes_new;
	nodesById = nodesById_new;
	langs = langs_new;
	eventsHandlers = eventsHandlers_new;
	clientSideNodes.clear();
	nodesTreeCache.clear();

	Object.assign(ADMIN_USER_SESSION, await authorizeUserByID(1, true
		/// #if DEBUG
		, "dev-admin-session-token"
		/// #endif
	));
	assert(isUserHaveRole(ADMIN_ROLE_ID, ADMIN_USER_SESSION), "User with id 1 expected to be admin.");
	Object.assign(GUEST_USER_SESSION, await authorizeUserByID(2, true, 'guest-session'));
	assert(isUserHaveRole(GUEST_ROLE_ID, GUEST_USER_SESSION), "User with id 2 expected to be guest.");
	/// #if DEBUG
	await authorizeUserByID(3, undefined, "dev-user-session-token");
	/// #endif

}

function getLangs(): UserLangEntry[] {
	return langs;
}

enum ServerSideEventHadlersNames {
	beforeCreate = 'beforeCreate',
	afterCreate = 'afterCreate',
	beforeUpdate = 'beforeUpdate',
	beforeDelete = 'beforeDelete',
}

interface NodeEventsHandlers {
	beforeCreate?: (data: RecordDataWrite, userSession: UserSession) => Promise<void>;
	afterCreate?: (data: RecordDataWrite, userSession: UserSession) => Promise<void>;
	beforeUpdate?: (currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) => Promise<void>;
	beforeDelete?: (data: RecordData, userSession: UserSession) => Promise<void>;
}

async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHadlersNames.beforeCreate, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHadlersNames.afterCreate, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHadlersNames.beforeUpdate, currentData: RecordData, newData: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHadlersNames.beforeDelete, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHadlersNames, data1, data2, data3?): Promise<void> {
	if(eventsHandlers.has(nodeId)) {
		const serverSideNodeEventHandler = eventsHandlers.get(nodeId)[eventName];
		/// #if DEBUG
		data1 = wrapObjectToDestroy(data1);
		data2 = wrapObjectToDestroy(data2);
		data3 = wrapObjectToDestroy(data3);
		/// #endif
		if(serverSideNodeEventHandler) {
			// call node server side event handler
			await serverSideNodeEventHandler(data1, data2, data3);
		}

		/// #if DEBUG
		destroyObject(data1);
		destroyObject(data2);
		destroyObject(data3);
		/// #endif
	}
}

/// #if DEBUG
const wrapObjectToDestroy = (o) => {
	let destroyed = false;
	if(o) {
		return new Proxy(o, {
			set: function(obj, prop, value, a) {
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




export {
	NodeEventsHandlers,
	ENV, getNodeDesc, getFieldDesc, initNodesData, getNodesTree, getNodeEventHandler, getLangs,
	ADMIN_USER_SESSION, GUEST_USER_SESSION, reloadMetadataSchedule, ServerSideEventHadlersNames
};
