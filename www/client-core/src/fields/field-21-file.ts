import ReactDOM from "react-dom";
import React from "react";

import { R } from "../r";
import { Component } from "react";
import { FIELD_TYPE } from "../bs-utils";
import { ENV } from "../main-frame";
import { Modal } from "../modal";
import { checkFileSize, getReadableUploadSize, idToFileUrl, L, renderIcon, serializeForm, submitData } from "../utils";
import { registerFieldClass } from "../utils";
import { BaseField, RefToInput } from "./base-field";
import { FieldWrap } from "./field-wrap";

registerFieldClass(FIELD_TYPE.FILE, class FileField extends BaseField {

	fileFormBodyRef: FileFormBody;

	setValue(val) {
		if(typeof val === 'string') {
			//@ts-ignore
			this.state.value = val;
		} else {
			this.props.form.currentData[this.props.field.field_name] = undefined;
		}
	}

	isEmpty() {
		return !this.fileFormBodyRef.fileInputRef.value && !this.state.value;
	}

	focus() {
		this.fileFormBodyRef.fileInputRef.focus();
	}

	async beforeSave() {
		return this.fileFormBodyRef.save(this.props.wrapper);
	}

	render() {
		var field = this.props.field;

		var fileName = this.props.initialValue;

		if(fileName && fileName.name) {
			fileName = fileName.name;
		}

		if(this.props.isEdit) {
			let accept = ENV.ALLOWED_UPLOADS.map(i => '.' + i).join(', ');
			return React.createElement(FileFormBody, { field, ref: (r) => { this.fileFormBodyRef = r; }, accept, wrapper: this.props.wrapper, parent: this, form: this.props.form, currentFileName: fileName, isCompact: this.props.isCompact });
		}
		return R.a({ className: 'field-file-link', href: idToFileUrl(fileName), download: true }, fileName ? (fileName.split('/').pop()) : undefined);

	}
});

class FileFormBody extends Component<any, any> {
	fileInputRef: RefToInput;
	formRef: RefToInput;
	selectButtonRef: RefToInput;
	waitingForUpload: boolean;

	constructor(props) {
		super(props);
		this.state = {};
		this._onChange = this._onChange.bind(this);
	}

	_cancel() {
		this.setState({
			file: null
		});
		this.fileInputRef.value = '';
		Modal.instance.hide();
		this.props.parent.props.wrapper.hideTooltip();
	}

	async save(fieldWrap: FieldWrap) {
		if(this.waitingForUpload) {
			let n = ReactDOM.findDOMNode(this.formRef);
			let fileId = await submitData('api/uploadFile', serializeForm(n), true);
			if(!fileId) {
				fieldWrap.props.form.fieldAlert(fieldWrap.props.field.field_name, L('UPLOAD_ERROR'));
			}
			return fileId;
		}
	}

	afterSave() {
		this.waitingForUpload = false;
	}

	_onChange(e) {
		e.preventDefault();
		var files = undefined;
		if(e.dataTransfer) {
			files = e.dataTransfer.files;
		} else if(e.target) {
			files = e.target.files;
		}
		if(checkFileSize(files[0])) {
			return;
		}
		this.setState({ file: files[0] });
		this.waitingForUpload = true;

		this.props.wrapper.valueListener(files[0], true, this);
	}

	render() {

		var field = this.props.field;

		var curFile;
		var selFile
		var select;

		if(this.props.currentFileName) {
			curFile =
				R.a({ href: idToFileUrl(this.props.currentFileName), download: true, target: '_blank', className: 'field-file-link' },
					this.props.currentFileName.split('/').pop()
				);
		}

		if(this.state.file) {
			selFile = R.span({ className: 'small-text' },
				L('FILE_SELECTED', this.state.file.name),
				"(", (this.state.file.size / 1000).toFixed(2), L("KILO_BYTES_SHORT"), ")"
			);
		}

		select = R.button({
			className: 'clickable field-button', onClick: () => {
				this.fileInputRef.value = null;
				this.fileInputRef.click();
			}
		}, renderIcon('folder-open'),
			L('FILE_SELECT', getReadableUploadSize())
		);

		var recIdField, nodeIdField;
		if(this.props.form.currentData && this.props.form.currentData.id) {
			recIdField = R.input({ name: "recId", className: 'hidden', defaultValue: this.props.form.currentData.id });
			nodeIdField = R.input({ name: "nodeId", className: 'hidden', defaultValue: this.props.form.props.node.id });
		}


		var form = R.form({ ref: (r) => { this.formRef = r; }, encType: "multipart/form-data", className: 'hidden' },
			R.input({ name: "file", ref: (r) => { this.fileInputRef = r; }, type: 'file', accept: this.props.accept, onChange: this._onChange }),
			R.input({ name: "MAX_FILE_SIZE", defaultValue: 30000000 }),
			R.input({ name: "fid", defaultValue: field.id }),
			R.input({ name: "nid", defaultValue: field.node.id }),
			recIdField,
			nodeIdField
		);

		return R.div(null,
			curFile,
			selFile,
			form,
			select
		);
	}
}

export { FileFormBody };