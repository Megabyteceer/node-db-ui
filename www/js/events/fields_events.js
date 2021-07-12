import {L} from "../utils.js";

var fieldsEvents={};


		
	fieldsEvents[20] = function() {//field20onchangebegin_cswhggft
if(this.fieldValue("fieldType")==FIELD_8_STATICTEXT){
	this.hideField("maxlen");
	this.hideField("nostore");
	this.hideField("name");
	this.hideField("requirement");
	this.hideField("uniqu");
	this.hideField("forSearch");
	this.setFieldLabel("fdescription", L("CONTENT"));
}else{
	this.showField("maxlen");
	this.showField("nostore");
	this.showField("name");
	this.showField("requirement");
	this.showField("uniqu");
	this.showField("forSearch");
	this.setFieldLabel("fdescription", L("FLD_DESC"));
}
this.hideField("selectFieldName");
if(((this.fieldValue("fieldType")==FIELD_7_Nto1)||
    (this.fieldValue("fieldType")==FIELD_14_NtoM)||
    (this.fieldValue("fieldType")==FIELD_15_1toN))){
	this.hideField("maxlen");
	this.hideField("uniqu");
	this.setFieldValue("uniqu",0);
	this.showField("nodeRef");
} else {
	this.hideField("nodeRef");
}

if(this.fieldValue("fieldType")==FIELD_6_ENUM){
 this.showField('enum');
} else {
 this.hideField('enum')
}

if(this.fieldValue("fieldType") === FIELD_1_TEXT || this.fieldValue("fieldType")==FIELD_19_RICHEDITOR){
 this.showField('multilang');
} else {
 this.hideField('multilang');
 this.setFieldValue('multilang',false);
}

if(this.fieldValue("fieldType") == FIELD_12_PICTURE) {
  this.hideField("maxlen");
  this.hideField("nostore");
  this.hideField("clientOnly");
  this.hideField("forSearch");
  this.hideField("uniqu");
  this.showField("width");
  this.showField("height");
  this.setFieldValue('nostore', false);
  this.setFieldValue('clientOnly', false);
  this.setFieldValue('forSearch', false);
  this.setFieldValue('uniqu', false);
} else {
  this.showField("maxlen");
  this.showField("nostore");
  this.showField("clientOnly");
  this.showField("forSearch");
  this.showField("uniqu");
  this.hideField("width");
  this.hideField("height");
}


this.check12nFieldName();
	}//field20onchangeend_wqdggft
	
	
	fieldsEvents[22] = function() {//field22onchangebegin_cswhggft
var shv = this.fieldValue("show");

if (this.fieldValue("vis_create"))
  shv |= 1;
else
  shv &= (65535-1);

this.setFieldValue("show", shv);
	}//field22onchangeend_wqdggft
	
	fieldsEvents[23] = function() {//field23onchangebegin_cswhggft
var shv = this.fieldValue("show");

if (this.fieldValue("vis_list"))
  shv |= 2;
else
  shv &= (65535-2);

this.setFieldValue("show", shv);
	}//field23onchangeend_wqdggft
	
	fieldsEvents[24] = function() {//field24onchangebegin_cswhggft
var shv = this.fieldValue("show");
if (this.fieldValue("vis_view")){
	shv |= 4;
} else {
	shv &= (65535-4);
}

this.setFieldValue("show", shv);
	}//field24onchangeend_wqdggft
	
	
	
	fieldsEvents[30] = function() {//field30onchangebegin_cswhggft
if (this.fieldValue("isDoc")) {
  this.showField("tableName");
  this.showField("creationName");
  if (this.hasField('creationName_en')) {
	this.showField("creationName_en");
	this.showField("singleName_en");
  }
  this.showField("singleName");
  this.showField("captcha");
  this.showField("draftable");

  if (!this.rec_creation) {
	this.showField("_fieldsID");
  }
  
  if (!this.rec_update) {
	this.showField("createdon_field");
	this.showField("createUserFld");
	this.showField("createdby_field");
	this.showField("staticLink");
  }
  this.showField("recPerPage");
} else {
  this.hideField("tableName");
  this.hideField("creationName");
  if (this.hasField('creationName_en')) {
	  this.hideField("creationName_en");
	  this.hideField("singleName_en");
  }
  this.hideField("singleName");
  this.hideField("captcha");
  this.hideField("_fieldsID");
  this.hideField("draftable");
  this.hideField("createdon_field");
  this.hideField("createUserFld");
  this.hideField("createdby_field");
  this.hideField("staticLink");
  this.hideField("recPerPage");
}
	}//field30onchangeend_wqdggft


	fieldsEvents[39] = function() {//field39onchangebegin_cswhggft
var p = this.fieldValue('PASS');
var p2 = this.fieldValue('passconfirm');
if (p && (p !== p2)) {
	this.fieldAlert('passconfirm', L('PASSWORDS_NOT_M'));
} else {
	this.fieldAlert('passconfirm');
}
	}//field39onchangeend_wqdggft


	fieldsEvents[246] = function() {//field246onchangebegin_cswhggft
var pv = this.fieldValue('title');
if (pv) {
  var newv = pv.replace(/ /g,'_').replace(/[^0-9a-zA-Z_]/g,'');

  if(pv != newv) {
      this.setFieldValue('title', newv);
  }

}
this.setFieldValue('help', location.protocol+'//'+location.host+'/custom/html/'+newv+'.html');
	}//field246onchangeend_wqdggft



	fieldsEvents[32] = function() {//field32onchangebegin_cswhggft
if (this.fieldValue('nostore')) {
  this.hideField('forSearch');
  this.hideField('uniqu');
} else {
  this.showField('forSearch');
  this.showField('uniqu');
}
	}//field32onchangeend_wqdggft


	fieldsEvents[9] = function() {//field9onchangebegin_cswhggft
this.check12nFieldName();
	}//field9onchangeend_wqdggft



	fieldsEvents[318] = function() {//field318onchangebegin_cswhggft
var shv = this.fieldValue("show");
if (this.fieldValue("vis_reflist")){
	shv |= 8;
} else {
	shv &= (65535-8);
}

this.setFieldValue("show", shv);
	}//field318onchangeend_wqdggft

	fieldsEvents[357] = function() {//field357onchangebegin_cswhggft
var shv = this.fieldValue("show");

if (this.fieldValue("vis_list_custom"))
  shv |= 16;
else
  shv &= (65535-16);

this.setFieldValue("show", shv);
	}//field357onchangeend_wqdggft

	fieldsEvents[253] = function() {//field253onchangebegin_cswhggft

this.check12nFieldName();
	}//field253onchangeend_wqdggft
	//insertNewhandlersHere_adsqw09


export default fieldsEvents;