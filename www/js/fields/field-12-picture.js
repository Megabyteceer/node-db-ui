import constants from "../custom/consts.js";
import {idToImgURL, L, renderIcon} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";


$.fn.serializefiles = function() {
	var obj = $(this);
	/* ADD FILE TO PARAM AJAX */
	var formData = new FormData();
	$.each($(obj).find("input[type='file']"), function(i, tag) {
		$.each($(tag)[0].files, function(i, file) {
			formData.append(tag.name, file);
		});
	});
	formData.append('sessionToken', 'dev-user-session-token');
	var params = $(obj).serializeArray();
	$.each(params, function (i, val) {
		formData.append(val.name, val.value);
	});
	return formData;
};

registerFieldClass(FIELD_12_PICTURE, class TextField extends fieldMixins {

	setValue(val) {
		
	}

	isEmpty() {
		//for checkingIfIsEmpty
		return this.refs.cropperBody.refs.fileInput.value;
	}

	focusOverride() {
		this.refs.cropperBody.refs.selectButton.focus();
	}

	beforeSave(callback) {
		this.refs.cropperBody.save(callback);
	}

	render() {
		var field = this.props.field;
		
		var imgUrl = idToImgURL(this.props.initialValue, this.props.field.fieldName);
		
		if (this.props.isEdit) {
			return React.createElement(CropperFieldBody, {field:field, ref: 'cropperBody', parent:this, imageRenderer:this.props.form.imageRenderer, form:this.props.form, currentPicUrl:imgUrl, isCompact:this.props.isCompact});
		} else if(this.props.isCompact) {
			return ReactDOM.img({src:imgUrl, style:{borderRadius:'3px', maxHeight:this.props.form.props.parentForm?'30px':'60px', width: 'auto'}})
		} else {
			return ReactDOM.img({src:imgUrl, style:{borderRadius: '5px'}})
		}
	}
});

class CropperFieldBody extends React.Component {

	constructor (props) {
		super(props);
		this.state = {
			src: '',
			cropResult: null
		};
	}

	_cancel() {
		this.setState({
			src:null
		});
		this.refs.fileInput.value = '';
		modal.hide();
		this.props.parent.props.wrapper.hideTooltip();
	}

	_cropImage(exactlySize, imgData) {
		
		if (exactlySize===true) {//no cropper needded
			this.setState({
				cropResult: imgData,
				src:null
			});
			
			
		} else {
			if (typeof this.cropper.getCroppedCanvas() === 'undefined') {
				return;
			}
			
			var bounds = this.cropper.getData();
			this.refs.w.value = bounds.width;
			this.refs.h.value = bounds.height;
			this.refs.x.value = bounds.x;
			this.refs.y.value = bounds.y;
			
			this.setState({
				cleared: false,
				cropResult: this.cropper.getCroppedCanvas().toDataURL(),
				src:null
			});
			modal.hide();
			this.props.parent.props.wrapper.hideTooltip();
		}
	}
	
	clear() {
		this.setState({
			cleared: true,
			cropResult: null,
			src:''
		});
		this.refs.fileInput.value = '';
	}

	save(callback) {
		if (this.state.cropResult) {
			submitData('api/uploadImage.php', $(ReactDOM.findDOMNode(this.refs.form)).serializefiles(), callback, true);
		} else if(this.state.cleared) {
			callback('0');
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
		if (files.length>0) {
			if (checkFileSize(files[0])) {
				return;
			}
			var reader = new FileReader();
			reader.onload = function () {
				_this.setState({waiting:0, src: reader.result, cropResult:false });
				
				var selectedImage = new Image(); 

				selectedImage.onload = function(){
					
					
					
					
					var field = this.props.field;
					var w = Math.floor(field.maxlen / 10000);
					var h = field.maxlen % 10000;
					
					if ((w === selectedImage.width) && (h === selectedImage.height)) {
						this._cropImage(true, reader.result);
					} else {
					
					
						var cropperW = 900;
						var cropperH = 900/w*h;
						if(cropperH > 350){
							cropperH = 350;
							cropperW = 350/h*w;
						}
						
						myAlert(ReactDOM.div( {style:{width:900}},
							React.createElement(ReactCropper, {
								zoomable:false,
								style: {margin:'auto', height: cropperH, width: cropperW },
								aspectRatio: w/h,
								preview: '.img-preview',
								guides: false,
								src: reader.result,
								ref: function(ref){this.cropper = ref}.bind(this),
								crop: this._crop
							}),
							ReactDOM.div({style:{marginTop:'12px', textAlign:'center'}},
								ReactDOM.button(
									{ className:'clickable', style:{background:'#382', color:'#fff'}, onClick: this._cropImage},
									renderIcon('check'),
									L('APPLY')
								),
								ReactDOM.button(
									{ className:'clickable', onClick: this._cancel},
									renderIcon('times'),
									L('CANCEL')
								),
								ReactDOM.div(
									{ className: 'box', style: {margin:'30px auto', width: w, height:h} },
									L('PREVIEW'),
									ReactDOM.div( { className: 'img-preview', style: {margin:'15px', overflow:'hidden', border:'1px dashed #ccc', borderRadius:'5px', width: w, height: h } })
								)
							)
						), 1,0,1);
					}
				
				}.bind(this);

				selectedImage.src = reader.result;
				
			}.bind(this);
		

			this.setState({waiting:1});
			reader.readAsDataURL(files[0]);
		}
	}

	render() {
		
		var field = this.props.field;
		
		
		var w = Math.floor(field.maxlen / 10000);
		var h = field.maxlen % 10000;
		var recW = w;
		var recH = h;
		
		if(this.props.isCompact){
			w /= 3;
			h /= 3;
		}
		var body;
		var select;
		var preview;
		
		var clrBtn;
		if (this.state.cropResult || this.state.src || this.props.currentPicUrl && this.props.currentPicUrl!=='images/placeholder_'+field.fieldName+'.png') {
			clrBtn =  ReactDOM.button({style:{background: constants.DELETE_COLOR, color:'#fff'},className:'clickable clickable-del toolbtn', onClick:this.clear},
				renderIcon('times')
			)
		}
		
		
		if(this.state.src){
			body = clrBtn;
		} else {
			
			if(this.state.waiting){
				body = renderIcon('cog fa-spin fa-2x');
			} else {
				
				var imgSrc = this.state.cropResult || this.props.currentPicUrl;
				if (this.state.cleared) {
					imgSrc = idToImgURL(0, field.fieldName);
				}
				if(this.props.imageRenderer){
					preview = this.props.imageRenderer(imgSrc, this.props.form);
					
				} else {
					preview =  ReactDOM.img( {ref:'img', style: { borderRadius:'5px',width: w/2, height:h/2 }, src: imgSrc, className:'clickable', onClick:function(){
						this.refs.fileInput.value = null;
						this.refs.fileInput.click();
					}.bind(this) });
				}
				
				select = ReactDOM.div(null, 
					ReactDOM.button({style:{background: constants.PUBLISH_COLOR, fontSize:'80%', padding: '5px 20px 6px 20px'},ref:'selectButton', className:'clickable clickable-edit', onClick:function(){
							this.refs.fileInput.value = null;
							this.refs.fileInput.click();
						}.bind(this)}, renderIcon('folder-open'),
						L('SELECT_IMG')
					),
					clrBtn
				);
			}
		}

		var form = ReactDOM.form({ref:'form', encType:"multipart/form-data", style:{display:'none'}},
			ReactDOM.input( {name:"picture", ref:'fileInput', type: 'file', accept:"image/*", onChange: this._onChange }),
			ReactDOM.input( {name:"MAX_FILE_SIZE", defaultValue:3000000}),
			ReactDOM.input( {name:"fid", defaultValue:field.id}),
			ReactDOM.input( {name:"nid", defaultValue:field.node.id}),
			ReactDOM.input( {name:"w", ref:'w'}),
			ReactDOM.input( {name:"h", ref:'h'}),
			ReactDOM.input( {name:"x", ref:'x'}),
			ReactDOM.input( {name:"y", ref:'y'})
		);
		
		return ReactDOM.div(null,
			ReactDOM.div(null,
				preview,
				body,
				ReactDOM.div({style:{color:'#aaa', fontSize:'70%'}}, L('RECOMEND_SIZE',recW).replace('%', recH)),
				form
			),
			select
		);
	}
}