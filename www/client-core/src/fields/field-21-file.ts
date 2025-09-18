import { Component, h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import BaseField, { type BaseFieldProps, type BaseFieldState } from '../base-field';
import { ENV } from '../main-frame';
import { Modal } from '../modal';
import { R } from '../r';
import { checkFileSize, getReadableUploadSize, idToFileUrl, L, registerFieldClass, renderIcon, serializeForm, submitData } from '../utils';
import type { RefToInput } from './base-field-old';

class FileField extends BaseField {
	fileFormBodyRef!: FileFormBody;

	setValue(val?: string) {
		if (typeof val === 'string') {
			this.currentValue = val;
			this.forceUpdate();
		} else {
			this.props.parentForm.formData![this.props.fieldDesc.fieldName] = undefined;
		}
	}

	isEmpty() {
		return !this.fileFormBodyRef.fileInputRef.value && !this.currentValue;
	}

	async beforeSave() {
		return this.fileFormBodyRef.save(this);
	}

	renderFieldEditable() {
		const field = this.props.fieldDesc;

		let fileName = this.props.initialValue;

		if (fileName && fileName.name) {
			fileName = fileName.name;
		}

		if (this.props.isEdit) {
			const accept = ENV.ALLOWED_UPLOADS.map(i => '.' + i).join(', ');
			return h(FileFormBody, {
				fieldDesc: field,
				ref: (r: FileFormBody) => {
					this.fileFormBodyRef = r;
				},
				accept,
				parent: this,
				currentFileName: fileName,
				isCompact: this.props.isCompact,
				initialValue: this.currentValue,
				parentForm: this.parentForm,
				hideControls: this.props.hideControls
			} as FileFormBodyProps);
		}
		return R.a(
			{ className: 'field-file-link', href: idToFileUrl(fileName), download: true },
			fileName ? fileName.split('/').pop() : undefined
		);
	}
}

interface FileFormBodyProps extends BaseFieldProps {
	/** image/*,.pdf */
	accept: string;
	currentFileName?: string;

}

interface FileFormBodyState extends BaseFieldState {
	file?: File | null;
}

class FileFormBody extends Component<FileFormBodyProps, FileFormBodyState> {
	fileInputRef!: RefToInput;
	formRef!: RefToInput;
	selectButtonRef!: RefToInput;
	waitingForUpload = false;

	constructor(props: FileFormBodyProps) {
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
		(this.props.parent as BaseField).hideTooltip();
	}

	async save(field: BaseField) {
		if (this.waitingForUpload) {
			const n = this.formRef.base as HTMLFormElement;
			const fileId = await submitData('api/uploadFile', serializeForm(n), true);
			if (!fileId) {
				field.props.parentForm.fieldAlert(field.props.fieldDesc.fieldName, L('UPLOAD_ERROR'));
			}
			return fileId;
		}
	}

	afterSave() {
		this.waitingForUpload = false;
	}

	_onChange(ev: InputEvent) {
		ev.preventDefault();
		let files = undefined;
		if (ev.dataTransfer) {
			files = ev.dataTransfer.files;
		} else if (ev.target) {
			files = (ev.target as HTMLInputElement).files;
		}
		if (checkFileSize(files![0])) {
			return;
		}
		this.setState({ file: files![0] });
		this.waitingForUpload = true;

		(this.props.parent as BaseField)!.valueListener(files![0], true);
	}

	render() {
		const field = this.props.fieldDesc;

		let curFile;
		let selFile;

		if (this.props.currentFileName) {
			curFile = R.a(
				{
					href: idToFileUrl(this.props.currentFileName),
					download: true,
					target: '_blank',
					className: 'field-file-link'
				},
				this.props.currentFileName.split('/').pop()
			);
		}

		if (this.state.file) {
			selFile = R.span(
				{ className: 'small-text' },
				L('FILE_SELECTED', this.state.file.name),
				'(',
				(this.state.file.size / 1000).toFixed(2),
				L('KILO_BYTES_SHORT'),
				')'
			);
		}

		const select = R.button(
			{
				className: 'clickable field-button',
				onClick: () => {
					this.fileInputRef.value = null;
					this.fileInputRef.click();
				}
			},
			renderIcon('folder-open'),
			L('FILE_SELECT', getReadableUploadSize())
		);

		let recIdField, nodeIdField;
		if (this.props.parentForm.formData?.id) {
			recIdField = R.input({
				name: 'recId',
				className: 'hidden',
				defaultValue: this.props.parentForm.formData.id
			});
			nodeIdField = R.input({
				name: 'nodeId',
				className: 'hidden',
				defaultValue: this.props.parentForm.nodeDesc.id
			});
		}

		const form = R.form(
			{
				ref: (r: RefToInput) => {
					this.formRef = r;
				},
				encType: 'multipart/form-data',
				className: 'hidden'
			},
			R.input({
				name: 'file',
				ref: (r: RefToInput) => {
					this.fileInputRef = r;
				},
				type: 'file',
				accept: this.props.accept,
				onInput: this._onChange
			}),
			R.input({ name: 'MAX_FILE_SIZE', defaultValue: 30000000 }),
			R.input({ name: 'fid', defaultValue: field.id }),
			R.input({ name: 'nid', defaultValue: field.node!.id }),
			recIdField,
			nodeIdField
		);

		return R.div(null, curFile, selFile, form, select);
	}
}
registerFieldClass(FIELD_TYPE.FILE, FileField);