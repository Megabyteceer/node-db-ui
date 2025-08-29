import { assert, throwError } from '../www/client-core/src/assert';
import type { UserSession } from '../www/client-core/src/bs-utils';
import { IMAGE_THUMBNAIL_PREFIX } from '../www/client-core/src/bs-utils';

import * as fs from 'fs';
import { join } from 'path';
const sharp = require('sharp');

import { ENV, getFieldDesc, getNodeDesc } from './describe-node';
import { L } from './locale';

/// #if DEBUG
let UPLOADS_IMAGES_PATH = join(__dirname, '../../html/images/uploads');
let UPLOADS_FILES_PATH = join(__dirname, '../../html/uploads/file');

if(!fs.existsSync(UPLOADS_IMAGES_PATH)) {
	UPLOADS_IMAGES_PATH = join(__dirname, '../../www/images/uploads');
	UPLOADS_FILES_PATH = join(__dirname, '../../www/uploads/file');
}

/*
/// #endif
const UPLOADS_IMAGES_PATH = join(__dirname, './html/images/uploads');
const UPLOADS_FILES_PATH = join(__dirname, './html/uploads/file');
//*/

const IMAGE_EXTENSION = '.jpg';
const IMAGE_EXTENSION_TRANSPARENCY = '.png';

const LOOKUP_ICON_HEIGHT = 30;

const getRadomPattern = () => {
	return Math.floor(Math.random() * 0xeffffffffffff + 0x1000000000000).toString(16);
};

const getNewFileDir = () => {
	return new Promise((resolve, reject) => {
		const generateId = () => {
			const folder = getRadomPattern();
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
		};
		generateId();
	});
};

const getNewImageID = (isTransparency): Promise<string> => {
	return new Promise((resolve, reject) => {
		const folder = Math.floor(Math.random() * 256).toString(16);

		const generateId = (err?: NodeJS.ErrnoException) => {
			if(err) {
				reject(err);
			}
			const id = folder + '/' + getRadomPattern() + (isTransparency ? IMAGE_EXTENSION_TRANSPARENCY : IMAGE_EXTENSION);
			fs.access(join(UPLOADS_IMAGES_PATH, id), fs.constants.F_OK, (err) => {
				if(err) {
					resolve(id);
				} else {
					generateId();
				}
			});
		};
		const folderName = join(UPLOADS_IMAGES_PATH, folder);
		fs.access(folderName, fs.constants.F_OK, (err) => {
			if(err) {
				fs.mkdir(folderName, generateId);
			} else {
				generateId();
			}
		});
	});
};

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
		throwError('field ' + reqData.fid + ' access denied');
	}
	return field;
};

async function uploadImage(reqData, userSession: UserSession) {
	if(userSession.isGuest) {
		throwError('unauthorized');
	}

	const field = getFieldForUpload(reqData, userSession);

	let img = await sharp(reqData.fileContent);
	const meta = await img.metadata();

	const targetW = Math.floor(field.maxLength / 10000);
	const targetH = field.maxLength % 10000;

	const srcW = meta.width;
	const srcH = meta.height;

	const isPerfectSize = srcW === targetW && srcH === targetH;

	const isTransparency = meta.format === 'png'; //TODO: Transparency checkbox for image field. Not via extension.

	const extendOptions = {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: { r: 255, g: 255, b: 255, alpha: isTransparency ? 0 : 1 }
	};

	if(!isPerfectSize) {
		let resizeTargetW = targetW;
		let resizeTargetH = targetH;

		let W = parseFloat(reqData.w);
		let H = parseFloat(reqData.h);
		let X = parseFloat(reqData.x);
		let Y = parseFloat(reqData.y);

		const Q = targetW / W;

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

		if(X + W > srcW) {
			resizeTargetW -= (W - srcW) * Q;
			W -= X + W - srcW;
		}

		if(Y + H > srcH) {
			resizeTargetH -= (Y + H - srcH) * Q;
			H -= Y + H - srcH;
		}

		resizeTargetW = Math.round(resizeTargetW);
		resizeTargetH = Math.round(resizeTargetH);

		H = Math.round(H);
		W = Math.round(W);

		targetY = Math.round(targetY);
		targetX = Math.round(targetX);

		await img.extract({ left: Math.round(X), top: Math.round(Y), width: W, height: H });

		await img.resize(resizeTargetW, resizeTargetH);

		if(resizeTargetW < targetW || resizeTargetH < targetH) {
			extendOptions.top = targetY;
			extendOptions.left = targetX;
			extendOptions.right = targetW - resizeTargetW - targetX;
			extendOptions.bottom = targetH - resizeTargetH - targetY;

			await img.extend(extendOptions);
		}
	}

	const newFileNameID = await getNewImageID(isTransparency);
	const newFileName = idToImgURLServer(newFileNameID);

	await img.toFile(newFileName);

	// ===== THUMB GENERATION =====
	img = await img.clone();

	let thumbSizeQ = 1;
	if(targetH > LOOKUP_ICON_HEIGHT) {
		thumbSizeQ = LOOKUP_ICON_HEIGHT / targetH;

		await img.extend({
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			background: { r: 255, g: 255, b: 255, alpha: 1 }
		});

		await img.resize({
			width: Math.floor(thumbSizeQ * targetW),
			height: LOOKUP_ICON_HEIGHT,
			fit: 'contain',
			background: { r: 255, g: 255, b: 255, alpha: 1 }
		});
	}

	await img.flatten({ background: '#FFFFFF' });
	await img.toFile(newFileName + IMAGE_THUMBNAIL_PREFIX);

	if(!userSession.uploaded) {
		userSession.uploaded = {};
	}

	userSession.uploaded[reqData.fid] = newFileNameID;
	return newFileNameID;
}

const idToImgURLServer = (imgId) => {
	assert(imgId, 'idToImgURLServer called for empty imageId');
	return join(UPLOADS_IMAGES_PATH, imgId);
};

export { idToImgURLServer, uploadFile, uploadImage, UPLOADS_FILES_PATH };
