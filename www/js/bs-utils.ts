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
type UserOrgs = { [key: number]: string };

interface UserSession {
	id: RecId;
	orgId: number;
	name: string;
	avatar: string;
	email: string;
	userRoles: UserRoles;
	orgs: UserOrgs;
	lang: UserLangEntry;
	cacheKey: string;
	/** file names uploaded for specified field id */
	uploaded?: { [key: number]: string };
	__temporaryServerSideSession?: boolean;
	notifications?: string[];
	/** not empty if user have multilingualEnabled */
	langs?: UserLangEntry[];
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
	id: RecId | string;

	/** field's name in database table */
	fieldName: string;
	/** maximal data length in database */
	maxlen: number;

	show: ViewMask;

	/** value is required for form. */
	requirement: BoolNum;

	/** value of the fied should be unique for whole database table. */
	uniqu: BoolNum;

	/** if true - field data do not go to the server on form save. */
	clientOnly: BoolNum;

	/** fields data go to the server, but has no store in database table. */
	nostore: BoolNum;

	/** fields will have index in database, and search will be processed in this field */
	forSearch: BoolNum;

	fieldType: FieldType;

	/** name of picture field in relative table. Thin picture will be used as icon in Lookup fields. */
	icon: string;

	/** owner node id */
	nodeRef: RecId;

	/** SERVER SIDE FIELD ONLY. If it not empty - content of this field goes in to fieldName in SQL query to retrieve data not from direct table's field */
	selectFieldName?: string;

	/** order of the field in the form */
	prior: number;

	/** field tip. or html content for FIELD_8_STATICTEXT fields */
	fdescription: string;

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

	/** used to group fields together in compactArea. Client side only field  */
	isCompactNested?: boolean;
}

interface FilterDesc {


}

interface NodeDesc {
	id: RecId;
	singleName: string;
	prevs: PrevsMask;
	reverse: BoolNum;
	creationName: string;
	matchName: string;
	description: string;
	isDoc: BoolNum;
	staticLink: string;
	tableName: string;
	draftable: BoolNum;
	icon: string;
	recPerPage: number;
	defaultFilterId: number;
	fields: FieldDesc[];
	filters: FilterDesc[];
	sortFieldName: string;
	/** CLIENT SIDE ONLY */
	fieldsById?: { [key: number]: FieldDesc };
}

interface UserLangEntry {
	id: RecId;
	name: string;
	code: string;
	prefix: string;
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
type TRoleId = number;
type FieldType = number;

const ADMIN_ROLE_ID: TRoleId = 1;
const GUEST_ROLE_ID: TRoleId = 2;
const USER_ROLE_ID: TRoleId = 3;


const FIELD_1_TEXT: FieldType = 1;
const FIELD_2_INT: FieldType = 2;
const FIELD_4_DATETIME: FieldType = 4;
const FIELD_5_BOOL: FieldType = 5;
const FIELD_6_ENUM: FieldType = 6;
const FIELD_7_Nto1: FieldType = 7;
const FIELD_8_STATICTEXT: FieldType = 8;
const FIELD_10_PASSWORD: FieldType = 10;
const FIELD_11_DATE: FieldType = 11;
const FIELD_12_PICTURE: FieldType = 12;
const FIELD_14_NtoM: FieldType = 14;
const FIELD_15_1toN: FieldType = 15;
const FIELD_16_RATING: FieldType = 16;
const FIELD_17_TAB: FieldType = 17;
const FIELD_18_BUTTON: FieldType = 18;
const FIELD_19_RICHEDITOR: FieldType = 19;
const FIELD_20_COLOR: FieldType = 20;
const FIELD_21_FILE: FieldType = 21;

type PrevsMask = number;
type ViewMask = number;

const VIEW_MASK_ALL = 65535;
const VIEW_MASK_EDIT_CREATE = 1;
const VIEW_MASK_LIST = 2;
const VIEW_MASK_READONLY = 4;
const VIEW_MASK_DROPDOWN_LOOKUP = 8;
const VIEW_MASK_CUSTOM_LIST = 16;


const PREVS_VIEW_OWN: PrevsMask = 1;
const PREVS_VIEW_ORG: PrevsMask = 2;
const PREVS_VIEW_ALL: PrevsMask = 4;
const PREVS_CREATE: PrevsMask = 8;
const PREVS_EDIT_OWN: PrevsMask = 16;
const PREVS_EDIT_ORG: PrevsMask = 32;
const PREVS_EDIT_ALL: PrevsMask = 64;
const PREVS_DELETE: PrevsMask = 128;
const PREVS_PUBLISH: PrevsMask = 256;
const PREVS_ANY: PrevsMask = 65535;

const EVENT_HANDLER_TYPE_NODE = 'node';
const EVENT_HANDLER_TYPE_FIELD = 'field';

export {
	throwError,
	/// #if DEBUG
	getCurrentStack,
	assert,
	/// #endif

	USER_ROLE_ID, ADMIN_ROLE_ID, GUEST_ROLE_ID,

	PREVS_VIEW_OWN, PREVS_VIEW_ORG, PREVS_VIEW_ALL, PREVS_CREATE, PREVS_EDIT_OWN, PREVS_EDIT_ORG, PREVS_EDIT_ALL,
	PREVS_DELETE, PREVS_PUBLISH, PREVS_ANY,
	FIELD_1_TEXT, FIELD_2_INT, FIELD_4_DATETIME, FIELD_5_BOOL, FIELD_6_ENUM, FIELD_7_Nto1,
	FIELD_8_STATICTEXT, FIELD_10_PASSWORD, FIELD_11_DATE, FIELD_12_PICTURE, FIELD_14_NtoM,
	FIELD_15_1toN, FIELD_16_RATING, FIELD_17_TAB, FIELD_18_BUTTON, FIELD_19_RICHEDITOR,
	FIELD_20_COLOR, FIELD_21_FILE,

	EVENT_HANDLER_TYPE_NODE, EVENT_HANDLER_TYPE_FIELD,

	VIEW_MASK_EDIT_CREATE, VIEW_MASK_LIST, VIEW_MASK_READONLY,
	VIEW_MASK_DROPDOWN_LOOKUP, VIEW_MASK_CUSTOM_LIST, VIEW_MASK_ALL,

	ViewMask, RecId, UserRoles, BoolNum, GetRecordsParams, Filters, EnumList,
	PrevsMask, UserLangEntry, TRoleId, NodeDesc, FieldDesc, RecordsDataResponse, RecordData, RecordDataWrite, RecordsData, UserSession
};
