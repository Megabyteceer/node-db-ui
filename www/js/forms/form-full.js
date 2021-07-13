
import FieldWrap from "../fields/field-wrap.js";
import {defaultButtonStyle, successButtonStyle} from "../stage.js";
import {iAdmin} from "../user.js";
import {consoleLog, goBack, L, n2mValuesEqual, removeBackup, renderIcon, submitRecord} from "../utils.js";
import FormTab from "./form-tab.js";
import eventProcessingMixins from "./event-processing-mixins.js";
import constants from "../custom/consts.js";

var style = {
	marginBottom:7
}

var backupCallback;

function tryBackup() {
	//TODO :  uncomment
	if(backupCallback) {
		//backupCallback();
	}
}

window.addEventListener('unload', tryBackup);
setInterval(tryBackup, 15000);

function callForEachField(fildRefs, data, functionName, onComplete) {
	var isInvalidForm = false;
	var callbacksCount = 0;
	var waitingForCallbacks = false;
	for (var k in fildRefs) {
		var f = fildRefs[k];
		
		callbacksCount++;
		(() => {
			var imgFieldName = f.props.field.fieldName;
			
			f[functionName]((newValue, isInvalid) => {
				if(typeof newValue !== 'undefined') {
					data[imgFieldName] = newValue;
				}
				callbacksCount--;
				if (waitingForCallbacks) {
					if (callbacksCount === 0) {
						Modal.instance.hide();
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


export default class FormFull extends eventProcessingMixins {
	constructor(props) {
		super(props);
		this.currentData = Object.assign({}, props.filters, props.initialData);
		this.saveClick = this.saveClick.bind(this);
	}

	componentDidMount() {
		super.componentDidMount(); // TODO merge base class
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
				this.currentData = Object.assign( backup, this.filters);
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

	UNSAFE_componentWillReceiveProps(nextProps) {
		super.UNSAFE_componentWillReceiveProps(nextProps); //TODO merge with super class
		consoleLog('receive props; '+this.props.node.tableName);
		if ((this.currentData.id !== nextProps.initialData.id) || (this.props.node !== nextProps.node) || (this.props.editable !== nextProps.editable)) {
			
			this.backupCurrentDataIfNeed();
			
			this.needCallOnload = true;
			this.showAllTabs = false;
			this.currentData = Object.assign({}, nextProps.filters, nextProps.initialData);
			
			this.resendDataToFields();
			
		}
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
		var onFieldValidated = (isValid) => {
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
			
			if (field.requirement && (!val && val !== 0) && field.fieldType != FIELD_17_TAB) {
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
					if(this.props.initialData.status !== 2){
						data.status = 2;
					}
				} else {
					if (this.props.initialData.status !== 1) {
						data.status = 1;
					}
				}
			}
		}
		
		this.validate((formIsValid) => {
			if (formIsValid) {

				for (var k in this.fieldsRefs) {
					var fieldRef = this.fieldsRefs[k];
					var field = fieldRef.props.field;
					
					var val = this.currentData[field.fieldName];

					if (!field.clientOnly) {
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
		});
	}

	saveClickInner(data, callback) {
		callForEachField(this.fieldsRefs, data, 'beforeSave', (isInvalid) => {
			if (!isInvalid) {
				this.saveClickInner2(data, callback);
			}
		});
	}

	saveClickInner2(data, callback) {
		if (Object.keys(data).length > 0) {
			submitRecord(this.props.node.id, data, this.props.initialData?this.props.initialData.id:undefined, (recId) => {
				if (!this.currentData.hasOwnProperty('id')) {
					this.currentData.id = recId;
					this.props.initialData.id = recId;
				}
				
				//renew current data
				this.currentData = Object.assign( this.currentData, data);
				//renew initial data;
				for (var k in data) {
					var val = data[k];
					if (typeof val === 'object') {
						if ($.isEmptyObject(val)) {
							this.props.initialData[k] = undefined;
						} else if (val._isAMomentObject) {
							this.props.initialData[k] = val.clone();
						} else if(Array.isArray(val)) {
							this.props.initialData[k] = val.concat();
						} else {
							this.props.initialData[k] = Object.assign({}, val);
						}
					} else {
						this.props.initialData[k] = val;
					}
				}
				
				this.didSave(data, callback);

			});
		} else {
			this.didSave(data, callback);
		}
	}
	
	didSave(data, callback) {
		if (this.props.onSave) {
			this.props.onSave();
			return;
		}
		callForEachField(this.fieldsRefs, data, 'afterSave', (isInvalid) => {
			if(!isInvalid){
				this.rec_ID = this.currentData.id;
				this.deteleBackup();
				if (callback) {
					callback();
				} else if (this.onSaveCallback) {
					
					this.onSaveCallback(callback);
				} else {
					if (this.isSlave()) {
						this.props.parentForm.valueChoosed(this.currentData, true);
					} else {
						this.cancelClick();
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
			fields.sort((a,b) => {
				
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
				deleteButton = ReactDOM.button({className:'clickable clickable-neg', style:dangerButtonStyle, onClick:() => {
						deleteRecord(data.name, node.id, data.id, () => {
							if(this.isSlave()){
								this.props.parentForm.valueChoosed();
							} else {
								goBack(true);
							}
						});
					}, title:L('DELETE')}, renderIcon('trash'), this.isSlave()?'':L('DELETE'));
			}

			if (this.props.editable) {
				if (!node.draftable || !isMainTab || this.disableDrafting || (data.id && !data.isPub) || !(node.prevs & PREVS_PUBLISH)) {
					saveButton = ReactDOM.button({className:'clickable clickable-edit save-btn', style:successButtonStyle, onClick:this.saveClick, title:L('SAVE')}, this.isSlave()?renderIcon('check'):renderIcon('floppy-o'), this.isSlave()?'':L('SAVE'));
				} else {
					if(data.status === 1) {
						draftButton = ReactDOM.button({className:'clickable clickable-cancel', style:defaultButtonStyle, onClick:() => {this.saveClick(true)}, title:L('UNPUBLISH')}, L('UNPUBLISH'));
						saveButton = ReactDOM.button({className:'clickable  clickable-edit save-btn', style:successButtonStyle, onClick:this.saveClick}, L('SAVE'));
					} else {
						draftButton = ReactDOM.button({className:'clickable clickable-cancel', style:defaultButtonStyle, onClick:() => {this.saveClick(true)}, title:L('SAVE_TEMPLATE')}, L('SAVE_TEMPLATE'));
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