import {L, renderIcon, sp} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

var dropListStyle = {
	position:'absolute',
	zIndex:8,
	background:'#F7F7F7',
	minWidth:550,
	border:'1px solid #BBBBBB',
	padding:'8px',
	fontSize:'80%',
	boxShadow: '0px 4px 12px 0px #777',
	borderRadius:6,
	//borderTopLeftRadius:0,
	marginBottom: 400
}

registerFieldClass(FIELD_7_Nto1, fieldMixins, fieldLookupMixins, {

	constructor (props) {
		super(props);
		
		var val = props.initialValue;
		if (typeof val === 'string') {
			val = {id:val, name:'selected'};
			this.props.wrapper.valueListener(val, false, this);
		}
		this.state = {filters:this.generateDefaultFiltersByProps(this.props), value:val};
	}

	componentDidUpdate() {
		if (this.props.editIt) {//edit item in extended n2m list
			if(!this.state.expanded){
				this.setState({expanded:true});
			}
			this.toggleCreateDialogue(props.editIt);
		}
		
		if (this.props.filters) {
			if(!this.state.filters) {
				this.state.filters = {};
			}
			for (var k in this.props.filters) {
				if (this.props.filters.hasOwnProperty(k)) {
					this.state.filters[k] = this.props.filters[k];
				}
			}
		}
	}

	componentWillUnmount(){
		this.clearLeaveTimout();
	}

	toggleList() {
		if(!this.props.fieldDisabled || this.state.expanded) {
			
			if (this.state.expanded) {
				scrollToVisible(this);
			}
			
			this.setState({expanded:!this.state.expanded, dataToEdit:undefined, creationOpened:false});
		}
	}

	valueChoosed(recordData, isNewCreated, noToggleList) {
		if (recordData) {
			if(!noToggleList){
				
				this.toggleList();
			}
			if (!this.state.value || (this.state.value.id !== recordData.id) || (this.state.value.name !== recordData.name) || (this.state.value[this.props.field.icon] !== recordData[this.props.field.icon])) {
				var newVal = {id:recordData.id, name:recordData.name};
				if(this.props.field.icon){
					newVal[this.props.field.icon] = recordData[this.props.field.icon];
				}
				this.setValue(newVal);
				this.props.wrapper.valueListener(newVal, false, this);
				
				if (isNewCreated) {
					this.saveNodeDataAndFilters(this.savedNode);
				}
			}
		} else {
			this.saveNodeDataAndFilters(this.savedNode,undefined, this.savedFilters);
			this.setState({creationOpened:false});
		}
	}

	toggleCreateDialogue (itemIdToEdit, defaultCreationData, backupPrefix) {
		
		if (defaultCreationData) {
			var curBackup = getBackupData(this.props.field.nodeRef, backupPrefix);
			backupCreationData(this.props.field.nodeRef, Object.assign(curBackup,defaultCreationData), backupPrefix);
		}
		this.clearLeaveTimout();
		this.setState({creationOpened:!this.state.creationOpened, backupPrefix:backupPrefix, dataToEdit:undefined, itemIdToEdit:itemIdToEdit});
		if(typeof itemIdToEdit !== 'undefined'){
			getNodeData(this.props.field.nodeRef, itemIdToEdit, function(data) {
				getNode(this.props.field.nodeRef, function(node){
					this.saveNodeDataAndFilters(node);
					this.setState({dataToEdit:data, itemIdToEdit:undefined});
				}.bind(this));
			}.bind(this), undefined, true);
		} else {
			this.setState({dataToEdit:{}});
		}
	}

	onMouseLeave() {
		if (this.state.expanded && !this.state.creationOpened) {
			this.leaveTimout = setTimeout(this.toggleList, 400);
		}
	}

	clearLeaveTimout(){
		if(this.leaveTimout){
			clearTimeout(this.leaveTimout);
			delete (this.leaveTimout);
		}
	}

	encodeValue(val) {

		if (val && val.hasOwnProperty('id')){
			return val.id;
		} else {
			return val;
		}
	}

	setValue(val) {
		this.state.value = val;
		this.forceUpdate();
	}

	render() {
		
		var field = this.props.field;
		var value = this.state.value;
		var iconPic;
		if(field.icon && value && (!this.props.hideIcon) && value[field.icon]){
			iconPic = ReactDOM.img({style:{height:30, width:'auto', marginRight:8}, src:idToImgURL(value[field.icon], field.icon)});
		}
			
		
		if (this.props.isEdit) {
			
			
			var list;
			var clearBtn;
			if (this.state.expanded) {
				if(this.state.creationOpened){
					if (this.state.itemIdToEdit) {
						list = ReactDOM.div({style:{textAlign:'center', color:'#ccc', padding:5}},
							renderIcon('cog fa-spin fa-2x')
						);
					} else {
						list = React.createElement(FormFull, {node:this.savedNode, nodeId:field.nodeRef, backupPrefix:this.state.backupPrefix, initialData:this.state.dataToEdit||{}, isCompact:true, parentForm:this, isLookup:true, filters:this.savedFilters||this.state.filters, editable:true});
					}
				} else {
					list = React.createElement(List, {node:this.savedNode,preventCreateButton:this.state.preventCreateButton||this.props.preventCreateButton, initialData:this.savedData, nodeId:field.nodeRef, isLookup:true, parentForm:this, filters:this.savedFilters||this.state.filters})
				}
			}
			
			if (list) {
				list = ReactDOM.div({style:dropListStyle, ref:scrollToVisible},
					list
				);
			}
			
			if (field.requirement !== '1' && !this.props.isN2M) {
				clearBtn = ReactDOM.div({style:{display:'inline-block',borderRadius:'3px', backgroundColor: constants.DELETE_COLOR, color:'#fff'}, title:L('CLEAR'), className:'clickable clickable-del', onClick:function(e){
							sp(e);
							this.valueChoosed({id:0,name:''}, false, true);
							if (this.state.expanded) {
								this.toggleList();
							}
						}.bind(this)
					},
				
					renderIcon('times')
				)
				var mrg = -56;
			} else {
				var mrg = -30;
			}
			
			var valLabel;
			if(value && value.name){
				valLabel = ReactDOM.span({style:{verticalAlign:'initial'}},value.name);
			} else {
				
				valLabel = ReactDOM.span({style:{color:'#aaa', marginLeft:8, verticalAlign:'initial', display:'inline-block', fontSize:'75%', fontWeight:'bold'}}, this.props.noBorder?L('+ADD'):L('SELECT'))

			}
			
			
			
			return ReactDOM.div({onMouseLeave:this.onMouseLeave, onMouseEnter:this.clearLeaveTimout},
				ReactDOM.div({style:{border:this.props.noBorder?'0':'1px solid #aaa', whiteSpace:'nowrap', cursor:this.props.fieldDisabled?'default':'pointer',  borderRadius:3, padding:2}, className:this.props.fieldDisabled?'unclickable disabled':'clickable', title:this.props.isCompact?field.name:L('SELECT'), onClick:this.toggleList},
					ReactDOM.span({style:{display:'inline-block',verticalAlign:'middle',textOverflow: 'ellipsis', width:'100%',whiteSpace:'nowrap',overflow: 'hidden',paddingLeft:8,paddingRight:54,marginRight:mrg}},
						iconPic,
						valLabel
					),
					ReactDOM.span({style:{display:'inline-block', verticalAlign:'middle'}},
						renderIcon('caret-down')
					),
					clearBtn
				),
				list
			)
		} else {
			return ReactDOM.span(this.props.isCompact?readOnlyCompactFieldProperties:readOnlyFieldProperties,
				iconPic, value.name
			)
		}
		
	}
}

