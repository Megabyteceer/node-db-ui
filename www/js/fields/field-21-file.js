import {L, renderIcon, submitData} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

registerFieldClass(FIELD_21_FILE, {
	mixins fieldMixins
	setValue(val) {
		
	}

	isEmpty() {
		//for checkingIfIsEmpty
		return this.refs.fileInput.value;
	}

	focusOverride() {
		this.refs.selectButton.focus();
	}

	beforeSave(callback) {
		this.refs.fileFormBody.save(callback);
	}

	render() {
		var field = this.props.field;
		
		var fileName = this.props.initialValue;

		if (this.props.isEdit) {
			return React.createElement(FileFormBody, {field:field, ref: 'fileFormBody', accept:this.state.accept, wrapper:this.props.wrapper, parent:this, form:this.props.form, currentFileName:fileName, isCompact:this.props.isCompact});
		}
		return ReactDOM.a({style:{color:'#227', fontWeight:'bold'}, href:fileName, download:true}, fileName ? (fileName.split('/').pop()) : undefined);
		
	}
});
	
export default class FileFormBody extends React.Component {

	constructor (props) {
		super(props);
		this.state = {};
	}
	
	_cancel() {
		this.setState({
			file:null
		});
		this.refs.fileInput.value = '';
		modal.hide();
		this.props.parent.props.wrapper.hideTooltip();
	}

	save(callback) {
		if (this.state.file) {
			submitData('api/uploadFile.php', $(ReactDOM.findDOMNode(this.refs.form)).serializefiles(), callback, true);
		} else {
			callback(undefined);
		}
	}

	_onChange(e) {
		var _this = this;

		e.preventDefault();
		var files = undefined;
		if (e.dataTransfer) {
			files = e.dataTransfer.files;
		} else if (e.target) {
			files = e.target.files;
		}
		if (checkFileSize(files[0])) {
			return;
		} 
		this.setState({file:files[0]});
		
		this.props.wrapper.valueListener(files[0], true, this);
	}

	render() {
		
		var field = this.props.field;
		
		var curFile;
		var selFile
		var select;
		var preview;
		
		if (this.props.currentFileName) {
			curFile = 
				ReactDOM.a({href:this.props.currentFileName, target:'_blank',style:{fontSize:'70%', color:'#00a'}},
					L('DOWNLOAD')
				);
			
		}
		
		if (this.state.file) {
			selFile = ReactDOM.span({style:{fontSize:'70%', color:'#999', marginLeft:10}},
				L('FILE_SELECTED', this.state.file.name)
			);
		}

		select = ReactDOM.button({style:{background: constants.PUBLISH_COLOR, fontSize:'80%', marginLeft:10, padding: '5px 20px 6px 20px'},ref:'selectButton', className:'clickable clickable-edit', onClick:function(){
				this.refs.fileInput.value = null;
				this.refs.fileInput.click();
			}.bind(this)}, renderIcon('folder-open'),
			L('FILE_SELECT', getReadableUploadSize())
		);

		var recIdField,nodeIdField;
		if (this.props.form.currentData && this.props.form.currentData.id) {
			recIdField = ReactDOM.input( {name:"recId", style:{display:'none'}, defaultValue:this.props.form.currentData.id});
			nodeIdField = ReactDOM.input( {name:"nodeId", style:{display:'none'}, defaultValue:this.props.form.props.node.id});
		}
		

		var form = ReactDOM.form({ref:'form', encType:"multipart/form-data", style:{display:'none'}},
			ReactDOM.input( {name:"all files", ref:'fileInput', type: 'file', accept:this.props.accept, onChange: this._onChange }),
			ReactDOM.input( {name:"MAX_FILE_SIZE", defaultValue:30000000}),
			ReactDOM.input( {name:"fid", defaultValue:field.id}),
			ReactDOM.input( {name:"nid", defaultValue:field.node.id}),
			recIdField,
			nodeIdField
		);
		
		return ReactDOM.div(null,
			curFile,
			selFile,
			form,
			select
		);
	}

}