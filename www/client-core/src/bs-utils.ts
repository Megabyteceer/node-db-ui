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

interface RecordSubmitResult {
	recId: RecId;
	handlerResult: any;
}

const getCurrentStack = () => {
	let a = new Error().stack?.split('\n');
	if(a) {
		a.splice(0, 3);
	}
	return a;
}

/*
/// #endif
const assert = null;
const getCurrentStack = null;
//*/
const IMAGE_THUMBNAIL_PREFIX = '_thumb.jpg';

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
	/** not empty if user have multilingual_enabled */
	multilingual_enabled?: BoolNum;
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
	field_name: string;
	/** maximal data length in database */
	max_length: number;

	show: VIEW_MASK;

	/** value is required for form. */
	requirement: BoolNum;

	/** value of the field should be unique for whole database table. */
	unique: BoolNum;

	/** if true - field data do not go to the server on form save. */
	send_to_server: BoolNum;

	/** fields data go to the server, but has no store in database table. */
	store_in_db: BoolNum;

	/** fields will have index in database, and search will be processed in this field */
	for_search: BoolNum;

	field_type: FIELD_TYPE;

	icon: string;

	/** name of picture field in relative table. Thin picture will be used as icon in Lookup fields. */
	lookup_icon: string;

	css_class?: string;

	display: FIELD_DISPLAY_TYPE;

	/** owner node id */
	node_ref: RecId;

	/** SERVER SIDE FIELD ONLY. If it not empty - content of this field goes in to field_name in SQL query to retrieve data not from direct table's field */
	select_field_name?: string;

	/** order of the field in the form */
	prior: number;

	/** field tip. or html content for FIELD_TYPE.STATIC_TEXT fields */
	description: string;

	/** client side only field */
	node?: NodeDesc;

	/** index in parent's node 'fields' list. Client side only field */
	index?: number;

	/** client side only field */
	enum?: EnumList;
	enumId?: RecId;

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
	order?: number;
	name: string;
	hi_priority?: BoolNum;
	view?: string;
	fields?: string;
}

interface NodeDesc {
	id: RecId;
	single_name: string;
	privileges: PRIVILEGES_MASK;
	matchName: string;
	description: string;
	node_type: NODE_TYPE;
	store_forms?: BoolNum;
	reverse?: BoolNum;
	creation_name?: string;
	static_link?: string;
	captcha?: BoolNum;
	table_name?: string;
	draftable?: BoolNum;
	icon?: string;
	rec_per_page?: number;
	default_filter_id?: number;
	fields?: FieldDesc[];
	css_class?: string;
	filters?: { [key: string]: FilterDesc };
	filtersList?: { name: string, value: any }[];
	sortFieldName?: string;
	/** CLIENT SIDE ONLY */
	fieldsById?: { [key: number]: FieldDesc };
	fieldsByName?: { [key: string]: FieldDesc };
}

interface UserLangEntry {
	id: RecId;
	name: string;
	code: string;
	prefix: string;
	is_ui_language: boolean;
}

interface RecordDataWrite {
	[key: string]: any;
	/** Recaptcha v3 token */
	c?: string;
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
	viewFields?: VIEW_MASK;
	recId?: RecId;
	s?: string;
	descNode?: boolean;
}

type BoolNum = 0 | 1;

enum ROLE_ID {
	ADMIN = 1,
	GUEST = 2,
	USER = 3
}

enum FIELD_TYPE {
	TEXT = 1,
	NUMBER = 2,
	DATE_TIME = 4,
	BOOL = 5,
	ENUM = 6,
	LOOKUP = 7,
	STATIC_TEXT = 8,
	PASSWORD = 10,
	DATE = 11,
	PICTURE = 12,
	LOOKUP_NtoM = 14,
	LOOKUP_1toN = 15,
	RATING = 16,
	TAB = 17,
	BUTTON = 18,
	RICH_EDITOR = 19,
	COLOR = 20,
	FILE = 21,
	SPLITTER = 22
}

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

enum VIEW_MASK {
	EDITABLE = 1,
	LIST = 2,
	READONLY = 4,
	DROPDOWN_LIST = 8,
	CUSTOM_LIST = 16,
	SUB_FORM = 32,
	ALL = 65535
}

enum PRIVILEGES_MASK {
	VIEW_OWN = 1,
	VIEW_ORG = 2,
	VIEW_ALL = 4,
	CREATE = 8,
	EDIT_OWN = 16,
	EDIT_ORG = 32,
	EDIT_ALL = 64,
	DELETE = 128,
	PUBLISH = 256,
	ALL = 65535
}

const HASH_DIVIDER = '.';

enum NODE_ID {
	PRIVILEGES = 1,
	NODES = 4,
	USERS = 5,
	FIELDS = 6,
	ORGANIZATIONS = 7,
	ROLES = 8,
	FILTERS = 9,
	LANGUAGES = 12,
	LOGIN = 20,
	REGISTER = 21,
	RESET = 22,
	PAGES = 49,
	ENUMERATIONS = 52,
	ENUMERATION_VALUES = 53,
	FILES = 83
}

enum USER_ID {
	SUPER_ADMIN = 1,
	GUEST = 2,
	USER = 3,
	VIEW_ALL = 7
}

enum FIELD_ID {
	MAX_LENGTH = 9
}

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
	BoolNum, EnumList, FIELD_DISPLAY_TYPE, FIELD_ID, FIELD_TYPE, FieldDesc, FilterDesc, Filters, getCurrentStack, GetRecordsParams, HASH_DIVIDER, IFormParameters, IMAGE_THUMBNAIL_PREFIX, LANGUAGE_ID_DEFAULT, NODE_ID, NODE_TYPE, NodeDesc, PRIVILEGES_MASK, RecId, RecordData, RecordDataWrite, RecordsData, RecordsDataResponse, RecordSubmitResult, ROLE_ID, USER_ID, UserLangEntry, UserRoles, UserSession, VIEW_MASK
};

