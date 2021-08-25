const throwError = (message: string): never => {

	throw new Error(message);
}

const notificationOut = (userSession: UserSession, text: string) => {
	if(!userSession || userSession.__temporaryServerSideSession) {
		console.log(text);
	} else {
		if(!userSession.notifications) {
			userSession.notifications = [text];
		} else {
			userSession.notifications.push(text);
		}
	}
}

/// #if DEBUG
const assert = (condition: any, errorTxt: string) => {
	if(!condition) {
		throwError(errorTxt);
	}
}
/// #endif

const shouldBeAuthorized = (userSession: UserSession) => {
	if(!userSession || userSession.__temporaryServerSideSession || isUserHaveRole(GUEST_ROLE_ID, userSession)) {
		throwError("operation permitted for authorized user only");
	}
}


const isAdmin = (userSession: UserSession) => {
	return isUserHaveRole(ADMIN_ROLE_ID, userSession);
}

const isUserHaveRole = (roleId: TRoleId, userSession: UserSession) => {
	return userSession && userSession.userRoles[roleId];
}
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
}

interface FieldDesc {



}

interface FilterDesc {


}

interface NodeDesc {
	id: RecId;
	singleName: string;
	prevs: TPrevsMask;
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
	isE: BoolNum;
	/** **publish** access to the record */
	isP: BoolNum;
	/** **delete** access to the record */
	isD: BoolNum;
}

interface RecordsData {
	items: RecordData[];
	total: number;
}

interface RecordsDataResponse {
	data: RecordsData;
	node?: NodeDesc;
}

type BoolNum = 0 | 1;
type TRoleId = number;

const ADMIN_ROLE_ID: TRoleId = 1;
const GUEST_ROLE_ID: TRoleId = 2;
const USER_ROLE_ID: TRoleId = 3;


const FIELD_1_TEXT = 1;
const FIELD_2_INT = 2;
const FIELD_4_DATETIME = 4;
const FIELD_5_BOOL = 5;
const FIELD_6_ENUM = 6;
const FIELD_7_Nto1 = 7;
const FIELD_8_STATICTEXT = 8;
const FIELD_10_PASSWORD = 10;
const FIELD_11_DATE = 11;
const FIELD_12_PICTURE = 12;
const FIELD_14_NtoM = 14;
const FIELD_15_1toN = 15;
const FIELD_16_RATING = 16;
const FIELD_17_TAB = 17;
const FIELD_18_BUTTON = 18;
const FIELD_19_RICHEDITOR = 19;
const FIELD_20_COLOR = 20;
const FIELD_21_FILE = 21;

type TPrevsMask = number;
type TViewMask = number;

const PREVS_VIEW_OWN: TPrevsMask = 1;
const PREVS_VIEW_ORG: TPrevsMask = 2;
const PREVS_VIEW_ALL: TPrevsMask = 4;
const PREVS_CREATE: TPrevsMask = 8;
const PREVS_EDIT_OWN: TPrevsMask = 16;
const PREVS_EDIT_ORG: TPrevsMask = 32;
const PREVS_EDIT_ALL: TPrevsMask = 64;
const PREVS_DELETE: TPrevsMask = 128;
const PREVS_PUBLISH: TPrevsMask = 256;
const PREVS_ANY: TPrevsMask = 65535;

export {
	isUserHaveRole, shouldBeAuthorized, isAdmin, throwError,
	/// #if DEBUG
	getCurrentStack,
	assert,
	/// #endif

	notificationOut,
	USER_ROLE_ID, ADMIN_ROLE_ID, GUEST_ROLE_ID,

	PREVS_VIEW_OWN, PREVS_VIEW_ORG, PREVS_VIEW_ALL, PREVS_CREATE, PREVS_EDIT_OWN, PREVS_EDIT_ORG, PREVS_EDIT_ALL,
	PREVS_DELETE, PREVS_PUBLISH, PREVS_ANY,
	FIELD_1_TEXT, FIELD_2_INT, FIELD_4_DATETIME, FIELD_5_BOOL, FIELD_6_ENUM, FIELD_7_Nto1,
	FIELD_8_STATICTEXT, FIELD_10_PASSWORD, FIELD_11_DATE, FIELD_12_PICTURE, FIELD_14_NtoM,
	FIELD_15_1toN, FIELD_16_RATING, FIELD_17_TAB, FIELD_18_BUTTON, FIELD_19_RICHEDITOR,
	FIELD_20_COLOR, FIELD_21_FILE,
	TViewMask, RecId, UserRoles,
	TPrevsMask, UserLangEntry, TRoleId, NodeDesc, RecordsDataResponse, RecordData, RecordDataWrite, RecordsData, UserSession
};
