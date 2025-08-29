interface ILoginRecord {
	/** Text */
	username: string;
	/** Password */
	password: string;
	/** Button */
	signInBtn?: any;
	/** Static HTML block */
	socialLoginButtons?: any;
	/** Button */
	forgotPasswordButton?: any;
	/** Button */
	signUpLinkBtn?: any;
}

interface INodesRecord {
	/** Number */
	id?: number;
	/** Text */
	name: string;
	/** Text */
	icon?: string;
	/** Lookup */
	_nodesId: any;
	/** Number */
	prior: number;
	/** Text */
	description?: string;
	/** Enum */
	nodeType: number;
	/** Splitter */
	dataStorageGroup?: any;
	/** Bool */
	storeForms?: number;
	/** Text */
	tableName?: string;
	/** Splitter */
	appearanceGroup?: any;
	/** Text */
	singleName?: string;
	/** Text */
	creationName?: string;
	/** Lookup */
	_fieldsId?: any;
	/** Bool */
	reverse?: number;
	/** Lookup */
	defaultFilterId?: any;
	/** Number */
	recPerPage?: number;
	/** Bool */
	captcha?: number;
	/** Bool */
	draftable?: number;
	/** Text */
	cssClass?: string;
	/** Text */
	staticLink?: string;
	/** Tab */
	propertyTab?: any;
	/** Tab */
	fieldsTab?: any;
	/** Lookup 1 to N */
	nodeFields?: any;
	/** Tab */
	filtersTab?: any;
	/** Lookup 1 to N */
	nodeFilters?: any;
}

interface IMyrecordsnotableRecord {
}

interface IFieldsRecord {
	/** Number */
	id?: number;
	/** Text */
	name?: string;
	/** Text */
	fieldName: string;
	/** Text */
	icon?: string;
	/** Number */
	prior: number;
	/** Text */
	description?: string;
	/** Enum */
	display?: number;
	/** Text */
	cssClass?: string;
	/** Enum */
	fieldType: number;
	/** Splitter */
	storageSettingSplitter?: any;
	/** Number */
	maxLength?: number;
	/** Lookup */
	nodeRef?: any;
	/** Lookup */
	enum?: any;
	/** Lookup */
	nodeFieldsLinker: any;
	/** Bool */
	requirement?: number;
	/** Bool */
	sendToServer?: number;
	/** Bool */
	storeInDb?: number;
	/** Bool */
	forSearch?: number;
	/** Bool */
	unique?: number;
	/** Bool */
	multilingual?: number;
	/** Number */
	width?: number;
	/** Number */
	height?: number;
	/** Text */
	selectFieldName?: string;
	/** Text */
	lookupIcon?: string;
	/** Splitter */
	visibilitySplitter?: any;
	/** Number */
	show?: number;
	/** Bool */
	visibilityCreate?: number;
	/** Bool */
	visibilityView?: number;
	/** Bool */
	visibilityList?: number;
	/** Bool */
	visibilityCustomList?: number;
	/** Bool */
	visibilityDropdownList?: number;
	/** Bool */
	visibilitySubFormList?: number;
}

interface IResetpasswordRecord {
	/** Text */
	email: string;
	/** Button */
	backToLogin?: any;
}

interface IMyrecordsRecord {
	/** Text */
	name: string;
	/** DateTime */
	_createdOn?: import('moment').Moment;
	/** Lookup */
	_organizationId?: any;
	/** Lookup */
	_usersId?: any;
}

interface IRegistrationRecord {
	/** Text */
	name?: string;
	/** Text */
	email: string;
	/** Password */
	password: string;
	/** Password */
	passwordConfirm: string;
	/** Button */
	alreadyHaveAccountBtn?: any;
	/** Text */
	activationKey?: string;
	/** Text */
	salt?: string;
}

interface IUsersRecord {
	/** Image */
	avatar?: string;
	/** Tab */
	mainTab?: any;
	/** Text */
	name: string;
	/** Text */
	salt?: string;
	/** Text */
	company?: string;
	/** Text */
	title?: string;
	/** Text */
	email?: string;
	/** Text */
	description?: string;
	/** Lookup N to M */
	_userRoles?: any;
	/** Tab */
	passwordTab?: any;
	/** Password */
	password?: string;
	/** Password */
	passwordConfirm?: string;
	/** Tab */
	privilegesTab?: any;
	/** Lookup */
	language?: any;
	/** Static HTML block */
	descSpl?: any;
	/** Text */
	lastName?: string;
	/** Text */
	firstName?: string;
	/** Text */
	midName?: string;
	/** Bool */
	multilingualEnabled?: number;
	/** Text */
	www?: string;
	/** Bool */
	mailing?: number;
	/** Text */
	activation?: string;
	/** Lookup */
	_organizationId?: any;
}

interface IRolesRecord {
	/** Text */
	name: string;
	/** Text */
	description?: string;
	/** Lookup N to M */
	_userRoles?: any;
}

interface IOrganizationRecord {
	/** Tab */
	commonTab?: any;
	/** Text */
	name?: string;
	/** Tab */
	membersTab?: any;
	/** Lookup N to M */
	_organizationUsers?: any;
}

interface IFiltersRecord {
	/** Number */
	id?: number;
	/** Text */
	name: string;
	/** Bool */
	hiPriority?: number;
	/** Text */
	filter?: string;
	/** Text */
	fields?: string;
	/** Text */
	view?: string;
	/** Lookup */
	nodeFiltersLinker: any;
	/** Number */
	order?: number;
	/** Lookup N to M */
	_filterAccessRoles?: any;
}

interface IFilesRecord {
	/** Text */
	name: string;
	/** DateTime */
	_createdOn?: import('moment').Moment;
	/** File */
	file: string;
	/** Lookup */
	_organizationId?: any;
	/** Lookup */
	_usersId?: any;
}

interface IHtmlRecord {
	/** Text */
	name: string;
	/** Text */
	link?: string;
	/** Static HTML block */
	clickableLink?: any;
	/** Text */
	title: string;
	/** HTML editor */
	body?: string;
}

interface IEnumsRecord {
	/** Number */
	id: number;
	/** Text */
	name: string;
	/** Lookup 1 to N */
	values?: any;
}

interface IEnumvaluesRecord {
	/** Text */
	name: string;
	/** Number */
	value?: number;
	/** Number */
	order?: number;
	/** Lookup */
	valuesLinker?: any;
}

interface ILanguagesRecord {
	/** Number */
	id?: number;
	/** Text */
	name: string;
	/** Image */
	langIcon?: string;
	/** Text */
	code?: string;
	/** Bool */
	isUILanguage?: number;
}
