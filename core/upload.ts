
import { assert, IMAGE_THUMBNAIL_PREFIX, throwError } from "../www/client-core/src/bs-utils";

import { join } from "path";
import * as fs from "fs";
const sharp = require("sharp");
import ENV from "./ENV";
import { getNodeDesc, getFieldDesc } from "./describe-node";
import { L } from "./locale";

const UPLOADS_IMAGES_PATH = join(__dirname, '../../www/images/uploads');
const UPLOADS_FILES_PATH = join(__dirname, '../../www/uploads/file');

const IMAGE_EXTENSION = '.jpg';

const LOOKUP_ICON_HEIGHT = 30;

const getRadomPattern = () => {
	return Math.floor(Math.random() * 0xEffffffffffff + 0x1000000000000).toString(16);
}

const getNewFileDir = () => {
	return new Promise((resolve, reject) => {
		const generateId = () => {
			let folder = getRadomPattern();
			const folderName = join(UPLOADS_FILES_PATH, folder);
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



const getNewImageID = () => {
	return new Promise((resolve, reject) => {
		let folder = Math.floor(Math.random() * 256).toString(16);

		const generateId = (err?: NodeJS.ErrnoException) => {
			if(err) {
				reject(err);
			}
			let id = folder + '/' + getRadomPattern() + IMAGE_EXTENSION;

			fs.access(join(UPLOADS_IMAGES_PATH, id), fs.constants.F_OK, (err) => {
				if(err) {
					resolve(id);
				} else {
					generateId();
				}
			});
		}
		let folderName = join(UPLOADS_IMAGES_PATH, folder);
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
		throwError(L('UPL_ERROR_WFN', userSession));
	}
	getFieldForUpload(reqData, userSession); //Check access to the field
	if(!allowedUpload) {
		allowedUpload = RegExp('\\.(' + ENV.ALLOWED_UPLOADS.join('|') + ')$', 'i');
	}
	if(!allowedUpload.test(reqData.filename)) {
		throwError(L('FILE_TYPE_NA', userSession, reqData.filename));
	}
	const newFileName = (await getNewFileDir()) + '/' + reqData.filename;

	return new Promise((resolve, reject) => {
		fs.writeFile(join(UPLOADS_FILES_PATH, newFileName), reqData.fileContent, (err) => {
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

	let targetW = Math.floor(field.maxLength / 10000);
	let targetH = field.maxLength % 10000;

	let srcW = meta.width;
	let srcH = meta.height;

	const isPerfectSize = (srcW === targetW) && (srcH === targetH);

	if(!isPerfectSize) {

		let resizeTargetW = targetW;
		let resizeTargetH = targetH;

		let W = parseFloat(reqData.w);
		let H = parseFloat(reqData.h);
		let X = parseFloat(reqData.x);
		let Y = parseFloat(reqData.y);

		let Q = targetW / W;

		let targetX = 0;
		let targetY = 0;

		if(X < 0) {
			resizeTargetW -= -X * Q;
			targetX = -X * Q;
			W += X;
			X = 0;
		}
		if(Y < 0) {
			resizeTargetH -= -Y * Q;
			targetY = -Y * Q;
			H += Y;
			Y = 0;
		}

		if((X + W) > srcW) {
			resizeTargetW -= (W - srcW) * Q;
			W -= (X + W) - srcW;
		}

		if((Y + H) > srcH) {
			resizeTargetH -= ((Y + H) - srcH) * Q;
			H -= (Y + H) - srcH;
		}

		resizeTargetW = Math.round(resizeTargetW);
		resizeTargetH = Math.round(resizeTargetH);

		H = Math.round(H);
		W = Math.round(W);

		targetY = Math.round(targetY);
		targetX = Math.round(targetX);

		await img.extract({ left: Math.round(X), top: Math.round(Y), width: W, height: H })
		await img.resize(resizeTargetW, resizeTargetH);

		if(resizeTargetW < targetW || resizeTargetH < targetH) {
			await img.extend({
				top: targetY,
				left: targetX,
				right: targetW - resizeTargetW - targetX,
				bottom: targetH - resizeTargetH - targetY,
				background: { r: 255, g: 255, b: 255, alpha: 1 }
			});
		}

		if(meta.format === 'png') {
			await img.flatten({ background: '#FFFFFF' })
		}
	}

	let newFileNameID = await getNewImageID();
	let newFileName = idToImgURLServer(newFileNameID);

	await img.toFile(newFileName);
	if(targetH > LOOKUP_ICON_HEIGHT) {
		await img.resize(Math.floor(LOOKUP_ICON_HEIGHT / targetH * targetW), LOOKUP_ICON_HEIGHT);
	}
	await img.toFile(newFileName + IMAGE_THUMBNAIL_PREFIX);

	if(!userSession.uploaded) {
		userSession.uploaded = {};
	}

	userSession.uploaded[reqData.fid] = newFileNameID;
	return newFileNameID;
}

const idToImgURLServer = (imgId) => {
	assert(imgId, "idToImgURLServer called for empty imageId");
	return join(UPLOADS_IMAGES_PATH, imgId);
}

export { uploadImage, uploadFile, UPLOADS_FILES_PATH, idToImgURLServer };
