
import fieldsEvents from "../events/fields_events.js";
import {L, renderIcon, sp} from "../utils.js";


var showedFieldId;


class FieldAdmin extends React.Component {
	constructor(props) {
		super(props);
		this.state = {show: showedFieldId===this.props.field.id};
	}

	show() {
		if(this.timeout){
			clearTimeout(this.timeout);
			delete(this.timeout);
		}
		if(!this.state.show){
			
			this.setState({show:true});
		}
	}

	hide() {
		if(this.state.show){
			this.setState({show:false});
		}
	}

	toggleLock() {
		this.setState({locked:!this.state.locked});
	}

	render() {
		
		var field = this.props.field;
		var node = field.node;
		var form = this.props.form;
		
		var body;
		
		var zAdd = this.props.zIndex;
		if(!zAdd){
			zAdd = 0;
		}
		var border;
		if (fieldsEvents.hasOwnProperty(field.id)) {
			border = "4px solid #040";
		}
		
		var bodyVisible = this.state.show || this.state.locked;
		
		if(bodyVisible) {
			var extendedInfo;
			if(form.fieldsRefs && form.fieldsRefs[field.fieldName] && form.fieldsRefs[field.fieldName].fieldRef && form.getField(field.fieldName).fieldRef.state.filters){
				extendedInfo = ReactDOM.div(null,
					'filters:',
					ReactDOM.input({defaultValue:JSON.stringify(form.getField(field.fieldName).fieldRef.state.filters)})
				);
			}
			
			body = ReactDOM.div({
					ref:keepInWindow,
					style:{position:'absolute', textAlign:'left', zIndex:4+zAdd,fontSize:'70%', display:'inline-block', verticalAlign:'top', marginTop:'-5px', marginLeft:10, color:'#800', padding:'10px', borderRadius:'5px', background:'#fee', border:'1px solid #ebb'},
					onClick:function(){clearTimeout(this.timeout); delete(this.timeout); showedFieldId=this.props.field.id }.bind(this),
					onMouseLeave:function(){
							this.hide()
						}.bind(this)},
				L('FLD_SETTINGS'),
				ReactDOM.b({style:{fontSize:'130%'}},
					field.fieldName
				),
				ReactDOM.div(null,
					field.name+ '; type: '+field.fieldType+'; id: '+field.id + '; len:' + field.maxlen
				),
				ReactDOM.div({style:{marginTop:'5px', textAlign:'center', whiteSpace:'nowrap'}},
					ReactDOM.button({className:'clickable toolbtn', style:{border:border, background:'#944',color:'#fcc', paddingLeft:'6px', paddingRight:'6px'}, onClick:function(){
								
								admin_editSource('onchange', node, field);
								
							}.bind(this)
						},
						'onChange...'
					),
					ReactDOM.button({className:'clickable toolbtn', style:{background:'#944',color:'#fcc'}, onClick:function(){
								var i = field.index;
								if(i > 0){
									admin.moveField(i, form, node, -1);
								}
							}
						},
						renderIcon('arrow-up')
					),
					ReactDOM.button({className:'clickable toolbtn', style:{background:'#944',color:'#fcc'}, onClick:function(){
								var i = field.index;
								if(i < (node.fields.length-1)) {
									admin.moveField(i, form, node, +1);
								}
							}
						},
						renderIcon('arrow-down')
					),
					ReactDOM.button({className:'clickable toolbtn', style:{background:'#944',color:'#fcc'}, onClick:function(){
								
								getNodeData(6, field.id, function(data){
									admin.popup(loactionToHash(6, 'new', {prior:data.prior, node_fields_linker:{id:node.id,name:node.singleName}}, true),900,true);
								});
							}.bind(this)
						},
						renderIcon('plus')
					),
					ReactDOM.button({onClick:function(){
							admin.popup(loactionToHash(6, field.id, undefined, true),900,true);
						}.bind(this), className:'clickable toolbtn', style:{background:'#944',color:'#fcc'}},
						renderIcon('wrench')
					),
					ReactDOM.span({style:{position:'absolute', right:5, top:5}, className:'clickable', onClick:this.toggleLock},
						renderIcon(this.state.locked?'lock':'unlock')
					
					)
				),
				extendedInfo,
				ReactDOM.button({onClick:function(){
					admin.debug(form.getField(field.fieldName) || form);
				}.bind(this), className:'clickable toolbtn', style:{background:'#944',color:'#fcc'}, title:'log field to console'},
					renderIcon('info')
				)
			);
		}
		
		return ReactDOM.span({ref:keepInWindow,className:'admin-controll', style:{position:'absolute', zIndex:(bodyVisible?4:3)+zAdd, transform:'translate('+this.props.x+'px, 0)'}, onClick:function(e){sp(e);}},
			ReactDOM.span({ref:keepInWindow,style:{border:border, display:'inline-block',position:'absolute', zIndex:2+zAdd, verticalAlign:'top', padding:'6px', background:'#944', transform:'scale(0.5)', borderRadius:'5px', color:'#fdd'},
			className:'halfvisible', onMouseEnter:this.show},
				renderIcon('wrench')
			),
			body
		)
	}
}