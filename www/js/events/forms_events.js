import {iAdmin} from "../user";
import {L} from "../utils";

var formsEventsOnLoad = {};
var formsEventsOnSave = {};

(function(){

	formsEventsOnLoad[4] = function(){//form4onloadBegin_hkasdhwdc
if(this.rec_update) {
  this.disableField('isDoc');
  this.disableField('tableName');
  this.hideField('createdby_field');
  this.hideField('createdon_field');
  this.hideField('createUserFld');
}

if(this.rec_creation){
  if(!this.fieldValue('recPerPage')){
	this.setFieldValue('recPerPage',25);
  }
  this.hideField('_fieldsID');
}

this.addLookupFilters('_nodesID','isDoc',0);
this.addLookupFilters('_fieldsID', {node_fields_linker: this.rec_ID, forSearch: 1});

	}//form4onloadEnd_hkasdhwdc


	formsEventsOnSave[4] = function(){//form4onsaveBegin_hkasdhwdc

if (!this.fieldValue("isDoc")) {
  var v = this.fieldValue("name");
  var v2 = this.fieldValue("singleName");
 if(v &&  !v2)
  this.setFieldValue("singleName",v);
 if(!v && v2)
  this.setFieldValue("name",v2);
}

	}//form4onsaveEnd_hkasdhwdc




	formsEventsOnLoad[5] = function(){//form5onloadBegin_hkasdhwdc
var self = this;
function isHiddenField(fn){
	if (self.fieldValue(fn)==='hidden_91d2g7') {
		self.hideField(fn); 
	}
}

if($('#org-edit-link').length === 0){
  $('.fc-63 input').css('width','50%');
  if (this.fieldValue('_organID')) {
    $('.fc-63 input').after(
      '<a id="org-edit-link" class="clickable" style="display:block; color:#777; font-size:80%; float:right;" title="additional organisation settings" href="#n/7/r/'+
      this.fieldValue('_organID').id+
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

var myname= this.fieldValue('name');


if (!isUserHaveRole(1)) {
	this.disableField('email');
}

if (this.rec_update || this.rec_creation) {
 this.addLookupFilters('_userroles', {exludeIDs: '2,3'}); 
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


if (this.rec_update) {
	this.header = 'Edit user\'s profile '+myname;
	this.setFieldValue('PASS', 'nc_l4DFn76ds5yhg');
	this.setFieldValue('passconfirm', 'nc_l4DFn76ds5yhg');
}

if (this.rec_creation) {
	this.hideField('mailing');
	this.hideField('PHONE');
	//this.hideField('desc');
	this.hideField('_organID');
	this.header = ( 'Registration:');
	this.setFieldValue('PASS', 'nc_l4DFn76ds5yhg');
	this.setFieldValue('passconfirm', 'nc_l4DFn76ds5yhg');
}
	}//form5onloadEnd_hkasdhwdc
	formsEventsOnSave[5] = function(){//form5onsaveBegin_hkasdhwdc
var pass = this.fieldValue('PASS');

if (pass.length < 6) {
	this.fieldAlert('PASS',L('PASS_LEN', 6));
}


if (pass != this.fieldValue('passconfirm')) {
	this.fieldAlert('passconfirm', L('PASS_NOT_MACH'));
}

if (curentUserData.id == this.fieldValue('id')) {
  var pLang = this.props.initialData.language;
  var nLang = this.currentData.language;
  if(pLang && pLang.hasOwnProperty('id')){
    pLang = pLang.id;
  }
  if(pLang && nLang.hasOwnProperty('id')){
    nLang = nLang.id;
  }
  if(nLang != pLang){
      this.onSaveCallback = function() {
        myPromt(L('RESTARTNOW'), function (){
          location = 'login.php'; 
        });
      };
  }
}
	}//form5onsaveEnd_hkasdhwdc
	
	
	
	formsEventsOnLoad[6] = function(){//form6onloadBegin_hkasdhwdc
if (this.rec_creation) {
  if (this.fieldValue("show")=="") {
	this.setFieldValue("show",5);
	this.setFieldValue("vis_create",1);
	this.setFieldValue("vis_view",1);
	this.setFieldValue("vis_list",0);
	this.setFieldValue("vis_reflist",0);
  }

  if(!this.fieldValue("prior")){
    this.setFieldValue("prior",1);
  }

} else {
  if (this.fieldValue("show") & 1)
	this.setFieldValue("vis_create",1)
  else
	this.setFieldValue("vis_create",0);

  if (this.fieldValue("show") & 4)
	this.setFieldValue("vis_view",1)
  else
	this.setFieldValue("vis_view",0);

  if (this.fieldValue("show") & 2)
	this.setFieldValue("vis_list",1)
  else
	this.setFieldValue("vis_list",0);

 if (this.fieldValue("show") & 8)
	this.setFieldValue("vis_reflist",1)
  else
	this.setFieldValue("vis_reflist",0);

if (this.fieldValue("show") & 16)
	this.setFieldValue("vis_list_custom",1)
  else
	this.setFieldValue("vis_list_custom",0);
  
  if(this.fieldValue("fieldType")==FIELD_12_PICTURE) {
    this.setFieldValue("height", this.fieldValue("maxlen")%10000);
    this.setFieldValue("width", Math.floor(this.fieldValue("maxlen")/10000));
  }
}

if (this.rec_update) {
	this.disableField("fieldName");
	this.disableField("fieldType");
	this.disableField("nodeRef");
	this.disableField("node_fields_linker");
	this.disableField("nostore");
	this.disableField("clientOnly");
}

this.addLookupFilters('node_fields_linker', {isDoc: 1});
this.addLookupFilters('nodeRef', {isDoc: 1});
this.hideField("prior");
this.hideField("show");

$('.fc-22').css({width:'6%'});
$('.fc-23').css({width:'6%'});
$('.fc-24').css({width:'6%'});
$('.fc-318').css({width:'6%'});
$('.fc-357').css({width:'6%'});

this.check12nFieldName = function() {
	if (this.rec_creation) {
		this.nameIsBad = false;
		
		var checkFieldExists = function(fName, nodeId) {
			getNodeData(6,undefined,function(data) {
				if(this.nameIsBad) return;
				if(data.items.length > 0) {
					this.fieldAlert('fieldName', L('FLD_EXISTS'));
					this.nameIsBad = true;
				} else {
					this.fieldAlert('fieldName', L('FLD_CORRECT'), true);
				}
			}.bind(this) ,{fieldName:fName, node_fields_linker:nodeId});
		}.bind(this);
		
		var fn = this.fieldValue('fieldName');
		var nodeId = this.fieldValue('node_fields_linker');
		if(nodeId && nodeId.id) {
			nodeId = nodeId.id;
		}
		var nodeRef = this.fieldValue('nodeRef');
		if(nodeRef && nodeRef.id){
			nodeRef = nodeRef.id; 
		}
		
		if(nodeId && fn && fn.length >=3) {
			if ((this.fieldValue("fieldType") == FIELD_15_1toN) && nodeRef) {
				checkFieldExists(fn + '_linker', nodeRef);
			}
			checkFieldExists(fn, nodeId);
		}
	}
}.bind(this);

	}//form6onloadEnd_hkasdhwdc
	formsEventsOnSave[6] = function(){//form6onsaveBegin_hkasdhwdc
var fieldType = this.fieldValue("fieldType");


if(/[^a-zA-Z_0-9]/.test(this.fieldValue('fieldName'))){
  this.fieldAlert('fieldName', L('LATIN_ONLY'));
}

if(this.fieldValue("fieldType")==FIELD_12_PICTURE) {
  this.setFieldValue("maxlen", Math.min(9999, this.fieldValue("height"))
  + this.fieldValue("width")*10000);
}

if (!this.fieldValue('maxlen')) {
	this.setFieldValue('maxlen',0);
	if((fieldType === FIELD_1_TEXT) || (fieldType == FIELD_2_INT) || (fieldType == FIELD_3_MONEY) || (fieldType == FIELD_9_EMAIL) || (fieldType == FIELD_10_PASSWORD) || (fieldType == FIELD_13_KEYWORDS) || (fieldType == FIELD_12_PICTURE))  {
		this.fieldAlert('maxlen', L('REQUIRED_FLD'));
	}
}




if (this.rec_creation) {

	if(this.rec_creation && (!this.fieldValue('fieldName') || (this.fieldValue('fieldName').length < 3))) {
	   this.fieldAlert('fieldName', L('MIN_NAMES_LEN', 3));
	}

} else {
  this.hideField('selectFieldName');
}

if((fieldType==FIELD_8_STATICTEXT)||(fieldType==FIELD_17_TAB)||(fieldType==FIELD_18_BUTTON)) {
	this.setFieldValue('nostore', true);
}
if (this.nameIsBad) {
	this.fieldAlert('fieldName', L('FLD_EXISTS'));
}
	}//form6onsaveEnd_hkasdhwdc
	


	formsEventsOnLoad[13] = function() {//form13onloadBegin_hkasdhwdc
if(this.rec_update){
  this.disableField('title');
  this.hideField('title');
} else if(!this.rec_creation) {
  this.hideField('title');
}
this.disableField('help');

if (!isUserHaveRole(0) && !isUserHaveRole(4)) {
  $('#rec_header').parent().parent().hide();
  this.hideField('help');
  this.hideField('name');
}
	}//form13onloadEnd_hkasdhwdc


	formsEventsOnLoad[8] = function() {//form8onloadBegin_hkasdhwdc
if ((this.rec_ID == 2)||(this.rec_ID == 3)) {
  this.hideField('_userroles');
}

	}//form8onloadEnd_hkasdhwdc



	formsEventsOnLoad[15] = function() {//form15onloadBegin_hkasdhwdc
this.getField("values").inlineEditable();
	}//form15onloadEnd_hkasdhwdc





	formsEventsOnLoad[85] = function() {//form85onloadBegin_hkasdhwdc
this.hideField("data");
this.hideField("preview");
this.hideFooter();

this.focusField("name");
	}//form85onloadEnd_hkasdhwdc





	formsEventsOnLoad[12] = function() {//form12onloadBegin_hkasdhwdc
if(this.rec_update){
 this.disableField("code"); 
}
	}//form12onloadEnd_hkasdhwdc


	formsEventsOnLoad[82] = function() {//form82onloadBegin_hkasdhwdc
//this.getField('subMessages').inlineEditable();
	}//form82onloadEnd_hkasdhwdc
	//insertNewhandlersHere_adsqw09
	
})();