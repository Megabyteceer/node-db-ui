import ReactDOM from "react-dom";
import React from "react";

import { checkFileSize, idToImgURL, L, myAlert, renderIcon, serializeForm, submitData } from "../utils";
import { registerFieldClass } from "../utils";
import { BaseField, RefToInput } from "./base-field";
import { Modal } from "../modal";
import { Component } from "react";
import { R } from "../r";
import { FIELD_TYPE } from "../bs-utils";

registerFieldClass(FIELD_TYPE.PICTURE, class PictureField extends BaseField {

	cropperBody: CropperFieldBody;

	setValue(value) {
		this.setState({ value });
	}

	isEmpty() {
		return !this.cropperBody.references.fileInput.value && !this.state.value;
	}

	focus() {
		this.cropperBody.references.selectButton.focus();
	}

	async beforeSave() {
		return this.cropperBody.save();
	}

	render() {
		var field = this.props.field;

		var imgUrl = idToImgURL(this.props.initialValue, this.props.field.fieldName);

		if(this.props.isEdit) {
			return React.createElement(CropperFieldBody, { field, ref: (r) => { this.cropperBody = r; }, parent: this, form: this.props.form, currentPicUrl: imgUrl, isCompact: this.props.isCompact });
		} else {
			return R.img({ src: imgUrl, className: "field-readonly-image" })
		}
	}
});


class CropperFieldBody extends Component<any, any> {

	references: { [key: string]: RefToInput };
	cropper: any;

	constructor(props) {
		super(props);
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
		this.props.parent.props.wrapper.hideTooltip();
	}

	_cropImage(exactlySize, imgData) {

		if(exactlySize === true) {//no cropper need
			this.setState({
				cropResult: imgData,
				src: null
			});
		} else {
			// @ts-ignore
			if(typeof this.cropper.cropper.getCroppedCanvas() === 'undefined') {
				return;
			}

			// @ts-ignore
			var bounds = this.cropper.cropper.getData();
			this.references.w.value = bounds.width;
			this.references.h.value = bounds.height;
			this.references.x.value = bounds.x;
			this.references.y.value = bounds.y;

			this.setState({
				cleared: false,
				// @ts-ignore
				cropResult: this.cropper.cropper.getCroppedCanvas().toDataURL(),
				src: null
			});
			Modal.instance.hide();
			this.props.parent.props.wrapper.hideTooltip();
		}
	}

	clear() {
		this.setState({
			cleared: true,
			cropResult: null,
			src: ''
		});
		this.props.parent.setValue('');
		this.references.fileInput.value = '';
	}

	async save() {
		if(this.state.cropResult) {
			let form = ReactDOM.findDOMNode(this.references.form);
			return submitData('api/uploadImage', serializeForm(form), true).catch((er) => {
				myAlert(L('UPLOAD_ERROR'));
			});
		} else if(this.state.cleared) {
			return '';
		}
	}

	_onChange(e) {
		e.preventDefault();
		var files = undefined;
		if(e.dataTransfer) {
			files = e.dataTransfer.files;
		} else if(e.target) {
			files = e.target.files;
		}
		if(files.length > 0) {
			if(checkFileSize(files[0])) {
				return;
			}
			var reader = new FileReader();
			reader.onload = () => {
				this.setState({ waiting: 0, src: reader.result, cropResult: false });

				var selectedImage = new Image();
				const cropperLoader = import('react-cropper');

				selectedImage.onload = () => {
					cropperLoader.then((module) => {
						const ReactCropper = module.Cropper;
						var field = this.props.field;
						var w = Math.floor(field.maxLength / 10000);
						var h = field.maxLength % 10000;

						if((w === selectedImage.width) && (h === selectedImage.height)) {
							this._cropImage(true, reader.result);
						} else {


							var cropperW = 900;
							var cropperH = 900 / w * h;
							if(cropperH > 350) {
								cropperH = 350;
								cropperW = 350 / h * w;
							}

							myAlert(R.div({ className: 'image-copper-popup' },
								React.createElement(ReactCropper, {
									zoomable: false,
									style: { margin: 'auto', height: cropperH, width: cropperW },
									aspectRatio: w / h,
									preview: '.image-copper-preview',
									guides: false,
									// @ts-ignore
									src: reader.result,
									ref: (ref) => {
										this.cropper = ref;
									}
								}),
								R.div({ className: 'image-copper-controls' },
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
							), true, false, true);
						}
					});
				};
				// @ts-ignore
				selectedImage.src = reader.result;
			};
			this.setState({ waiting: 1 });
			reader.readAsDataURL(files[0]);
		}
	}

	render() {

		var field = this.props.field;
		var w = Math.floor(field.maxLength / 10000);
		var h = field.maxLength % 10000;
		var recW = w;
		var recH = h;

		if(this.props.isCompact) {
			w /= 3;
			h /= 3;
		}
		var body;
		var select;
		var preview;

		var clrBtn;
		if(this.state.cropResult || this.state.src || this.props.currentPicUrl && this.props.currentPicUrl !== 'images/placeholder_' + field.fieldName + '.png') {
			clrBtn = R.button({ className: 'clickable tool-btn clear-btn', onClick: this.clear },
				renderIcon('times')
			)
		}

		if(this.state.src) {
			body = clrBtn;
		} else {

			if(this.state.waiting) {
				body = renderIcon('cog fa-spin fa-2x');
			} else {

				var imgSrc = this.state.cropResult || this.props.currentPicUrl;
				if(this.state.cleared) {
					imgSrc = idToImgURL(0, field.fieldName);
				}

				preview = R.img({
					ref: (r) => { this.references.img = r; }, style: { borderRadius: '5px', width: w / 2, height: h / 2 }, src: imgSrc, className: 'clickable', onClick: () => {
						this.references.fileInput.value = null;
						this.references.fileInput.click();
					}
				});


				select = R.div(null,
					R.button({
						className: 'clickable success-button button-small', onClick: () => {
							this.references.fileInput.value = null;
							this.references.fileInput.click();
						}
					}, renderIcon('folder-open'),
						L('SELECT_IMG')
					),
					clrBtn
				);
			}
		}

		var form = R.form({ ref: (r) => { this.references.form = r; }, encType: "multipart/form-data", className: 'hidden' },
			R.input({ name: "picture", ref: (r) => { this.references.fileInput = r; }, type: 'file', accept: ".jpg, .jpeg, .png, .gif", onChange: this._onChange }),
			R.input({ name: "MAX_FILE_SIZE", defaultValue: 3000000 }),
			R.input({ name: "fid", defaultValue: field.id }),
			R.input({ name: "nid", defaultValue: field.node.id }),
			R.input({ name: "w", ref: (r) => { this.references.w = r; } }),
			R.input({ name: "h", ref: (r) => { this.references.h = r; } }),
			R.input({ name: "x", ref: (r) => { this.references.x = r; } }),
			R.input({ name: "y", ref: (r) => { this.references.y = r; } })
		);

		return R.div(null,
			R.div(null,
				preview,
				body,
				R.div({ className: 'small-text' }, L('RECOMMEND_SIZE', recW).replace('%', recH)),
				form
			),
			select
		);
	}
}