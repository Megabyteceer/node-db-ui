
import { attachGoogleLoginAPI, getData, getNode, getRecordsClient, goToHome, isAdmin, L, myAlert, showPrompt } from '../utils';
/// #if DEBUG
import { FIELD_TYPE, NODE_ID, NODE_TYPE, type TFieldsFieldsList, type TNodesFieldsList, type TRegistrationFieldsList, type TResetPasswordFieldsList, type TUsersFieldsList, type TypeGenerationHelper } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import { makeIconSelectionField, makeReactClassSelectionField, removeReactClassSelectionField } from '../admin/admin-utils';
import type { FormFull } from '../forms/form-full';
/// #endif

import { VIEW_MASK } from '../bs-utils';


import type { ResetPasswordData } from '../../../../core/events/_resetPassword';
import { type IFieldsFilter, type IFiltersFilter, type ILanguagesFilter, type INodesFilter, type IUsersRecord } from '../../../../types/generated';
import type { NodeDesc } from '../bs-utils';
import { LANGUAGE_ID_DEFAULT } from '../bs-utils';
import { clientOn } from '../events-handle';
import type { LookupOneToManyFiled } from '../fields/field-15-one-to-many';
import { ENV } from '../main-frame';
import { R } from '../r';
import { iAdmin, User } from '../user';

let uiLanguageIsChanged;


const checkPasswordConfirmation = (form: FormFull<TUsersFieldsList> | FormFull<TRegistrationFieldsList>) => {
	const p = form.fieldValue('password');
	const p2 = form.fieldValue('passwordConfirm');
	if (p && p !== p2) {
		form.fieldAlert('passwordConfirm', L('PASS_NOT_MACH'));
	} else {
		form.fieldAlert('passwordConfirm');
	}
};

clientOn('_users.onLoad', (form) => {
	if (!ENV.langs) {
		form.hideField('language');
	} else {
		form.addLookupFilters('language', {
			isUILanguage: 1
		} as ILanguagesFilter);
	}

	if (window.document.querySelector('#org-edit-link')!) {
		(window.document.querySelector('.field-container-id-63 input') as HTMLDivElement).style.width = '50%';
		if (form.fieldValue('_organizationId')) {
			(window.document.querySelector('.field-container-id-63 input') as HTMLDivElement).insertAdjacentHTML(
				'beforeend',
				'<a id="org-edit-link" class="clickable" style="display:block; color:#777; font-size:80%; float:right;" title="additional organization settings" href="#n/7/r/' +
					form.fieldValue('_organizationId').id +
					'/e">additional organization settings <p class="fa fa-wrench"></p></a>'
			);
		}
	}

	if (!iAdmin()) {
		form.hideField('_userRoles');
	}
	if ((form.recId as number) < 4) {
		form.hideField('_userRoles');
	}

	form.disableField('_organizationId');

	if (!iAdmin()) {
		form.hideField('_organizationId');
	}

	const myName = form.fieldValue('name');

	if (!isAdmin()) {
		form.disableField('email');
	}

	if (form.isUpdateRecord || form.isNewRecord) {
		form.addLookupFilters('_userRoles', {
			excludeIDs: [2, 3]
		});
	}

	if (form.isUpdateRecord) {
		form.header = L('EDIT_USER_PROFILE', myName);
		form.setFieldValue('password', 'nc_l4DFn76ds5yhg');
		form.setFieldValue('passwordConfirm', 'nc_l4DFn76ds5yhg');
		(form.props.initialData as IUsersRecord).password = 'nc_l4DFn76ds5yhg';
	}

	if (form.isNewRecord) {
		form.hideField('mailing');
		form.hideField('_organizationId');
		form.setFieldValue('password', 'nc_l4DFn76ds5yhg');
		form.setFieldValue('passwordConfirm', 'nc_l4DFn76ds5yhg');
		(form.props.initialData as IUsersRecord).password = 'nc_l4DFn76ds5yhg';
	}
});

clientOn('_users.onSave', (form) => {
	checkPasswordConfirmation(form);
	const pass = form.fieldValue('password');
	if (pass.length < 6) {
		form.fieldAlert('password', L('PASS_LEN', 6));
	}

	if (User.currentUserData.id === form.recId) {
		let pLang = (form.props.initialData as IUsersRecord).language;
		let nLang = (form.props.initialData as IUsersRecord).language;

		uiLanguageIsChanged = nLang.id != pLang.id;
	}
});

clientOn('_users.afterSave', (form) => {
	if (uiLanguageIsChanged) {
		showPrompt(L('RESTART_NOW')).then((isYes) => {
			if (isYes) {
				window.location.href = 'login';
			}
		});
	}
	if (form.recId === User.currentUserData.id) {
		User.currentUserData.avatar = form.fieldValue('avatar');
		User.instance.forceUpdate();
	}
});

clientOn('_roles.onLoad', (form) => {
	form.getField('_userRoles').setLookupFilter('excludeIDs', [1, 2, 3]);
	if (form.recId === 2 || form.recId === 3) {
		form.hideField('_userRoles');
	}
});

clientOn('_enums.onLoad', (form) => {
	form.getField('values').inlineEditable();
});


const _nodes_recalculateFieldsVisibility = (form:FormFull<TNodesFieldsList, TypeGenerationHelper['getValueNodes']>) => {
	if (!form.isNewRecord && form.fieldValue('nodeType') === NODE_TYPE.DOCUMENT) {
		form.showField('_fieldsId');
		form.showField('reverse');
		form.showField('defaultFilterId');
	} else {
		form.hideField('_fieldsId');
		form.hideField('reverse');
		form.hideField('defaultFilterId');
	}

	if (form.fieldValue('nodeType') === NODE_TYPE.STATIC_LINK) {
		form.showField('staticLink');
	} else {
		form.hideField('staticLink');
	}
};

/// #if DEBUG
clientOn('_nodes.onLoad', (form) => {
	if (form.isNewRecord || form.fieldValue('nodeType') !== NODE_TYPE.DOCUMENT) {
		form.hideField('fieldsTab');
		form.hideField('filtersTab');
	}

	makeIconSelectionField(this, 'icon');

	if (form.fieldValue('nodeType') !== NODE_TYPE.DOCUMENT) {
		form.hideField('defaultFilterId');
	} else if (form.isUpdateRecord) {
		form.addLookupFilters('defaultFilterId', {
			nodeFiltersLinker: form.recId
		} as IFiltersFilter);
	} else {
		if (!form.currentData.hasOwnProperty('storeForms')) {
			form.setFieldValue('storeForms', 1);
		}
	}

	_nodes_recalculateFieldsVisibility(form);

	if (form.isUpdateRecord) {
		form.disableField('nodeType');
		form.disableField('storeForms');
		form.disableField('tableName');
	}

	if (form.isNewRecord) {
		if (!form.fieldValue('recPerPage')) {
			form.setFieldValue('recPerPage', 25);
		}
		form.hideField('_fieldsId');
	} else {
		form.addLookupFilters('_nodesId', 'excludeIDs', [form.recId]);
		form.addLookupFilters('nodeFields', 'n', 200);
	}
	form.addLookupFilters('_nodesId', 'nodeType', NODE_TYPE.SECTION);
	form.addLookupFilters('_fieldsId', {
		nodeFieldsLinker: form.recId,
		forSearch: 1
	} as IFieldsFilter);
});

clientOn('_nodes.onSave', (form) => {
	if (form.fieldValue('nodeType') !== NODE_TYPE.DOCUMENT) {
		const name = form.fieldValue('name');
		form.setFieldValue('singleName', name);
		form.setFieldValue('storeForms', 0);
	} else {
		if (/[^a-zA-Z_0-9]/.test(form.fieldValue('tableName'))) {
			form.fieldAlert('tableName', L('LATIN_ONLY'));
		}

		if (form.fieldValue('tableName') == parseInt(form.fieldValue('tableName')).toString()) {
			form.fieldAlert('tableName', L('NO_NUMERIC_NAME'));
		}
	}
});

let _fieldsNameIsBad: boolean;

clientOn('_fields.onLoad', async (form) => {
	makeIconSelectionField(this, 'icon');

	const parentNodeVal = form.fieldValue('nodeFieldsLinker');
	let parentNode: NodeDesc;
	if (parentNodeVal) {
		parentNode = await getNode(parentNodeVal.id);
		if (!parentNode.storeForms) {
			form.setFieldValue('storeInDb', 0);
			form.disableField('storeInDb');
		}
	}

	if (form.isNewRecord) {
		if (isNaN(form.fieldValue('show'))) {
			form.setFieldValue('show', 5);
			form.setFieldValue('visibilityCreate', 1);
			form.setFieldValue('visibilityView', 1);
			form.setFieldValue('visibilityList', 1);
			form.setFieldValue('visibilityDropdownList', 0);
			form.setFieldValue('visibilitySubFormList', 1);

			form.setFieldValue('sendToServer', 1);
			form.setFieldValue('storeInDb', 1);
		}

		if (!form.fieldValue('prior')) {
			form.setFieldValue('prior', 1);
		}
	} else {
		if (form.fieldValue('show') & VIEW_MASK.EDITABLE) form.setFieldValue('visibilityCreate', 1);
		else form.setFieldValue('visibilityCreate', 0);

		if (form.fieldValue('show') & VIEW_MASK.READONLY) form.setFieldValue('visibilityView', 1);
		else form.setFieldValue('visibilityView', 0);

		if (form.fieldValue('show') & VIEW_MASK.LIST) form.setFieldValue('visibilityList', 1);
		else form.setFieldValue('visibilityList', 0);

		if (form.fieldValue('show') & VIEW_MASK.DROPDOWN_LIST) form.setFieldValue('visibilityDropdownList', 1);
		else form.setFieldValue('visibilityDropdownList', 0);

		if (form.fieldValue('show') & VIEW_MASK.SUB_FORM) form.setFieldValue('visibilitySubFormList', 1);
		else form.setFieldValue('visibilitySubFormList', 0);

		if (form.fieldValue('show') & VIEW_MASK.CUSTOM_LIST) form.setFieldValue('visibilityCustomList', 1);
		else form.setFieldValue('visibilityCustomList', 0);

		if (form.fieldValue('fieldType') === FIELD_TYPE.IMAGE || form.fieldValue('fieldType') === FIELD_TYPE.HTML_EDITOR) {
			form.setFieldValue('height', form.fieldValue('maxLength') % 10000);
			form.setFieldValue('width', Math.floor(form.fieldValue('maxLength') / 10000));
		}
	}

	form.addLookupFilters('nodeFieldsLinker', {
		nodeType: NODE_TYPE.DOCUMENT
	} as INodesFilter);
	form.addLookupFilters('nodeRef', {
		nodeType: NODE_TYPE.DOCUMENT,
		storeForms: 1
	} as INodesFilter);
	form.hideField('show');
});

clientOn('_fields.onSave', (form) => {
	const fieldType = form.fieldValue('fieldType');

	if (fieldType === FIELD_TYPE.LOOKUP || fieldType === FIELD_TYPE.LOOKUP_N_TO_M || fieldType === FIELD_TYPE.LOOKUP_1_TO_N) {
		if (form.isFieldEmpty('nodeRef')) {
			form.fieldAlert('nodeRef', L('REQUIRED_FLD'));
		}
	}

	if (/[^a-zA-Z_0-9]/.test(form.fieldValue('fieldName'))) {
		form.fieldAlert('fieldName', L('LATIN_ONLY'));
	}

	if (form.fieldValue('fieldName') == parseInt(form.fieldValue('fieldName')).toString()) {
		form.fieldAlert('fieldName', L('NO_NUMERIC_NAME'));
	}

	if (fieldType === FIELD_TYPE.IMAGE || fieldType === FIELD_TYPE.HTML_EDITOR) {
		if (!form.fieldValue('height')) {
			form.fieldAlert('height', L('REQUIRED_FLD'));
		}
		if (!form.fieldValue('width')) {
			form.fieldAlert('width', L('REQUIRED_FLD'));
		}
		const maxLength = Math.min(9999, form.fieldValue('height') || undefined) + (form.fieldValue('width') || undefined) * 10000;
		if (!isNaN(maxLength)) {
			form.setFieldValue('maxLength', maxLength);
		}
	}

	if (!form.fieldValue('maxLength')) {
		form.setFieldValue('maxLength', 0);
		if (fieldType === FIELD_TYPE.TEXT || fieldType === FIELD_TYPE.NUMBER || fieldType === FIELD_TYPE.PASSWORD) {
			form.fieldAlert('maxLength', L('REQUIRED_FLD'));
		}
	}

	if (form.isNewRecord) {
		if (form.isNewRecord && (!form.fieldValue('fieldName') || form.fieldValue('fieldName').length < 3)) {
			form.fieldAlert('fieldName', L('MIN_NAMES_LEN', 3));
		}
	} else {
		form.hideField('selectFieldName');
	}

	if (fieldType === FIELD_TYPE.STATIC_HTML_BLOCK || fieldType === FIELD_TYPE.TAB || fieldType === FIELD_TYPE.BUTTON || fieldType === FIELD_TYPE.SPLITTER) {
		form.setFieldValue('storeInDb', 0);
	}
	if (_fieldsNameIsBad) {
		form.fieldAlert('fieldName', L('FLD_EXISTS'));
	}
});
/// #endif

clientOn('_languages.onLoad', (form) => {
	if (form.recId === LANGUAGE_ID_DEFAULT) {
		form.disableField('isUILanguage');
	}
	if (form.isUpdateRecord) {
		form.disableField('code');
	} else if (form.editable) {
		form.header = R.span({ className: 'danger' }, L('NEW_LANGUAGE_WARNING'));
	}
});

clientOn('_languages.onSave', (form) => {
	if (form.isNewRecord && !form.fieldValue('code')) {
		form.fieldAlert('code', L('REQUIRED_FLD'));
	}
});

clientOn('_enums.onSave', (form) => {
	let ret;
	const exists = {};
	const valuesForms = (form.getField('values').fieldRef as LookupOneToManyFiled).inlineListRef.getSubForms();
	for (const form of valuesForms) {
		const val = form.fieldValue('value');
		if (exists[val]) {
			ret = true;
			form.fieldAlert('value', L('VALUE_EXISTS'));
		}
		exists[val] = true;
	}
	return ret;
});

clientOn('_filters.onLoad', (form) => {

	form.addLookupFilters('nodeFiltersLinker', {
		filterId: 8,
		excludeIDs: [9]
	});
});

clientOn('_login.afterSave', (_form, result) => {
	debugger;
	User.setUserData(result.handlerResult);
	if (globals.onCurdJSLogin) {
		globals.onCurdJSLogin(result.handlerResult);
	}
});

clientOn('_registration.onSave', (form) => {
	checkPasswordConfirmation(form);
});

clientOn('_registration.afterSave', (form) => {
	showMessageAboutEmailSent(L('REGISTRATION_EMAIL_SENT'), form);
	form.isPreventCloseFormAfterSave = true;
});

const showMessageAboutEmailSent = (txt, form: FormFull<TRegistrationFieldsList> | FormFull<TResetPasswordFieldsList>) => {
	myAlert(
		R.span(null, txt, R.div({ className: 'email-highlight' }, form.fieldValue('email'))),
		true,
		false,
		true,
		() => {
			globals.Stage.showForm(NODE_ID.LOGIN);
		},
		L('GO_TO_LOGIN')
	);
};

clientOn('_resetPassword.afterSave', (form) => {
	showMessageAboutEmailSent(L('RESET_EMAIL_SENT'), form);
	form.isPreventCloseFormAfterSave = true;
});

clientOn('_registration.onLoad', (form) => {
	form.setSaveButtonTitle(L('REGISTER'));
	form.hideCancelButton();
});

clientOn('_login.onLoad', (form) => {
	form.hideFooter();
	if (form.hasField('socialLoginButtons') && ENV.clientOptions.googleSigninClientId) {
		/// #if DEBUG
		return;
		/// #endif
		//@ts-ignore
		window.onGoogleSignIn = (googleUser) => {
			const id_token = googleUser.getAuthResponse().id_token;
			form.setFieldValue('username', 'google-auth-sign-in');
			form.setFieldValue('password', id_token);
			form.save();
		};
		form.renderToField('socialLoginButtons', 'social-buttons', R.span(null, R.div({ className: 'g-signin2', 'data-onsuccess': 'onGoogleSignIn' })));
		attachGoogleLoginAPI(true);
	}
});

clientOn('_resetPassword.onLoad', (form) => {
	form.hideCancelButton();
	const activationKey = (form.filters as ResetPasswordData).activationKey;
	const resetCode = (form.filters as ResetPasswordData).resetCode;
	if (activationKey || resetCode) {
		form.hideField('email');
		form.hideFooter();
		if (activationKey) {
			getData('api/activate', form.filters)
				.then((userSession) => {
					User.setUserData(userSession);
					goToHome();
				})
				.catch((_er) => {});
		} else {
			getData('api/reset', form.filters)
				.then((userSession) => {
					User.setUserData(userSession);
					globals.Stage.showForm(NODE_ID.USERS, userSession.id, { tab: 'passwordTab' }, true);
				})
				.catch((_er) => {});
		}
	}
});

clientOn('_enumValues.onLoad', (form) => {
	if (form.isNewRecord && form.props.parentForm) {
		let maxEnumVal = 0;
		for (const item of form.props.parentForm.getBackupData()) {
			if (item.value > maxEnumVal) {
				maxEnumVal = item.value;
			}
		}
		form.setFieldValue('value', maxEnumVal + 1);
	}
});

const check12nFieldName = (form: FormFull<TFieldsFieldsList>) => {
	if (form.isNewRecord) {
		_fieldsNameIsBad = false;

		const checkFieldExists = (fName: string, nodeId: NODE_ID) => {
			const fieldsFilter: IFieldsFilter = {
				fieldName: fName
			};
			if (form.fieldValue('fieldType') !== FIELD_TYPE.LOOKUP_N_TO_M) {
				fieldsFilter.nodeFieldsLinker = nodeId;
			}
			getRecordsClient(NODE_ID.FIELDS, undefined, fieldsFilter).then((data) => {
				if (_fieldsNameIsBad) return;
				if (data.items.length > 0) {
					if (form.fieldValue('fieldType') === FIELD_TYPE.LOOKUP_N_TO_M) {
						form.fieldAlert('fieldName', L('LOOKUP_NAME_NOT_UNIQUE'));
					} else {
						form.fieldAlert('fieldName', L('FLD_EXISTS'));
					}
					_fieldsNameIsBad = true;
				} else {
					form.fieldAlert('fieldName', undefined, true);
				}
			});
		};

		const fn = form.fieldValue('fieldName');
		let nodeId = form.fieldValue('nodeFieldsLinker');
		if (nodeId && nodeId.id) {
			nodeId = nodeId.id;
		}
		let nodeRef = form.fieldValue('nodeRef');
		if (nodeRef && nodeRef.id) {
			nodeRef = nodeRef.id;
		}

		if (nodeId && fn && fn.length >= 3) {
			if (form.fieldValue('fieldType') === FIELD_TYPE.LOOKUP_1_TO_N && nodeRef) {
				checkFieldExists(fn + 'Linker', nodeRef);
			} else {
				checkFieldExists(fn, nodeId);
			}
		}
	}
};


const removeWrongCharactersInField = (form: FormFull<string>, fieldName: string) => {
	const oldValue = form.fieldValue(fieldName);
	if (oldValue) {
		const newValue = oldValue.toLowerCase().replace(/[^a-z0-9]/gm, '_');
		if (oldValue != newValue) {
			form.setFieldValue(fieldName, newValue);
		}
	}
};

clientOn('_html,title.onChange', (form) => {
	removeWrongCharactersInField(form, 'title');
	const href =
		location.protocol +
		'//' +
		location.host +
		'/custom/html/' +
		form.fieldValue('title') +
		'.html';
	form.setFieldValue('link', href);

	const e: HTMLDivElement = form.base as HTMLDivElement;
	(e.querySelector('.clickable-link') as HTMLAnchorElement).href = href;
	(e.querySelector('.clickable-link-text') as HTMLAnchorElement).innerText = href;
});

clientOn('_users,passwordConfirm.onChange', (form) => {
	checkPasswordConfirmation(form);
});

/// #if DEBUG


const nodeTypeOnChange = (form) => {
	const nodeType = form.fieldValue('nodeType');

	if (nodeType === NODE_TYPE.DOCUMENT) {
		form.showField(
			'creationName',
			'singleName',
			'reverse',
			'draftable',
			'storeForms',
			'recPerPage',
			'data_storage_group',
			'appearance_group'
		);
		form.makeFieldRequired('singleName');
	} else {
		form.hideField(
			'creationName',
			'singleName',
			'reverse',
			'draftable',
			'storeForms',
			'recPerPage',
			'data_storage_group',
			'appearance_group'
		);
		form.makeFieldRequired('singleName', false);
	}

	if (nodeType === NODE_TYPE.DOCUMENT || nodeType === NODE_TYPE.REACT_CLASS) {
		form.makeFieldRequired('tableName');
		form.showField('tableName');
	} else {
		form.hideField('tableName');
		form.makeFieldRequired('tableName', false);
	}

	if (nodeType === NODE_TYPE.REACT_CLASS) {
		form.setFieldLabel('tableName', L('CLASS_NAME'));
		makeReactClassSelectionField(this, 'tableName');
	} else {
		form.setFieldLabel('tableName');
		removeReactClassSelectionField(this, 'tableName');
	}

	_nodes_recalculateFieldsVisibility(form);
};

clientOn('_nodes,nodeType.onChange', nodeTypeOnChange);

clientOn('_nodes,storeForms.onChange', nodeTypeOnChange);

clientOn('_fields,name.onChange', (form) => {
	removeWrongCharactersInField(form, 'fieldName');
	check12nFieldName(form);
});

clientOn('_fields,fieldType.onChange', (form) => {
	_fields_recalculateFieldsVisibility(form);
});

clientOn('_fields,storeInDb.onChange', (form) => {
	if (form.isFieldVisible('storeInDb')) {
		if (!form.fieldValue('storeInDb') || form.fieldValue('sendToServer')) {
			form.hideField('forSearch', 'unique');
		} else {
			form.showField('forSearch', 'unique');
		}
	}
});

clientOn('_fields,visibilityCreate.onChange', (form) => {
	let shv = form.fieldValue('show');

	if (form.fieldValue('visibilityCreate')) shv |= VIEW_MASK.EDITABLE;
	else shv &= VIEW_MASK.ALL - VIEW_MASK.EDITABLE;

	form.setFieldValue('show', shv);
});

clientOn('_fields,visibilityList.onChange', (form) => {
	let shv = form.fieldValue('show');

	if (form.fieldValue('visibilityList')) shv |= VIEW_MASK.LIST;
	else shv &= VIEW_MASK.ALL - VIEW_MASK.LIST;

	form.setFieldValue('show', shv);
});

clientOn('_fields,visibilityCustomList.onChange', (form) => {
	let shv = form.fieldValue('show');

	if (form.fieldValue('visibilityCustomList')) shv |= VIEW_MASK.CUSTOM_LIST;
	else shv &= VIEW_MASK.ALL - VIEW_MASK.CUSTOM_LIST;

	form.setFieldValue('show', shv);
});

clientOn('_fields,visibilityView.onChange', (form) => {
	let shv = form.fieldValue('show');
	if (form.fieldValue('visibilityView')) {
		shv |= VIEW_MASK.READONLY;
	} else {
		shv &= VIEW_MASK.ALL - VIEW_MASK.READONLY;
	}

	form.setFieldValue('show', shv);
});

clientOn('_fields,visibilityDropdownList.onChange', (form) => {
	let shv = form.fieldValue('show');
	if (form.fieldValue('visibilityDropdownList')) {
		shv |= VIEW_MASK.DROPDOWN_LIST;
	} else {
		shv &= VIEW_MASK.ALL - VIEW_MASK.DROPDOWN_LIST;
	}

	form.setFieldValue('show', shv);
});

clientOn('_fields,visibilitySubFormList.onChange', (form) => {
	let shv = form.fieldValue('show');
	if (form.fieldValue('visibilitySubFormList')) {
		shv |= VIEW_MASK.SUB_FORM;
	} else {
		shv &= VIEW_MASK.ALL - VIEW_MASK.SUB_FORM;
	}

	form.setFieldValue('show', shv);
});

clientOn('_fields,nodeRef.onChange', (form) => {
	check12nFieldName(form);
});

clientOn('_nodes,tableName.onChange', (form) => {
	removeWrongCharactersInField(form, 'tableName');
});
/// #endif

clientOn('_registration,passwordConfirm.onChange', (form) => {
	checkPasswordConfirmation(form);
});

clientOn('_registration,alreadyHaveAccountBtn.onClick', (_form) => {
	globals.Stage.showForm(NODE_ID.LOGIN);
});

clientOn('_login,signUpLinkBtn.onClick', (_form) => {
	globals.Stage.showForm(NODE_ID.REGISTRATION, 'new', undefined, true);
});

clientOn('_login,forgotPasswordButton.onClick', (_form) => {
	globals.Stage.showForm(NODE_ID.RESET_PASSWORD, 'new', undefined, true);
});

clientOn('_resetPassword,backToLogin.onClick', (_form) => {
	globals.Stage.showForm(NODE_ID.LOGIN);
});

const _fields_recalculateFieldsVisibility = (form:FormFull<TFieldsFieldsList>) => {
	const fieldType = form.fieldValue('fieldType');

	form.showField('maxLength', 'requirement', 'storeInDb', 'sendToServer', 'unique', 'forSearch');
	form.hideField(
		'multilingual',
		'nodeRef',
		'width',
		'height',
		'selectFieldName',
		'lookupIcon',
		'enum'
	);
	form.setFieldLabel('description');

	form.enableField('visibilityList');
	form.enableField('visibilityCustomList');
	form.enableField('visibilityDropdownList');
	form.enableField('visibilitySubFormList');
	form.enableField('storeInDb');
	form.enableField('sendToServer');
	form.enableField('unique');
	form.enableField('forSearch');

	if (fieldType === FIELD_TYPE.LOOKUP_N_TO_M) {
		form.getField('nodeRef').setLookupFilter('excludeIDs', [
			form.fieldValue('nodeFieldsLinker').id,
		]);
	} else {
		form.getField('nodeRef').setLookupFilter('excludeIDs', undefined);
	}
	switch (fieldType) {
	case FIELD_TYPE.STATIC_HTML_BLOCK:
		form.setFieldLabel('description', L('CONTENT'));
	case FIELD_TYPE.BUTTON:
	case FIELD_TYPE.TAB:
	case FIELD_TYPE.SPLITTER:
		form.hideField(
			'storageSettingSplitter',
			'maxLength',
			'sendToServer',
			'storeInDb',
			'requirement',
			'unique',
			'forSearch'
		);
		form.setFieldValue('sendToServer', 0);
		form.disableField('sendToServer');
		form.setFieldValue('storeInDb', 0);
		form.disableField('storeInDb');
		form.disableField('requirement');
		break;
	case FIELD_TYPE.LOOKUP_N_TO_M:
	case FIELD_TYPE.LOOKUP_1_TO_N:
		form.disableField('visibilityList');
		form.setFieldValue('visibilityList', 0);
		form.disableField('visibilityCustomList');
		form.setFieldValue('visibilityCustomList', 0);
		form.disableField('visibilityDropdownList');
		form.setFieldValue('visibilityDropdownList', 0);
		form.disableField('visibilitySubFormList');
		form.setFieldValue('visibilitySubFormList', 0);

		form.disableField('sendToServer');
		form.setFieldValue('sendToServer', 1);
		form.disableField('storeInDb');
		form.setFieldValue('storeInDb', 1);
		form.hideField('forSearch', 'requirement', 'unique');
	case FIELD_TYPE.LOOKUP:
		form.hideField('maxLength', 'unique');
		form.setFieldValue('unique', false);
		form.showField('nodeRef');
		break;

	case FIELD_TYPE.ENUM:
		form.showField('enum');
		form.hideField('maxLength');
		break;
	case FIELD_TYPE.HTML_EDITOR:
	case FIELD_TYPE.IMAGE:
		form.showField('width', 'height');
		form.hideField('maxLength');
		break;
	case FIELD_TYPE.BOOL:
	case FIELD_TYPE.DATE_TIME:
	case FIELD_TYPE.DATE:
	case FIELD_TYPE.COLOR:
	case FIELD_TYPE.FILE:
		form.hideField('maxLength');
		break;
	}

	if (form.isUpdateRecord) {
		form.disableField('fieldName');
		form.disableField('fieldType');
		form.disableField('nodeRef');
		form.disableField('nodeFieldsLinker');
		form.disableField('storeInDb');
		form.disableField('sendToServer');
	}

	if (fieldType === FIELD_TYPE.LOOKUP) {
		form.disableField('forSearch');
		form.setFieldValue('forSearch', 1);
	}

	if (fieldType === FIELD_TYPE.TEXT || fieldType === FIELD_TYPE.HTML_EDITOR) {
		form.showField('multilingual');
	} else {
		form.hideField('multilingual');
		form.setFieldValue('multilingual', false);
	}

	check12nFieldName(form);

	if (!form.fieldValue('sendToServer')) {
		form.disableField('storeInDb');
		form.setFieldValue('storeInDb', 0);
	}

	if (!form.fieldValue('storeInDb')) {
		form.disableField('forSearch');
		form.setFieldValue('forSearch', 0);
	}

	if (!form.fieldValue('forSearch')) {
		form.disableField('unique');
		form.setFieldValue('unique', 0);
	}

	form.makeFieldRequired('maxLength', form.isFieldVisible('maxLength'));
};

clientOn('_fields,storeInDb.onChange', (form) => {
	_fields_recalculateFieldsVisibility(form);
});

clientOn('_fields,sendToServer.onChange', (form) => {
	_fields_recalculateFieldsVisibility(form);
});

clientOn('_fields,forSearch.onChange', (form) => {
	_fields_recalculateFieldsVisibility(form);
});

clientOn('_login,signInBtn.onClick', (form) => {
	form.save();
});