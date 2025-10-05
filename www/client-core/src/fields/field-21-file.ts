import { Component, h } from 'preact';
import BaseField, { type BaseFieldProps, type BaseFieldState } from '../base-field';
import { ENV } from '../main-frame';
import { Modal } from '../modal';
import { R } from '../r';
import { FIELD_TYPE } from '../types/generated';
import { checkFileSize, getReadableUploadSize, idToFileUrl, L, registerFieldClass, renderIcon, serializeForm, submitData } from '../utils';

export default class FileField extends BaseField {

	accept?: string;

	fileFormBodyRef!: FileFormBody;

	setValue(val?: string) {
		if (typeof val === 'string') {
			this.currentValue = val;
			this.forceUpdate();
		} else {
			this.props.parentForm.formData![this.props.fieldDesc.fieldName] = undefined;
		}
	}

	setAccept(accept: string) {
		this.accept = accept;
		this.forceUpdate();
	}

	getFileData() {
		return this.fileFormBodyRef.getFileData();
	}

	async getFileDataAsString() {
		let dec = new TextDecoder('utf-8');
		try {
			return dec.decode((await this.fileFormBodyRef.getFileData() as any));
		} catch (_er) {
			/** */
		}
	}

	isEmpty() {
		return !this.fileFormBodyRef.fileInputRef.value && !this.currentValue;
	}

	async beforeSave() {
		await this.fileFormBodyRef.save(this);
		return super.beforeSave();
	}

	renderFieldEditable() {
		const field = this.props.fieldDesc;
		let fileName = this.props.initialValue;

		if (fileName && fileName.name) {
			fileName = fileName.name;
		}

		if (this.props.isEdit) {
			const accept = this.accept || ENV.ALLOWED_UPLOADS.map(i => '.' + i).join(', ');
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

}

class FileFormBody extends Component<FileFormBodyProps, FileFormBodyState> {
	fileInputRef!: HTMLInputElement;
	formRef!: HTMLFormElement;
	selectButtonRef!: HTMLInputElement;
	waitingForUpload = false;
	file?: File | null;

	constructor(props: FileFormBodyProps) {
		super(props);
		this.state = {};
		this._onChange = this._onChange.bind(this);
	}

	_cancel() {
		this.file = null;
		this.fileInputRef.value = '';
		Modal.instance.hide();
		(this.props.parent as BaseField).hideTooltip();
		this.forceUpdate();
	}

	async getFileData(): Promise<string | ArrayBuffer | null | undefined> {
		if (this.file) {
			return new Promise((resolve) => {
				const reader = new FileReader();
				reader.onload = () => {
					resolve(reader.result);
				};
				reader.readAsArrayBuffer(this.file!);
			});
		}
	}

	async save(field: BaseField) {
		if (this.waitingForUpload) {
			const n = this.formRef;
			const fileId = await submitData('api/uploadFile', serializeForm(n), true);
			if (!fileId) {
				field.props.parentForm.fieldAlert(field.props.fieldDesc.fieldName, L('UPLOAD_ERROR'));
			}

			await (this.props.parent as FileField)!.valueListener(fileId);

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
		this.file = files![0];
		this.waitingForUpload = true;
		this.props.parentForm.formData![this.props.fieldDesc.fieldName] = 'a'; // force event listener
		(this.props.parent as FileField)!.valueListener(this.file?.name, false);
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

		if (this.file) {
			selFile = R.div(
				{ className: 'selected-file' },
				this.file.name,
				' (',
				(this.file.size / 1000).toFixed(2),
				L('KILO_BYTES_SHORT'),
				')'
			);
		}

		const select = R.button(
			{
				className: 'clickable field-button',
				onClick: () => {
					this.fileInputRef.value = '';
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
				ref: (r: HTMLFormElement) => {
					this.formRef = r;
				},
				encType: 'multipart/form-data',
				className: 'hidden'
			},
			R.input({
				name: 'file',
				ref: (r: HTMLInputElement) => {
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