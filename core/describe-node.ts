/// #if DEBUG
/*
/// #endif
import handlers from '../___index';
// */

import { existsSync, writeFileSync } from 'fs';

import { D, mysqlExec, NUM_0, NUM_1 } from './mysql-connection';

import { assert, ESCAPE_BEGIN, ESCAPE_END, throwError } from '../www/client-core/src/assert';
import type { EnumList, EnumListItem, FieldDesc, NodeDesc, RecId, TreeItem, UserLangEntry } from '../www/client-core/src/bs-utils';
import { FIELD_DATA_TYPE, isServer, normalizeEnumName, normalizeName, ROLE_ID, snakeToCamel, USER_ID, VIEW_MASK } from '../www/client-core/src/bs-utils';
import { ENUM_ID, FIELD_TYPE, NODE_ID, NODE_TYPE, type IFiltersRecord } from '../www/client-core/src/types/generated';
import { globals } from '../www/client-core/src/types/globals';
import { recoveryDB } from './admin/admin';
import type { UserSession /* , usersSessionsStartedCount */ } from './auth';
import { authorizeUserByID, isUserHaveRole, setMaintenanceMode /* , usersSessionsStartedCount */ } from './auth';
import { ENV, type ENV_TYPE } from './ENV';

const METADATA_RELOADING_ATTEMPT_INTERVAl = 500;

interface FilterRecord extends IFiltersRecord {
	roles: number[];
}

let fieldsById: Map<number, FieldDesc>;
let nodes: NodeDesc[];
let nodesById: Map<RecId, NodeDesc>;
let enumsById: Map<RecId, EnumList>;
let nodesByTableName: Map<string, NodeDesc>;
let langs: UserLangEntry[];

const ADMIN_USER_SESSION: UserSession = {} as UserSession;
const GUEST_USER_SESSION: UserSession = {} as UserSession;

export interface ITreeAndOptions {
	nodesTree: TreeItem[];
	options: typeof options;
}

const clientSideNodes = new Map();
const nodesTreeCache = new Map() as Map<string, ITreeAndOptions>;

const filtersById = new Map() as Map<RecId, FilterRecord>;

function getFieldDesc(fieldId: number): FieldDesc {
	assert(fieldsById.has(fieldId), 'Unknown field id ' + fieldId);
	return fieldsById.get(fieldId)!;
}

function getEnumDesc(enumId: RecId) {
	return enumsById.get(enumId)!;
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
				singleName: (srcNode as any as KeyedMap<string>)['singleName' + landQ],
				privileges,
				matchName: (srcNode as any as KeyedMap<string>)['name' + landQ],
				description: (srcNode as any as KeyedMap<string>)['description' + landQ],
				nodeType: srcNode.nodeType
			} as any;

			if (srcNode.cssClass) {
				ret.cssClass = srcNode.cssClass;
			}

			if (srcNode.nodeType === NODE_TYPE.REACT_CLASS) {
				ret.tableName = srcNode.tableName;
			} else if (srcNode.nodeType === NODE_TYPE.DOCUMENT) {
				ret.reverse = srcNode.reverse;
				ret.creationName = (srcNode as unknown as KeyedMap<string>)['creationName' + landQ];
				ret.storeForms = srcNode.storeForms;
				ret.staticLink = srcNode.staticLink;
				ret.tableName = srcNode.tableName;
				ret.draftable = srcNode.draftable;
				ret.icon = srcNode.icon;
				ret.recPerPage = srcNode.recPerPage;
				ret.defaultFilterId = srcNode.defaultFilterId;
				/// #if DEBUG
				ret.__serverSideHandlers = srcNode.__serverSideHandlers;
				/// #endif

				for (const id in srcNode.filters) {
					const filter = filtersById.get(parseInt(id))!;
					if (filter.roles && !isUserHaveRole(ROLE_ID.ADMIN, userSession)) {
						// TODO roles
						if (!filter.roles.find(roleId => isUserHaveRole(roleId, userSession))) {
							continue;
						}
					}
					if (!ret.filters) {
						ret.filters = {};
					}
					ret.filters[id] = {
						order: filter.order!,
						name: (filter as unknown as KeyedMap<string>)['name' + userSession.lang.prefix]
					};
				}
				ret.sortFieldName = srcNode.sortFieldName;
				const fields = [];
				for (const srcField of srcNode.fields!) {

					const field: FieldDesc = {
						id: srcField.id,
						name: (srcField as unknown as KeyedMap<string>)['name' + landQ] || srcField.name,
						description: (srcField as unknown as KeyedMap<string>)['description' + landQ] || srcField.description,
						show: srcField.show,
						dataType: srcField.dataType,
						prior: srcField.prior,
						fieldType: srcField.fieldType,
						multilingual: srcField.multilingual,
						nodeFieldsLinker: srcField.nodeFieldsLinker,
						fieldName: srcField.fieldName,
						selectFieldName: srcField.selectFieldName,
						maxLength: srcField.maxLength,
						decimals: srcField.decimals,
						storageMode: srcField.storageMode,
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

let options: ENV_TYPE | {
	langs?: UserLangEntry[];
};

function getNodesTree(userSession: UserSession) {

	// get nodes tree visible to user
	const langId = userSession.lang.prefix;
	const cacheKey = userSession.cacheKey;

	if (!nodesTreeCache.has(cacheKey)) {
		const nodesTree = [] as TreeItem[];
		const ret = {
			nodesTree,
			options
		} as ITreeAndOptions;
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
			// */

			const privileges = getUserAccessToNode(nodeSrc, userSession);
			if (privileges) {
				nodesTree.push({
					icon: nodeSrc.icon,
					id: nodeSrc.id,
					name: (nodeSrc as unknown as KeyedMap<string>)['name' + langId],
					nodeType: nodeSrc.nodeType,
					parent: nodeSrc._nodesId as any, // SQL returns Lookup fields as number
					privileges,
					staticLink: nodeSrc.staticLink
				} as TreeItem);
			}
		}
		nodesTreeCache.set(cacheKey, ret);
	}
	return nodesTreeCache.get(cacheKey);
}

let metadataReloadingInterval = 0;
function reloadMetadataSchedule() {
	if (!metadataReloadingInterval) {
		setMaintenanceMode(true);
		metadataReloadingInterval = setInterval(attemptToReloadMetadataSchedule, METADATA_RELOADING_ATTEMPT_INTERVAl) as any;
	}
}

function attemptToReloadMetadataSchedule() {
	// if(usersSessionsStartedCount() === 0) { //TODO: disabled because of freezes
	if (metadataReloadingInterval) {
		clearInterval(metadataReloadingInterval);
		metadataReloadingInterval = 0;
	}
	initNodesData().then(() => {
		setMaintenanceMode(false);
	});
	//	}
}

async function initNodesData() {
	// load whole nodes data in to memory
	options = Object.assign({}, ENV) as any;
	fieldsById = new Map();
	nodesById = new Map();
	enumsById = new Map();
	globals.nodesByTableName = nodesByTableName = new Map();

	/// #if DEBUG
	await mysqlExec('-- ======== NODES RELOADING STARTED ===================================================================================================================== --');
	/// #endif

	const tablesDetector = (await mysqlExec(ESCAPE_BEGIN + `SELECT table_name
  FROM information_schema.tables
 WHERE table_schema='public'
		AND table_type='BASE TABLE'` + ESCAPE_END));
	if (['_nodes', '_fields', '_languages', '_enums'].some((tableName) => {
		return !tablesDetector.some(r => r.table_name === tableName);
	})) {
		if (tablesDetector.length) {
			throwError('Database is not empty to initialize for CRUD usage');
		} else {
			await recoveryDB();
		}
	}

	langs = (await mysqlExec('SELECT "id", "name", "code", "isUILanguage" FROM "_languages"')) as UserLangEntry[];
	for (const l of langs) {
		l.prefix = l.code ? '$' + l.code : '';
		ALL_LANGUAGES_BY_CODES.set(l.code || ENV.DEFAULT_LANG_CODE, l);
		if (!DEFAULT_LANGUAGE.lang || l.code === ENV.DEFAULT_LANG_CODE) {
			DEFAULT_LANGUAGE.lang = l;
		}
	}

	const enums = await mysqlExec('SELECT name, id FROM _enums');
	for (const en of enums) {
		const name = en.name;
		const enumId = en.id;
		const items = (await mysqlExec(
			'SELECT value,'
			+ langs
				.map((l) => {
					return 'name' + l.prefix;
				})
				.join()
				+ ' FROM "_enumValues" WHERE status = 1 AND "valuesLinker"='
				+ D(enumId)
				+ ' ORDER BY "_enumValues".order'
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

	const query = 'SELECT * FROM _nodes WHERE status = ' + NUM_1 + ' ORDER BY prior';
	nodes = (await mysqlExec(query)) as any;
	for (const nodeData of nodes) {
		nodesById.set(nodeData.id!, nodeData);
		if (nodeData.tableName) {
			nodesByTableName.set(nodeData.tableName, nodeData);
		}
		nodeData.sortFieldName = '_createdOn';
		const rolesToAccess = await mysqlExec('SELECT "roleId", "privileges" FROM "_rolePrivileges" WHERE "nodeId" = ' + NUM_0 + ' OR "nodeId" = ' + D(nodeData.id!));
		/// #if DEBUG
		(nodeData as any).____preventToStringify = nodeData; // circular structure to fail when try to stringify
		/// #endif
		nodeData.rolesToAccess = rolesToAccess as any;
		nodeData.privileges = 65535;
		const sortField = nodeData._fieldsId!;

		if (nodeData.nodeType === NODE_TYPE.DOCUMENT) {

			const query = 'SELECT * FROM _fields WHERE "nodeFieldsLinker"=' + D(nodeData.id!) + ' AND status = ' + NUM_1 + ' ORDER BY prior';
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

				field.nodeRef = { id: field.nodeRef as any };
				field.nodeFieldsLinker = { id: field.nodeFieldsLinker as any };
				if (field.fieldType === FIELD_TYPE.ENUM && field.show) {
					field.enum = { id: field.enum as any };
					const enums = getEnumDesc(field.enum.id);
					field.enumList = enums;
				}
				if (field.fieldType === FIELD_TYPE.STATIC_HTML_BLOCK) {
					field.htmlContent = field.description;
					delete field.description;
				}
				fieldsById.set(field.id!, field);
			}
			nodeData.fields = fields;
			const filtersRes = await mysqlExec('SELECT * FROM _filters WHERE status = ' + NUM_1 + ' AND "nodeFiltersLinker"=' + D(nodeData.id!) + ' ORDER BY _filters.order') as FilterRecord[];

			const filters = {} as KeyedMap<FilterRecord>;
			for (const f of filtersRes) {
				const filterRoles = await mysqlExec('SELECT "_rolesId" FROM "_filterAccessRoles" WHERE "_filtersId"=' + D(f.id!));
				if (filterRoles.length > 0) {
					f.roles = filterRoles.map(i => i._rolesId);
				}
				f.nodeFiltersLinker = { id: f.nodeFiltersLinker as any };
				filtersById.set(f.id!, f);
				(filters)[f.id!] = f;
			}
			nodeData.filters = filters;
		}
	}

	if (langs.length > 1) {
		options.langs = langs;
	}

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

let DEFAULT_LANGUAGE = { lang: null as UserLangEntry | null };
const ALL_LANGUAGES_BY_CODES: Map<string, UserLangEntry> = new Map();

function getGuestUserForBrowserLanguage(browserLanguage?: string) {
	if (browserLanguage) {
		browserLanguage = browserLanguage.substr(0, 2);
	} else {
		browserLanguage = ENV.DEFAULT_LANG_CODE;
	}
	const languageCode = ALL_LANGUAGES_BY_CODES.has(browserLanguage) ? browserLanguage : ENV.DEFAULT_LANG_CODE;
	if (!GUEST_USER_SESSIONS.has(languageCode)) {
		const session: UserSession = Object.assign({}, GUEST_USER_SESSION);
		session.lang = ALL_LANGUAGES_BY_CODES.get(languageCode)!;
		GUEST_USER_SESSIONS.set(languageCode, session);
	}
	return GUEST_USER_SESSIONS.get(languageCode);
}

function getLangs(): UserLangEntry[] {
	return langs;
}

/// #if DEBUG
type EventType = number;

type EventMap = { [Key: string]: EventMap | EventType };

let eventsEnum: EventMap = {};
let eventCounter = isServer() ? 10000 : 0;

const eventName = (event: string): EventType => {
	eventCounter++;
	const path = event.split('.');
	let node = eventsEnum;
	while (path.length > 1) {
		const nodeName = path.shift()!;
		if (!node[nodeName]) {
			node[nodeName] = {};
		}
		node = node[nodeName] as EventMap;
	}
	node[path[0]] = eventCounter;
	return eventCounter;
};

const generateTypings = async () => {
	const srcAdd = [''];
	const src = [`import type { Moment } from 'moment';
import type { BoolNum, GetRecordsFilter, LookupValue, LookupValueIconic, RecordData, RecordDataWrite, RecordDataWriteDraftable, RecordSubmitResult, RecordSubmitResultNewRecord } from '../bs-utils';
`] as string[];
	for (const node of nodes) {
		if (node.nodeType === NODE_TYPE.DOCUMENT) {
			const searchFields = [] as string[];
			src.push('type ' + snakeToCamel(node.tableName!) + 'Base = {');
			for (const field of node.fields!) {
				let type = getFieldTypeSrc(field);
				const jsDoc = '\t/** **' + (getEnumDesc(ENUM_ID.FIELD_TYPE)).namesByValue[field.fieldType] + '** ' + (field.description || '') + ' */';
				src.push(jsDoc);
				src.push('	' + field.fieldName + (field.requirement ? '' : '?') + ': ' + type + ';');
				if (field.forSearch) {
					searchFields.push(jsDoc, '\t' + field.fieldName + ': ' + (field.fieldType === FIELD_TYPE.LOOKUP ? 'number' : type) + ';');
				}
			}
			src.push('};', '');
			if (searchFields.length) {
				src.push('export type I' + snakeToCamel(node.tableName!) + 'Filter = GetRecordsFilter & Partial<{');
				src.push(...searchFields);
				src.push('}>;', '');
			} else {
				src.push('export type I' + snakeToCamel(node.tableName!) + 'Filter = GetRecordsFilter;\n');
			}
		}
	}

	for (const node of nodes) {
		if (node.nodeType === NODE_TYPE.DOCUMENT) {
			const name = snakeToCamel(node.tableName!);
			src.push(`export type I${name}Record = ${name}Base & RecordData;`);
			src.push(`export type I${name}RecordWrite = ${name}Base & RecordDataWrite;`);
		}
	}

	enumsById.forEach((enumData) => {
		src.push('export enum ' + normalizeName(enumData.name) + ' {');
		src.push(enumData.items.map(val =>
			'\t' + normalizeEnumName(val.name).toUpperCase() + ' = ' + val.value
		).join(',\n'));
		src.push('}');
	});

	src.push('export const enum NODE_ID {');
	const nodesData = Array.from(nodesById.values());
	nodesData.sort((a, b) => a.id! - b.id!);
	src.push(nodesData.map((nodeData) => {
		return '\t' + normalizeEnumName(nodeData.tableName || nodeData.name) + ' = ' + nodeData.id;
	}).join(',\n'));
	src.push('}');

	src.push('export const enum ENUM_ID {');
	const enumsData = Array.from(enumsById.entries());
	nodesData.sort((a, b) => a.id! - b.id!);
	src.push(enumsData.map((nodeData) => {
		return '\t' + normalizeEnumName(nodeData[1].name) + ' = ' + nodeData[0];
	}).join(',\n'));
	src.push('}');

	src.push('export const enum FIELD_ID {');
	const fieldsData = Array.from(fieldsById.values());
	fieldsData.sort((a, b) => a.id! - b.id!);
	src.push(fieldsData.map((fieldData) => {
		const node = nodesById.get(fieldData.nodeFieldsLinker.id)!;
		const nodeName = normalizeEnumName(node.tableName || node.name);
		return '\t' + nodeName + '__' + normalizeEnumName(fieldData.fieldName! || fieldData.name!) + ' = ' + fieldData.id;
	}).join(',\n'));
	src.push('}');

	src.push('export const enum FILTER_ID {');
	const filtersData = Array.from(filtersById.values());
	filtersData.sort((a, b) => a.id! - b.id!);
	src.push(
		filtersData.map((filterData) => {
			const node = nodesById.get(filterData.nodeFiltersLinker.id)!;
			const nodeName = normalizeEnumName(node.tableName || node.name);
			return '\t' + nodeName + '__' + normalizeEnumName(filterData.name) + ' = ' + filterData.id;
		}).join(',\n')
	);

	src.push('}');

	nodesData.forEach((nodeData) => {
		if (nodeData.nodeType === NODE_TYPE.DOCUMENT) {
			const name = snakeToCamel(nodeData.tableName!);
			src.push(`export type T${name}FieldsList = keyof I${name}Record | ${nodeData.fields!.map(f => '\'' + f.fieldName + '\'').join(' | ') || 'string'};`);
		}
	});

	const HANDLER_RET = 'HandlerRet';

	src.push(`
import type { RecId, UserSession, VIEW_MASK } from '../bs-utils';
import type Form from '../form';
export class TypeGenerationHelper {`);

	nodesData.forEach((nodeData) => {

		if (nodeData.nodeType === NODE_TYPE.DOCUMENT) {

			const name = snakeToCamel(nodeData.tableName!);
			if (nodeData.storeForms) {

				src.push(`	eventsServer(eventName: ${eventName(nodeData.tableName + '.beforeCreate')}, handler: (data: I${name}RecordWrite, userSession: UserSession) => ${HANDLER_RET}): void;
	eventsServer(eventName: ${eventName(nodeData.tableName + '.afterCreate')}, handler: (data: I${name}RecordWrite, userSession: UserSession) => ${HANDLER_RET}): void;
	eventsServer(eventName: ${eventName(nodeData.tableName + '.beforeUpdate')}, handler: (data: I${name}Record, newData: I${name}RecordWrite, userSession: UserSession) => ${HANDLER_RET}): void;
	eventsServer(eventName: ${eventName(nodeData.tableName + '.afterUpdate')}, handler: (data: I${name}RecordWrite, userSession: UserSession) => ${HANDLER_RET}): void;
	eventsServer(eventName: ${eventName(nodeData.tableName + '.beforeDelete')}, handler: (data: I${name}Record, userSession: UserSession) => ${HANDLER_RET}): void;
	eventsServer(eventName: ${eventName(nodeData.tableName + '.afterDelete')}, handler: (data: I${name}Record, userSession: UserSession) => ${HANDLER_RET}): void;`);
			} else {
				src.push(`	eventsServer(eventName: ${eventName(nodeData.tableName + '.onSubmit')}, handler: (data: I${name}RecordWrite, userSession: UserSession) => ${HANDLER_RET}): void;`);
			}
		}
	});
	src.push(`
	eventsServer(): void {
		return 1 as any;
	}
`);

	const CLIENT_HANDLER_RET = 'Promise<boolean | void> | boolean | void';

	nodesData.forEach((nodeData) => {

		if (nodeData.nodeType === NODE_TYPE.DOCUMENT) {
			const nodeName = snakeToCamel(nodeData.tableName!);
			const methodNameGet = 'fieldValue';
			const methodNameSet = 'setFieldValue';
			const fieldsWithData = nodeData.fields!.filter(f => f.dataType !== FIELD_DATA_TYPE.NODATA);
			const formInterfaceName = 'Form' + nodeName;

			srcAdd.push(`export interface ${formInterfaceName} extends Form<T${nodeName}FieldsList> {`);
			for (const field of fieldsWithData) {
				let type = getFieldTypeSrc(field);
				srcAdd.push(`	${methodNameGet}(fieldName: '${field.fieldName}'): ${type};`);
			}
			for (const field of fieldsWithData) {
				let type = getFieldTypeSrc(field);
				srcAdd.push(`	${methodNameSet}(fieldName: '${field.fieldName}', value: ${type}): void;`);
			}
			srcAdd.push('}');
			const formArg
				= `form: ${formInterfaceName}`;

			src.push(`	eventsClient(eventName: ${eventName(nodeData.tableName + '.onLoad')}, handler: (${formArg}) => ${CLIENT_HANDLER_RET}): void;
	eventsClient(eventName: ${eventName(nodeData.tableName + '.onSave')}, handler: (${formArg}) => ${CLIENT_HANDLER_RET}): void;
	eventsClient(eventName: ${eventName(nodeData.tableName + '.afterSave')}, handler: (${formArg}, result: RecordSubmitResult) => ${CLIENT_HANDLER_RET}): void;`);
			for (const field of nodeData.fields!) {

				const isClickable = (field.fieldType === FIELD_TYPE.BUTTON) || (field.fieldType === FIELD_TYPE.TAB);
				if (isClickable || (field.show && VIEW_MASK.EDITABLE)) {
					if (isClickable) {
						src.push(`	eventsClient(eventName: ${eventName(nodeData.tableName + '.' + field.fieldName + '.onClick')}, handler: (${formArg}) => void): void;`);
					} else {
						src.push(`	eventsClient(eventName: ${eventName(nodeData.tableName + '.' + field.fieldName + '.onChange')}, handler: (${formArg}, value: ${getFieldTypeSrc(field)}, isUserAction: boolean, prevValue: any) => void): void;`);
					}
				}
			}
		}
	});
	src.push(`
	eventsClient() {
		return 1 as any;
	}
`);

	src.push('	// getRecord server-side');
	nodesData.forEach((nodeData) => {
		if (nodeData.fields?.length && nodeData.storeForms) {
			const enumName = normalizeEnumName(nodeData.tableName || nodeData.name);
			const typeName = 'I' + snakeToCamel(nodeData.tableName!) + 'Record';
			src.push(`	async g(nodeId: NODE_ID.${enumName}, viewMask: VIEW_MASK, recId: RecId, userSession?: UserSession): Promise<${typeName}>;`);
		}
	});
	src.push(`	async g(nodeId: NODE_ID, viewMask: VIEW_MASK, recId: RecId, userSession?: UserSession): Promise<RecordData>;
	async g() {
		return 1 as any;
	}
`);

	src.push('	// getRecords server-side');
	nodesData.forEach((nodeData) => {
		if (nodeData.fields?.length && nodeData.storeForms) {
			const enumName = normalizeEnumName(nodeData.tableName || nodeData.name);
			const typeName = 'I' + snakeToCamel(nodeData.tableName!) + 'Record';
			src.push(`	async m(nodeId: NODE_ID.${enumName}, viewMask: VIEW_MASK, recId?: RecId[], userSession?: UserSession, filterFields?: I${snakeToCamel(nodeData.tableName!)}Filter, search?: string): Promise<{ items: ${typeName}[]; total: number }>;`);
		}
	});

	src.push(`	async m(nodeId: NODE_ID, viewMask: VIEW_MASK, recId?: RecId[], userSession?: UserSession, filterFields?: GetRecordsFilter, search?: string): Promise<{ items: RecordData[]; total: number }>;

	async m() {
		return 1 as any;
	}
`);
	src.push('	// getRecordClient');
	nodesData.forEach((nodeData) => {
		if (nodeData.fields?.length && nodeData.storeForms) {
			const enumName = normalizeEnumName(nodeData.tableName || nodeData.name);
			const typeName = 'I' + snakeToCamel(nodeData.tableName!) + 'Record';
			src.push(`	async gc(nodeId: NODE_ID.${enumName}, recId: RecId, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean): Promise<${typeName}>;`);
		}
	});

	src.push(`	async gc(nodeId: NODE_ID, recId: RecId, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean): Promise<RecordData>;
	async gc() {
		return 1 as any;
	}`);

	src.push('	// getRecordsClient');
	nodesData.forEach((nodeData) => {
		if (nodeData.fields?.length && nodeData.storeForms) {
			const enumName = normalizeEnumName(nodeData.tableName || nodeData.name);
			const typeName = 'I' + snakeToCamel(nodeData.tableName!) + 'Record';
			src.push(`	async gcm(nodeId: NODE_ID.${enumName}, recId?: RecId[], filters?: I${snakeToCamel(nodeData.tableName!)}Filter, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean): Promise<{ items: ${typeName}[]; total: number }>;`);
		}
	});

	src.push(`	async gcm(nodeId: NODE_ID, recId?: RecId[], filters?: GetRecordsFilter, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean): Promise<{ items: RecordData[]; total: number }>;

	async gcm() {
		return 1 as any;
	}
`);

	src.push('	// submit server-side');
	nodesData.forEach((nodeData) => {
		if (nodeData.fields?.length) {
			const enumName = normalizeEnumName(nodeData.tableName || nodeData.name);
			const typeName = 'I' + snakeToCamel(nodeData.tableName!) + 'RecordWrite';
			src.push(`	async s(nodeId: NODE_ID.${enumName}, data: ${typeName}, recId: RecId, userSession?: UserSession): Promise<RecordSubmitResult>;
	async s(nodeId: NODE_ID.${enumName}, data: ${typeName}, recId?: undefined, userSession?: UserSession): Promise<RecordSubmitResultNewRecord>;`);
		}
	});

	src.push(`	async s(nodeId: NODE_ID, data: RecordDataWrite | RecordDataWriteDraftable, recId: RecId, userSession?: UserSession): Promise<RecordSubmitResult>;
	async s(nodeId: NODE_ID, data: RecordDataWrite | RecordDataWriteDraftable, recId?: undefined, userSession?: UserSession): Promise<RecordSubmitResultNewRecord>;

	async s() {
		return 1 as any;
	}

}`);
	src.push('export const E = ' + JSON.stringify(eventsEnum, undefined, '\t').replaceAll('"', '') + ' as const;');
	src.push(...srcAdd);

	for (const fn of ['./node_modules/crud-js/www/client-core/src/types/generated.ts', './www/client-core/src/types/generated.ts']) {
		if (existsSync(fn)) {
			writeFileSync(fn, src.join('\n'));
			break;
		}
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
	getNodesTree,
	initNodesData,
	reloadMetadataSchedule
};

function getFieldTypeSrc(field: FieldDesc) {

	let type = 'any';
	switch (field.fieldType) {
	case FIELD_TYPE.BOOL:
		type = 'BoolNum | boolean';
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
		type = normalizeName((getEnumDesc(field.enum!.id)).name);
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
	return type;
}
