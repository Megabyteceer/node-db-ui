import { initDictionary } from "../../utils";

const LANGS = {
	'NO_TRANSLATION': 'No translation for key "%"',
	'OK': 'Ok',
	'CANCEL': 'Cancel',
	'UPLOAD_ERROR': 'Uploading error',
	'IMAGE_UPLOAD_ERROR': 'Image Uploading error',
	'CONNECTION_ERR': 'Connection error',
	'CHECK_CONNECTION': 'Please check you connection.',
	'SURE_DELETE': 'A you sure, you want to delete %',
	'TYPES_ALLOWED': 'Only next file types allowed for uploading: %',
	'FILE_BIG': 'File too big (% Mb). Available size is ',
	'MB': ' Mb',
	'FLD_SETTINGS': 'Field ',
	'FLD_ADD': 'Add field',
	'FLD_SHOW_ALL': 'Show hidden fields',
	'ADD_RATING_FLD': 'Add ratings for section',
	'ADD_NODE': 'Add section',
	'NODE_SETTINGS': 'Section ',
	'EDIT_NODE': 'Edit section settings',
	'EDIT_ACCESS': 'Edit access privileges for section',
	'SEARCH': 'Search',
	'CONTENT': 'Content',
	'LOOKUP_NAME_NOT_UNIQUE': 'Lookup N to M should have globally unique name.',
	/// #if DEBUG
	'EMPTY_SECTION': 'Empty section (click to add)',
	/// #endif
	'VALUE_EXISTS': 'Value already in use.',
	'FLD_EXISTS': 'Field with same name already exists in this document.',
	'MULTILINGUAL': 'Multilingual',
	'LOGIN': 'Login',
	'USER_PROFILE': 'User profile',
	'EDIT_USER_PROFILE': 'Edit user\'s profile %',
	'LOGOUT': 'Logout',
	'DEPLOY_TO': 'Deploy changes to %?',
	'TESTS_ERROR': 'Testing error.',
	'DEPLOY': 'Deploy changes',
	'CLEAR_CACHE': 'Clear servers cache',
	'CLEAR_DEBUG': 'Clear debug output',
	'VIEW': 'View',
	'CREATE': 'Create',
	'DELETE': 'Delete',
	'MOVE_UP': 'Move up',
	'MOVE_DOWN': 'Move down',
	'ADD': 'Add %',
	'SEARCH_LIST': 'Search in full list',
	'NO_RESULTS': 'No results found for "%"',
	'PUSH_CREATE': 'Press "Create %" button,',
	'TO_CONTINUE': 'to continue your work...',
	'TO_START': 'to start your work...',
	'LIST_EMPTY': 'List is empty.',
	'SHOWED_LIST': '% of %',
	'TOTAL_IN_LIST': 'total %',
	'SEARCH_RESULTS': ' (search results for "%")',
	'EDIT': 'Edit',
	'TEMPLATE': 'template',
	'UNPUBLISH': 'Unpublish',
	'PUBLISH': 'Publish',
	'DETAILS': 'Details',
	'SELECT': 'Select',
	'REQUIRED_FLD': 'Required field.',
	'SAVE': 'Save',
	'SAVE_TEMPLATE': 'Save as template',
	'BACK': 'Back',
	'ADM_NA': 'Not allowed',
	'ADM_A': 'Allowed',
	'ADM_A_OWN': 'Allowed his own',
	'ADM_A_ORG': 'Allowed inside organization',
	'ADM_A_FULL': 'Full access',
	'ADM_NODE_ACCESS': 'Privileges for section ',
	'APPLY': 'Apply',
	'PREVIEW': 'Preview:',
	'SELECT_IMG': 'Select...',
	'RECOMMEND_SIZE': 'Recommended image size %x% pixels in JPG format.',
	'LIST_REMOVE': 'Remove from list',
	'FRAG_TO_REORDER': 'Drag to reorder items',
	'NO_RATES': 'No rates',
	'CLEAR': 'Clear',
	'+ADD': '+ Add',
	'YES': 'Yes',
	'NO': 'No',
	'TIME': 'Time',
	'N_TIME': '% (time)',
	'DATE': 'Date',
	'N_DATE': '% (date)',
	'FILE_SELECTED': 'file selected: % ',
	'KILO_BYTES_SHORT': 'Kb',
	'FILE_SELECT': 'Select.. (% max.)',
	'RICH_ED_SIZE': 'Total size of images in field "%" should be less that 2 megabytes.',
	'RESTART_NOW': 'To apply changes you have to re-login. Do you want to do it now?',
	'INVALID_DATA_LIST': 'List is not complete',
	'PASS_LEN': 'Password length should be at leas % symbols.',
	'PASS_NOT_MACH': 'Passwords dont mach.',
	'LATIN_ONLY': 'Latin symbols only',
	'NO_NUMERIC_NAME': 'Numeric name is not allowed',
	'MIN_NAMES_LEN': 'Minimal name\'s length is % symbols.',
	'APPLY_CHILD': 'Apply settings for all sub sections?',
	'TO_THIS': 'To this section only',
	'TO_ALL': 'To all sub sections',
	'NEW_LANGUAGE_WARNING': 'Warning! Adding a new language will modify all database tables. Additional columns will be created for all fields marked as multilingual.',
	'REGISTRATION_EMAIL_SENT': 'We sent confirmation link to E-mail: ',
	'RESET_EMAIL_SENT': 'We sent link for reset password to E-mail: ',
	'GO_TO_LOGIN': 'Go to login',
	'REGISTER': 'Register',
	'REACT_CLASS_NAME': 'React Class Name',
	'FORM_IS_MODIFIED': 'Current data in the form is modified!',
	'LEAVE_WITHOUT_SAVING': 'Leave form without saving.'
};

initDictionary(LANGS);

type LANG_KEYS = keyof typeof LANGS;
export { LANG_KEYS }