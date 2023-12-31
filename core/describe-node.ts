/// #if DEBUG
/*
/// #endif
import handlers from '../___index';
//*/

import { existsSync } from "fs";
import { join } from "path";
import { mysqlExec, mysqlRowsResult } from "./mysql-connection";
import ENV from "./ENV";
import { authorizeUserByID, isUserHaveRole, setMaintenanceMode, UserSession/*, usersSessionsStartedCount*/  } from "./auth";
import { throwError, assert, FIELD_TYPE, NodeDesc, UserLangEntry, RecId, RecordDataWrite, RecordData, FieldDesc, VIEW_MASK, ROLE_ID, NODE_ID, NODE_TYPE, USER_ID } from "../www/client-core/src/bs-utils";

const METADATA_RELOADING_ATTEMPT_INTERVAl = 500;

let fields;
let nodes;
let nodesById;
let nodesByTableName;
let langs: UserLangEntry[];
let eventsHandlersServerSide;

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
	let userNodesCacheKey = nodeId + 'n_' + userSession.cacheKey;
	if(!clientSideNodes.has(userNodesCacheKey)) {
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

			if(srcNode.cssClass) {
				ret.cssClass = srcNode.cssClass;
			}

			if(srcNode.nodeType === NODE_TYPE.REACT_CLASS) {
				ret.tableName = srcNode.tableName;
			} else if(srcNode.nodeType === NODE_TYPE.DOCUMENT) {

				ret.captcha = srcNode.captcha;
				ret.reverse = srcNode.reverse;
				ret.creationName = srcNode["creationName" + landQ];
				ret.storeForms = srcNode.storeForms;
				ret.staticLink = srcNode.staticLink;
				ret.tableName = srcNode.tableName;
				ret.draftable = srcNode.draftable;
				ret.icon = srcNode.icon;
				ret.recPerPage = srcNode.recPerPage;
				ret.defaultFilterId = srcNode.defaultFilterId;

				for(let id in srcNode.filters) {
					const filter = srcNode.filters[id];
					if(filter.roles && !isUserHaveRole(ROLE_ID.ADMIN, userSession)) {
						if(!filter.roles.find(roleId => isUserHaveRole(roleId, userSession))) {
							continue;
						}
					}
					if(!ret.filters) {
						ret.filters = {};
					}
					ret.filters[id] = {
						order: filter.order,
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
						field.enumId = srcField.enumId;
					}
					if(srcField.cssClass) {
						field.cssClass = srcField.cssClass;
					}

					fields.push(field);
					if(srcField.multilingual && userSession.multilingualEnabled) {

						const fieldName = field.fieldName;
						const fieldId = field.id;
						const langs = getLangs();
						for(const l of langs) {
							if(l.prefix) {
								if(nodeId === NODE_ID.NODES || nodeId === NODE_ID.FIELDS || nodeId === NODE_ID.FILTERS) { // for nodes, fields, and filters, add only languages which used in system UI
									if(!l.isUILanguage) {
										continue;
									}
								}
								const langFiled = Object.assign({}, field);
								langFiled.show = field.show & (VIEW_MASK.ALL - VIEW_MASK.LIST - VIEW_MASK.DROPDOWN_LIST);
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
			clientSideNodes.set(userNodesCacheKey, ret);
		} else {
			throwError("<access> Access to node " + nodeId + " is denied");
		}
	}
	return clientSideNodes.get(userNodesCacheKey);
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

			/// #if DEBUG
			/*
			/// #endif
			const ADMIN_NODES = {
				4: true,
				6:true,
				9:true,
				10:true,
				12:true
			};
			if(ADMIN_NODES[nodeSrc.id]) {
				continue;
			}
			//*/

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
	//if(usersSessionsStartedCount() === 0) { //TODO: disabled because of freezes
		if(metadataReloadingInterval) {
			clearInterval(metadataReloadingInterval);
			metadataReloadingInterval = null;
		}
		initNodesData().then(() => {
			setMaintenanceMode(false);
		});
//	}
}

async function initNodesData() { // load whole nodes data in to memory
	let fields_new = new Map();
	let nodes_new;
	let nodesById_new;
	let langs_new: UserLangEntry[];
	let eventsHandlers_new = new Map();

	options = {
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
		CAPTCHA_CLIENT_SECRET: ENV.CAPTCHA_CLIENT_SECRET,
		ALLOWED_UPLOADS: ENV.ALLOWED_UPLOADS,
		clientOptions: ENV.clientOptions,
	};

	nodesById_new = new Map();
	nodesByTableName = new Map();

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
		if(nodeData.tableName) {
			nodesByTableName.set(nodeData.tableName, nodeData);
		}
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

				if(field.fieldType === FIELD_TYPE.ENUM && field.show) {
					let enums = await mysqlExec("SELECT value," + langs_new.map((l) => {
						return 'name' + l.prefix;
					}).join() + " FROM _enum_values WHERE status = 1 AND values_linker=" + field.enum + " ORDER BY `order`");
					field.enumId = field.enum;
					field.enum = enums;
				}
				fields_new.set(field.id, field);
			}
			nodeData.fields = fields;
			const filtersRes = await mysqlExec("SELECT * FROM _filters WHERE status = 1 AND node_filters_linker=" + nodeData.id + " ORDER BY `order`") as mysqlRowsResult;

			const filters = {};
			for(let f of filtersRes) {
				let filterRoles = await mysqlExec("SELECT _rolesId FROM _filter_access_roles WHERE _filtersId=" + f.id) as mysqlRowsResult;
				if(filterRoles.length > 0) {
					f.roles = filterRoles.map(i => i._rolesId);
				}
				filtersById.set(f.id, f);
				filters[f.id] = f;
			}
			nodeData.filters = filters;

			//events handlers
			/// #if DEBUG
			async function importServerSideEvents(folderName) {
				let moduleFileName = join(__dirname, folderName + nodeData.tableName + '.js');
				if(existsSync(moduleFileName)) {
					let handler = await import(`./${folderName}${nodeData.tableName}`);
					eventsHandlers_new.set(nodeData.id, handler.default);
				}

			}
			await importServerSideEvents('events/');
			await importServerSideEvents('../events/');
			/// #endif
		}
	}
	//events handlers
	/// #if DEBUG
	/*
	/// #endif
	for(let tableName in handlers) {
		if(!nodesByTableName.has(tableName)) {
			throwError('Event handler ./events/' + tableName + '.ts has no related node in database.');
		}
		let nodeId = nodesByTableName.get(tableName).id;
		eventsHandlers_new.set(nodeId, handlers[tableName]);
	}
	//*/

	
	fields = fields_new;
	nodes = nodes_new;
	nodesById = nodesById_new;
	langs = langs_new;
	if(langs.length > 1) {
		options.langs = langs;
	}
	eventsHandlersServerSide = eventsHandlers_new;
	clientSideNodes.clear();
	nodesTreeCache.clear();
	Object.assign(ADMIN_USER_SESSION, await authorizeUserByID(USER_ID.SUPER_ADMIN, false
		/// #if DEBUG
		, "dev-admin-session-token"
		/// #endif
	));
	assert(isUserHaveRole(ROLE_ID.ADMIN, ADMIN_USER_SESSION), "User with id 1 expected to be admin.");
	Object.assign(GUEST_USER_SESSION, await authorizeUserByID(USER_ID.GUEST, true, 'guest-session'));
	GUEST_USER_SESSION.isGuest = true;
	assert(isUserHaveRole(ROLE_ID.GUEST, GUEST_USER_SESSION), "User with id 2 expected to be guest.");
	/// #if DEBUG
	await authorizeUserByID(3, undefined, "dev-user-session-token");
	/// #endif
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
	afterUpdate = 'afterUpdate',
	beforeDelete = 'beforeDelete',
	afterDelete = 'afterDelete',
}

interface NodeEventsHandlers {
	beforeCreate?: (data: RecordDataWrite, userSession: UserSession) => Promise<void>;
	afterCreate?: (data: RecordDataWrite, userSession: UserSession) => Promise<void>;
	beforeUpdate?: (currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) => Promise<void>;
	afterUpdate?: (data: RecordData, userSession: UserSession) => Promise<void>;
	beforeDelete?: (data: RecordData, userSession: UserSession) => Promise<void>;
	afterDelete?: (data: RecordData, userSession: UserSession) => Promise<void>;
}

async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames.beforeCreate, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames.afterCreate, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames.beforeUpdate, currentData: RecordData, newData: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames.afterUpdate, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames.beforeDelete, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames.afterDelete, data: RecordDataWrite, userSession: UserSession): Promise<void>;
async function getNodeEventHandler(nodeId: RecId, eventName: ServerSideEventHandlersNames, data1, data2, data3?): Promise<void> {
	if(eventsHandlersServerSide.has(nodeId)) {
		const serverSideNodeEventHandler = eventsHandlersServerSide.get(nodeId)[eventName];
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
