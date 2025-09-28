import type { DebugInfo } from '../../../core/mysql-connection';
import type { SelectItem } from './components/select';
import type { NEW_RECORD } from './consts';
import type Form from './form';
import type { FIELD_DISPLAY, FIELD_ID, FILTER_ID, IFieldsRecord, IFiltersRecord, ILanguagesRecord, INodesRecord, NODE_ID, NODE_TYPE } from './types/generated';

export const normalizeCSSName = (name: string) => {
	return camelToSnake(name!).toLowerCase().replaceAll('_', '-');
};

export const normalizeName = (txt: string) => {
	return snakeToCamel(txt).replace(/[`']/g, '').replace(/[^\w]/gm, '_').toUpperCase();
};

export const normalizeEnumName = (txt: string) => {
	return camelToSnake(txt.replace(/^_/, '')).replace(/[`']/g, '').replace(/[^\w]/gm, '_').toUpperCase().replace(/__+/gm, '_');
};

export const camelToSnake = (str: string) => {
	str = str.replace(/([a-z][A-Z])/gm, (group) => {
		return group[0].toUpperCase() + '_' + group[1];
	});
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export const snakeToCamel = (str: string) => {
	str = str.replace(/([_][a-z])/g, group => group.toUpperCase().replace('_', ''));
	return str.charAt(0).toUpperCase() + str.slice(1);
};

export interface LookupValue {
	id: RecId;
	name?: string;
}

export interface LookupValueIconic extends LookupValue {
	icon?: string;
}

export interface GetRecordsFilter {

	/** search text */
	s?: string;

	/** page number */
	p?: number | '*';

	/** items per page */
	n?: number;

	excludeIDs?: number[];

	onlyIDs?: number[];

	/** order by field */
	o?: FIELD_ID;

	/** reversed order */
	r?: 1;

	/** filterId */
	filterId?: FILTER_ID;
}

export interface FormControlFilters {
	/** form tab to show */
	tab?: string;

	/** number of item in parent 1toN lookup list */
	_itemNum?:number;

	/** render standard list view */
	noCustomList?: BoolNum;

	/** override form title by string */
	formTitle?: string;
}

export type FormFilters = Partial<FormControlFilters & RecordData & GetRecordsFilter>;

interface RecordSubmitResult {
	handlerResult: KeyedMap<any> | undefined;
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
// */
const IMAGE_THUMBNAIL_PREFIX = '_thumb.jpg';

type RecId = number;

type UserRoles = { [key: number]: 1 };
type UserOrganizations = { [key: number]: string };

export type APIResult = any;

export interface ApiResponse {
	error?: string;
	result: APIResult;
	isGuest?: boolean;
	/// #if DEBUG
	notifications?: string[];
	debug?: DebugInfo;
	/// #endif
}

interface UserSession {
	id: RecId;
	orgId: number;
	home: number;
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
	multilingualEnabled?: BoolNum | boolean;
	sessionToken: string;
	isGuest?: boolean;
	_isStarted?: boolean;
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

export const enum FIELD_DATA_TYPE {
	TEXT = 0,
	NUMBER = 1,
	TIMESTAMP = 2,
	NODATA = 3,
	BOOL = 4
}

export const isServer = () => {
	return typeof window === 'undefined';
};

interface ClientSideFilterRecord {
	name: string;
	order: number;
}

declare global {

	type KeyedMap<T> = {
		[key: string]: T;
	};

	type HandlerRet = AsyncHandlerRet | SyncHandlerRet;

	type AsyncHandlerRet = Promise<KeyedMap<any> | undefined | void>;

	type SyncHandlerRet = KeyedMap<any> | undefined | void;

	interface FieldDesc extends IFieldsRecord {

		id: FIELD_ID;

		dataType: FIELD_DATA_TYPE;

		show: VIEW_MASK;

		/** value is required for form. */
		requirement: BoolNum;

		/** value of the field should be unique for whole database table. */
		unique: BoolNum;

		/** if true - field data will go to the server on form save. */
		sendToServer: BoolNum;

		/** has multilingual input */
		multilingual: BoolNum;

		/** fields data go to the server, but has no store in database table. */
		storeInDb: BoolNum;

		/** fields will have index in database, and search will be processed in this field */
		forSearch: BoolNum;

		icon: string;

		/** name of picture field in relative table. Thin picture will be used as icon in Lookup fields. */
		lookupIcon: string;

		cssClass?: string;

		display: FIELD_DISPLAY;

		/** SERVER SIDE FIELD ONLY. If it not empty - content of this field goes in to fieldName in SQL query to retrieve data not from direct table's field */
		selectFieldName?: string;

		/** order of the field in the form */
		prior: number;

		/** field tip. or html content for FIELD_TYPE.STATIC_HTML_BLOCK fields */
		description?: string;

		/** content for static HTML field */
		htmlContent?: string;

		/** client side only field */
		node?: NodeDesc;

		/** index in parent's node 'fields' list. Client side only field */
		index?: number;

		enumList?: EnumList;

		/** contains language id, if field is multilingual and refers to non default language */
		lang?: string;

		/** field name without language prefix */
		fieldNamePure?: string;

		/** fields which contains other languages data for that field */
		childrenFields?: FieldDesc[];

		/** fields which rendered beyond form TAB (page) */
		tabFields?: FieldDesc[];

		parenTab?: FieldDesc;
	}

	interface NodeDesc extends INodesRecord {

		id: NODE_ID;

		rolesToAccess: { roleId: RecId; privileges: number }[];
		privileges: PRIVILEGES_MASK;
		matchName: string;

		fields?: FieldDesc[];

		tabs?: FieldDesc[];

		/** CLIENT SIDE ONLY */
		rootFields?: FieldDesc[];

		filters?: { [key: string]: IFiltersRecord | ClientSideFilterRecord };
		filtersList?: SelectItem[];
		sortFieldName?: string;
		/** CLIENT SIDE ONLY */
		fieldsById?: { [key: number]: FieldDesc };
		/** CLIENT SIDE ONLY */
		fieldsByName?: { [key: string]: FieldDesc };

		__serverSideHandlers?: KeyedMap<{ __sourceFile: string }[]>;
	}
}

interface UserLangEntry extends ILanguagesRecord {
	prefix: string;
}

export type RecordDataWrite = {

};

export interface TreeItem {
	children: TreeItem[];
	icon: string;
	id: NODE_ID;
	name: string;
	nodeType: NODE_TYPE;
	parent: NODE_ID;
	privileges: number;
	field?: FieldDesc;
	form?: Form;
	staticLink: string;
}

export type RecordDataWriteDraftable = RecordDataWrite & {
	status?: STATUS;
	id?: RecId;
};

export const enum STATUS {
	DELETED = 0,
	PUBLIC = 1,
	DRAFT = 2
}

export type RecordDataBaseFields = Extract<keyof RecordData, string>;

interface RecordData {

	/** owner org id */
	co?: RecId;

	/** owner by user id */
	cu?: RecId;

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

	name: string;
}

export interface RecordsData {
	items: RecordData[];
	total: number;
}

export interface RecordDataOrdered extends RecordData {
	order: number;
}

export interface RecordsDataOrdered extends RecordsData {
	items: RecordDataOrdered[];
	order: number;
}

interface RecordsDataResponse {
	data?: RecordsData;
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
	USER = 3
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
	NONE = 0,
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
	/** id of current edited/shown record. 'new' - if record is not saved yet. */
	recId?: RecId | typeof NEW_RECORD;
	/** true if form is editable or read only */
	editable?: boolean;
	filters?: GetRecordsFilter;
}

export {
	BoolNum,
	EnumList,
	EnumListItem,
	FieldDesc,
	getCurrentStack, GetRecordsParams,
	HASH_DIVIDER,
	IFormParameters,
	IMAGE_THUMBNAIL_PREFIX,
	LANGUAGE_ID_DEFAULT, NodeDesc,
	PRIVILEGES_MASK,
	RecId,
	RecordData,
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
