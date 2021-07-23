import {iAdmin} from "../user.js";
import {getNodeData, L, myPromt} from "../utils.js";

var formsEventsOnLoad = {};
var formsEventsOnSave = {};


















formsEventsOnLoad[13] = function () { //form13onloadBegin_JS89DW72SISA887QKJ32IUSL
	if(this.rec_update) {
		this.disableField('title');
		this.hideField('title');
	} else if(!this.rec_creation) {
		this.hideField('title');
	}
	this.disableField('help');

	if(!isUserHaveRole(0) && !isUserHaveRole(4)) {
		$('#rec_header').parent().parent().hide();
		this.hideField('help');
		this.hideField('name');
	}
} //form13onloadEnd_JS89DW72SISA887QKJ32IUSL



formsEventsOnLoad[15] = function () { //form15onloadBegin_JS89DW72SISA887QKJ32IUSL
	this.getField("values").inlineEditable();
} //form15onloadEnd_JS89DW72SISA887QKJ32IUSL

formsEventsOnLoad[85] = function () { //form85onloadBegin_JS89DW72SISA887QKJ32IUSL
	this.hideField("data");
	this.hideField("preview");
	this.hideFooter();

	this.focusField("name");
} //form85onloadEnd_JS89DW72SISA887QKJ32IUSL







formsEventsOnLoad[5] = function _users_onload() {//form5onloadBegin_JS89DW72SISA887QKJ32IUSL

const isHiddenField = (fn) => {
  if(this.fieldValue(fn) === 'hidden_91d2g7') {
    this.hideField(fn);
  }
}

if($('#org-edit-link').length === 0) {
  $('.fc-63 input').css('width', '50%');
  if(this.fieldValue('_organID')) {
    $('.fc-63 input').after(
      '<a id="org-edit-link" class="clickable" style="display:block; color:#777; font-size:80%; float:right;" title="additional organisation settings" href="#n/7/r/' +
      this.fieldValue('_organID').id +
      '/e">additional organisation settings <p class="fa fa-wrench"></p></a>'
    );
  }
}

if(!iAdmin()) {
  this.hideField('_userroles');
}

this.disableField('_organID');

if(!iAdmin()) {
  this.hideField('_organID');
}

var myname = this.fieldValue('name');


if(!isUserHaveRole(1)) {
  this.disableField('email');
}

if(this.rec_update || this.rec_creation) {
  this.addLookupFilters('_userroles', {
    exludeIDs: [2, 3]
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
  this.header = 'Edit user\'s profile ' + myname;
  this.setFieldValue('PASS', 'nc_l4DFn76ds5yhg');
  this.setFieldValue('passconfirm', 'nc_l4DFn76ds5yhg');
  this.props.initialData.PASS = 'nc_l4DFn76ds5yhg';
}

if(this.rec_creation) {
  this.hideField('mailing');
  this.hideField('PHONE');
  //this.hideField('desc');
  this.hideField('_organID');
  this.header = ('Registration:');
  this.setFieldValue('PASS', 'nc_l4DFn76ds5yhg');
  this.setFieldValue('passconfirm', 'nc_l4DFn76ds5yhg');
  this.props.initialData.PASS = 'nc_l4DFn76ds5yhg';
}
} //form5onloadEnd_JS89DW72SISA887QKJ32IUSL

formsEventsOnSave[5] = function _users_onsave() {//form5onsaveBegin_JS89DW72SISA887QKJ32IUSL
var pass = this.fieldValue('PASS');

if(pass.length < 6) {
  this.fieldAlert('PASS', L('PASS_LEN', 6));
}


if(pass != this.fieldValue('passconfirm')) {
  this.fieldAlert('passconfirm', L('PASS_NOT_MACH'));
}

if(curentUserData.id === this.fieldValue('id')) {
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
      myPromt(L('RESTARTNOW'), () => {
        location = 'login';
      });
    };
  }
}
} //form5onsaveEnd_JS89DW72SISA887QKJ32IUSL

formsEventsOnLoad[8] = function _roles_onload() {//form8onloadBegin_JS89DW72SISA887QKJ32IUSL
if((this.rec_ID === 2) || (this.rec_ID === 3)) {
  this.hideField('_userroles');
}

} //form8onloadEnd_JS89DW72SISA887QKJ32IUSL

formsEventsOnLoad[52] = function _enums_onload() {//form52onloadBegin_JS89DW72SISA887QKJ32IUSL
this.getField("values").inlineEditable();
} //form52onloadEnd_JS89DW72SISA887QKJ32IUSL

formsEventsOnLoad[4] = function _nodes_onload() {//form4onloadBegin_JS89DW72SISA887QKJ32IUSL
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

this.addLookupFilters('_nodesID', 'isDoc', 0);
this.addLookupFilters('_fieldsID', {
  node_fields_linker: this.rec_ID,
  forSearch: 1
});

} //form4onloadEnd_JS89DW72SISA887QKJ32IUSL

formsEventsOnSave[4] = function _nodes_onsave() {//form4onsaveBegin_JS89DW72SISA887QKJ32IUSL

	if(!this.fieldValue("isDoc")) {
		var v = this.fieldValue("name");
		var v2 = this.fieldValue("singleName");
		if(v && !v2)
			this.setFieldValue("singleName", v);
		if(!v && v2)
			this.setFieldValue("name", v2);
	}

} //form4onsaveEnd_JS89DW72SISA887QKJ32IUSL

formsEventsOnLoad[6] = function _fields_onload() {//form6onloadBegin_JS89DW72SISA887QKJ32IUSL

	this.getField('fieldType').fieldRef.setFilterValues([16]);

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

	$('.fc-22').css({
		width: '6%'
	});
	$('.fc-23').css({
		width: '6%'
	});
	$('.fc-24').css({
		width: '6%'
	});
	$('.fc-318').css({
		width: '6%'
	});
	$('.fc-357').css({
		width: '6%'
	});

	this.check12nFieldName = () => {
		if(this.rec_creation) {
			this.nameIsBad = false;

			var checkFieldExists = (fName, nodeId) => {
				getNodeData(6, undefined, (data) => {
					if(this.nameIsBad) return;
					if(data.items.length > 0) {
						this.fieldAlert('fieldName', L('FLD_EXISTS'));
						this.nameIsBad = true;
					} else {
						this.fieldAlert('fieldName', '', true);
					}
				}, {
					fieldName: fName,
					node_fields_linker: nodeId
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
				}
				checkFieldExists(fn, nodeId);
			}
		}
	};

} //form6onloadEnd_JS89DW72SISA887QKJ32IUSL

formsEventsOnSave[6] = function _fields_onsave() {//form6onsaveBegin_JS89DW72SISA887QKJ32IUSL
	var fieldType = this.fieldValue("fieldType");

	if(fieldType === FIELD_7_Nto1 || fieldType === FIELD_14_NtoM || fieldType === FIELD_15_1toN) {
		if(this.isFieldEmpty('nodeRef')) {
			this.fieldAlert('nodeRef', L('REQUIRED_FLD'));
		}
	}

	if(/[^a-zA-Z_0-9]/.test(this.fieldValue('fieldName'))) {
		this.fieldAlert('fieldName', L('LATIN_ONLY'));
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
	if(this.nameIsBad) {
		this.fieldAlert('fieldName', L('FLD_EXISTS'));
	}
} //form6onsaveEnd_JS89DW72SISA887QKJ32IUSL

formsEventsOnLoad[12] = function _languages_onload() {//form12onloadBegin_JS89DW72SISA887QKJ32IUSL
	if(this.rec_update) {
		this.disableField("code");
	}
} //form12onloadEnd_JS89DW72SISA887QKJ32IUSL

formsEventsOnLoad[82] = function my_records_onload() {//form82onloadBegin_JS89DW72SISA887QKJ32IUSL
	12
} //form82onloadEnd_JS89DW72SISA887QKJ32IUSL

//insertNewhandlersHere_adsqw09

export {
	formsEventsOnLoad,
	formsEventsOnSave
};