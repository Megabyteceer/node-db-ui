/// #if DEBUG
/*
/// #endif
import handlers from '../___index';
//*/

import { existsSync, writeFileSync } from 'fs';

import { D, mysqlExec, NUM_0, NUM_1 } from './mysql-connection';

import { join } from 'path';
import { assert, throwError } from '../www/client-core/src/assert';
import type { EnumList, EnumListItem, FieldDesc, NodeDesc, RecId, RecordData, RecordDataWrite, UserLangEntry } from '../www/client-core/src/bs-utils';
import { FIELD_TYPE, NODE_ID, NODE_TYPE, ROLE_ID, USER_ID, VIEW_MASK } from '../www/client-core/src/bs-utils';
import type { UserSession /*, usersSessionsStartedCount*/ } from './auth';
import { authorizeUserByID, isUserHaveRole, setMaintenanceMode /*, usersSessionsStartedCount*/ } from './auth';
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

const normalizeName = (txt:string) => {
	return snakeToCamel(txt).replace(/[^\w]/gm, '_');
}

const snakeToCamel = (str: string) => {
	str = str.toLowerCase().replace(/([_][a-z])/g, (group) => group.toUpperCase().replace('_', ''));
	return str.charAt(0).toUpperCase() + str.slice(1);
};

function getFieldDesc(fieldId: number): FieldDesc {
	assert(fieldsById.has(fieldId), 'Unknown field id ' + fieldId);
	return fieldsById.get(fieldId);
}

async function getEnumDesc(enumId: RecId) {
	if (!enumsById.has(enumId)) {
		const name = (await mysqlExec('SELECT name FROM _enums WHERE id = ' + D(enumId)))[0].name;
		const items = (await mysqlExec(
			'SELECT value,' +
				langs
					.map((l) => {
						return 'name' + l.prefix;
					})
					.join() +
				' FROM "_enumValues" WHERE status = 1 AND "valuesLinker"=' +
				D(enumId) +
				' ORDER BY "_enumValues".order'
		)) as any as EnumListItem[];
		const namesByValue = {} as { [key: number]: string };
		for (const item of items) {
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
	const userNodesCacheKey = nodeId + 'n_' + userSession.cacheKey;
	if (!clientSideNodes.has(userNodesCacheKey)) {
		const srcNode = nodesById.get(nodeId);
		let privileges;

		if (srcNode && (privileges = getUserAccessToNode(srcNode, userSession))) {
			const landQ = userSession.lang.prefix;

			const ret: NodeDesc = {
				id: srcNode.id,
				singleName: srcNode['singleName' + landQ],
				privileges,
				matchName: srcNode['name' + landQ],
				description: srcNode['description' + landQ],
				nodeType: srcNode.nodeType
			} as any;

			if (srcNode.cssClass) {
				ret.cssClass = srcNode.cssClass;
			}

			if (srcNode.nodeType === NODE_TYPE.REACT_CLASS) {
				ret.tableName = srcNode.tableName;
			} else if (srcNode.nodeType === NODE_TYPE.DOCUMENT) {
				ret.captcha = srcNode.captcha;
				ret.reverse = srcNode.reverse;
				ret.creationName = srcNode['creationName' + landQ];
				ret.storeForms = srcNode.storeForms;
				ret.staticLink = srcNode.staticLink;
				ret.tableName = srcNode.tableName;
				ret.draftable = srcNode.draftable;
				ret.icon = srcNode.icon;
				ret.recPerPage = srcNode.recPerPage;
				ret.defaultFilterId = srcNode.defaultFilterId;

				for (const id in srcNode.filters) {
					const filter = srcNode.filters[id];
					if (filter.roles && !isUserHaveRole(ROLE_ID.ADMIN, userSession)) {
						// TODO roles
						if (!filter.roles.find((roleId) => isUserHaveRole(roleId, userSession))) {
							continue;
						}
					}
					if (!ret.filters) {
						ret.filters = {};
					}
					ret.filters[id] = {
						order: filter.order,
						name: filter['name' + userSession.lang.prefix]
					};
				}

				ret.sortFieldName = srcNode.sortFieldName;

				const fields = [];
				for (const srcField of srcNode.fields) {
					const field: FieldDesc = {
						id: srcField.id,
						name: srcField['name' + landQ] || srcField.name,
						description: srcField['description' + landQ] || srcField.description,
						show: srcField.show,
						prior: srcField.prior,
						fieldType: srcField.fieldType,
						multilingual: srcField.multilingual,
						fieldName: srcField.fieldName,
						selectFieldName: srcField.selectFieldName,
						maxLength: srcField.maxLength,
						requirement: srcField.requirement,
						unique: srcField.unique,
						enum: srcField.enum,
						forSearch: srcField.forSearch,
						storeInDb: srcField.storeInDb,
						nodeRef: srcField.nodeRef,
						sendToServer: srcField.sendToServer,
						icon: srcField.icon,
						lookupIcon: srcField.lookupIcon,
						display: srcField.display
					};

					if (field.enum) {
						field.enumId = srcField.enumId;
					}
					if (srcField.cssClass) {
						field.cssClass = srcField.cssClass;
					}

					fields.push(field);
					if (srcField.multilingual && userSession.multilingualEnabled) {
						const fieldName = field.fieldName;
						const fieldId = field.id;
						const langs = getLangs();
						for (const l of langs) {
							if (l.prefix) {
								if (nodeId === NODE_ID.NODES || nodeId === NODE_ID.FIELDS || nodeId === NODE_ID.FILTERS) {
									// for nodes, fields, and filters, add only languages which used in system UI
									if (!l.isUILanguage) {
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
			throwError('<access> Access to node ' + nodeId + ' is denied');
		}
	}
	return clientSideNodes.get(userNodesCacheKey);
}

function getUserAccessToNode(node: NodeDesc, userSession: UserSession) {
	let ret = 0;
	for (const role of node.rolesToAccess) {
		if (isUserHaveRole(role.roleId, userSession)) {
			ret |= role.privileges;
		}
	}
	return ret;
}

let options;

function getNodesTree(userSession) {
	// get nodes tree visible to user
	const langId = userSession.lang.prefix;
	const cacheKey = userSession.cacheKey;

	if (!nodesTreeCache.has(cacheKey)) {
		const nodesTree = [];
		const ret = { nodesTree, options };
		for (const nodeSrc of nodes) {
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

			const privileges = getUserAccessToNode(nodeSrc, userSession);
			if (privileges) {
				nodesTree.push({
					icon: nodeSrc.icon,
					id: nodeSrc.id,
					name: nodeSrc['name' + langId],
					nodeType: nodeSrc.nodeType,
					parent: nodeSrc._nodesId,
					privileges,
					staticLink: nodeSrc.staticLink
				});
			}
		}
		nodesTreeCache.set(cacheKey, ret);
	}
	return nodesTreeCache.get(cacheKey);
}

let metadataReloadingInterval;
function reloadMetadataSchedule() {
	if (!metadataReloadingInterval) {
		setMaintenanceMode(true);
		metadataReloadingInterval = setInterval(attemptToReloadMetadataSchedule, METADATA_RELOADING_ATTEMPT_INTERVAl);
	}
}

function attemptToReloadMetadataSchedule() {
	//if(usersSessionsStartedCount() === 0) { //TODO: disabled because of freezes
	if (metadataReloadingInterval) {
		clearInterval(metadataReloadingInterval);
		metadataReloadingInterval = null;
	}
	initNodesData().then(() => {
		setMaintenanceMode(false);
	});
	//	}
}

async function initNodesData() {
	// load whole nodes data in to memory

	const eventsHandlers_new = new Map();

	options = Object.assign({}, ENV);

	fieldsById = new Map();
	nodesById = new Map();
	enumsById = new Map();
	nodesByTableName = new Map();

	/// #if DEBUG
	await mysqlExec('-- ======== NODES RELOADING STARTED ===================================================================================================================== --');
	/// #endif

	langs = (await mysqlExec('SELECT "id", "name", "code", "isUILanguage" FROM "_languages"')) as UserLangEntry[];
	for (const l of langs) {
		l.prefix = l.code ? '$' + l.code : '';
		ALL_LANGUAGES_BY_CODES.set(l.code || ENV.DEFAULT_LANG_CODE, l);
		if (!DEFAULT_LANGUAGE || l.code === ENV.DEFAULT_LANG_CODE) {
			DEFAULT_LANGUAGE = l;
		}
	}

	const query = 'SELECT * FROM _nodes WHERE status = ' + NUM_1 + ' ORDER BY prior';
	nodes = (await mysqlExec(query)) as any;
	for (const nodeData of nodes) {
		nodesById.set(nodeData.id, nodeData);
		if (nodeData.tableName) {
			nodesByTableName.set(nodeData.tableName, nodeData);
		}
		nodeData.sortFieldName = '_createdOn';

		const rolesToAccess = await mysqlExec('SELECT "roleId", "privileges" FROM "_rolePrivileges" WHERE "nodeId" = ' + NUM_0 + ' OR "nodeId" = ' + D(nodeData.id));

		/// #if DEBUG
		(nodeData as any).____preventToStringify = nodeData; // circular structure to fail when try to stringify
		/// #endif

		nodeData.rolesToAccess = rolesToAccess as any;
		nodeData.privileges = 65535;
		const sortField = nodeData._fieldsId;

		if (nodeData.nodeType === NODE_TYPE.DOCUMENT) {
			const query = 'SELECT * FROM _fields WHERE "nodeFieldsLinker"=' + D(nodeData.id) + ' AND status = ' + NUM_1 + ' ORDER BY prior';
			const fields = (await mysqlExec(query)) as any;
			for (const field of fields) {
				if (field.id === sortField) {
					nodeData.sortFieldName = field.fieldName;
				}

				if (field.fieldType === FIELD_TYPE.ENUM && field.show) {
					const enums = await getEnumDesc(field.enum);
					field.enumId = field.enum;
					field.enum = enums;
				}
				fieldsById.set(field.id, field);
			}
			nodeData.fields = fields;
			const filtersRes = await mysqlExec('SELECT * FROM _filters WHERE status = ' + NUM_1 + ' AND "nodeFiltersLinker"=' + D(nodeData.id) + ' ORDER BY _filters.order');

			const filters = {};
			for (const f of filtersRes) {
				const filterRoles = await mysqlExec('SELECT "_rolesId" FROM "_filterAccessRoles" WHERE "_filtersId"=' + D(f.id));
				if (filterRoles.length > 0) {
					f.roles = filterRoles.map((i) => i._rolesId);
				}
				filtersById.set(f.id, f);
				filters[f.id] = f;
			}
			nodeData.filters = filters;

			//events handlers
			/// #if DEBUG
			const importServerSideEvents = async (folderName) => {
				const moduleFileName = join(__dirname, folderName + nodeData.tableName + '.js');
				if (existsSync(moduleFileName)) {
					const handler = await import(`./${folderName}${nodeData.tableName}.js`);
					eventsHandlers_new.set(nodeData.id, handler.default.default || handler.default);
				}
			};
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

	if (langs.length > 1) {
		options.langs = langs;
	}
	eventsHandlersServerSide = eventsHandlers_new;
	clientSideNodes.clear();
	nodesTreeCache.clear();
	Object.assign(
		ADMIN_USER_SESSION,
		await authorizeUserByID(
			USER_ID.SUPER_ADMIN,
			false,
			/// #if DEBUG
			'dev-admin-session-token'
			/// #endif
		)
	);
	assert(isUserHaveRole(ROLE_ID.ADMIN, ADMIN_USER_SESSION), 'User with id 1 expected to be admin.');
	Object.assign(GUEST_USER_SESSION, await authorizeUserByID(USER_ID.GUEST, true, 'guest-session'));
	GUEST_USER_SESSION.isGuest = true;
	assert(isUserHaveRole(ROLE_ID.GUEST, GUEST_USER_SESSION), 'User with id 2 expected to be guest.');
	/// #if DEBUG
	generateTypings();
	await authorizeUserByID(3, undefined, 'dev-user-session-token');
	/// #endif
}

const generateTypings = async () => {
	const src = ['/* eslint-disable @typescript-eslint/consistent-type-imports */'] as string[];
	for (const node of nodes) {
		if (node.fields?.length) {
			src.push('interface I' + snakeToCamel(node.tableName) + 'Record {');
			for (const field of node.fields) {
				let type = 'any';
				switch (field.fieldType) {
				case FIELD_TYPE.BOOL:
				case FIELD_TYPE.COLOR:
				case FIELD_TYPE.NUMBER:
					type = 'number';
					break;
				case FIELD_TYPE.DATE:
				case FIELD_TYPE.DATE_TIME:
					type = "import('moment').Moment";
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
				src.push('	/** ' + (await getEnumDesc(FIELD_TYPE_ENUM_ID)).namesByValue[field.fieldType] + ' */');
				src.push('	' + field.fieldName + (field.requirement ? '' : '?') + ': ' + type + ';');
			}
			src.push('}', '');
		}
	}

	writeFileSync('types/generated.d.ts', src.join('\n'));

	src.length = 0;

	enumsById.forEach((enumData) => {
		src.push('export const enum ENUM_' +normalizeName(enumData.name) + ' {');
		for(const val of enumData.items) {
			src.push('\t' + normalizeName(val.name) + ' = ' + val.value + ',');
		}
		src.push('}');
	});

	writeFileSync('types/generated.ts', src.join('\n'));

};

const GUEST_USER_SESSIONS = new Map();

let DEFAULT_LANGUAGE;
const ALL_LANGUAGES_BY_CODES: Map<string, UserLangEntry> = new Map();

function getGuestUserForBrowserLanguage(browserLanguage: string) {
	if (browserLanguage) {
		browserLanguage = browserLanguage.substr(0, 2);
	} else {
		browserLanguage = ENV.DEFAULT_LANG_CODE;
	}

	const languageCode = ALL_LANGUAGES_BY_CODES.has(browserLanguage) ? browserLanguage : ENV.DEFAULT_LANG_CODE;

	if (!GUEST_USER_SESSIONS.has(languageCode)) {
		const session: UserSession = Object.assign({}, GUEST_USER_SESSION);
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
	afterDelete = 'afterDelete'
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
	if (eventsHandlersServerSide.has(nodeId)) {
		const serverSideNodeEventHandler = eventsHandlersServerSide.get(nodeId)[eventName];
		/// #if DEBUG
		data1 = wrapObjectToDestroy(data1);
		data2 = wrapObjectToDestroy(data2);
		data3 = wrapObjectToDestroy(data3);
		/// #endif
		let res;
		if (serverSideNodeEventHandler) {
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
	if (o) {
		return new Proxy(o, {
			set: function (obj, prop, value, a) {
				if (destroyed) {
					throwError('Attempt to assign data after exit on eventHandler. Has eventHandler not "await" for something?');
				}
				if (prop === 'destroyObject_ONKwFSqwSFd123123') {
					destroyed = true;
				} else {
					obj[prop] = value;
				}
				return true;
			}
		});
	}
};

const destroyObject = (o) => {
	if (o) {
		o.destroyObject_ONKwFSqwSFd123123 = true;
	}
};

/// #endif

export {
	ADMIN_USER_SESSION,
	DEFAULT_LANGUAGE,
	ENV,
	filtersById,
	getFieldDesc,
	getGuestUserForBrowserLanguage,
	getLangs,
	getNodeDesc,
	getNodeEventHandler,
	getNodesTree,
	initNodesData,
	NodeEventsHandlers,
	reloadMetadataSchedule,
	ServerSideEventHandlersNames
};

