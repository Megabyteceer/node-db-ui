import { Filters, getNodeData, isAdmin, L, myPromt } from "../utils";
import { makeIconSelectionField } from "../admin/admin-utils";
import { FIELD_10_PASSWORD, FIELD_12_PICTURE, FIELD_14_NtoM, FIELD_15_1toN, FIELD_17_TAB, FIELD_18_BUTTON, FIELD_19_RICHEDITOR, FIELD_1_TEXT, FIELD_2_INT, FIELD_7_Nto1, FIELD_8_STATICTEXT } from "../bs-utils";
import { FormFull } from "../forms/form-full";
import { iAdmin } from "../user";
import { User } from "../user";
import { EnumField } from "../fields/field-6-enum";
import { R } from "../r";

class FormEvents extends FormFull {

	async _users_onload() {

		const isHiddenField = (fn) => {
			if(this.fieldValue(fn) === 'hidden_91d2g7') {
				this.hideField(fn);
			}
		}

		if($('#org-edit-link').length === 0) {
			$('.field-container-id-63 input').css('width', '50%');
			if(this.fieldValue('_organID')) {
				$('.field-container-id-63 input').after(
					'<a id="org-edit-link" class="clickable" style="display:block; color:#777; font-size:80%; float:right;" title="additional organisation settings" href="#n/7/r/' +
					this.fieldValue('_organID').id +
					'/e">additional organisation settings <p class="fa fa-wrench"></p></a>'
				);
			}
		}

		if(!iAdmin()) {
			this.hideField('_userroles');
		}
		if(this.recId < 4) {
			this.hideField('_userroles');
		}

		this.disableField('_organID');

		if(!iAdmin()) {
			this.hideField('_organID');
		}

		var myname = this.fieldValue('name');


		if(!isAdmin()) {
			this.disableField('email');
		}

		if(this.rec_update || this.rec_creation) {
			this.addLookupFilters('_userroles', {
				excludeIDs: [2, 3]
			});
			this.hideField('public_phone');
			this.hideField('public_vk');
			this.hideField('public_fb');
			this.hideField('public_google');
			this.hideField('public_email');

		} else {
			isHiddenField('public_phone');
			isHiddenField('public_vk');
			isHiddenField('public_fb');
			isHiddenField('public_google');
			isHiddenField('public_email');

		}


		if(this.rec_update) {
			this.header = L('EDIT_USER_PROFILE', myname);
			this.setFieldValue('PASS', 'nc_l4DFn76ds5yhg');
			this.setFieldValue('passconfirm', 'nc_l4DFn76ds5yhg');
			this.props.initialData.PASS = 'nc_l4DFn76ds5yhg';
		}

		if(this.rec_creation) {
			this.hideField('mailing');
			this.hideField('PHONE');
			//this.hideField('desc');
			this.hideField('_organID');
			this.setFieldValue('PASS', 'nc_l4DFn76ds5yhg');
			this.setFieldValue('passconfirm', 'nc_l4DFn76ds5yhg');
			this.props.initialData.PASS = 'nc_l4DFn76ds5yhg';
		}
	}

	async _users_onsave() {
		var pass = this.fieldValue('PASS');

		if(pass.length < 6) {
			this.fieldAlert('PASS', L('PASS_LEN', 6));
		}

		if(pass != this.fieldValue('passconfirm')) {
			this.fieldAlert('passconfirm', L('PASS_NOT_MACH'));
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
			if(nLang != pLang) {
				this.onSaveCallback = () => {
					myPromt(L('RESTARTNOW')).then((isYes) => {
						if(isYes) {
							window.location.href = 'login';
						}
					});
				}
			}
		}
	}

	async _roles_onload() {
		this.getField('_userroles').setLookupFilter('excludeIDs', [1, 2, 3]);
		if((this.recId === 2) || (this.recId === 3)) {
			this.hideField('_userroles');
		}
	}

	async _enums_onload() {
		this.getField("values").inlineEditable();
	}

	async _nodes_onload() {
		makeIconSelectionField(this, 'icon');

		if(this.rec_update) {
			this.disableField('isDoc');
			this.disableField('tableName');
			this.hideField('createdby_field');
			this.hideField('createdon_field');
			this.hideField('createUserFld');
		}

		if(this.rec_creation) {
			if(!this.fieldValue('recPerPage')) {
				this.setFieldValue('recPerPage', 25);
			}
			this.hideField('_fieldsID');
		}
		if(!this.rec_creation) {
			this.addLookupFilters('_nodesID', 'excludeIDs', [this.recId]);
		}
		this.addLookupFilters('_nodesID', 'isDoc', 0);
		this.addLookupFilters('_fieldsID', {
			node_fields_linker: this.recId,
			forSearch: 1
		});
	}

	async _nodes_onsave() {

		if(!this.fieldValue("isDoc")) {
			var name = this.fieldValue("name");
			this.setFieldValue("singleName", name);
		}
		else {
			if(/[^a-zA-Z_0-9]/.test(this.fieldValue('tableName'))) {
				this.fieldAlert('tableName', L('LATIN_ONLY'));
			}

			if(this.fieldValue('tableName') == parseInt(this.fieldValue('tableName'))) {
				this.fieldAlert('tableName', L('NO_NUMERIC_NAME'));
			}
		}

	}

	_fieldsNameIsBad: boolean;

	async _fields_onload() {

		(this.getField('fieldType').fieldRef as EnumField).setFilterValues([16]);

		if(this.rec_creation) {
			if(isNaN(this.fieldValue("show"))) {
				this.setFieldValue("show", 5);
				this.setFieldValue("vis_create", 1);
				this.setFieldValue("vis_view", 1);
				this.setFieldValue("vis_list", 1);
				this.setFieldValue("vis_reflist", 0);
			}

			if(!this.fieldValue("prior")) {
				this.setFieldValue("prior", 1);
			}

		} else {
			if(this.fieldValue("show") & 1)
				this.setFieldValue("vis_create", 1)
			else
				this.setFieldValue("vis_create", 0);

			if(this.fieldValue("show") & 4)
				this.setFieldValue("vis_view", 1)
			else
				this.setFieldValue("vis_view", 0);

			if(this.fieldValue("show") & 2)
				this.setFieldValue("vis_list", 1)
			else
				this.setFieldValue("vis_list", 0);

			if(this.fieldValue("show") & 8)
				this.setFieldValue("vis_reflist", 1)
			else
				this.setFieldValue("vis_reflist", 0);

			if(this.fieldValue("show") & 16)
				this.setFieldValue("vis_list_custom", 1)
			else
				this.setFieldValue("vis_list_custom", 0);

			if(this.fieldValue("fieldType") === FIELD_12_PICTURE || this.fieldValue("fieldType") === FIELD_19_RICHEDITOR) {
				this.setFieldValue("height", this.fieldValue("maxlen") % 10000);
				this.setFieldValue("width", Math.floor(this.fieldValue("maxlen") / 10000));
			}
		}

		if(this.rec_update) {
			this.disableField("fieldName");
			this.disableField("fieldType");
			this.disableField("nodeRef");
			this.disableField("node_fields_linker");
			this.disableField("nostore");
			this.disableField("clientOnly");
		}

		this.addLookupFilters('node_fields_linker', {
			isDoc: 1
		});
		this.addLookupFilters('nodeRef', {
			isDoc: 1
		});
		this.hideField("prior");
		this.hideField("show");

		$('.field-container-id-22').css({
			width: '6%'
		});
		$('.field-container-id-23').css({
			width: '6%'
		});
		$('.field-container-id-24').css({
			width: '6%'
		});
		$('.field-container-id-318').css({
			width: '6%'
		});
		$('.field-container-id-357').css({
			width: '6%'
		});
	}

	check12nFieldName() {
		if(this.rec_creation) {
			this._fieldsNameIsBad = false;

			var checkFieldExists = (fName, nodeId) => {
				let fieldsFilter: Filters = {
					fieldName: fName
				}
				if(this.fieldValue('fieldType') !== FIELD_14_NtoM) {
					fieldsFilter.node_fields_linker = nodeId;
				}
				getNodeData(6, undefined, fieldsFilter).then((data) => {
					if(this._fieldsNameIsBad) return;
					if(data.items.length > 0) {
						if(this.fieldValue('fieldType') === FIELD_14_NtoM) {
							this.fieldAlert('fieldName', L('LOOKUP_NAME_NOT_UNIC'));
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
			var nodeRef = this.fieldValue('nodeRef');
			if(nodeRef && nodeRef.id) {
				nodeRef = nodeRef.id;
			}

			if(nodeId && fn && fn.length >= 3) {
				if((this.fieldValue("fieldType") === FIELD_15_1toN) && nodeRef) {
					checkFieldExists(fn + '_linker', nodeRef);
				} else {
					checkFieldExists(fn, nodeId);
				}
			}
		}
	}

	async _fields_onsave() {
		var fieldType = this.fieldValue("fieldType");

		if(fieldType === FIELD_7_Nto1 || fieldType === FIELD_14_NtoM || fieldType === FIELD_15_1toN) {
			if(this.isFieldEmpty('nodeRef')) {
				this.fieldAlert('nodeRef', L('REQUIRED_FLD'));
			}
		}

		if(/[^a-zA-Z_0-9]/.test(this.fieldValue('fieldName'))) {
			this.fieldAlert('fieldName', L('LATIN_ONLY'));
		}

		if(this.fieldValue('fieldName') == parseInt(this.fieldValue('fieldName'))) {
			this.fieldAlert('fieldName', L('NO_NUMERIC_NAME'));
		}

		if(fieldType === FIELD_12_PICTURE || fieldType === FIELD_19_RICHEDITOR) {
			if(!this.fieldValue("height")) {
				this.fieldAlert("height", L('REQUIRED_FLD'));
			}
			if(!this.fieldValue("width")) {
				this.fieldAlert("width", L('REQUIRED_FLD'));
			}
			let maxlen = Math.min(9999, this.fieldValue("height") || undefined) + (this.fieldValue("width") || undefined) * 10000;
			if(!isNaN(maxlen)) {
				this.setFieldValue("maxlen", maxlen);
			}

		}

		if(!this.fieldValue('maxlen')) {
			this.setFieldValue('maxlen', 0);
			if((fieldType === FIELD_1_TEXT) || (fieldType === FIELD_2_INT) || (fieldType === FIELD_10_PASSWORD)) {
				this.fieldAlert('maxlen', L('REQUIRED_FLD'));
			}
		}

		if(this.rec_creation) {

			if(this.rec_creation && (!this.fieldValue('fieldName') || (this.fieldValue('fieldName').length < 3))) {
				this.fieldAlert('fieldName', L('MIN_NAMES_LEN', 3));
			}

		} else {
			this.hideField('selectFieldName');
		}

		if((fieldType === FIELD_8_STATICTEXT) || (fieldType === FIELD_17_TAB) || (fieldType === FIELD_18_BUTTON)) {
			this.setFieldValue('nostore', true);
		}
		if(this._fieldsNameIsBad) {
			this.fieldAlert('fieldName', L('FLD_EXISTS'));
		}
	}

	async _languages_onload() {
		if(this.rec_update) {
			this.disableField("code");
		} else if(this.editable) {
			this.header = R.span({ className: 'danger' }, L("NEW_LANGUAGE_WARNING"));
		}
	}

	async _enums_onsave() {
		//TODO check if all values unique
	}

	//_insertNewHandlersHere_
}

export { FormEvents };