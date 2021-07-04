const fs = require('fs');
const path = require('path');

const sharp = require("sharp");
const {idToImgURL} = require('../www/both-side-utils');
const {getNodeDesc} = require("./desc-node");

const UPLOADS_PATH = path.join(__dirname, '../www/images/uploads');

const getRadomPattern = () => {
	return Math.floor(Math.random() * 900000000000000 + 100000000000000);
}

const getNewImageID = (originalFileName) => {
	return new Promise((resolve, reject) => {
		let ext = originalFileName.split('.').pop();
		if (ext === 'jpeg') {
			ext = 'jpg';
		}
		let folder = Math.floor(Math.random() * 256).toString(16);
		
		const generateId = (err) => {
			if(err) {
				reject(err);
			}
			let id = folder + '/' + getRadomPattern() + '.' + ext;


			fs.access(path.join(UPLOADS_PATH, id), fs.constants.F_OK, (err) => {
				if(err) {
					resolve(id);
				} else {
					generateId();
				}
			});
		}
		let folderName = path.join(UPLOADS_PATH, folder);
		fs.access(folderName, fs.constants.F_OK, (err) => {
			if(err) {
				fs.mkdir(folderName, generateId);
			} else {
				generateId();
			}
		});
	});
}

async function uploadImage(reqData, userSession) {

	const node = getNodeDesc(parseInt(reqData.nid), userSession);
	const field = node.fields.find(f => f.id === parseInt(reqData.fid));
	if(!field) {
		throw new Error("field " + reqData.fid + " access denied");
	}

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

		
		if(X < 0){
			targetW -= -X * Q;
			targetX = -X * Q;
			W += X;
			X = 0;
		}
		if(Y < 0){
			targetH -= -Y * Q;
			targetY = -Y * Q;
			H += Y;
			Y = 0;
		}
		
		if(W > srcW){
			targetW -= (W - srcW) * Q;
			W = srcW;
		}
		
		if(H > srcH){
			targetH -= (H - srcH) * Q;
			H = srcH;
		}

		await img.extract({left: Math.floor(X), top: Math.floor(Y), width: Math.floor(W), height: Math.floor(H)})
		.resize(targetW, targetH);
		if(meta.format === 'png') {
			await img.flatten({ background: '#FFFFFF' })
		}
	}

	let newFileNameID = await getNewImageID('tmp.jpg');
	let newFileName = idToImgURL(newFileNameID, false);
	
	if(!userSession.uploaded) {
		userSession.uploaded = {};
	}
	

	return new Promise((resolve, reject) => {
		img.toFile(path.join(__dirname, '../www', newFileName), (err, info) => {
			if(err) {
				reject(err);
			}
			userSession.uploaded[reqData.fid] = newFileNameID;
			resolve(newFileNameID);
		});
	});
}

module.exports = {uploadImage};

