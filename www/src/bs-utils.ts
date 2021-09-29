interface Filters {
	[key: string]: string | number | {};

	excludeIDs?: RecId[];

	onlyIDs?: RecId[];

	/** filter id to apply to query */
	filterId?: RecId;

	/** page number. '*' - to retrieve all */
	p?: number | '*';

	/** items per page */
	n?: number;

	/** field name to order by */
	o?: string;

	/** reverse order */
	r?: boolean;
}

const throwError = (message: string): never => {
	debugger;
	throw new Error(message);
}

/// #if DEBUG
const assert = (condition: any, errorTxt: string) => {
	if(!condition) {
		throwError(errorTxt);
	}
}
/// #endif

/// #if DEBUG
const getCurrentStack = () => {
	let a = new Error().stack?.split('\n');
	if(a) {
		a.splice(0, 3);
	}
	return a;
}
/// #endif

type RecId = number;

type UserRoles = { [key: number]: 1 };
type UserOrganizations = { [key: number]: string };

interface UserSession {
	id: RecId;
	orgId: number;
	name: string;
	avatar: string;
	email: string;
	userRoles: UserRoles;
	organizations: UserOrganizations;
	lang: UserLangEntry;
	cacheKey: string;
	/** file names uploaded for specified field id */
	uploaded?: { [key: number]: string };
	__temporaryServerSideSession?: boolean;
	notifications?: string[];
	/** not empty if user have multilingualEnabled */
	multilingualEnabled?: BoolNum;
	sessionToken?: string;
	isGuest?: boolean;
}

interface EnumListItem {
	value: number;
	name: string
}

type EnumList = EnumListItem[];

interface FieldDesc {
	/** readable name */
	name: string;

	/** could be string for multilingual fields */
	id: RecId;

	/** field's name in database table */
	fieldName: string;
	/** maximal data length in database */
	maxLength: number;

	show: ViewMask;

	/** value is required for form. */
	requirement: BoolNum;

	/** value of the field should be unique for whole database table. */
	unique: BoolNum;

	/** if true - field data do not go to the server on form save. */
	sendToServer: BoolNum;

	/** fields data go to the server, but has no store in database table. */
	storeInDB: BoolNum;

	/** fields will have index in database, and search will be processed in this field */
	forSearch: BoolNum;

	fieldType: FieldType;

	icon: string;

	/** name of picture field in relative table. Thin picture will be used as icon in Lookup fields. */
	lookupIcon: string;

	display: FIELD_DISPLAY_TYPE;

	/** owner node id */
	nodeRef: RecId;

	/** SERVER SIDE FIELD ONLY. If it not empty - content of this field goes in to fieldName in SQL query to retrieve data not from direct table's field */
	selectFieldName?: string;

	/** order of the field in the form */
	prior: number;

	/** field tip. or html content for FIELD_TYPE_STATIC_TEXT_8 fields */
	description: string;

	/** client side only field */
	node?: NodeDesc;

	/** index in parent's node 'fields' list. Client side only field */
	index?: number;

	/** client side only field */
	enum?: EnumList;

	/** client side only field */
	enumNamesById?: { [key: number]: string };

	/** contains language id, if field is multilingual and refers to non default language */
	lang?: string;

	/** field name without language prefix */
	fieldNamePure?: string;/** field name without language prefix */

	/** fields which contains other languages data for that field */
	childrenFields?: FieldDesc[];
}

interface FilterDesc {
	order: number;
	name: string;
}

interface NodeDesc {
	id: RecId;
	singleName: string;
	privileges: PrivilegesMask;
	matchName: string;
	description: string;
	nodeType: NODE_TYPE;
	storeForms?: BoolNum;
	reverse?: BoolNum;
	creationName?: string;
	staticLink?: string;
	tableName?: string;
	draftable?: BoolNum;
	icon?: string;
	recPerPage?: number;
	defaultFilterId?: number;
	fields?: FieldDesc[];
	filters?: { [key: string]: FilterDesc };
	sortFieldName?: string;
	/** CLIENT SIDE ONLY */
	fieldsById?: { [key: number]: FieldDesc };
}

interface UserLangEntry {
	id: RecId;
	name: string;
	code: string;
	prefix: string;
	isUILanguage: boolean;
}

interface RecordDataWrite {
	[key: string]: any;
}

interface RecordData extends RecordDataWrite {

	/** **edit** access to the record */
	isE?: BoolNum;
	/** **publish** access to the record */
	isP?: BoolNum;
	/** **delete** access to the record */
	isD?: BoolNum;

	id?: RecId;
	name?: string;
}

interface RecordsData {
	items: RecordData[];
	total: number;
}

interface RecordsDataResponse {
	data: RecordsData;
	node?: NodeDesc;
}

interface GetRecordsParams {
	nodeId: RecId;
	viewFields?: ViewMask;
	recId?: RecId;
	s?: string;
	descNode?: boolean;
}

type BoolNum = 0 | 1;
type FieldType = number;

enum ROLE_ID {
	ADMIN = 1,
	GUEST = 2,
	USER = 3
}



const FIELD_TYPE_TEXT_1: FieldType = 1;
const FIELD_TYPE_NUMBER_2: FieldType = 2;
const FIELD_TYPE_DATE_TIME_4: FieldType = 4;
const FIELD_TYPE_BOOL_5: FieldType = 5;
const FIELD_TYPE_ENUM_6: FieldType = 6;
const FIELD_TYPE_LOOKUP_7: FieldType = 7;
const FIELD_TYPE_STATIC_TEXT_8: FieldType = 8;
const FIELD_TYPE_PASSWORD_10: FieldType = 10;
const FIELD_TYPE_DATE_11: FieldType = 11;
const FIELD_TYPE_PICTURE_12: FieldType = 12;
const FIELD_TYPE_LOOKUP_NtoM_14: FieldType = 14;
const FIELD_TYPE_LOOKUP_1toN_15: FieldType = 15;
const FIELD_TYPE_RATING_16: FieldType = 16;
const FIELD_TYPE_TAB_17: FieldType = 17;
const FIELD_TYPE_BUTTON_18: FieldType = 18;
const FIELD_TYPE_RICH_EDITOR_19: FieldType = 19;
const FIELD_TYPE_COLOR_20: FieldType = 20;
const FIELD_TYPE_FILE_21: FieldType = 21;
const FIELD_TYPE_SPLITTER_22: FieldType = 22;

enum FIELD_DISPLAY_TYPE {
	BLOCK = 0,
	INLINE = 1
}

enum NODE_TYPE {
	SECTION = 1,
	DOCUMENT = 2,
	STATIC_LINK = 3,
	REACT_CLASS = 4
}

type PrivilegesMask = number;
type ViewMask = number;

const VIEW_MASK_ALL = 65535;
const VIEW_MASK_EDIT_CREATE = 1;
const VIEW_MASK_LIST = 2;
const VIEW_MASK_READONLY = 4;
const VIEW_MASK_DROPDOWN_LOOKUP = 8;
const VIEW_MASK_CUSTOM_LIST = 16;

const PRIVILEGES_VIEW_OWN: PrivilegesMask = 1;
const PRIVILEGES_VIEW_ORG: PrivilegesMask = 2;
const PRIVILEGES_VIEW_ALL: PrivilegesMask = 4;
const PRIVILEGES_CREATE: PrivilegesMask = 8;
const PRIVILEGES_EDIT_OWN: PrivilegesMask = 16;
const PRIVILEGES_EDIT_ORG: PrivilegesMask = 32;
const PRIVILEGES_EDIT_ALL: PrivilegesMask = 64;
const PRIVILEGES_DELETE: PrivilegesMask = 128;
const PRIVILEGES_PUBLISH: PrivilegesMask = 256;
const PRIVILEGES_ANY: PrivilegesMask = 65535;

const EVENT_HANDLER_TYPE_NODE = 'node';
const EVENT_HANDLER_TYPE_FIELD = 'field';

const HASH_DIVIDER = '.';

const NODE_ID_PRIVILEGES: RecId = 1;
const NODE_ID_NODES: RecId = 4;
const NODE_ID_USERS: RecId = 5;
const NODE_ID_FIELDS: RecId = 6;
const NODE_ID_ORGANIZATIONS: RecId = 7;
const NODE_ID_ROLES: RecId = 8;
const NODE_ID_FILTERS: RecId = 9;
const NODE_ID_MESSAGES: RecId = 11;
const NODE_ID_LANGUAGES: RecId = 12;
const NODE_ID_PAGES: RecId = 49;
const NODE_ID_ENUMERATIONS: RecId = 52;
const NODE_ID_ENUMERATION_VALUES: RecId = 53;
const NODE_ID_ERROR_REPORTS: RecId = 81;
const NODE_ID_FILES: RecId = 83;
const NODE_ID_LOGIN: RecId = 20;
const NODE_ID_REGISTER: RecId = 21;
const NODE_ID_RESET: RecId = 22;

const ROLE_ID_SUPER_ADMIN: RecId = 1;
const ROLE_ID_GUEST: RecId = 2;
const ROLE_ID_USER: RecId = 3;
const ROLE_ID_VIEW_ALL: RecId = 7;

const FIELD_ID_MAX_LENGTH: RecId = 9;

const LANGUAGE_ID_DEFAULT: RecId = 1;

interface IFormParameters {
	nodeId: RecId;
	/** id of current edited/shown record. 'new' - if record is not saved yet.*/
	recId?: RecId | 'new';
	/** true if form is editable or read only */
	editable?: boolean;
	filters?: Filters;
}

export {
	throwError,
	/// #if DEBUG
	getCurrentStack,
	assert,
	/// #endif

	IFormParameters,

	HASH_DIVIDER,

	LANGUAGE_ID_DEFAULT,

	FIELD_ID_MAX_LENGTH,

	ROLE_ID_SUPER_ADMIN, ROLE_ID_GUEST, ROLE_ID_USER, ROLE_ID_VIEW_ALL,

	NODE_ID_PRIVILEGES,
	NODE_ID_NODES, NODE_ID_USERS, NODE_ID_FIELDS, NODE_ID_ORGANIZATIONS,
	NODE_ID_ROLES, NODE_ID_FILTERS, NODE_ID_MESSAGES, NODE_ID_LANGUAGES,
	NODE_ID_PAGES, NODE_ID_ENUMERATIONS, NODE_ID_ENUMERATION_VALUES,
	NODE_ID_ERROR_REPORTS, NODE_ID_FILES, NODE_ID_LOGIN, NODE_ID_REGISTER, NODE_ID_RESET,

	ROLE_ID,

	PRIVILEGES_VIEW_OWN, PRIVILEGES_VIEW_ORG, PRIVILEGES_VIEW_ALL, PRIVILEGES_CREATE, PRIVILEGES_EDIT_OWN, PRIVILEGES_EDIT_ORG, PRIVILEGES_EDIT_ALL,
	PRIVILEGES_DELETE, PRIVILEGES_PUBLISH, PRIVILEGES_ANY,
	FIELD_TYPE_TEXT_1, FIELD_TYPE_NUMBER_2, FIELD_TYPE_DATE_TIME_4, FIELD_TYPE_BOOL_5, FIELD_TYPE_ENUM_6, FIELD_TYPE_LOOKUP_7,
	FIELD_TYPE_STATIC_TEXT_8, FIELD_TYPE_PASSWORD_10, FIELD_TYPE_DATE_11, FIELD_TYPE_PICTURE_12, FIELD_TYPE_LOOKUP_NtoM_14,
	FIELD_TYPE_LOOKUP_1toN_15, FIELD_TYPE_RATING_16, FIELD_TYPE_TAB_17, FIELD_TYPE_BUTTON_18, FIELD_TYPE_RICH_EDITOR_19,
	FIELD_TYPE_COLOR_20, FIELD_TYPE_FILE_21, FIELD_TYPE_SPLITTER_22,

	NODE_TYPE, FIELD_DISPLAY_TYPE,

	EVENT_HANDLER_TYPE_NODE, EVENT_HANDLER_TYPE_FIELD,

	VIEW_MASK_EDIT_CREATE, VIEW_MASK_LIST, VIEW_MASK_READONLY,
	VIEW_MASK_DROPDOWN_LOOKUP, VIEW_MASK_CUSTOM_LIST, VIEW_MASK_ALL,

	ViewMask, RecId, UserRoles, BoolNum, GetRecordsParams, Filters, EnumList,
	PrivilegesMask, UserLangEntry, NodeDesc, FieldDesc, RecordsDataResponse, RecordData, RecordDataWrite, RecordsData, UserSession
};
