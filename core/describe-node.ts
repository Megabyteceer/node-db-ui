import { existsSync } from "fs";
import { join } from "path";
import { mysqlExec, mysqlRowsResult } from "./mysql-connection";
import ENV from "../ENV";
import { authorizeUserByID, isUserHaveRole, setMaintenanceMode, UserSession, usersSessionsStartedCount } from "./auth";
import { throwError, assert, FIELD_TYPE_ENUM_6, NodeDesc, UserLangEntry, RecId, RecordDataWrite, RecordData, FieldDesc, VIEW_MASK_ALL, VIEW_MASK_LIST, VIEW_MASK_DROPDOWN_LOOKUP, GUEST_ROLE_ID, ADMIN_ROLE_ID, NODE_ID_NODES, NODE_ID_FIELDS, NODE_ID_FILTERS, NODE_TYPE } from "../www/src/bs-utils";

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

const filtersById = new Map();

function getFieldDesc(fieldId): FieldDesc {
	assert(fields.has(fieldId), "Unknown field id " + fieldId);
	return fields.get(fieldId);
}

function getNodeDesc(nodeId, userSession = ADMIN_USER_SESSION): NodeDesc {
	assert(!isNaN(nodeId), 'nodeId expected');
	if(!clientSideNodes.has(userSession.cacheKey)) {
		const srcNode = nodesById.get(nodeId);
		let privileges;

		if(srcNode && (privileges = getUserAccessToNode(srcNode, userSession))) {
			let landQ = userSession.lang.prefix;

			const ret: NodeDesc = {
				id: srcNode.id,
				singleName: srcNode["singleName" + landQ],
				privileges,
				matchName: srcNode["name" + landQ],
				description: srcNode["description" + landQ],
				nodeType: srcNode.nodeType
			}
			if(srcNode.nodeType === NODE_TYPE.REACT_CLASS) {
				ret.tableName = srcNode.tableName;
			} else if(srcNode.nodeType === NODE_TYPE.DOCUMENT) {

				ret.reverse = srcNode.reverse;
				ret.creationName = srcNode["creationName" + landQ];
				ret.storeForms = srcNode.storeForms;
				ret.staticLink = srcNode.staticLink;
				ret.tableName = srcNode.tableName;
				ret.draftable = srcNode.draftable;
				ret.icon = srcNode.icon;
				ret.recPerPage = srcNode.recPerPage;
				ret.defaultFilterId = srcNode.defaultFilterId;

				ret.filters = {};
				let order = 0;
				for(let id in srcNode.filters) {
					const filter = srcNode.filters[id];
					ret.filters[id] = {
						order: order++,
						name: filter['name' + userSession.lang.prefix]
					};
				}

				ret.sortFieldName = srcNode.sortFieldName

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
						storeInDB: srcField.storeInDB,
						nodeRef: srcField.nodeRef,
						sendToServer: srcField.sendToServer,
						icon: srcField.icon,
						lookupIcon: srcField.lookupIcon,
						display: srcField.display
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
					if(srcField.multilingual && userSession.multilingualEnabled) {

						const fieldName = field.fieldName;
						const fieldId = field.id;
						const langs = getLangs();
						for(const l of langs) {
							if(l.prefix) {
								if(nodeId === NODE_ID_NODES || nodeId === NODE_ID_FIELDS || nodeId === NODE_ID_FILTERS) { // for nodes, fields, and filters, add only languages which used in system UI
									if(!l.isUILanguage) {
										continue;
									}
								}
								const langFiled = Object.assign({}, field);
								langFiled.show = field.show & (VIEW_MASK_ALL - VIEW_MASK_LIST - VIEW_MASK_DROPDOWN_LOOKUP);
								langFiled.fieldName = fieldName + l.prefix;
								langFiled.id = (fieldId + l.prefix) as unknown as number;
								langFiled.lang = l.name;
								fields.push(langFiled);
							}
						}
					}
				}
				ret.fields = fields;
			}
			clientSideNodes.set(nodeId, ret);
		} else {
			throwError("<access> Access to node " + nodeId + " is denied");
		}
	}
	return clientSideNodes.get(nodeId);
}

function getUserAccessToNode(node, userSession) {
	let ret = 0;
	for(let role of node.rolesToAccess) {
		if(isUserHaveRole(role.roleId, userSession)) {
			ret |= role.privileges;
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
			let privileges = getUserAccessToNode(nodeSrc, userSession);
			if(privileges) {
				nodesTree.push({
					icon: nodeSrc.icon,
					id: nodeSrc.id,
					name: nodeSrc['name' + langId],
					nodeType: nodeSrc.nodeType,
					parent: nodeSrc._nodesID,
					privileges,
					staticLink: nodeSrc.staticLink
				});
			}
		}
		nodesTreeCache.set(cacheKey, ret)
	}
	return nodesTreeCache.get(cacheKey);
}

let metadataReloadingInterval;
function reloadMetadataSchedule() {
	if(!metadataReloadingInterval) {
		setMaintenanceMode(true);
		metadataReloadingInterval = setInterval(attemptToReloadMetadataSchedule, METADATA_RELOADING_ATTEMPT_INTERVAl);
	}
}

function attemptToReloadMetadataSchedule() {
	if(usersSessionsStartedCount() === 0) {
		if(metadataReloadingInterval) {
			clearInterval(metadataReloadingInterval);
			metadataReloadingInterval = null;
		}
		initNodesData().then(() => {
			setMaintenanceMode(false);
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
		DEFAULT_LANG_CODE: ENV.DEFAULT_LANG_CODE,
		MAX_FILE_SIZE_TO_UPLOAD: ENV.MAX_FILE_SIZE_TO_UPLOAD,
		ENABLE_MULTILINGUAL: ENV.ENABLE_MULTILINGUAL,
		GOOGLE_PLUS: ENV.GOOGLE_PLUS,
		TERMS_URL: ENV.TERMS_URL,
		ALLOWED_UPLOADS: ENV.ALLOWED_UPLOADS
	};

	nodesById_new = new Map();
	/// #if DEBUG
	await mysqlExec('-- ======== NODES RELOADING STARTED ===================================================================================================================== --');
	/// #endif

	langs_new = await mysqlExec("SELECT id, name, code, isUILanguage FROM _languages WHERE id <> 0") as UserLangEntry[];
	for(let l of langs_new) {
		l.prefix = l.code ? ('$' + l.code) : '';
		ALL_LANGUAGES_BY_CODES.set(l.code || ENV.DEFAULT_LANG_CODE, l);
		if(!DEFAULT_LANGUAGE || (l.code === ENV.DEFAULT_LANG_CODE)) {
			DEFAULT_LANGUAGE = l;
		}
	}

	let query = "SELECT * FROM _nodes WHERE status = 1 ORDER BY prior";
	nodes_new = await mysqlExec(query);

	for(let nodeData of nodes_new) {
		nodesById_new.set(nodeData.id, nodeData);
		nodeData.sortFieldName = '_createdON';

		let rolesToAccess = await mysqlExec("SELECT roleId, privileges FROM _role_privileges WHERE nodeID = 0 OR nodeID = " + nodeData.id);

		/// #if DEBUG
		nodeData.__preventToStringify = nodeData; // circular structure to fail when try to stringify
		/// #endif

		nodeData.rolesToAccess = rolesToAccess;
		nodeData.privileges = 65535;
		let sortField = nodeData._fieldsID;

		if(nodeData.nodeType === NODE_TYPE.DOCUMENT) {
			let query = "SELECT * FROM _fields WHERE node_fields_linker=" + nodeData.id + " AND status = 1 ORDER BY prior";
			let fields = await mysqlExec(query) as mysqlRowsResult;
			for(let field of fields) {

				if(field.id === sortField) {
					nodeData.sortFieldName = field.fieldName;
				}

				if(field.fieldType === FIELD_TYPE_ENUM_6 && field.show) {
					let enums = await mysqlExec("SELECT value," + langs_new.map((l) => {
						return 'name' + l.prefix;
					}).join() + " FROM _enum_values WHERE status = 1 AND values_linker=" + field.enum + " ORDER BY `order`");
					field.enum = enums;
				}
				fields_new.set(field.id, field);
			}
			nodeData.fields = fields;
			const filtersRes = await mysqlExec("SELECT * FROM _filters WHERE status = 1 AND _nodesID=" + nodeData.id) as mysqlRowsResult;

			const filters = {};
			for(let f of filtersRes) {
				filtersById.set(f.id, f);
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
	if(langs.length > 1) {
		options.langs = langs;
	}
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
	GUEST_USER_SESSION.isGuest = true;
	assert(isUserHaveRole(GUEST_ROLE_ID, GUEST_USER_SESSION), "User with id 2 expected to be guest.");
	/// #if DEBUG
	await authorizeUserByID(3, undefined, "dev-user-session-token");
	/// #endif

	await import("../www/locales/en/lang-server");
	await import("../www/locales/ru/lang-server");

}


const GUEST_USER_SESSIONS = new Map();

let DEFAULT_LANGUAGE;
const ALL_LANGUAGES_BY_CODES: Map<string, UserLangEntry> = new Map();

function getGuestUserForBrowserLanguage(browserLanguage: string) {
	if(browserLanguage) {
		browserLanguage = browserLanguage.substr(0, 2);
	} else {
		browserLanguage = ENV.DEFAULT_LANG_CODE;
	}

	const languageCode = ALL_LANGUAGES_BY_CODES.has(browserLanguage) ? browserLanguage : ENV.DEFAULT_LANG_CODE;

	if(!GUEST_USER_SESSIONS.has(languageCode)) {
		let session: UserSession = Object.assign({}, GUEST_USER_SESSION);
		session.lang = ALL_LANGUAGES_BY_CODES.get(languageCode);
		GUEST_USER_SESSIONS.set(languageCode, session);
	}
	return GUEST_USER_SESSIONS.get(languageCode);
}

function getLangs(): UserLangEntry[] {
	return langs;
}


enum ServerSideEventHandlersNames {
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

async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames.beforeCreate, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames.afterCreate, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames.beforeUpdate, currentData: RecordData, newData: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames.beforeDelete, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames, data1, data2, data3?): Promise<void> {
	if(eventsHandlers.has(nodeId)) {
		const serverSideNodeEventHandler = eventsHandlers.get(nodeId)[eventName];
		/// #if DEBUG
		data1 = wrapObjectToDestroy(data1);
		data2 = wrapObjectToDestroy(data2);
		data3 = wrapObjectToDestroy(data3);
		/// #endif
		let res;
		if(serverSideNodeEventHandler) {
			// call node server side event handler
			res = await serverSideNodeEventHandler(data1, data2, data3);
		}

		/// #if DEBUG
		destroyObject(data1);
		destroyObject(data2);
		destroyObject(data3);
		/// #endif
		return res;
	}
}

/// #if DEBUG
const wrapObjectToDestroy = (o) => {
	let destroyed = false;
	if(o) {
		return new Proxy(o, {
			set: function(obj, prop, value, a) {
				if(destroyed) {
					throwError('Attempt to assign data after exit on eventHandler. Has eventHandler not "await" for something?');
				}
				if(prop === 'destroyObject_ONKwFSqwSFd123123') {
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
		o.destroyObject_ONKwFSqwSFd123123 = true;
	}
}

/// #endif

export {
	NodeEventsHandlers, filtersById, getGuestUserForBrowserLanguage, DEFAULT_LANGUAGE,
	ENV, getNodeDesc, getFieldDesc, initNodesData, getNodesTree, getNodeEventHandler, getLangs,
	ADMIN_USER_SESSION, reloadMetadataSchedule, ServerSideEventHandlersNames
};
