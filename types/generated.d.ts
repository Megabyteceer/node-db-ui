interface ILoginRecord {
	/** Text */
	username: string;
	/** Password */
	password: string;
	/** Button */
	signIn_btn?: any;
	/** Static HTML block */
	social_login_buttons?: any;
	/** Button */
	forgot_password_button?: any;
	/** Button */
	sign_up_link_btn?: any;
}

interface INodesRecord {
	/** Number */
	id?: number;
	/** Text */
	name: string;
	/** Text */
	icon?: string;
	/** Lookup */
	_nodes_id: any;
	/** Number */
	prior: number;
	/** Text */
	description?: string;
	/** Enum */
	node_type: number;
	/** Splitter */
	data_storage_group?: any;
	/** Bool */
	store_forms?: number;
	/** Text */
	table_name?: string;
	/** Splitter */
	appearance_group?: any;
	/** Text */
	single_name?: string;
	/** Text */
	creation_name?: string;
	/** Lookup */
	_fields_id?: any;
	/** Bool */
	reverse?: number;
	/** Lookup */
	default_filter_id?: any;
	/** Number */
	rec_per_page?: number;
	/** Bool */
	captcha?: number;
	/** Bool */
	draftable?: number;
	/** Text */
	css_class?: string;
	/** Text */
	static_link?: string;
	/** Tab */
	t_property?: any;
	/** Tab */
	t_fields?: any;
	/** Lookup 1 to N */
	node_fields?: any;
	/** Tab */
	t_filters?: any;
	/** Lookup 1 to N */
	node_filters?: any;
}

interface IMyRecordsNoTableRecord {
}

interface IFieldsRecord {
	/** Number */
	id?: number;
	/** Text */
	name?: string;
	/** Text */
	field_name: string;
	/** Text */
	icon?: string;
	/** Number */
	prior: number;
	/** Text */
	description?: string;
	/** Enum */
	display?: number;
	/** Text */
	css_class?: string;
	/** Enum */
	field_type: number;
	/** Splitter */
	storage_setting_splitter?: any;
	/** Number */
	max_length?: number;
	/** Lookup */
	node_ref?: any;
	/** Lookup */
	enum?: any;
	/** Lookup */
	node_fields_linker: any;
	/** Bool */
	requirement?: number;
	/** Bool */
	send_to_server?: number;
	/** Bool */
	store_in_db?: number;
	/** Bool */
	for_search?: number;
	/** Bool */
	unique?: number;
	/** Bool */
	multilingual?: number;
	/** Number */
	width?: number;
	/** Number */
	height?: number;
	/** Text */
	select_field_name?: string;
	/** Text */
	lookup_icon?: string;
	/** Splitter */
	visibility_splitter?: any;
	/** Number */
	show?: number;
	/** Bool */
	visibility_create?: number;
	/** Bool */
	visibility_view?: number;
	/** Bool */
	visibility_list?: number;
	/** Bool */
	visibility_custom_list?: number;
	/** Bool */
	visibility_dropdown_list?: number;
	/** Bool */
	visibility_sub_form_list?: number;
}

interface IResetpasswordRecord {
	/** Text */
	email: string;
	/** Button */
	back_to_login?: any;
}

interface IMyRecordsRecord {
	/** Text */
	name: string;
	/** DateTime */
	_created_on?: import('moment').Moment;
	/** Lookup */
	_organization_id?: any;
	/** Lookup */
	_users_id?: any;
}

interface IRegistrationRecord {
	/** Text */
	name?: string;
	/** Text */
	email: string;
	/** Password */
	password: string;
	/** Password */
	password_confirm: string;
	/** Button */
	already_have_account_btn?: any;
	/** Text */
	activation_key?: string;
	/** Text */
	salt?: string;
}

interface IUsersRecord {
	/** Image */
	avatar?: string;
	/** Tab */
	t_main?: any;
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
	_user_roles?: any;
	/** Tab */
	t_pass?: any;
	/** Password */
	password?: string;
	/** Password */
	password_confirm?: string;
	/** Tab */
	t_priv?: any;
	/** Lookup */
	language?: any;
	/** Static HTML block */
	desc_spl?: any;
	/** Text */
	last_name?: string;
	/** Text */
	first_name?: string;
	/** Text */
	mid_name?: string;
	/** Bool */
	multilingual_enabled?: number;
	/** Text */
	www?: string;
	/** Bool */
	mailing?: number;
	/** Text */
	activation?: string;
	/** Lookup */
	_organization_id?: any;
}

interface IRolesRecord {
	/** Text */
	name: string;
	/** Text */
	description?: string;
	/** Lookup N to M */
	_user_roles?: any;
}

interface IOrganizationRecord {
	/** Tab */
	t_common?: any;
	/** Text */
	name?: string;
	/** Tab */
	t_members?: any;
	/** Lookup N to M */
	_organization_users?: any;
}

interface IFiltersRecord {
	/** Number */
	id?: number;
	/** Text */
	name: string;
	/** Bool */
	hi_priority?: number;
	/** Text */
	filter?: string;
	/** Text */
	fields?: string;
	/** Text */
	view?: string;
	/** Lookup */
	node_filters_linker: any;
	/** Number */
	order?: number;
	/** Lookup N to M */
	_filter_access_roles?: any;
}

interface IFilesRecord {
	/** Text */
	name: string;
	/** DateTime */
	_created_on?: import('moment').Moment;
	/** File */
	file: string;
	/** Lookup */
	_organization_id?: any;
	/** Lookup */
	_users_id?: any;
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

interface IEnumValuesRecord {
	/** Text */
	name: string;
	/** Number */
	value?: number;
	/** Number */
	order?: number;
	/** Lookup */
	values_linker?: any;
}

interface ILanguagesRecord {
	/** Number */
	id?: number;
	/** Text */
	name: string;
	/** Image */
	lang_icon?: string;
	/** Text */
	code?: string;
	/** Bool */
	isUiLanguage?: number;
}
