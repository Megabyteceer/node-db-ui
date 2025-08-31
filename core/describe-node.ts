/// #if DEBUG
/*
/// #endif
import handlers from '../___index';
//*/

import { existsSync, writeFileSync } from 'fs';

import { D, mysqlExec, NUM_0, NUM_1 } from './mysql-connection';

import { join } from 'path';
import { FIELD_TYPE, NODE_ID, NODE_TYPE, type IFiltersRecord } from '../types/generated';
import { assert, throwError } from '../www/client-core/src/assert';
import type { EnumList, EnumListItem, FieldDesc, NodeDesc, RecId, RecordData, RecordDataWrite, UserLangEntry } from '../www/client-core/src/bs-utils';
import { FIELD_DATA_TYPE, normalizeEnumName, normalizeName, ROLE_ID, snakeToCamel, USER_ID, VIEW_MASK } from '../www/client-core/src/bs-utils';
import type { UserSession /*, usersSessionsStartedCount*/ } from './auth';
import { authorizeUserByID, isUserHaveRole, setMaintenanceMode /*, usersSessionsStartedCount*/ } from './auth';
import { ENV } from './ENV';

const METADATA_RELOADING_ATTEMPT_INTERVAl = 500;

const FIELD_TYPE_ENUM_ID = 1;

interface FilterRecord extends IFiltersRecord {
	roles: number[];
}

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

const filtersById = new Map() as Map<RecId, FilterRecord>;

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

function getNodeDesc(nodeId: NODE_ID, userSession = ADMIN_USER_SESSION): NodeDesc {
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
					const filter = filtersById.get(parseInt(id));
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
						dataType: srcField.dataType,
						prior: srcField.prior,
						fieldType: srcField.fieldType,
						multilingual: srcField.multilingual,
						nodeFieldsLinker: srcField.nodeFieldsLinker,
						fieldName: srcField.fieldName,
						selectFieldName: srcField.selectFieldName,
						maxLength: srcField.maxLength,
						requirement: srcField.requirement,
						unique: srcField.unique,
						enum: srcField.enum,
						enumList: srcField.enumList,
						forSearch: srcField.forSearch,
						storeInDb: srcField.storeInDb,
						nodeRef: srcField.nodeRef,
						sendToServer: srcField.sendToServer,
						icon: srcField.icon,
						lookupIcon: srcField.lookupIcon,
						display: srcField.display
					};

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

function getUserAccessToNode(node: NodeDesc, userSession: UserSession): number {
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

			for (const field of fields as FieldDesc[]) {
				if (field.id === sortField.id) {
					nodeData.sortFieldName = field.fieldName;
				}

				switch (field.fieldType) {

				case FIELD_TYPE.FILE:
				case FIELD_TYPE.IMAGE:
				case FIELD_TYPE.TEXT:
				case FIELD_TYPE.PASSWORD:
				case FIELD_TYPE.HTML_EDITOR:
					field.dataType = FIELD_DATA_TYPE.TEXT;
					break;
				case FIELD_TYPE.TAB:
				case FIELD_TYPE.LOOKUP_N_TO_M:
				case FIELD_TYPE.LOOKUP_1_TO_N:
					field.dataType = FIELD_DATA_TYPE.NODATA;
					break;
				case FIELD_TYPE.DATE_TIME:
				case FIELD_TYPE.DATE:
					field.dataType = FIELD_DATA_TYPE.TIMESTAMP;
					break;
				case FIELD_TYPE.BOOL:
					field.dataType = FIELD_DATA_TYPE.BOOL;
					break;
				default:
					field.dataType = FIELD_DATA_TYPE.NUMBER;
					break;
				}

				field.nodeRef = {id: field.nodeRef as any};
				field.nodeFieldsLinker = {id: field.nodeFieldsLinker as any};

				if (field.fieldType === FIELD_TYPE.ENUM && field.show) {
					field.enum = {id: field.enum as any};
					const enums = await getEnumDesc(field.enum.id);
					field.enumList = enums;
				}
				if (field.fieldType === FIELD_TYPE.STATIC_HTML_BLOCK) {
					field.htmlContent = field.description;
					delete field.description;
				}
				fieldsById.set(field.id, field);
			}
			nodeData.fields = fields;
			const filtersRes = await mysqlExec('SELECT * FROM _filters WHERE status = ' + NUM_1 + ' AND "nodeFiltersLinker"=' + D(nodeData.id) + ' ORDER BY _filters.order') as FilterRecord[];

			const filters = {};
			for (const f of filtersRes) {
				const filterRoles = await mysqlExec('SELECT "_rolesId" FROM "_filterAccessRoles" WHERE "_filtersId"=' + D(f.id));
				if (filterRoles.length > 0) {
					f.roles = filterRoles.map((i) => i._rolesId);
				}
				f.nodeFiltersLinker = {id: f.nodeFiltersLinker as any};
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
			set: function (obj, prop, value) {
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

const generateTypings = async () => {
	const src = [`
import type { Moment } from 'moment';
import type { BoolNum, GetRecordsFilter, LookupValue, LookupValueIconic, RecordData, RecordDataWrite, RecordDataWriteDraftable, RecordSubmitResult, RecordSubmitResultNewRecord } from '../www/client-core/src/bs-utils';
`] as string[];

	for (const node of nodes) {
		if (node.nodeType === NODE_TYPE.DOCUMENT) {
			const searchFields = [] as string[];

			src.push('type ' + snakeToCamel(node.tableName) + 'Base = {');
			for (const field of node.fields) {
				let type = 'any';
				switch (field.fieldType) {
				case FIELD_TYPE.BOOL:
					type = 'BoolNum';
					break;
				case FIELD_TYPE.COLOR:
				case FIELD_TYPE.NUMBER:
					type = 'number';
					break;
				case FIELD_TYPE.DATE:
				case FIELD_TYPE.DATE_TIME:
					type = 'Moment';
					break;

				case FIELD_TYPE.ENUM:
					type = normalizeName((await getEnumDesc(field.enum.id)).name);
					break;

				case FIELD_TYPE.TEXT:
				case FIELD_TYPE.PASSWORD:
				case FIELD_TYPE.FILE:
				case FIELD_TYPE.IMAGE:
				case FIELD_TYPE.HTML_EDITOR:
					type = 'string';
					break;
				case FIELD_TYPE.LOOKUP:
					if (field.lookupIcon) {
						type = 'LookupValueIconic';
					} else {
						type = 'LookupValue';
					}
				}
				src.push('	/** **' + (await getEnumDesc(FIELD_TYPE_ENUM_ID)).namesByValue[field.fieldType] + '** ' + (field.description || '') + ' */');
				src.push('	' + field.fieldName + (field.requirement ? '' : '?') + ': ' + type + ';');
				if (field.forSearch) {
					searchFields.push('\t' + field.fieldName + ': ' + (field.fieldType === FIELD_TYPE.LOOKUP ? 'number' : type) + ';');
				}
			}
			src.push('}', '');

			if (searchFields.length) {
				src.push('export type I' + snakeToCamel(node.tableName) + 'Filter = GetRecordsFilter & Partial<{');
				src.push(...searchFields);
				src.push('}>', '');
			} else {
				src.push('export type I' + snakeToCamel(node.tableName) + 'Filter = GetRecordsFilter;\n');
			}
		}
	}

	for (const node of nodes) {
		if (node.nodeType === NODE_TYPE.DOCUMENT) {
			const name = snakeToCamel(node.tableName);
			src.push(`export type I${name}Record = ${name}Base & RecordData;`);
			src.push(`export type I${name}RecordWrite = ${name}Base & RecordDataWrite;`);
		}
	}

	enumsById.forEach((enumData) => {
		src.push('export const enum ' + normalizeName(enumData.name) + ' {');
		for (const val of enumData.items) {
			src.push('\t' + normalizeEnumName(val.name).toUpperCase() + ' = ' + val.value + ',');
		}
		src.push('}');
	});

	src.push('export const enum NODE_ID {');
	const nodesData = Array.from(nodesById.values());
	nodesData.sort((a, b) => a.id - b.id);
	nodesData.forEach((nodeData) => {
		src.push('\t' + normalizeEnumName(nodeData.tableName || nodeData.name) + ' = ' + nodeData.id + ',');
	});
	src.push('}');

	src.push('export const enum FIELD_ID {');
	const fieldsData = Array.from(fieldsById.values());
	fieldsData.sort((a, b) => a.id - b.id);
	fieldsData.forEach((fieldData) => {
		const node = nodesById.get(fieldData.nodeFieldsLinker.id);
		const nodeName = normalizeEnumName(node.tableName || node.name);
		src.push('\t' + nodeName + '__' + normalizeEnumName(fieldData.fieldName || fieldData.name) + ' = ' + fieldData.id + ',');
	});
	src.push('}');

	src.push('export const enum FILTER_ID {');
	const filtersData = Array.from(filtersById.values());
	filtersData.sort((a, b) => a.id - b.id);
	filtersData.forEach((filterData) => {
		const node = nodesById.get(filterData.nodeFiltersLinker.id);
		const nodeName = normalizeEnumName(node.tableName || node.name);
		src.push('\t' + nodeName + '__' + normalizeEnumName(filterData.name) + ' = ' + filterData.id + ',');
	});
	src.push('}');

	src.push(`
import type { RecId, UserSession, VIEW_MASK } from '../www/client-core/src/bs-utils';
export class TypeGenerationHelper {`);

	// generate getRecords() typing
	nodesData.forEach((nodeData) => {
		if (nodeData.fields?.length && nodeData.storeForms) {
			const enumName = normalizeEnumName(nodeData.tableName || nodeData.name);
			const typeName = 'I' + snakeToCamel(nodeData.tableName) + 'Record';
			src.push(`
	async g(nodeId: NODE_ID.${enumName}, viewMask: VIEW_MASK, recId?: RecId[], userSession?: UserSession, filterFields?: I${snakeToCamel(nodeData.tableName)}Filter, search?: string): Promise<{items:${typeName}[], total:number}>;
	async g(nodeId: NODE_ID.${enumName}, viewMask: VIEW_MASK, recId: RecId, userSession?: UserSession): Promise<${typeName}>;
`);
		}
	});

	src.push(`
	async g(nodeId: NODE_ID, viewMask: VIEW_MASK, recId?: RecId[], userSession?: UserSession, filterFields?: GetRecordsFilter, search?: string): Promise<{items:RecordData[], total:number}>;
	async g(nodeId: NODE_ID, viewMask: VIEW_MASK, recId: RecId, userSession?: UserSession): Promise<RecordData>;

	async g() {
		return 1 as any;
	}`);

	// generate getNodeData() typing
	nodesData.forEach((nodeData) => {
		if (nodeData.fields?.length && nodeData.storeForms) {
			const enumName = normalizeEnumName(nodeData.tableName || nodeData.name);
			const typeName = 'I' + snakeToCamel(nodeData.tableName) + 'Record';
			src.push(`
	async gc(nodeId: NODE_ID.${enumName}, recId?: RecId[], filters?: I${snakeToCamel(nodeData.tableName)}Filter, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean): Promise<{items:${typeName}[], total:number}>;
	async gc(nodeId: NODE_ID.${enumName}, recId: RecId, filters?: undefined, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean): Promise<${typeName}>;
`);
		}
	});


	src.push(`
	async gc(nodeId: NODE_ID, recId: RecId, filters?: undefined, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean): Promise<RecordData>;
	async gc(nodeId: NODE_ID, recId?: RecId[], filters?: GetRecordsFilter, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean): Promise<{items:RecordData[], total:number}>;

	async gc() {
		return 1 as any;
	}`);


	// generate submit() typings
	nodesData.forEach((nodeData) => {
		if (nodeData.fields?.length) {
			const enumName = normalizeEnumName(nodeData.tableName || nodeData.name);
			const typeName = 'I' + snakeToCamel(nodeData.tableName) + 'RecordWrite';
			src.push(`
	async s(nodeId: NODE_ID.${enumName}, data: ${typeName}, recId: RecId, userSession?: UserSession): Promise<RecordSubmitResult>;
	async s(nodeId: NODE_ID.${enumName}, data: ${typeName}, recId?: RecId, userSession?: UserSession): Promise<RecordSubmitResultNewRecord>;
`);
		}
	});

	src.push(`
	async s(nodeId: NODE_ID, data: RecordDataWrite | RecordDataWriteDraftable, recId: RecId, userSession?: UserSession): Promise<RecordSubmitResult>;
	async s(nodeId: NODE_ID, data: RecordDataWrite | RecordDataWriteDraftable, recId?: RecId, userSession?: UserSession): Promise<RecordSubmitResultNewRecord>;

	async s() {
		return 1 as any;
	}
}`);

	writeFileSync('types/generated.ts', src.join('\n'));

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

