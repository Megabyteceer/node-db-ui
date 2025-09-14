import { Component, h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import type { FormFull__olf } from '../forms/form-full';
import { ENV } from '../main-frame';
import { Modal } from '../modal';
import { R } from '../r';
import { checkFileSize, getReadableUploadSize, idToFileUrl, L, registerFieldClass, renderIcon, serializeForm, submitData } from '../utils';
import type { FieldProps__olf, FieldState__olf, RefToInput } from './base-field';
import { BaseField__old } from './base-field';
import type { FieldWrap__olf } from './field-wrap';

registerFieldClass(
	FIELD_TYPE.FILE,
	class FileField extends BaseField__old {
		fileFormBodyRef!: FileFormBody;

		setValue(val?: string) {
			if (typeof val === 'string') {
				this.setState({ value: val });
			} else {
				(this.props.form as FormFull__olf).currentData[this.props.field.fieldName] = undefined;
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
			const field = this.props.field;

			let fileName = this.props.initialValue;

			if (fileName && fileName.name) {
				fileName = fileName.name;
			}

			if (this.props.isEdit) {
				const accept = ENV.ALLOWED_UPLOADS.map(i => '.' + i).join(', ');
				return h(FileFormBody, {
					field,
					ref: (r: FileFormBody) => {
						this.fileFormBodyRef = r;
					},
					accept,
					wrapper: this.props.wrapper,
					parent: this,
					form: this.props.form,
					currentFileName: fileName,
					isCompact: this.props.isCompact
				});
			}
			return R.a(
				{ className: 'field-file-link', href: idToFileUrl(fileName), download: true },
				fileName ? fileName.split('/').pop() : undefined
			);
		}
	}
);

interface FileFormBodyProps extends FieldProps__olf {
	/** image/*,.pdf */
	accept: string;
	currentFileName?: string;

}

interface FileFormBodyState extends FieldState__olf {
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
		this.props.parent!.props.wrapper.hideTooltip();
	}

	async save(fieldWrap: FieldWrap__olf) {
		if (this.waitingForUpload) {
			const n = this.formRef.base as HTMLFormElement;
			const fileId = await submitData('api/uploadFile', serializeForm(n), true);
			if (!fileId) {
				(fieldWrap.props.form as FormFull__olf).fieldAlert(fieldWrap.props.field!.fieldName, L('UPLOAD_ERROR'));
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

		this.props.wrapper.valueListener(files![0], true);
	}

	render() {
		const field = this.props.field;

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
		if ((this.props.form as FormFull__olf).currentData && (this.props.form as FormFull__olf).currentData.id) {
			recIdField = R.input({
				name: 'recId',
				className: 'hidden',
				defaultValue: (this.props.form as FormFull__olf).currentData.id
			});
			nodeIdField = R.input({
				name: 'nodeId',
				className: 'hidden',
				defaultValue: this.props.form.props.node.id
			});
		}

		const form = R.form(
			{
				ref: (r) => {
					this.formRef = r;
				},
				encType: 'multipart/form-data',
				className: 'hidden'
			},
			R.input({
				name: 'file',
				ref: (r) => {
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

export { FileFormBody };
