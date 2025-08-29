import type { Filters} from '../utils';
import { attachGoogleLoginAPI, getData, getNode, getNodeData, goToHome, isAdmin, L, myAlert, showPrompt } from '../utils';
/// #if DEBUG
import { makeIconSelectionField } from '../admin/admin-utils';
/// #endif

import type { NodeDesc, RecordSubmitResult} from '../bs-utils';
import { FIELD_TYPE, LANGUAGE_ID_DEFAULT, NODE_ID, NODE_TYPE, VIEW_MASK } from '../bs-utils';
import type { LookupOneToManyFiled } from '../fields/field-15-one-to-many';
import { FormFull } from '../forms/form-full';
import { ENV } from '../main-frame';
import { R } from '../r';
import { iAdmin, User } from '../user';

let uiLanguageIsChanged;

class FormEvents extends FormFull {
	checkPasswordConfirmation() {
		const p = this.fieldValue('password');
		const p2 = this.fieldValue('passwordConfirm');
		if (p && p !== p2) {
			this.fieldAlert('passwordConfirm', L('PASS_NOT_MACH'));
		} else {
			this.fieldAlert('passwordConfirm');
		}
	}

	_users_onLoad() {
		if (!ENV.langs && this.isUserEdit) {
			this.hideField('language');
		}

		if (this.isUserEdit) {
			this.addLookupFilters('language', {
				isUILanguage: 1
			});
		}

		if (window.document.querySelector('#org-edit-link')!) {
			(window.document.querySelector('.field-container-id-63 input') as HTMLDivElement).style.width = '50%';
			if (this.fieldValue('_organizationId')) {
				(window.document.querySelector('.field-container-id-63 input') as HTMLDivElement).insertAdjacentHTML(
					'beforeend',
					'<a id="org-edit-link" class="clickable" style="display:block; color:#777; font-size:80%; float:right;" title="additional organization settings" href="#n/7/r/' +
						this.fieldValue('_organizationId').id +
						'/e">additional organization settings <p class="fa fa-wrench"></p></a>'
				);
			}
		}

		if (!iAdmin() && this.isUserEdit) {
			this.hideField('_userRoles');
		}
		if ((this.recId as number) < 4 && this.isUserEdit) {
			this.hideField('_userRoles');
		}

		this.disableField('_organizationId');

		if (!iAdmin()) {
			this.hideField('_organizationId');
		}

		const myName = this.fieldValue('name');

		if (!isAdmin() && this.isUserEdit) {
			this.disableField('email');
		}

		if (this.isUpdateRecord || this.isNewRecord) {
			this.addLookupFilters('_userRoles', {
				excludeIDs: [2, 3]
			});
		}

		if (this.isUpdateRecord) {
			this.header = L('EDIT_USER_PROFILE', myName);
			this.setFieldValue('password', 'nc_l4DFn76ds5yhg');
			this.setFieldValue('passwordConfirm', 'nc_l4DFn76ds5yhg');
			this.props.initialData.password = 'nc_l4DFn76ds5yhg';
		}

		if (this.isNewRecord) {
			this.hideField('mailing');
			this.hideField('_organizationId');
			this.setFieldValue('password', 'nc_l4DFn76ds5yhg');
			this.setFieldValue('passwordConfirm', 'nc_l4DFn76ds5yhg');
			this.props.initialData.password = 'nc_l4DFn76ds5yhg';
		}
	}

	_users_onSave() {
		this.checkPasswordConfirmation();
		const pass = this.fieldValue('password');
		if (pass.length < 6) {
			this.fieldAlert('password', L('PASS_LEN', 6));
		}

		if (User.currentUserData.id === this.fieldValue('id')) {
			let pLang = this.props.initialData.language;
			let nLang = this.currentData.language;
			if (pLang && pLang.hasOwnProperty('id')) {
				pLang = pLang.id;
			}
			if (nLang && nLang.hasOwnProperty('id')) {
				nLang = nLang.id;
			}
			uiLanguageIsChanged = nLang != pLang;
		}
	}

	_users_onAfterSave() {
		if (uiLanguageIsChanged) {
			showPrompt(L('RESTART_NOW')).then((isYes) => {
				if (isYes) {
					window.location.href = 'login';
				}
			});
		}
		if (this.recId === User.currentUserData.id) {
			User.currentUserData.avatar = this.fieldValue('avatar');
			User.instance.forceUpdate();
		}
	}

	_roles_onLoad() {
		this.getField('_userRoles').setLookupFilter('excludeIDs', [1, 2, 3]);
		if (this.recId === 2 || this.recId === 3) {
			this.hideField('_userRoles');
		}
	}

	_enums_onLoad() {
		this.getField('values').inlineEditable();
	}

	_nodes_recalculateFieldsVisibility() {
		if (!this.isNewRecord && this.fieldValue('nodeType') === NODE_TYPE.DOCUMENT) {
			this.showField('_fieldsId');
			this.showField('reverse');
			this.showField('defaultFilterId');
		} else {
			this.hideField('_fieldsId');
			this.hideField('reverse');
			this.hideField('defaultFilterId');
		}

		if (this.fieldValue('nodeType') === NODE_TYPE.STATIC_LINK) {
			this.showField('staticLink');
		} else {
			this.hideField('staticLink');
		}
	}

	/// #if DEBUG
	_nodes_onLoad() {
		if (this.isNewRecord || this.fieldValue('nodeType') !== NODE_TYPE.DOCUMENT) {
			this.hideField('fieldsTab');
			this.hideField('filtersTab');
		}

		makeIconSelectionField(this, 'icon');

		if (this.fieldValue('nodeType') !== NODE_TYPE.DOCUMENT) {
			this.hideField('defaultFilterId');
		} else if (this.isUpdateRecord) {
			this.addLookupFilters('defaultFilterId', {
				nodeFiltersLinker: this.recId
			});
		} else {
			if (!this.currentData.hasOwnProperty('storeForms')) {
				this.setFieldValue('storeForms', 1);
			}
		}

		this._nodes_recalculateFieldsVisibility();

		if (this.isUpdateRecord) {
			this.disableField('nodeType');
			this.disableField('storeForms');
			this.disableField('tableName');
		}

		if (this.isNewRecord) {
			if (!this.fieldValue('recPerPage')) {
				this.setFieldValue('recPerPage', 25);
			}
			this.hideField('_fieldsId');
		} else {
			this.addLookupFilters('_nodesId', 'excludeIDs', [this.recId]);
			this.addLookupFilters('nodeFields', 'n', 200);
		}
		this.addLookupFilters('_nodesId', 'nodeType', NODE_TYPE.SECTION);
		this.addLookupFilters('_fieldsId', {
			nodeFieldsLinker: this.recId,
			forSearch: 1
		});
	}

	_nodes_onSave() {
		if (this.fieldValue('nodeType') !== NODE_TYPE.DOCUMENT) {
			const name = this.fieldValue('name');
			this.setFieldValue('singleName', name);
			this.setFieldValue('storeForms', 0);
		} else {
			if (/[^a-zA-Z_0-9]/.test(this.fieldValue('tableName'))) {
				this.fieldAlert('tableName', L('LATIN_ONLY'));
			}

			if (this.fieldValue('tableName') == parseInt(this.fieldValue('tableName'))) {
				this.fieldAlert('tableName', L('NO_NUMERIC_NAME'));
			}
		}
	}

	_fieldsNameIsBad: boolean;

	async _fields_onLoad() {
		makeIconSelectionField(this, 'icon');

		const parentNodeVal = this.fieldValue('nodeFieldsLinker');
		let parentNode: NodeDesc;
		if (parentNodeVal) {
			parentNode = await getNode(parentNodeVal.id);
			if (!parentNode.storeForms) {
				this.setFieldValue('storeInDb', 0);
				this.disableField('storeInDb');
			}
		}

		if (this.isNewRecord) {
			if (isNaN(this.fieldValue('show'))) {
				this.setFieldValue('show', 5);
				this.setFieldValue('visibilityCreate', 1);
				this.setFieldValue('visibilityView', 1);
				this.setFieldValue('visibilityList', 1);
				this.setFieldValue('visibilityDropdownList', 0);
				this.setFieldValue('visibilitySubFormList', 1);

				this.setFieldValue('sendToServer', 1);
				this.setFieldValue('storeInDb', 1);
			}

			if (!this.fieldValue('prior')) {
				this.setFieldValue('prior', 1);
			}
		} else {
			if (this.fieldValue('show') & VIEW_MASK.EDITABLE) this.setFieldValue('visibilityCreate', 1);
			else this.setFieldValue('visibilityCreate', 0);

			if (this.fieldValue('show') & VIEW_MASK.READONLY) this.setFieldValue('visibilityView', 1);
			else this.setFieldValue('visibilityView', 0);

			if (this.fieldValue('show') & VIEW_MASK.LIST) this.setFieldValue('visibilityList', 1);
			else this.setFieldValue('visibilityList', 0);

			if (this.fieldValue('show') & VIEW_MASK.DROPDOWN_LIST) this.setFieldValue('visibilityDropdownList', 1);
			else this.setFieldValue('visibilityDropdownList', 0);

			if (this.fieldValue('show') & VIEW_MASK.SUB_FORM) this.setFieldValue('visibilitySubFormList', 1);
			else this.setFieldValue('visibilitySubFormList', 0);

			if (this.fieldValue('show') & VIEW_MASK.CUSTOM_LIST) this.setFieldValue('visibilityCustomList', 1);
			else this.setFieldValue('visibilityCustomList', 0);

			if (this.fieldValue('fieldType') === FIELD_TYPE.PICTURE || this.fieldValue('fieldType') === FIELD_TYPE.RICH_EDITOR) {
				this.setFieldValue('height', this.fieldValue('maxLength') % 10000);
				this.setFieldValue('width', Math.floor(this.fieldValue('maxLength') / 10000));
			}
		}

		this.addLookupFilters('nodeFieldsLinker', {
			nodeType: 2
		});
		this.addLookupFilters('nodeRef', {
			nodeType: 2,
			storeForms: 1
		});
		this.hideField('show');
	}

	check12nFieldName() {
		if (this.isNewRecord) {
			this._fieldsNameIsBad = false;

			const checkFieldExists = (fName, nodeId) => {
				const fieldsFilter: Filters = {
					fieldName: fName
				};
				if (this.fieldValue('fieldType') !== FIELD_TYPE.LOOKUP_NtoM) {
					fieldsFilter.nodeFieldsLinker = nodeId;
				}
				getNodeData(6, undefined, fieldsFilter).then((data) => {
					if (this._fieldsNameIsBad) return;
					if (data.items.length > 0) {
						if (this.fieldValue('fieldType') === FIELD_TYPE.LOOKUP_NtoM) {
							this.fieldAlert('fieldName', L('LOOKUP_NAME_NOT_UNIQUE'));
						} else {
							this.fieldAlert('fieldName', L('FLD_EXISTS'));
						}
						this._fieldsNameIsBad = true;
					} else {
						this.fieldAlert('fieldName', undefined, true);
					}
				});
			};

			const fn = this.fieldValue('fieldName');
			let nodeId = this.fieldValue('nodeFieldsLinker');
			if (nodeId && nodeId.id) {
				nodeId = nodeId.id;
			}
			let nodeRef = this.fieldValue('nodeRef');
			if (nodeRef && nodeRef.id) {
				nodeRef = nodeRef.id;
			}

			if (nodeId && fn && fn.length >= 3) {
				if (this.fieldValue('fieldType') === FIELD_TYPE.LOOKUP_1toN && nodeRef) {
					checkFieldExists(fn + 'Linker', nodeRef);
				} else {
					checkFieldExists(fn, nodeId);
				}
			}
		}
	}

	_fields_onSave() {
		const fieldType = this.fieldValue('fieldType');

		if (fieldType === FIELD_TYPE.LOOKUP || fieldType === FIELD_TYPE.LOOKUP_NtoM || fieldType === FIELD_TYPE.LOOKUP_1toN) {
			if (this.isFieldEmpty('nodeRef')) {
				this.fieldAlert('nodeRef', L('REQUIRED_FLD'));
			}
		}

		if (/[^a-zA-Z_0-9]/.test(this.fieldValue('fieldName'))) {
			this.fieldAlert('fieldName', L('LATIN_ONLY'));
		}

		if (this.fieldValue('fieldName') == parseInt(this.fieldValue('fieldName'))) {
			this.fieldAlert('fieldName', L('NO_NUMERIC_NAME'));
		}

		if (fieldType === FIELD_TYPE.PICTURE || fieldType === FIELD_TYPE.RICH_EDITOR) {
			if (!this.fieldValue('height')) {
				this.fieldAlert('height', L('REQUIRED_FLD'));
			}
			if (!this.fieldValue('width')) {
				this.fieldAlert('width', L('REQUIRED_FLD'));
			}
			const maxLength = Math.min(9999, this.fieldValue('height') || undefined) + (this.fieldValue('width') || undefined) * 10000;
			if (!isNaN(maxLength)) {
				this.setFieldValue('maxLength', maxLength);
			}
		}

		if (!this.fieldValue('maxLength')) {
			this.setFieldValue('maxLength', 0);
			if (fieldType === FIELD_TYPE.TEXT || fieldType === FIELD_TYPE.NUMBER || fieldType === FIELD_TYPE.PASSWORD) {
				this.fieldAlert('maxLength', L('REQUIRED_FLD'));
			}
		}

		if (this.isNewRecord) {
			if (this.isNewRecord && (!this.fieldValue('fieldName') || this.fieldValue('fieldName').length < 3)) {
				this.fieldAlert('fieldName', L('MIN_NAMES_LEN', 3));
			}
		} else {
			this.hideField('selectFieldName');
		}

		if (fieldType === FIELD_TYPE.STATIC_TEXT || fieldType === FIELD_TYPE.TAB || fieldType === FIELD_TYPE.BUTTON || fieldType === FIELD_TYPE.SPLITTER) {
			this.setFieldValue('storeInDb', 0);
		}
		if (this._fieldsNameIsBad) {
			this.fieldAlert('fieldName', L('FLD_EXISTS'));
		}
	}
	/// #endif

	_languages_onLoad() {
		if (this.recId === LANGUAGE_ID_DEFAULT) {
			this.disableField('isUILanguage');
		}
		if (this.isUpdateRecord) {
			this.disableField('code');
		} else if (this.editable) {
			this.header = R.span({ className: 'danger' }, L('NEW_LANGUAGE_WARNING'));
		}
	}

	_languages_onSave() {
		if (this.isNewRecord && !this.fieldValue('code')) {
			this.fieldAlert('code', L('REQUIRED_FLD'));
		}
	}

	_enums_onSave() {
		let ret;
		const exists = {};
		const valuesForms = (this.getField('values').fieldRef as LookupOneToManyFiled).inlineListRef.getSubForms();
		for (const form of valuesForms) {
			const val = form.fieldValue('value');
			if (exists[val]) {
				ret = true;
				form.fieldAlert('value', L('VALUE_EXISTS'));
			}
			exists[val] = true;
		}
		return ret;
	}

	_filters_onLoad() {
		this.addLookupFilters('nodeFiltersLinker', {
			filterId: 8,
			excludeIDs: [9]
		});
	}

	_login_onAfterSave(saveResult: RecordSubmitResult) {
		User.setUserData(saveResult.handlerResult);
		if (onCurdJSLogin) {
			onCurdJSLogin(saveResult.handlerResult);
		}
	}

	_registration_onSave() {
		this.checkPasswordConfirmation();
	}

	_registration_onAfterSave() {
		this.showMessageAboutEmailSent(L('REGISTRATION_EMAIL_SENT'));
		this.isPreventCloseFormAfterSave = true;
	}

	showMessageAboutEmailSent(txt) {
		myAlert(
			R.span(null, txt, R.div({ className: 'email-highlight' }, this.fieldValue('email'))),
			true,
			false,
			true,
			() => {
				crudJs.Stage.showForm(NODE_ID.LOGIN);
			},
			L('GO_TO_LOGIN')
		);
	}

	_resetPassword_onAfterSave() {
		this.showMessageAboutEmailSent(L('RESET_EMAIL_SENT'));
		this.isPreventCloseFormAfterSave = true;
	}

	_registration_onLoad() {
		this.setSaveButtonTitle(L('REGISTER'));
		this.hideCancelButton();
	}

	_login_onLoad() {
		this.hideFooter();
		if (this.hasField('socialLoginButtons') && ENV.clientOptions.googleSigninClientId) {
			/// #if DEBUG
			return;
			/// #endif
			//@ts-ignore
			window.onGoogleSignIn = (googleUser) => {
				const id_token = googleUser.getAuthResponse().id_token;
				this.setFieldValue('username', 'google-auth-sign-in');
				this.setFieldValue('password', id_token);
				this.save();
			};
			this.renderToField('socialLoginButtons', 'social-buttons', R.span(null, R.div({ className: 'g-signin2', 'data-onsuccess': 'onGoogleSignIn' })));
			attachGoogleLoginAPI(true);
		}
	}

	_resetPassword_onLoad() {
		this.hideCancelButton();
		const activationKey = this.filters.activationKey;
		const resetCode = this.filters.resetCode;
		if (activationKey || resetCode) {
			this.hideField('email');
			this.hideFooter();
			if (activationKey) {
				getData('api/activate', this.filters)
					.then((userSession) => {
						User.setUserData(userSession);
						goToHome();
					})
					.catch((er) => {});
			} else {
				getData('api/reset', this.filters)
					.then((userSession) => {
						User.setUserData(userSession);
						crudJs.Stage.showForm(NODE_ID.USERS, userSession.id, { tab: 'passwordTab' }, true);
					})
					.catch((er) => {});
			}
		}
	}

	_enum_values_onLoad() {
		if (this.isNewRecord && this.props.parentForm) {
			let maxEnumVal = 0;
			for (const item of this.props.parentForm.getBackupData()) {
				if (item.value > maxEnumVal) {
					maxEnumVal = item.value;
				}
			}
			this.setFieldValue('value', maxEnumVal + 1);
		}
	}

	//_insertNewHandlersHere_
}

export { FormEvents };
