
import type { ENUM_FIELD_DISPLAY, FIELD_ID, FILTER_ID, IFieldsRecord, IFiltersRecord, ILanguagesRecord, INodesRecord } from '../../../types/generated';
import { ENUM_FIELD_TYPE as FIELD_TYPE, ENUM_NODE_TYPE as NODE_TYPE } from '../../../types/generated';

export interface GetRecordsFilter {

	/** page number */
	p?: number | '*';

	/** items per page */
	n?: number;

	excludeIDs?: number[];

	onlyIDs?: number[];

	/** order by field*/
	o?: FIELD_ID;

	/** reversed order */
	r?: 1;

	/** filterId */
	filterId?: FILTER_ID;

	/** filter by other field. numeric types only */
	[fieldId:string]: number | any| undefined;
}

interface RecordSubmitResult {
	handlerResult: any;
}

interface RecordSubmitResultNewRecord extends RecordSubmitResult {
	recId: RecId;
}

const getCurrentStack = () => {
	const a = new Error().stack?.split('\n');
	if (a) {
		a.splice(0, 3);
	}
	return a;
};

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
	/** not empty if user have multilingualEnabled */
	multilingualEnabled?: BoolNum;
	sessionToken?: string;
	isGuest?: boolean;
}

interface EnumListItem {
	value: number;
	name: string;
}

type EnumList = {
	name: string;
	items: EnumListItem[];
	namesByValue: { [key: number]: string };
};

interface FieldDesc extends IFieldsRecord {
	/** readable name */
	name: string;

	/** could be string for multilingual fields */
	id: RecId;

	/** owner node */
	nodeFieldsLinker: RecId;

	/** field's name in database table */
	fieldName: string;
	/** maximal data length in database */
	maxLength: number;

	show: VIEW_MASK;

	/** value is required for form. */
	requirement: BoolNum;

	/** value of the field should be unique for whole database table. */
	unique: BoolNum;

	/** if true - field data do not go to the server on form save. */
	sendToServer: BoolNum;

	/** has multilingual input */
	multilingual: BoolNum;

	/** fields data go to the server, but has no store in database table. */
	storeInDb: BoolNum;

	/** fields will have index in database, and search will be processed in this field */
	forSearch: BoolNum;

	fieldType: FIELD_TYPE;

	icon: string;

	/** name of picture field in relative table. Thin picture will be used as icon in Lookup fields. */
	lookupIcon: string;

	cssClass?: string;

	display: ENUM_FIELD_DISPLAY;

	/** node id lookup field points to*/
	nodeRef: RecId;

	/** SERVER SIDE FIELD ONLY. If it not empty - content of this field goes in to fieldName in SQL query to retrieve data not from direct table's field */
	selectFieldName?: string;

	/** order of the field in the form */
	prior: number;

	/** field tip. or html content for FIELD_TYPE.STATIC_HTML_BLOCK fields */
	description: string;

	/** client side only field */
	node?: NodeDesc;

	/** index in parent's node 'fields' list. Client side only field */
	index?: number;

	/** client side only field */
	enum?: EnumList;
	enumId?: RecId;

	/** contains language id, if field is multilingual and refers to non default language */
	lang?: string;

	/** field name without language prefix */
	fieldNamePure?: string /** field name without language prefix */;

	/** fields which contains other languages data for that field */
	childrenFields?: FieldDesc[];
}

interface ClientSideFilterRecord {
	name: string;
	order: number
};

interface NodeDesc extends INodesRecord {
	id: RecId;
	/** parent node id */
	_nodesId: RecId;
	singleName: string;
	rolesToAccess: { roleId: RecId; privileges: number }[];
	privileges: PRIVILEGES_MASK;
	matchName: string;
	description: string;
	nodeType: NODE_TYPE;
	storeForms?: BoolNum;
	reverse?: BoolNum;
	creationName?: string;
	staticLink?: string;
	captcha?: BoolNum;
	tableName?: string;
	draftable?: BoolNum;
	icon?: string;
	recPerPage?: number;
	defaultFilterId?: number;
	fields?: FieldDesc[];
	cssClass?: string;
	filters?: { [key: string]: IFiltersRecord | ClientSideFilterRecord };
	filtersList?: { name: string; value: any }[];
	sortFieldName?: string;
	/** CLIENT SIDE ONLY */
	fieldsById?: { [key: number]: FieldDesc };
	fieldsByName?: { [key: string]: FieldDesc };
}

interface UserLangEntry extends ILanguagesRecord {
	prefix: string;
}

export type RecordDataWrite<T> = {

	/** submit captcha token */
	c?: string;

} & Omit<T, 'isE' | 'isP' | 'isD'>;

export const enum STATUS {
	DELETED = 0,
	PUBLIC = 1,
	DRAFT = 2,
}

interface RecordData {
	/** **edit** access to the record */
	isE?: BoolNum;
	/** **publish** access to the record */
	isP?: BoolNum;
	/** **delete** access to the record */
	isD?: BoolNum;

	status?: STATUS;
	id?: RecId;

	/** item deleted from list in lookup field */
	__deleted_901d123f?: true;


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
	recId?: RecId | RecId[];
	s?: string;
	descNode?: boolean;
}

type BoolNum = 0 | 1;

const enum ROLE_ID {
	ADMIN = 1,
	GUEST = 2,
	USER = 3,
}


const enum VIEW_MASK {
	EDITABLE = 1,
	LIST = 2,
	READONLY = 4,
	DROPDOWN_LIST = 8,
	CUSTOM_LIST = 16,
	SUB_FORM = 32,
	ALL = 65535
}

const enum PRIVILEGES_MASK {
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

const enum USER_ID {
	SUPER_ADMIN = 1,
	GUEST = 2,
	USER = 3,
	VIEW_ALL = 7
}

const LANGUAGE_ID_DEFAULT: RecId = 1;

interface IFormParameters {
	nodeId: RecId;
	/** id of current edited/shown record. 'new' - if record is not saved yet.*/
	recId?: RecId | 'new';
	/** true if form is editable or read only */
	editable?: boolean;
	filters?: GetRecordsFilter;
}

export {
	BoolNum,
	EnumList,
	EnumListItem,
	FIELD_TYPE, FieldDesc,
	getCurrentStack, GetRecordsParams,
	HASH_DIVIDER,
	IFormParameters,
	IMAGE_THUMBNAIL_PREFIX,
	LANGUAGE_ID_DEFAULT, NODE_TYPE, NodeDesc,
	PRIVILEGES_MASK,
	RecId,
	RecordData,
	RecordsData,
	RecordsDataResponse,
	RecordSubmitResult,
	RecordSubmitResultNewRecord,
	ROLE_ID,
	USER_ID,
	UserLangEntry,
	UserRoles,
	UserSession,
	VIEW_MASK
};

