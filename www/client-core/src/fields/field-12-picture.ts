import { Component, h, type ComponentChild } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import BaseField from '../base-field';
import { IMAGE_THUMBNAIL_PREFIX } from '../bs-utils';
import type Form from '../form';
import { Modal } from '../modal';
import { R } from '../r';
import { checkFileSize, idToImgURL, L, registerFieldClass, renderIcon, serializeForm, submitData } from '../utils';

class PictureField extends BaseField {
	cropperBody!: CropperFieldBody;

	setValue(value: string) {
		this.currentValue = value;
		this.forceUpdate();
	}

	isEmpty() {
		return !this.cropperBody.references.fileInput.value && !this.currentValue;
	}

	async beforeSave() {
		return this.cropperBody.save(this);
	}

	async afterSave() {
		this.cropperBody.afterSave();
	}

	renderField(): ComponentChild {
		return R.img({
			className: 'field-lookup-icon-pic',
			src: idToImgURL(this.currentValue, this.props.fieldDesc.fieldName) + ((this.props.isCompact && this.currentValue) ? IMAGE_THUMBNAIL_PREFIX : '')
		});
	}

	renderFieldEditable() {
		const field = this.props.fieldDesc;

		const imgUrl = idToImgURL(this.props.initialValue, this.props.fieldDesc.fieldName);

		if (this.props.isEdit) {
			return h(CropperFieldBody, {
				field,
				parent: this,
				form: this.parentForm,
				currentPicUrl: imgUrl,
				isCompact: this.props.isCompact
			} as CropperFieldBodyProps);
		} else if (this.props.isCompact) {
			return R.img({ src: imgUrl + IMAGE_THUMBNAIL_PREFIX, className: 'field-readonly-image' });
		} else {
			return R.img({ src: imgUrl, className: 'field-readonly-image' });
		}
	}
}

registerFieldClass(FIELD_TYPE.IMAGE, PictureField);

interface CropperFieldBodyProps {
	currentPicUrl?: string;
	parent: PictureField;
	form: Form;
}

interface CropperFieldBodyState {
	cleared?: boolean;
	waiting?: boolean;
	src?: string | null;
	cropResult?: string | null;
}

class CropperFieldBody extends Component<CropperFieldBodyProps, CropperFieldBodyState> {

	references: { [key: string]: HTMLInputElement | HTMLFormElement };
	cropper: any;
	waitingForUpload = false;

	constructor(props: CropperFieldBodyProps) {
		super(props);
		props.parent.cropperBody = this;
		this.state = {
			src: '',
			cropResult: null
		};
		this.references = {};
		this._onChange = this._onChange.bind(this);
		this._cancel = this._cancel.bind(this);
		this._cropImage = this._cropImage.bind(this);
		this.clear = this.clear.bind(this);
		this.save = this.save.bind(this);
	}

	_cancel() {
		this.setState({
			src: null
		});
		this.references.fileInput.value = '';
		Modal.instance.hide();
		this.props.parent.hideTooltip();
	}

	_cropImage(exactlySize: boolean | MouseEvent, imgData?: string) {
		if (exactlySize === true) {
			// no cropper need
			this.setState({
				cropResult: imgData,
				src: null
			});
		} else {

			if (typeof this.cropper.cropper.getCroppedCanvas() === 'undefined') {
				return;
			}

			const bounds = this.cropper.cropper.getData();
			this.references.w.value = bounds.width;
			this.references.h.value = bounds.height;
			this.references.x.value = bounds.x;
			this.references.y.value = bounds.y;

			this.setState({
				cleared: false,
				cropResult: this.cropper.cropper.getCroppedCanvas().toDataURL(),
				src: null
			});
			Modal.instance.hide();
			this.props.parent.hideTooltip();
		}
		this.waitingForUpload = true;
	}

	clear() {
		this.setState({
			cleared: true,
			cropResult: null,
			src: ''
		});
		this.waitingForUpload = false;
		this.props.parent!.setValue('');
		this.references.fileInput.value = '';
	}

	async save(imageField: PictureField) {
		if (this.waitingForUpload) {
			const form = this.references.form as HTMLFormElement;
			const imageId = await submitData('api/uploadImage', serializeForm(form), true).catch(
				(_er) => {}
			);
			if (!imageId) {
				imageField.parentForm.fieldAlert(imageField.props.fieldDesc.fieldName, L('IMAGE_UPLOAD_ERROR'));
			}
			return imageId;
		} else if (this.state.cleared) {
			return '';
		}
	}

	afterSave() {
		this.waitingForUpload = false;
	}

	_onChange(e: InputEvent) {
		e.preventDefault();
		let files = undefined;
		if (e.dataTransfer) {
			files = e.dataTransfer.files;
		} else if (e.target) {
			files = (e.target as HTMLInputElement).files;
		}
		if (files!.length > 0) {
			if (checkFileSize(files![0])) {
				return;
			}
			const reader = new FileReader();
			reader.onload = () => {
				this.setState({ waiting: false, src: reader.result as string, cropResult: null });
				this.waitingForUpload = false;
				const selectedImage = new Image();
				selectedImage.onload = () => {
					this._cropImage(true, reader.result as string);
					/* TODO cropper
					const cropperLoader = import('react-cropper');
					cropperLoader.then((module) => {
						const ReactCropper = module.Cropper;
						const field = this.props.field;
						const w = Math.floor(field.maxLength / 10000);
						const h = field.maxLength % 10000;

						if (w === selectedImage.width && h === selectedImage.height) {
							this._cropImage(true, reader.result as string);
						} else {
							let cropperW = 900;
							let cropperH = (900 / w) * h;
							if (cropperH > 350) {
								cropperH = 350;
								cropperW = (350 / h) * w;
							}

							myAlert(
								R.div(
									{ className: 'image-copper-popup' },
									h(ReactCropper, {
										zoomable: false,
										style: { margin: 'auto', height: cropperH, width: cropperW },
										aspectRatio: w / h,
										preview: '.image-copper-preview',
										guides: false,
										src: reader.result,
										ref: (ref) => {
											this.cropper = ref;
										},
									}),
									R.div(
										{ className: 'image-copper-controls' },
										R.button(
											{ className: 'clickable image-copper-crop-btn', onClick: this._cropImage },
											renderIcon('check'),
											L('APPLY')
										),
										R.button(
											{ className: 'clickable image-copper-cancel-btn', onClick: this._cancel },
											renderIcon('times'),
											L('CANCEL')
										),
										R.div(
											{ className: 'box', style: { margin: '30px auto', width: w, height: h } },
											L('PREVIEW'),
											R.div({ className: 'image-copper-preview', style: { width: w, height: h } })
										)
									)
								),
								true,
								false,
								true
							);
						}
					});
					*/
				};

				selectedImage.src = reader.result as string;
			};
			this.setState({ waiting: true });
			reader.readAsDataURL(files![0]);
		}
	}

	render() {
		const field = this.props.parent.props.fieldDesc;
		let w = Math.floor(field.maxLength! / 10000);
		let h = field.maxLength! % 10000;
		const recW = w;
		const recH = h;

		if (this.props.parent.props.isCompact) {
			w /= 3;
			h /= 3;
		}
		let body;
		let select;
		let preview;

		let clrBtn;
		if (
			this.state.cropResult ||
			this.state.src ||
			(this.props.currentPicUrl &&
				this.props.currentPicUrl !== 'images/placeholder_' + field.fieldName + '.png')
		) {
			clrBtn = R.button(
				{ className: 'clickable tool-btn clear-btn', onClick: this.clear },
				renderIcon('times')
			);
		}

		if (this.state.src) {
			body = clrBtn;
		} else {
			if (this.state.waiting) {
				body = renderIcon('cog fa-spin fa-2x');
			} else {
				let imgSrc = this.state.cropResult || this.props.currentPicUrl;
				if (this.state.cleared) {
					imgSrc = idToImgURL(undefined, field.fieldName);
				}

				preview = R.img({
					ref: (r: HTMLInputElement) => {
						this.references.img = r;
					},
					style: { width: w / 2, height: h / 2 },
					src: imgSrc,
					className: 'clickable image-crop-preview',
					onClick: () => {
						this.references.fileInput.value = null;
						this.references.fileInput.click();
					}
				});

				select = R.div(
					null,
					R.button(
						{
							className: 'clickable success-button button-small',
							onClick: () => {
								this.references.fileInput.value = null;
								this.references.fileInput.click();
							}
						},
						renderIcon('folder-open'),
						L('SELECT_IMG')
					),
					clrBtn
				);
			}
		}

		const form = R.form(
			{
				ref: (r: HTMLInputElement) => {
					this.references.form = r;
				},
				encType: 'multipart/form-data',
				className: 'hidden'
			},
			R.input({
				name: 'file',
				ref: (r: HTMLInputElement) => {
					this.references.fileInput = r;
				},
				type: 'file',
				accept: '.jpg, .jpeg, .png, .gif',
				onInput: this._onChange
			}),
			R.input({ name: 'MAX_FILE_SIZE', defaultValue: 3000000 }),
			R.input({ name: 'fid', defaultValue: field.id }),
			R.input({ name: 'nid', defaultValue: field.node!.id }),
			R.input({
				name: 'w',
				ref: (r: HTMLInputElement) => {
					this.references.w = r;
				}
			}),
			R.input({
				name: 'h',
				ref: (r: HTMLInputElement) => {
					this.references.h = r;
				}
			}),
			R.input({
				name: 'x',
				ref: (r: HTMLInputElement) => {
					this.references.x = r;
				}
			}),
			R.input({
				name: 'y',
				ref: (r: HTMLInputElement) => {
					this.references.y = r;
				}
			})
		);

		return R.div(
			null,
			R.div(
				null,
				preview,
				body,
				R.div({ className: 'small-text' }, L('RECOMMEND_SIZE', recW).replace('%', recH.toString())),
				form
			),
			select
		);
	}
}
