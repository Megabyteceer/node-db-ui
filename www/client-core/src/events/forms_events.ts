import { attachGoogleLoginAPI, Filters, getData, getNode, getNodeData, goToHome, isAdmin, L, myAlert, showPrompt } from "../utils";
/// #if DEBUG
import { makeIconSelectionField } from "../admin/admin-utils";
/// #endif

import { FIELD_TYPE, LANGUAGE_ID_DEFAULT, NODE_ID, NODE_TYPE, NodeDesc, RecordSubmitResult, VIEW_MASK } from "../bs-utils";
import type { LookupOneToManyFiled } from "../fields/field-15-one-to-many";
import { EnumField } from "../fields/field-6-enum";
import { FormFull } from "../forms/form-full";
import { ENV } from "../main-frame";
import { R } from "../r";
import { iAdmin, User } from "../user";

let uiLanguageIsChanged;

class FormEvents extends FormFull {

	checkPasswordConfirmation() {
		var p = this.fieldValue('password');
		var p2 = this.fieldValue('password_confirm');
		if(p && (p !== p2)) {
			this.fieldAlert('password_confirm', L('PASS_NOT_MACH'));
		} else {
			this.fieldAlert('password_confirm');
		}
	}

	_users_onLoad() {

		if(!ENV.langs && this.isUserEdit) {
			this.hideField('language');
		}

		if(this.isUserEdit) {
			this.addLookupFilters('language', {
				isUILanguage: 1
			});
		}

		if(window.document.querySelector('#org-edit-link')!) {
			(window.document.querySelector('.field-container-id-63 input') as HTMLDivElement).style.width = '50%';
			if(this.fieldValue('_organization_id')) {
				(window.document.querySelector('.field-container-id-63 input') as HTMLDivElement).insertAdjacentHTML('beforeend',
					'<a id="org-edit-link" class="clickable" style="display:block; color:#777; font-size:80%; float:right;" title="additional organization settings" href="#n/7/r/' +
					this.fieldValue('_organization_id').id +
					'/e">additional organization settings <p class="fa fa-wrench"></p></a>'
				);
			}
		}

		if(!iAdmin() && this.isUserEdit) {
			this.hideField('_user_roles');
		}
		if((this.recId as number) < 4 && this.isUserEdit) {
			this.hideField('_user_roles');
		}

		this.disableField('_organization_id');

		if(!iAdmin()) {
			this.hideField('_organization_id');
		}

		var myName = this.fieldValue('name');


		if(!isAdmin() && this.isUserEdit) {
			this.disableField('email');
		}

		if(this.isUpdateRecord || this.isNewRecord) {
			this.addLookupFilters('_user_roles', {
				excludeIDs: [2, 3]
			});

		}

		if(this.isUpdateRecord) {
			this.header = L('EDIT_USER_PROFILE', myName);
			this.setFieldValue('password', 'nc_l4DFn76ds5yhg');
			this.setFieldValue('password_confirm', 'nc_l4DFn76ds5yhg');
			this.props.initialData.password = 'nc_l4DFn76ds5yhg';
		}

		if(this.isNewRecord) {
			this.hideField('mailing');
			this.hideField('_organization_id');
			this.setFieldValue('password', 'nc_l4DFn76ds5yhg');
			this.setFieldValue('password_confirm', 'nc_l4DFn76ds5yhg');
			this.props.initialData.password = 'nc_l4DFn76ds5yhg';
		}
	}

	_users_onSave() {

		this.checkPasswordConfirmation();
		var pass = this.fieldValue('password');
		if(pass.length < 6) {
			this.fieldAlert('password', L('PASS_LEN', 6));
		}

		if(User.currentUserData.id === this.fieldValue('id')) {
			var pLang = this.props.initialData.language;
			var nLang = this.currentData.language;
			if(pLang && pLang.hasOwnProperty('id')) {
				pLang = pLang.id;
			}
			if(nLang && nLang.hasOwnProperty('id')) {
				nLang = nLang.id;
			}
			uiLanguageIsChanged = nLang != pLang;
		}
	}

	_users_onAfterSave() {
		if(uiLanguageIsChanged) {
			showPrompt(L('RESTART_NOW')).then((isYes) => {
				if(isYes) {
					window.location.href = 'login';
				}
			});
		}
		if(this.recId === User.currentUserData.id) {
			User.currentUserData.avatar = this.fieldValue('avatar');
			User.instance.forceUpdate();
		}
	}

	_roles_onLoad() {
		this.getField('_user_roles').setLookupFilter('excludeIDs', [1, 2, 3]);
		if((this.recId === 2) || (this.recId === 3)) {
			this.hideField('_user_roles');
		}
	}

	_enums_onLoad() {
		this.getField("values").inlineEditable();
	}

	_nodes_recalculateFieldsVisibility() {
		if(!this.isNewRecord && (this.fieldValue("node_type") === NODE_TYPE.DOCUMENT)) {
			this.showField("_fields_id");
			this.showField("reverse");
			this.showField("default_filter_id");
		} else {
			this.hideField("_fields_id");
			this.hideField("reverse");
			this.hideField("default_filter_id");
		}

		if(this.fieldValue('node_type') === NODE_TYPE.STATIC_LINK) {
			this.showField('static_link');
		} else {
			this.hideField('static_link');
		}
	}

	/// #if DEBUG
	_nodes_onLoad() {
		if(this.isNewRecord || (this.fieldValue('node_type') !== NODE_TYPE.DOCUMENT)) {
			this.hideField('t_fields');
			this.hideField('t_filters');
		}

		makeIconSelectionField(this, 'icon');

		if(this.fieldValue('node_type') !== NODE_TYPE.DOCUMENT) {
			this.hideField('default_filter_id');
		} else if(this.isUpdateRecord) {
			this.addLookupFilters('default_filter_id', {
				node_filters_linker: this.recId
			});
		} else {
			this.setFieldValue('store_forms', 1);
		}

		this._nodes_recalculateFieldsVisibility();

		if(this.isUpdateRecord) {
			this.disableField('node_type');
			this.disableField('store_forms');
			this.disableField('table_name');
			this.disableField('add_created_by_filed');
			this.disableField('add_created_on_filed');
			this.disableField('add_creator_user_fld');
		}

		if(this.isNewRecord) {
			if(!this.fieldValue('rec_per_page')) {
				this.setFieldValue('rec_per_page', 25);
			}
			this.hideField('_fields_id');
		} else {
			this.addLookupFilters('_nodes_id', 'excludeIDs', [this.recId]);
			this.addLookupFilters('node_fields', 'n', 200);
		}
		this.addLookupFilters('_nodes_id', 'node_type', NODE_TYPE.SECTION);
		this.addLookupFilters('_fields_id', {
			node_fields_linker: this.recId,
			for_search: 1
		});
	}

	_nodes_onSave() {

		if(this.fieldValue("node_type") !== NODE_TYPE.DOCUMENT) {
			var name = this.fieldValue("name");
			this.setFieldValue("singleName", name);
			this.setFieldValue("store_forms", 0);
		}
		else {
			if(/[^a-zA-Z_0-9]/.test(this.fieldValue('table_name'))) {
				this.fieldAlert('table_name', L('LATIN_ONLY'));
			}

			if(this.fieldValue('table_name') == parseInt(this.fieldValue('table_name'))) {
				this.fieldAlert('table_name', L('NO_NUMERIC_NAME'));
			}
		}
	}

	_fieldsNameIsBad: boolean;

	async _fields_onLoad() {
		makeIconSelectionField(this, 'icon');

		let parentNodeVal = this.fieldValue('node_fields_linker');
		let parentNode: NodeDesc;
		if(parentNodeVal) {
			parentNode = await getNode(parentNodeVal.id);
			if(!parentNode.store_forms) {
				this.setFieldValue('store_in_db', 0);
				this.disableField('store_in_db');
			}
		}

		(this.getField('fieldType').fieldRef as EnumField).setFilterValues([FIELD_TYPE.RATING]); //TODO ratings is not implemented

		if(this.isNewRecord) {
			if(isNaN(this.fieldValue("show"))) {
				this.setFieldValue("show", 5);
				this.setFieldValue("visibility_create", 1);
				this.setFieldValue("visibility_view", 1);
				this.setFieldValue("visibility_list", 1);
				this.setFieldValue("visibility_dropdownList", 0);
				this.setFieldValue("visibility_subFormList", 1);

				this.setFieldValue("send_to_server", 1);
				this.setFieldValue("store_in_db", 1);
			}

			if(!this.fieldValue("prior")) {
				this.setFieldValue("prior", 1);
			}

		} else {
			if(this.fieldValue("show") & VIEW_MASK.EDITABLE)
				this.setFieldValue("visibility_create", 1)
			else
				this.setFieldValue("visibility_create", 0);

			if(this.fieldValue("show") & VIEW_MASK.READONLY)
				this.setFieldValue("visibility_view", 1)
			else
				this.setFieldValue("visibility_view", 0);

			if(this.fieldValue("show") & VIEW_MASK.LIST)
				this.setFieldValue("visibility_list", 1)
			else
				this.setFieldValue("visibility_list", 0);

			if(this.fieldValue("show") & VIEW_MASK.DROPDOWN_LIST)
				this.setFieldValue("visibility_dropdownList", 1)
			else
				this.setFieldValue("visibility_dropdownList", 0);

			if(this.fieldValue("show") & VIEW_MASK.SUB_FORM)
				this.setFieldValue("visibility_subFormList", 1)
			else
				this.setFieldValue("visibility_subFormList", 0);

			if(this.fieldValue("show") & VIEW_MASK.CUSTOM_LIST)
				this.setFieldValue("visibility_customList", 1)
			else
				this.setFieldValue("visibility_customList", 0);

			if(this.fieldValue("fieldType") === FIELD_TYPE.PICTURE || this.fieldValue("fieldType") === FIELD_TYPE.RICH_EDITOR) {
				this.setFieldValue("height", this.fieldValue("maxLength") % 10000);
				this.setFieldValue("width", Math.floor(this.fieldValue("maxLength") / 10000));
			}
		}

		this.addLookupFilters('node_fields_linker', {
			node_type: 2
		});
		this.addLookupFilters('node_ref', {
			node_type: 2,
			store_forms: 1
		});
		this.hideField("show");
	}

	check12nFieldName() {
		if(this.isNewRecord) {
			this._fieldsNameIsBad = false;

			var checkFieldExists = (fName, nodeId) => {
				let fieldsFilter: Filters = {
					fieldName: fName
				}
				if(this.fieldValue('fieldType') !== FIELD_TYPE.LOOKUP_NtoM) {
					fieldsFilter.node_fields_linker = nodeId;
				}
				getNodeData(6, undefined, fieldsFilter).then((data) => {
					if(this._fieldsNameIsBad) return;
					if(data.items.length > 0) {
						if(this.fieldValue('fieldType') === FIELD_TYPE.LOOKUP_NtoM) {
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

			var fn = this.fieldValue('fieldName');
			var nodeId = this.fieldValue('node_fields_linker');
			if(nodeId && nodeId.id) {
				nodeId = nodeId.id;
			}
			var node_ref = this.fieldValue('node_ref');
			if(node_ref && node_ref.id) {
				node_ref = node_ref.id;
			}

			if(nodeId && fn && fn.length >= 3) {
				if((this.fieldValue("fieldType") === FIELD_TYPE.LOOKUP_1toN) && node_ref) {
					checkFieldExists(fn + '_linker', node_ref);
				} else {
					checkFieldExists(fn, nodeId);
				}
			}
		}
	}

	_fields_onSave() {
		var fieldType = this.fieldValue("fieldType");

		if(fieldType === FIELD_TYPE.LOOKUP || fieldType === FIELD_TYPE.LOOKUP_NtoM || fieldType === FIELD_TYPE.LOOKUP_1toN) {
			if(this.isFieldEmpty('node_ref')) {
				this.fieldAlert('node_ref', L('REQUIRED_FLD'));
			}
		}

		if(/[^a-zA-Z_0-9]/.test(this.fieldValue('fieldName'))) {
			this.fieldAlert('fieldName', L('LATIN_ONLY'));
		}

		if(this.fieldValue('fieldName') == parseInt(this.fieldValue('fieldName'))) {
			this.fieldAlert('fieldName', L('NO_NUMERIC_NAME'));
		}

		if(fieldType === FIELD_TYPE.PICTURE || fieldType === FIELD_TYPE.RICH_EDITOR) {
			if(!this.fieldValue("height")) {
				this.fieldAlert("height", L('REQUIRED_FLD'));
			}
			if(!this.fieldValue("width")) {
				this.fieldAlert("width", L('REQUIRED_FLD'));
			}
			let maxLength = Math.min(9999, this.fieldValue("height") || undefined) + (this.fieldValue("width") || undefined) * 10000;
			if(!isNaN(maxLength)) {
				this.setFieldValue("maxLength", maxLength);
			}

		}

		if(!this.fieldValue('maxLength')) {
			this.setFieldValue('maxLength', 0);
			if((fieldType === FIELD_TYPE.TEXT) || (fieldType === FIELD_TYPE.NUMBER) || (fieldType === FIELD_TYPE.PASSWORD)) {
				this.fieldAlert('maxLength', L('REQUIRED_FLD'));
			}
		}

		if(this.isNewRecord) {

			if(this.isNewRecord && (!this.fieldValue('fieldName') || (this.fieldValue('fieldName').length < 3))) {
				this.fieldAlert('fieldName', L('MIN_NAMES_LEN', 3));
			}

		} else {
			this.hideField('select_field_name');
		}

		if((fieldType === FIELD_TYPE.STATIC_TEXT) ||
			(fieldType === FIELD_TYPE.TAB) ||
			(fieldType === FIELD_TYPE.BUTTON) ||
			(fieldType === FIELD_TYPE.SPLITTER)
		) {
			this.setFieldValue('store_in_db', 0);
		}
		if(this._fieldsNameIsBad) {
			this.fieldAlert('fieldName', L('FLD_EXISTS'));
		}
	}
	/// #endif

	_languages_onLoad() {
		if(this.recId === LANGUAGE_ID_DEFAULT) {
			this.disableField('isUILanguage');
		}
		if(this.isUpdateRecord) {
			this.disableField("code");
		} else if(this.editable) {
			this.header = R.span({ className: 'danger' }, L("NEW_LANGUAGE_WARNING"));
		}
	}

	_languages_onSave() {
		if(this.isNewRecord && !this.fieldValue('code')) {
			this.fieldAlert('code', L('REQUIRED_FLD'));
		}
	}

	_enums_onSave() {
		let ret;
		let exists = {};
		let valuesForms = (this.getField('values').fieldRef as LookupOneToManyFiled).inlineListRef.getSubForms();
		for(let form of valuesForms) {
			let val = form.fieldValue('value');
			if(exists[val]) {
				ret = true;
				form.fieldAlert('value', L('VALUE_EXISTS'));
			}
			exists[val] = true;
		}
		return ret;
	}

	_filters_onLoad() {
		this.addLookupFilters('node_filters_linker', {
			filterId: 8,
			excludeIDs: [9]
		});
	}

	_login_onAfterSave(saveResult: RecordSubmitResult) {
		User.setUserData(saveResult.handlerResult);
		if(window.onCurdJSLogin) {
			window.onCurdJSLogin(saveResult.handlerResult);
		}
	}

	_registration_onSave() {
		this.checkPasswordConfirmation();
	}

	_registration_onAfterSave() {
		this.showMessageAboutEmailSent(L("REGISTRATION_EMAIL_SENT"));
		this.isPreventCloseFormAfterSave = true;
	}

	showMessageAboutEmailSent(txt) {
		myAlert(R.span(null,
			txt,
			R.div({ className: 'email-highlight' },
				this.fieldValue("email")
			)), true, false, true,
			() => {
				window.crudJs.Stage.showForm(NODE_ID.LOGIN);
			},
			L('GO_TO_LOGIN')
		);
	}

	_resetPassword_onAfterSave() {
		this.showMessageAboutEmailSent(L("RESET_EMAIL_SENT"));
		this.isPreventCloseFormAfterSave = true;
	}

	_registration_onLoad() {
		this.setSaveButtonTitle(L('REGISTER'));
		this.hideCancelButton();
	}

	_login_onLoad() {
		this.hideFooter();
		if(this.hasField('socialLoginButtons') && ENV.clientOptions.googleSigninClientId) {
			/// #if DEBUG
			return;
			/// #endif
			//@ts-ignore
			window.onGoogleSignIn = (googleUser) => {
				var id_token = googleUser.getAuthResponse().id_token;
				this.setFieldValue('username', 'google-auth-sign-in');
				this.setFieldValue('password', id_token);
				this.save();
			}
			this.renderToField('socialLoginButtons', 'social-buttons',
				R.span(null,
					R.div({ className: "g-signin2", "data-onsuccess": "onGoogleSignIn" })
				)
			);
			attachGoogleLoginAPI(true);
		}
	}

	_resetPassword_onLoad() {
		this.hideCancelButton();
		let activationKey = this.filters.activationKey;
		let resetCode = this.filters.resetCode;
		if(activationKey || resetCode) {
			this.hideField('email');
			this.hideFooter();
			if(activationKey) {
				getData('api/activate', this.filters).then((userSession) => {
					User.setUserData(userSession);
					goToHome();
				}).catch((er) => {

				});
			} else {
				getData('api/reset', this.filters).then((userSession) => {
					User.setUserData(userSession);
					window.crudJs.Stage.showForm(NODE_ID.USERS, userSession.id, { tab: 't_pass' }, true);
				}).catch((er) => {

				});

			}
		}
	}

	_enum_values_onLoad() {
		if(this.isNewRecord && this.props.parentForm) {
			let maxEnumVal = 0;
			for(var item of this.props.parentForm.getBackupData()) {
				if(item.value > maxEnumVal) {
					maxEnumVal = item.value;
				}
			}
			this.setFieldValue('value', maxEnumVal + 1);
		}
	}

	//_insertNewHandlersHere_
}

export { FormEvents };
