"use strict";
const fs = require('fs');
const path = require('path');

const sharp = require("sharp");
const ENV = require("../ENV.js");
const {getNodeDesc, getFieldDesc} = require("./desc-node");
const {L} = require("./locale.js");
const {throwError} = require("./utils.js");

const UPLOADS_IMAGES_PATH = path.join(__dirname, '../www/images/uploads');
const UPLOADS_FILES_PATH = path.join(__dirname, '../www/uploads/file');

const getRadomPattern = () => {
	return Math.floor(Math.random() * 0xEffffffffffff + 0x1000000000000).toString(16);
}

const getNewFileDir = () => {
	return new Promise((resolve, reject) => {
		const generateId = () => {
			let folder = getRadomPattern();
			const folderName = path.join(UPLOADS_FILES_PATH, folder);
			fs.access(folderName, fs.constants.F_OK, (err) => {
				if(err) {
					fs.mkdir(folderName, (err) => {
						if(err) {
							reject(err);
						} else {
							resolve(folder);
						}
					});
				} else {
					generateId();
				}
			});
		}
		generateId();
	});
}



const getNewImageID = (originalFileName) => {
	return new Promise((resolve, reject) => {
		let ext = originalFileName.split('.').pop();
		if(ext === 'jpeg') {
			ext = 'jpg';
		}
		let folder = Math.floor(Math.random() * 256).toString(16);

		const generateId = (err) => {
			if(err) {
				reject(err);
			}
			let id = folder + '/' + getRadomPattern() + '.' + ext;

			fs.access(path.join(UPLOADS_IMAGES_PATH, id), fs.constants.F_OK, (err) => {
				if(err) {
					resolve(id);
				} else {
					generateId();
				}
			});
		}
		let folderName = path.join(UPLOADS_IMAGES_PATH, folder);
		fs.access(folderName, fs.constants.F_OK, (err) => {
			if(err) {
				fs.mkdir(folderName, generateId);
			} else {
				generateId();
			}
		});
	});
}


let allowedUpload;

async function uploadFile(reqData, userSession) {
	if(reqData.filename.indexOf('..') >= 0) {
		throwError(L('UPL_ERROW_WFN'));
	}
	const field = getFieldForUpload(reqData, userSession);
	if(!allowedUpload) {
		allowedUpload = RegExp('\\.(' + ENV.ALLOWED_UPLOADS.join('|') + ')$', 'i');
	}
	if(!allowedUpload.test(reqData.filename)) {
		throwError(L('FILE_TYPE_NA', reqData.filename));
	}
	const newFileName = (await getNewFileDir()) + '/' + reqData.filename;

	return new Promise((resolve, reject) => {
		fs.writeFile(path.join(UPLOADS_FILES_PATH, newFileName), reqData.fileContent, (err) => {
			if(err) {
				reject(err);
			}
			if(!userSession.uploaded) {
				userSession.uploaded = {};
			}
			userSession.uploaded[reqData.fid] = newFileName;
			resolve(newFileName);
		});
	});
}

const getFieldForUpload = (reqData, userSession) => {
	getNodeDesc(parseInt(reqData.nid), userSession);
	const field = getFieldDesc(parseInt(reqData.fid));
	if(!field) {
		throwError("field " + reqData.fid + " access denied");
	}
	return field;
}

async function uploadImage(reqData, userSession) {

	const field = getFieldForUpload(reqData, userSession);

	let img = await sharp(reqData.fileContent);
	let meta = await img.metadata();

	let targetW = Math.floor(field.maxlen / 10000);
	let targetH = field.maxlen % 10000;

	let srcW = meta.width;
	let srcH = meta.height;

	const isPerfectSize = (srcW === targetW) && (srcH === targetH);

	if(!isPerfectSize) {

		let W = parseFloat(reqData.w);
		let H = parseFloat(reqData.h);
		let X = parseFloat(reqData.x);
		let Y = parseFloat(reqData.y);

		let Q = targetW / W;
		let targetX = 0;
		let targetY = 0;


		if(X < 0) {
			targetW -= -X * Q;
			targetX = -X * Q;
			W += X;
			X = 0;
		}
		if(Y < 0) {
			targetH -= -Y * Q;
			targetY = -Y * Q;
			H += Y;
			Y = 0;
		}

		if(W > srcW) {
			targetW -= (W - srcW) * Q;
			W = srcW;
		}

		if(H > srcH) {
			targetH -= (H - srcH) * Q;
			H = srcH;
		}

		await img.extract({left: Math.floor(X), top: Math.floor(Y), width: Math.floor(W), height: Math.floor(H)})
			.resize(targetW, targetH);
		if(meta.format === 'png') {
			await img.flatten({background: '#FFFFFF'})
		}
	}

	let newFileNameID = await getNewImageID('tmp.jpg');
	let newFileName = idToImgURLServer(newFileNameID);

	return new Promise((resolve, reject) => {
		img.toFile(newFileName, (err, info) => {
			if(err) {
				reject(err);
			}
			if(!userSession.uploaded) {
				userSession.uploaded = {};
			}
			userSession.uploaded[reqData.fid] = newFileNameID;
			resolve(newFileNameID);
		});
	});
}

const idToImgURLServer = (imgId) => {
	assert(imgId, "idToImgURLServer called for empty imageId");
	return path.join(UPLOADS_IMAGES_PATH, imgId);
}

module.exports = {uploadImage, uploadFile, UPLOADS_FILES_PATH, idToImgURLServer};
