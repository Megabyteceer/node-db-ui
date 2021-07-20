"use strict";
const {nodePrevs, getClientEventHandler, clearCache} = require('./admin/admin.js');
const {setCurrentOrg, setMultiLang, login, resetPassword, registerUser, activateUser} = require('./auth.js');
const {getNodeDesc, getNodesTree} = require('./desc-node.js');
const {getRecords, deleteRecord} = require('./get-records.js');
const {submitRecord, uniquCheck} = require('./submit.js');
const {uploadImage, uploadFile} = require('./upload.js');

const api = {
	"api/": (reqData, userSession, res) => {
		getRecords(reqData.nodeId, reqData.viewFields, reqData.recId, userSession, reqData, reqData.s).then((data) => {
			let ret = {data};
			if(reqData.descNode) {
				ret.node = getNodeDesc(reqData.nodeId, userSession);
			}
			res(ret);
		});
	},
	"api/getMe": (reqData, userSession, res) => {
		res(userSession);
	},
	"api/getOptions": (reqData, userSession, res) => {
		res(getNodesTree(userSession));
	},
	"api/delete": (reqData, userSession, res) => {
		deleteRecord(reqData.nodeId, reqData.recId, userSession).then(res);
	},
	"api/setCurrentOrg": (reqData, userSession, res) => {
		setCurrentOrg(reqData.orgId, userSession, true).then(res);
	},
	"api/toggleMultilang": (reqData, userSession, res) => {
		setMultiLang(!userSession.langs, userSession).then(res);
	},
	"api/descNode": (reqData, userSession, res) => {
		res(getNodeDesc(reqData.nodeId, userSession));
	},
	"api/submit": (reqData, userSession, res) => {
		submitRecord(reqData.nodeId, reqData.data, reqData.recId, userSession).then(res);
	},
	"api/uploadImage": (reqData, userSession, res) => {
		uploadImage(reqData, userSession).then(res);
	},
	"api/uploadFile": (reqData, userSession, res) => {
		uploadFile(reqData, userSession).then(res);
	},
	"api/uniquCheck": (reqData, userSession, res) => {
		uniquCheck(reqData.fieldId, reqData.nodeId, reqData.val, reqData.recId, userSession).then(res);
	},
	"register": (reqData, userSession, res) => {
		registerUser(reqData).then(res);
	},
	"login": (reqData, userSession, res) => {
		login(reqData.login_username, reqData.login_password).then(res);
	},
	"reset": (reqData, userSession, res) => {
		resetPassword(reqData.key).then(res);
	},
	"activate": (reqData, userSession, res) => {
		activateUser(reqData.key).then(res);
	},
	"admin/nodePrevs": (reqData, userSession, res) => {
		nodePrevs(reqData, userSession).then(res);
	},
	"admin/cache_info": (reqData, userSession, res) => {
		clearCache(userSession).then(res);
	},
	"admin/getEventHandler": (reqData, userSession, res) => {
		getClientEventHandler(reqData, userSession).then(res);
	}
};

module.exports = api;