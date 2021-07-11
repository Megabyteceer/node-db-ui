import BaseForm from "../forms/form-mixins.js";
import {iAdmin} from "../user.js";
import {L, renderIcon} from "../utils.js";

function check() {
	return ReactDOM.span({style:{marginLeft:-12, marginRight:-12}}, renderIcon('check'));
}

class PrevsEditor extends React.Component {
	render() {
		var self = this;
		var body;
		var item = self.props.item;
		
		var mask = (Math.pow(2,self.props.bitsCount)-1)*self.props.baseBit;
		
		var curVal = (item.prevs & mask);
		
		var title;
		
		if(curVal === 0){
			body = ReactDOM.span({style:{color:'#ccc'}}, renderIcon('ban'));
			title = L('ADM_NA');
		} else if(self.props.bitsCount === 1){
			body = ReactDOM.span({style:{color:'#3a3'}}, check());
			title = L('ADM_A');
		} else {
			switch (curVal/self.props.baseBit) {
				case 1:
					body = ReactDOM.span({style:{color:'#3a3'}}, check());
					title = L('ADM_A_OWN');
					break;
				case 2:
				case 3:
					body = ReactDOM.span({style:{color:'#3a3'}}, ReactDOM.span({style:{fontSize:'120%'}}, check(),check()));
					title = L('ADM_A_ORG');
					break;
				case 4:
				case 5:
				case 6:
				case 7:
					body = ReactDOM.span({style:{color:'#3a3'}}, ReactDOM.span({style:{fontSize:'140%'}},  check(),check(),check()));
					title = L('ADM_A_FULL');
					break;
				default:
					body = 'props: '+ (curVal/self.props.baseBit);
					break;
			}
		}
		
		return ReactDOM.td({className:'clickable', title:title, style:{width:140}, onClick:function() {
				curVal*=2;
				curVal+=self.props.baseBit;
				if((curVal & mask)!== curVal){
					curVal = 0;
				}
				item.prevs = ((item.prevs&(65535^mask)) | curVal);
				self.forceUpdate();
			}},
			body
		)
		
	}
}

export default class AdminRoleprevsForm extends BaseForm {

	constructor(props) {
		super(props);
	}

	componentDidUpdate(props, state) {
		super.componentDidUpdate(props, state);
		this.onShow();
	}

	componentDidMount() {
		this.onShow();
	}

	onShow() {
		var self = this;
		getNode(self.props.recId, function(node) {
			getData('admin/nodePrevs.php', {nodeId :self.props.recId}, function(data) {
				var lines=data.prevs.map(function(i) {
					if( !i.prevs) {
						i.prevs = 0;
					}
				});
				
				self.initData = Object.assign(true, {}, data);
				self.setState({node:node, data:data});
			});
		});
	}

	saveClick() {
		if (JSON.stringify(this.initData) !== JSON.stringify(this.state.data)) {
			var submit = function(toChild) {
				submitData('core/admin/nodePrevs.php?nodeId=' + this.props.recId + (toChild ? '&toChild' : ''), this.state.data, function() {
					this.cancelClick();
				}.bind(this));
			}.bind(this);
			
			if(this.state.data.isDoc) {
				submit();
			} else {
				myPromt(L('APPLY_CHILD'), function(){submit();}, L('TO_THIS'), function(){submit(true);}, L('TO_ALL'), 'check', 'check');
			}
			
		} else {
			this.cancelClick();
		}
	}

	render() {
		if (this.state && this.state.data) {
			
			var data = this.state.data;
			var node = this.state.node;
			
			var lines=data.prevs.map(function(i) {
				return ReactDOM.tr({key:i.id, style:{paddingBottom:10, paddingTop:10, height:40}},
					ReactDOM.td({style:{textAlign:'right', verticalAlign:'middle', paddingRight:20, width:250}}, i.name),
					React.createElement(PrevsEditor, {bitsCount:3, baseBit:PREVS_VIEW_OWN, item:i}),
					React.createElement(PrevsEditor, {bitsCount:1, baseBit:PREVS_CREATE, item:i}),
					React.createElement(PrevsEditor, {bitsCount:3, baseBit:PREVS_EDIT_OWN, item:i}),
					React.createElement(PrevsEditor, {bitsCount:1, baseBit:PREVS_DELETE, item:i}),
					(node.draftable!=='0')?React.createElement(PrevsEditor, {bitsCount:1, baseBit:PREVS_PUBLISH, item:i}):undefined
				)
			});
			
			var body = ReactDOM.div(null,
				ReactDOM.h3(null,
					ReactDOM.span({style:{color:'#aaa', fontSize:'80%'}}, L('ADM_NODE_ACCESS')),
					node.matchName
				),
				
				ReactDOM.table({style:{textAlign:'center', marginTop:50}},
					ReactDOM.thead({style:{fontWeight:'bold', borderBottom:'1px solid #aaa'}},
						ReactDOM.tr({style:{height:40}},
							ReactDOM.th({style:{textAlign:'right', paddingRight:20}},L('ADM_ROLE')),
							ReactDOM.th(null,L('VIEW')),
							ReactDOM.th(null,L('CREATE')),
							ReactDOM.th(null,L('EDIT')),
							ReactDOM.th(null,L('DELETE')),
							(node.draftable!=='0')?ReactDOM.th(null,L('PUBLISH')):undefined
						)
					),
					ReactDOM.tbody(null,
						lines
					)
				)
			);
			
			var saveButton = ReactDOM.button({className:'clickable', style:successButtonStyle, onClick:this.saveClick}, this.isSlave()?renderIcon('check'):renderIcon('floppy-o'), this.isSlave()?'':L('SAVE'));
			
			var nodeAdmin;
			if(iAdmin()){
				nodeAdmin = React.createElement(NodeAdmin, {form:this,x:320,y:-40});
			}
			
			var closeButton = ReactDOM.button({className:'clickable', style:defaultButtonStyle, onClick:this.cancelClick}, renderIcon('times'),  this.isSlave()?'':L('CANCEL'));
			
			return ReactDOM.div({style:null},
				nodeAdmin,
				body,
				
				ReactDOM.div({style:this.isSlave()?{display:'inline-block'}:{textAlign:'center', marginTop:45}},
					saveButton,
					closeButton
				)
			)
		} else {
			return React.createElement(FormLoaderCog);
		}
	}
}