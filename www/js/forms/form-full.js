

import constants from "../custom/consts.js";
import FieldWrap from "../fields/field-wrap.js";
import {iAdmin} from "../user.js";
import {consoleLog, L, renderIcon} from "../utils.js";
import BaseForm from "./form-mixins.js";
import FormTab from "./form-tab.js";

var style = {
	marginBottom:7
}


var backupCallback;
function tryBackup() {
	if(backupCallback){
		backupCallback();
	}
}
window.addEventListener('unload', tryBackup);
setInterval(tryBackup, 15000);

function callForEachField(fildRefs, data, functionName, onComplete){
	var isInvalidForm = false;
	var callbacksCount = 0;
	var waitingForCallbacks = false;
	for (var k in fildRefs) {
		var f = fildRefs[k];
		
		callbacksCount++;
		(function(){
			var imgFieldName = f.props.field.fieldName;
			
			f[functionName](function(newValue, isInvalid){
				if(typeof newValue !== 'undefined') {
					data[imgFieldName] = newValue;
				}
				callbacksCount--;
				if (waitingForCallbacks) {
					if (callbacksCount === 0) {
						modal.hide();
						onComplete(isInvalid);
					}
				} else {
					if(isInvalid){
						isInvalidForm = isInvalid;
					}
				}
			});
		})();
	}
	waitingForCallbacks = true;
	
	if(callbacksCount === 0) {
		onComplete(isInvalidForm);
	} else {
		myAlert(ReactDOM.span({},
			L('LOADING'),
			ReactDOM.br(),
			renderIcon('cog fa-spin fa-2x')
		),1,0,1,1);
	}
}


export default class FormFull extends BaseForm {
	constructor (props) {
		super(props);
		this.currentData = Object.assign({}, props.filters, props.initialData);
		this.componentDidUpdate();
	}

	componentDidUpdate() {
		super.componentDidUpdate();
		if (nextProps.initialData.id !== this.props.initialData.id) {
			this.replaceState({});
			this.resetFieldsProperties(true);
		}
		setTimeout(function(){
			this.callOnTabShowEvent(nextProps.filters.tab);
			this.timeout = null;
		}.bind(this), 0);

		if ((this.currentData.id !== nextProps.initialData.id) || (this.props.node !== nextProps.node) || (this.props.editable !== nextProps.editable)) {
			
			this.backupCurrentDataIfNeed();
			
			this.needCallOnload = true;
			this.showAllTabs = false;
			this.currentData = Object.assign(true,{}, nextProps.filters, nextProps.initialData);
			
			this.resendDataToFields();
		}
	}

	resetFieldsProperties(needCallOnload) {
		this.hiddenFields = {};
		this.disabledFields = {};
		this.currentTabName = -1;
		delete(this.onSaveCallback);
		this.needCallOnload = needCallOnload;
	}

	saveForm(callback, callbackInvalid) {
		if(this.props.editable){
			if(!callback){
				callback = function(){};
			}
			this.saveClick('keepStatus', callback, callbackInvalid);
		}
	}

	callOnTabShowEvent(tabNameToShow) {
		if(this.currentTabName !== tabNameToShow) {
			this.currentTabName = tabNameToShow;
			var field;
			var flds = this.props.node.fields;
			for (var k in flds) {
				var f = flds[k];
				if (this.isVisibleField(f)) {
					if ((f.fieldType === FIELD_17_TAB) && (f.maxlen === 0)) {//tab
						if ((tabNameToShow === f.fieldName) || !tabNameToShow) {
							field = f;
							break;
						}
					}
				}
			}
			
			if (field && fieldsEvents.hasOwnProperty(field.id)) {
				this.processFormEvent(fieldsEvents[field.id], false, false);
			}
		}
	}

	hasField(fieldName) {
		return this.fieldsRefs.hasOwnProperty(fieldName)
	}

	getField(fieldName) {
		if(this.hasField(fieldName)) {
			return this.fieldsRefs[fieldName];
		} else {
			consoleLog('Unknown field: '+fieldName);
		}
	}

	setFieldLabel(fieldName, label) {
		this.getField(fieldName).setLabel(label);
	}

	hideField(fieldName) {
		var f = this.getField(fieldName);
		if(f && (this.hiddenFields[fieldName] !== 1)){
			this.hiddenFields[fieldName] = 1;
			f.hide();
		}
	}

	showField(fieldName) {
		if(this.hiddenFields[fieldName] === 1){
			delete(this.hiddenFields[fieldName]);
			this.getField(fieldName).show();
		}
	}

	hideFooter() {
		this.setState({footerHidden:true});
	}

	showFooter() {
		this.setState({footerHidden:false});
	}

	disableField(fieldName) {
		if(this.disabledFields[fieldName] !== 1){
			this.disabledFields[fieldName] = 1;
			var f = this.getField(fieldName);
			if (!f) {
				throw new Error('unknown field "'+fieldName+'"');
			}
			f.disable();
		}
	}

	enableField(fieldName) {
		if(this.disabledFields[fieldName] === 1){
			delete(this.disabledFields[fieldName]);
			this.getField(fieldName).enable();
		}
	}

	addLookupFilters(fieldName, filtersObjOrName, val) {
		this.getField(fieldName).setLookupFilter(filtersObjOrName,val);
	}

	focusField(fieldName) {
		this.getField(fieldName).focus();
	}

	onShow() {
/// #if DEBUG
		consoleLog('onLoad '+this.props.node.tableName);
/// #endif
		this.header = '';
		this.currentTabName = -1;
		this.hiddenFields = {};
		this.disabledFields = {};
		
		if (formsEventsOnLoad.hasOwnProperty(this.props.node.id)) {
			this.processFormEvent(formsEventsOnLoad[this.props.node.id], false);
		}
		
		this.refreshLeftBar();
		
		
		
		
		for (var k in this.fieldsRefs) {
			var f = this.fieldsRefs[k];
			
			if (f.props.field.fieldType!==FIELD_18_BUTTON && f.props.field.fieldType!==FIELD_17_TAB) { //is not button
				if (fieldsEvents.hasOwnProperty(f.props.field.id)) {
					this.processFormEvent(fieldsEvents[f.props.field.id], false);
				}
			}
		}
	
		var hdr = this.header;
		if (this.state.header !== hdr) {
			this.setState({header:hdr});
		}
		
		if (this.props.filters && this.props.filters.tab) {
			this.callOnTabShowEvent(this.props.filters.tab);
		}
	}

	refreshLeftBar() {
		if(!this.isSlave()){
			if ((typeof(this.currentData) !== 'array') && this.currentData.id && !this.showAllTabs) {
				var items = [this.currentData.name || L('NEW', this.props.node.singleName)];
				var isDefault = true;
				var fields = this.props.node.fields
				for (var k in fields) {
					var f = fields[k];
					
					if ((f.fieldType === FIELD_17_TAB) && (f.maxlen === 0)) {//tab
						
						if (this.isVisibleField(f)) {
							
							items.push({icon:f.icon, subheader:(f.fieldName.indexOf('header_')===0), name:f.name, field:f, form:this, id:false, isDoc:1, isDefault:isDefault, tabId:f.id, tab:f.fieldName});
							isDefault = false;
							
						}
						
					}
					
				}
			
				LeftBar.instance.setLeftBar(items);
			} else {
				LeftBar.instance.setLeftBar();
			}
		}
	}

	setFieldValue(fieldName, val, isUserAction) {
		
		var f = this.getField(fieldName);
		
		if(this.currentData[fieldName] !== val) {
			if (!isUserAction) {
				f.setValue(val);
			}
			var prev_value = this.currentData[fieldName];
			this.currentData[fieldName] = val;
			
			if (f && fieldsEvents.hasOwnProperty(f.props.field.id)) {
				this.processFormEvent(fieldsEvents[f.props.field.id], isUserAction, prev_value);
			}
/// #if DEBUG
			consoleLog('onChange '+fieldName+'; '+prev_value+' -> '+val);
/// #endif				
			
			if (fieldName === 'name') {
				this.refreshLeftBar();
			}
		}
	}

	fieldValue(fieldName) {
		return this.currentData[fieldName];
	}

	isFieldEmpty(fieldName) {
		var v = this.fieldValue(fieldName);
		if(Array.isArray(v)) {
			return v.length == 0;
		}
		if(v && v !== '0'){
			return false;
		}
		return this.getField(fieldName).isEmpty();
	}

	onSave() {
/// #if DEBUG
		consoleLog('onSave '+this.props.node.tableName);
/// #endif			
		
		for(var k in this.props.node.fields){
			if (this.hasField(k)) {//hide all alerts
				this.fieldAlert(this.props.node.fields[k].fieldName);
			}
		}
		
		this.invalidAlertInOnSaveHandler = false;
		if (formsEventsOnSave.hasOwnProperty(this.props.node.id)) {
			var onSaveRes = this.processFormEvent(formsEventsOnSave[this.props.node.id], false);
			if (onSaveRes) {
				//debugError('onSave event handler returned true. Saving operation was canceled.');
			}
			return  onSaveRes || this.invalidAlertInOnSaveHandler;
		}
		return false;
	}

	fieldAlert(fieldName, text, isSuccess, focus) {
		
		var f = this.getField(fieldName);
		if (f && f.props.parentCompactAreaName) {
			f = this.getField(f.props.parentCompactAreaName);
		}
		if (f) {
			f.fieldAlert(text, isSuccess, focus);
			
			if(text && !isSuccess && !this.invalidAlertInOnSaveHandler){
				this.getField(fieldName).focus();
			}
			
			if(!isSuccess){
				this.invalidAlertInOnSaveHandler = true;
			}
			
			
		}
	}

	processFormEvent(handler, isUserAction, prev_val) {
		
		this.prev_value = prev_val;
		
		this.rec_ID = this.props.initialData.id || 'new';
		this.rec_update = this.props.editable;

		
		if(this.rec_update) {
			this.rec_creation = !this.props.initialData.hasOwnProperty('id');
			if(this.rec_creation){
				this.rec_update = false;
			}
		}
		
		this.isUserEdit = isUserAction;
		
		return handler.call(this);
	}

	componentDidMount() {
		this.callOnTabShowEvent(this.props.filters.tab);
		this.recoveryBackupIfNeed();
		this.onShow();
		backupCallback = this.backupCurrentDataIfNeed;
	}

	componentDidUpdate() {
		if(this.needCallOnload){
			this.recoveryBackupIfNeed();
			this.onShow();
			delete(this.needCallOnload);
		}
	}

	recoveryBackupIfNeed() {
		if (!this.currentData.id && !this.props.inlineEditable) {
			var backup = getItem('backup_for_node'+this.props.node.id+(this.props.backupPrefix?this.props.backupPrefix:''));
			if (backup) {
				this.currentData = Object.assign(true, backup, this.filters);
				this.resendDataToFields();
			}
		}
	}

	prepareToBackup() {
		var fields = this.props.node.fields;
		for(var k in fields){
			var f = fields[k];
			if ((f.fieldType === FIELD_15_1toN) && this.isVisibleField(f)) {
				this.currentData[f.fieldName] = this.getField(f.fieldName).getBackupData();
			}
		}
	}

	backupCurrentDataIfNeed() {
		if (!this.currentData.id && !this.props.inlineEditable) {
			this.prepareToBackup();
			backupCreationData(this.props.node.id, this.currentData, this.props.backupPrefix);
		}
	}

	deteleBackup() {
		removeBackup(this.props.node.id, this.props.backupPrefix);
	}

	componentWillUnmount() {
		backupCallback = null;
		this.backupCurrentDataIfNeed();
	}

	resendDataToFields() {
		if (this.props.editable) {
			for (var k in this.fieldsRefs) {
				var f = this.fieldsRefs[k];
				f.setValue(this.currentData[k]||'');
			}
		}
	}

	forceBouncingTimeout() {
		for (var k in this.fieldsRefs) {
			var f = this.fieldsRefs[k];
			f.forceBouncingTimeout();
		}
	}

	validate(callback) { //TODO: validate
		if(this.onSave()) {
			callback(false);
			return;
		}
		
		var formIsValid = true;
		var callbacksCount = 1; //one fake call
		var onFieldValidated = function(isValid) {
			if (!isValid) {
				formIsValid = false;
			}
			callbacksCount--;
			if (callbacksCount == 0) {
				callback(formIsValid);
			}
		}
		for (var k in this.fieldsRefs) {
			var fieldRef = this.fieldsRefs[k];
			var field = fieldRef.props.field;

			if (this.props.overrideOrderData >= 0 && field.fieldName==='order') {
				this.currentData[field.fieldName] = this.props.overrideOrderData;
			}

			var val = this.currentData[field.fieldName];
			
			if ((field.requirement === '1') && (!val && val !== 0) && field.fieldType != FIELD_17_TAB) {
				this.fieldAlert(field.fieldName, L('REQUIRED_FLD'), false, formIsValid);
				formIsValid = false;
			} else {
				this.fieldAlert('');
				callbacksCount++;
				fieldRef.checkValidityBeforeSave(formIsValid, onFieldValidated);
			}
		}
		onFieldValidated(true);
	}

	saveClick(isDraft, callback, callbackInvalid) { //TODO: saveClick
		
		if (typeof callback !== 'function') {
			callback = false;
		}
		if (typeof callbackInvalid !== 'function') {
			callbackInvalid = false;
		}
		this.forceBouncingTimeout();
		var data={};
		
		if(isDraft !== 'keepStatus'){
			if(this.props.initialData.isPub || !this.props.initialData.id) {
				if (isDraft === true) {
					if(this.props.initialData.status !== '2'){
						data.status = '2';
					}
				} else {
					if (this.props.initialData.status !== '1') {
						data.status = '1';
					}
				}
			}
		}
		
		this.validate(function(formIsValid) {
			if (formIsValid) {

				for (var k in this.fieldsRefs) {
					var fieldRef = this.fieldsRefs[k];
					var field = fieldRef.props.field;
					var fieldIsValid = true;
					
					var val = this.currentData[field.fieldName];

					if (field.clientOnly!=='1') {
						if ((field.fieldType===FIELD_14_NtoM)) {
							if(!n2mValuesEqual(this.props.initialData[field.fieldName], val)){
								data[field.fieldName] = val;
							}
						} else if ((field.fieldType===FIELD_7_Nto1)) {
							
							var cVal = val;
							var iVal = this.props.initialData[field.fieldName];
							
							if (cVal && cVal.id) {
								cVal = cVal.id;
							}
							
							if (iVal && iVal.id) {
								iVal = iVal.id;
							}
							
							if (cVal !== iVal) {
								data[field.fieldName] = val;
							}
							
						} else if(val && val._isAMomentObject) {
							if (!val.isSame(this.props.initialData[field.fieldName])) {
								data[field.fieldName] = val;
							}
						} else {
							if (this.props.initialData[field.fieldName] != val) {
								data[field.fieldName] = val;
							}
						}
					}
					
				}

				this.saveClickInner(data, callback);
			} else {
				if (callbackInvalid) {
					callbackInvalid();
				}
			}
		}.bind(this));
	}

	saveClickInner(data, callback) {
		callForEachField(this.fieldsRefs, data, 'beforeSave', function(isInvalid){
			if (!isInvalid) {
				this.saveClickInner2(data, callback);
			}
		}.bind(this));
	}

	saveClickInner2 (data, callback) {
		var self = this;
		if (Object.keys(data).length > 0) {
			submitRecord(self.props.node.id, data, self.props.initialData?self.props.initialData.id:undefined, function(recId) {
				if (!self.currentData.hasOwnProperty('id')) {
					self.currentData.id = recId;
					self.props.initialData.id = recId;
				}
				
				//renew current data
				self.currentData = Object.assign(true, self.currentData, data);
				//renew initial data;
				for (var k in data) {
					var val = data[k];
					if (typeof val === 'object') {
						if ($.isEmptyObject(val)) {
							self.props.initialData[k] = undefined;
						} else if (val._isAMomentObject) {
							self.props.initialData[k] = val.clone();
						} else if(Array.isArray(val)) {
							self.props.initialData[k] = val.concat();
						} else {
							self.props.initialData[k] = Object.assign(true, {}, val);
						}
					} else {
						self.props.initialData[k] = val;
					}
				}
				
				this.didSave(data, callback);

			}.bind(this));
		} else {
			this.didSave(data, callback);
		}
		
	}
	
	didSave(data, callback) {
		if (this.props.onSave) {
			this.props.onSave();
			return;
		}
		var self = this;
		callForEachField(self.fieldsRefs, data, 'afterSave', function(isInvalid){
			if(!isInvalid){
				self.rec_ID = self.currentData.id;
				self.deteleBackup();
				if (callback) {
					callback();
				} else if (self.onSaveCallback) {
					
					self.onSaveCallback(callback);
				} else {
					if (self.isSlave()) {
						self.props.parentForm.valueChoosed(self.currentData, true);
					} else {
						self.cancelClick();
					}
				}
			}
		});
	}
	
	isVisibleField(field) {
		return (this.props.editable?(field.show & 1):(field.show & 4));
	}

	render() { //TODO: render
		var node = this.props.node;
		if (!node) {
			return ReactDOM.div({style:{textAlign:'center', color:'#ccc', padding:'5px'}},
				renderIcon('cog fa-spin fa-2x')
			);
		}
		
		var tabs;
		var fields =[];
		var data = this.currentData;
		var flds = node.fields;
		
		var domId = 'form-full-'+node.id;
		
		
		var forcedValues = this.props.filters;
		var currentTab;
		var currentTabName;
		var currentCompactAreaName;
		var currentCompactAreaFields = [];
		var currentCompactAreaCounter = 0;
		
		var isFirstTab;
		
		for (var k in flds) {
			var field = flds[k];
			if (this.isVisibleField(field)) {
				if ((field.fieldType === FIELD_17_TAB) && (field.maxlen === 0)) {//tab
					currentCompactAreaCounter = 0;//terminate compact area nesting
					var isDefaultTab;
					if(!tabs){
						tabs = [];
						isDefaultTab = true;
					} else {
						isDefaultTab = false;
						fields =[];
					}
					
					var tabVisible;
					if(this.filters.hasOwnProperty('tab')){
						tabVisible = (this.filters.tab === field.fieldName);
					} else {
						tabVisible = isDefaultTab;
					}
					
					currentTabName = field.fieldName;
					currentTab = React.createElement(FormTab, {
							key:field.id,
							title:field.name,
							visible:tabVisible||this.showAllDebug||this.showAllTabs,
							highlightFrame:this.showAllDebug,
							field:field, form:this,
							fields:fields
						});
					tabs.push(currentTab);
				} else if(this.props.editable || data[field.fieldName] || (field.nostore==1) || (field.fieldType === FIELD_15_1toN) || field.fieldType>=100) {
					var tf = React.createElement(FieldWrap, {
						key:field.id,
						field:field,
						initialValue:data[field.fieldName],
						form:this, parentTabName:currentTabName,
						isEdit:this.props.editable,
						subFields:currentCompactAreaFields,
						parentCompactAreaName:currentCompactAreaName,
						isCompact:this.props.isCompact||(currentCompactAreaCounter>0),
						hidden:(this.hiddenFields.hasOwnProperty(field.fieldName) || (forcedValues.hasOwnProperty(field.fieldName))),
						fieldDisabled:this.disabledFields.hasOwnProperty(field.fieldName) || forcedValues.hasOwnProperty(field.fieldName)
					});
					
					
					if ((field.fieldType === FIELD_17_TAB) && (field.maxlen >= 0)) {//compact area
						currentCompactAreaCounter = 0;//terminate compact area nesting
					}
					
					if (currentCompactAreaCounter > 0) {
						field.isCompactNested = true;
						currentCompactAreaFields.push(tf);
						currentCompactAreaCounter--;
						if(currentCompactAreaCounter === 0){
							currentCompactAreaFields = [];
							currentCompactAreaName = undefined;
						}
					} else {
						fields.push(tf);
					}
					if ((field.fieldType === FIELD_17_TAB) && (field.maxlen >= 0)) {//compact area
						currentCompactAreaCounter = field.maxlen;
						currentCompactAreaName = field.fieldName;
					}
				}
			}
			
			
		}
		
		var isMainTab = (!this.filters.tab || (tabs[0].props.field.fieldName === this.filters.tab));
		
		if(this.props.isCompact){
			fields.sort(function(a,b){
				
				var alow = (a.props.field.fieldType === FIELD_15_1toN || a.props.field.fieldType === FIELD_14_NtoM || a.props.field.fieldType === FIELD_5_BOOL);
				var blow = (b.props.field.fieldType === FIELD_15_1toN || b.props.field.fieldType === FIELD_14_NtoM || b.props.field.fieldType === FIELD_5_BOOL);
				if (alow !== blow) {
					if (alow) {
						return 1;
					} else {
						return -1
					}
					
				}
				var pa = a.props.field.lang;
				var pb = b.props.field.lang;
				
				if (pa !== pb) {
					if(!pa) return -1;
					if(!pb) return 1;
					if(pa && (pa > pb)) return 1;
					if(pa && (pa < pb)) return -1;
				}
				
				return a.props.field.index - b.props.field.index;
				
				
			});
		}
		
		var closeButton;
		var header;
		
		var deleteButton;
		var saveButton;
		var draftButton;
		var nodeAdmin;
		if(!this.props.inlineEditable){
			if (data.isDel && isMainTab) {
				deleteButton = ReactDOM.button({className:'clickable clickable-neg', style:dangerButtonStyle, onClick:function(){
						deleteRecord(data.name, node.id, data.id, function() {
							if(this.isSlave()){
								this.props.parentForm.valueChoosed();
							} else {
								goBack(true);
							}
						}.bind(this));
					}.bind(this), title:L('DELETE')}, renderIcon('trash'), this.isSlave()?'':L('DELETE'));
			}
			
		

			if (this.props.editable) {
				if ((node.draftable!=='1') || !isMainTab || this.disableDrafting || (data.id && !data.isPub) || !(node.prevs & PREVS_PUBLISH)) {
					saveButton = ReactDOM.button({className:'clickable clickable-edit save-btn', style:successButtonStyle, onClick:this.saveClick, title:L('SAVE')}, this.isSlave()?renderIcon('check'):renderIcon('floppy-o'), this.isSlave()?'':L('SAVE'));
				} else {
					if(data.status === '1'){
						draftButton = ReactDOM.button({className:'clickable clickable-cancel', style:defaultButtonStyle, onClick:function(){this.saveClick(true)}.bind(this), title:L('UNPUBLISH')}, L('UNPUBLISH'));
						saveButton = ReactDOM.button({className:'clickable  clickable-edit save-btn', style:successButtonStyle, onClick:this.saveClick}, L('SAVE'));
					} else {
						draftButton = ReactDOM.button({className:'clickable clickable-cancel', style:defaultButtonStyle, onClick:function(){this.saveClick(true)}.bind(this), title:L('SAVE_TEMPLATE')}, L('SAVE_TEMPLATE'));
						saveButton = ReactDOM.button({className:'clickable clickable-edit save-btn', style:successButtonStyle, onClick:this.saveClick, title:L('PUBLISH')}, L('PUBLISH'));
						
					}
				}
			}
		
			
			if(iAdmin()){
				nodeAdmin = React.createElement(NodeAdmin, {form:this,x:320,y:-40});
			}
			
			if (!this.props.isCompact && (this.header || this.state.header)) {
				header = ReactDOM.h4({style:{color: constants.BRAND_COLOR_HEADER, margin:10}}, this.header||this.state.header);
			}
			
			
			if(this.props.editable){
				closeButton = ReactDOM.button({className:'clickable clickable-cancel', style:defaultButtonStyle, onClick:this.cancelClick, title:L('CANCEL')}, renderIcon('caret-left'),  this.isSlave()?'':L('CANCEL'));
			} else {
				closeButton = ReactDOM.button({className:'clickable clickable-cancel', style:defaultButtonStyle, onClick:this.cancelClick}, renderIcon('caret-left'),  this.isSlave()?'':L('BACK'));
			}
		}
		return ReactDOM.div({className:domId, style:style},
			nodeAdmin,
			header,
			tabs || fields,
			ReactDOM.div({style:{maxWidth:1024}}, 
			ReactDOM.div({className:'footer-'+domId, style:{marginLeft:'25%',paddingLeft:22, display:(this.state.footerHidden || this.props.inlineEditable?'none':undefined),textAlign:'left', marginTop:65}},
				deleteButton,
				draftButton,
				saveButton,
				closeButton
			))
		)
		

	}
}
