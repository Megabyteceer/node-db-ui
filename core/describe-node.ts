/// #if DEBUG
/*
/// #endif
import handlers from '../___index';
//*/

import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { mysqlExec } from "./mysql-connection";

import { assert, throwError } from '../www/client-core/src/assert';
import { EnumList, EnumListItem, FIELD_TYPE, FieldDesc, NODE_ID, NODE_TYPE, NodeDesc, RecId, RecordData, RecordDataWrite, ROLE_ID, USER_ID, UserLangEntry, VIEW_MASK } from "../www/client-core/src/bs-utils";
import { authorizeUserByID, isUserHaveRole, setMaintenanceMode, UserSession /*, usersSessionsStartedCount*/ } from "./auth";
import { ENV } from './ENV';

const METADATA_RELOADING_ATTEMPT_INTERVAl = 500;

const FIELD_TYPE_ENUM_ID = 1;

let fieldsById: Map<number, FieldDesc>;
let nodes: NodeDesc[];
let nodesById: Map<number, NodeDesc>;
let enumsById: Map<number, EnumList>;
let nodesByTableName: Map<string, NodeDesc>;
let langs: UserLangEntry[];
let eventsHandlersServerSide;

const ADMIN_USER_SESSION: UserSession = {} as UserSession;
const GUEST_USER_SESSION: UserSession = {} as UserSession;

const clientSideNodes = new Map();
const nodesTreeCache = new Map();

const filtersById = new Map();

const snakeToCamel = (str: string) => {
	str = str.toLowerCase().replace(/([_][a-z])/g, group =>
		group
			.toUpperCase()
			.replace('_', '')
	);
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function getFieldDesc(fieldId: number): FieldDesc {
	assert(fieldsById.has(fieldId), "Unknown field id " + fieldId);
	return fieldsById.get(fieldId);
}

async function getEnumDesc(enumId: RecId) {
	if(!enumsById.has(enumId)) {
		const name = (await mysqlExec("SELECT name FROM _enums WHERE id = " + enumId))[0].name;
		const items = await mysqlExec("SELECT value," + langs.map((l) => {
			return 'name' + l.prefix;
		}).join() + " FROM _enum_values WHERE status = 1 AND values_linker=" + enumId + " ORDER BY _enum_values.order") as any as EnumListItem[];
		const namesByValue = {} as { [key: number]: string };
		for(const item of items) {
			namesByValue[item.value] = item.name;
		}
		enumsById.set(enumId, {
			name,
			items,
			namesByValue
		});
	}
	return enumsById.get(enumId);
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
				single_name: srcNode["single_name" + landQ],
				privileges,
				matchName: srcNode["name" + landQ],
				description: srcNode["description" + landQ],
				node_type: srcNode.node_type
			} as any;

			if(srcNode.css_class) {
				ret.css_class = srcNode.css_class;
			}

			if(srcNode.node_type === NODE_TYPE.REACT_CLASS) {
				ret.table_name = srcNode.table_name;
			} else if(srcNode.node_type === NODE_TYPE.DOCUMENT) {

				ret.captcha = srcNode.captcha;
				ret.reverse = srcNode.reverse;
				ret.creation_name = srcNode["creation_name" + landQ];
				ret.store_forms = srcNode.store_forms;
				ret.static_link = srcNode.static_link;
				ret.table_name = srcNode.table_name;
				ret.draftable = srcNode.draftable;
				ret.icon = srcNode.icon;
				ret.rec_per_page = srcNode.rec_per_page;
				ret.default_filter_id = srcNode.default_filter_id;

				for(let id in srcNode.filters) {
					const filter = srcNode.filters[id];
					if(filter.roles && !isUserHaveRole(ROLE_ID.ADMIN, userSession)) { // TODO roles
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
						field_type: srcField.field_type,
						multilingual: srcField.multilingual,
						field_name: srcField.field_name,
						select_field_name: srcField.select_field_name,
						max_length: srcField.max_length,
						requirement: srcField.requirement,
						unique: srcField.unique,
						enum: srcField.enum,
						for_search: srcField.for_search,
						store_in_db: srcField.store_in_db,
						node_ref: srcField.node_ref,
						send_to_server: srcField.send_to_server,
						icon: srcField.icon,
						lookup_icon: srcField.lookup_icon,
						display: srcField.display
					};

					if(field.enum) {
						field.enumId = srcField.enumId;
					}
					if(srcField.css_class) {
						field.css_class = srcField.css_class;
					}

					fields.push(field);
					if(srcField.multilingual && userSession.multilingual_enabled) {

						const field_name = field.field_name;
						const fieldId = field.id;
						const langs = getLangs();
						for(const l of langs) {
							if(l.prefix) {
								if(nodeId === NODE_ID.NODES || nodeId === NODE_ID.FIELDS || nodeId === NODE_ID.FILTERS) { // for nodes, fields, and filters, add only languages which used in system UI
									if(!l.isUiLanguage) {
										continue;
									}
								}
								const langFiled = Object.assign({}, field);
								langFiled.show = field.show & (VIEW_MASK.ALL - VIEW_MASK.LIST - VIEW_MASK.DROPDOWN_LIST);
								langFiled.field_name = field_name + l.prefix;
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

function getUserAccessToNode(node: NodeDesc, userSession: UserSession) {
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
					node_type: nodeSrc.node_type,
					parent: nodeSrc._nodes_id,
					privileges,
					static_link: nodeSrc.static_link
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

	let eventsHandlers_new = new Map();

	options = Object.assign({}, ENV);

	fieldsById = new Map();
	nodesById = new Map();
	enumsById = new Map();
	nodesByTableName = new Map();

	/// #if DEBUG
	await mysqlExec('-- ======== NODES RELOADING STARTED ===================================================================================================================== --');
	/// #endif

	langs = await mysqlExec("SELECT id, name, code, isUiLanguage FROM _languages WHERE id != 0") as UserLangEntry[];
	for(let l of langs) {
		l.prefix = l.code ? ('$' + l.code) : '';
		ALL_LANGUAGES_BY_CODES.set(l.code || ENV.DEFAULT_LANG_CODE, l);
		if(!DEFAULT_LANGUAGE || (l.code === ENV.DEFAULT_LANG_CODE)) {
			DEFAULT_LANGUAGE = l;
		}
	}

	let query = "SELECT * FROM _nodes WHERE status = 1 ORDER BY prior";
	nodes = await mysqlExec(query) as any;
	for(let nodeData of nodes) {
		nodesById.set(nodeData.id, nodeData);
		if(nodeData.table_name) {
			nodesByTableName.set(nodeData.table_name, nodeData);
		}
		nodeData.sortFieldName = '_created_on';

		let rolesToAccess = await mysqlExec("SELECT roleId, privileges FROM rolePrivileges WHERE node_id = 0 OR node_id = " + nodeData.id);

		/// #if DEBUG
		(nodeData as any).____preventToStringify = nodeData; // circular structure to fail when try to stringify
		/// #endif

		nodeData.rolesToAccess = rolesToAccess as any;
		nodeData.privileges = 65535;
		let sortField = nodeData._fields_id;

		if(nodeData.node_type === NODE_TYPE.DOCUMENT) {
			let query = "SELECT * FROM _fields WHERE node_fields_linker=" + nodeData.id + " AND status = 1 ORDER BY prior";
			let fields = await mysqlExec(query) as any;
			for(let field of fields) {

				if(field.id === sortField) {
					nodeData.sortFieldName = field.field_name;
				}

				if(field.field_type === FIELD_TYPE.ENUM && field.show) {
					let enums = await getEnumDesc(field.enum);
					field.enumId = field.enum;
					field.enum = enums;
				}
				fieldsById.set(field.id, field);
			}
			nodeData.fields = fields;
			const filtersRes = await mysqlExec("SELECT * FROM _filters WHERE status = 1 AND node_filters_linker=" + nodeData.id + " ORDER BY _filters.order");

			const filters = {};
			for(let f of filtersRes) {
				let filterRoles = await mysqlExec("SELECT _roles_id FROM _filter_access_roles WHERE _filters_id=" + f.id);
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
				let moduleFileName = join(__dirname, folderName + nodeData.table_name + '.js');
				if(existsSync(moduleFileName)) {
					let handler = await import(`./${folderName}${nodeData.table_name}.js`);
					eventsHandlers_new.set(nodeData.id, handler.default.default || handler.default);
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
	for(let table_name in handlers) {
		if(!nodesByTableName.has(table_name)) {
			throwError('Event handler ./events/' + table_name + '.ts has no related node in database.');
		}
		let nodeId = nodesByTableName.get(table_name).id;
		eventsHandlers_new.set(nodeId, handlers[table_name]);
	}
	//*/

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
	generateTypings();
	await authorizeUserByID(3, undefined, "dev-user-session-token");
	/// #endif
}

const generateTypings = async () => {
	const src = [] as string[];
	for(const node of nodes) {
		if(node.fields) {
			src.push('interface I' + snakeToCamel(node.table_name) + 'Record {');
			for(const field of node.fields) {
				let type = 'any';
				switch(field.field_type) {
					case FIELD_TYPE.BOOL:
					case FIELD_TYPE.COLOR:
					case FIELD_TYPE.NUMBER:
						type = 'number';
						break;
					case FIELD_TYPE.DATE:
					case FIELD_TYPE.DATE_TIME:
						type = 'import(\'moment\').Moment';
						break;

					case FIELD_TYPE.ENUM: // TODO
						type = 'number';
						break;

					case FIELD_TYPE.TEXT:
					case FIELD_TYPE.PASSWORD:
					case FIELD_TYPE.FILE:
					case FIELD_TYPE.PICTURE:
					case FIELD_TYPE.RICH_EDITOR:
						type = 'string';
						break;
				}
				src.push('	/** ' + (await getEnumDesc(FIELD_TYPE_ENUM_ID)).namesByValue[field.field_type] + ' */');
				src.push('	' + field.field_name + (field.requirement ? '' : '?') + ': ' + type + ';');

			}
			src.push('}', '');
		}
	}
	writeFileSync('types/generated.d.ts', src.join('\n'));
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
			set: function (obj, prop, value, a) {
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
	ADMIN_USER_SESSION, DEFAULT_LANGUAGE,
	ENV, filtersById, getFieldDesc, getGuestUserForBrowserLanguage, getLangs, getNodeDesc, getNodeEventHandler, getNodesTree, initNodesData, NodeEventsHandlers, reloadMetadataSchedule, ServerSideEventHandlersNames
};

