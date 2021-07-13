"use strict";
const {nodePrevs, getClientEventHandler} = require('./admin/admin.js');
const {setCurrentOrg, setMultiLang, login, resetPassword, registerUser, activateUser} = require('./auth.js');
const {getNodeDesc, getNodesTree} = require('./desc-node.js');
const {getRecords, deleteRecord} = require('./get-records.js');
const {submitRecord} = require('./sumbit.js');
const {uploadImage, uploadFile} = require('./upload.js');

const api = {
	"api/":(reqData, userSession, res) => {
		getRecords(reqData.nodeId, reqData.viewFields, reqData.recId, userSession, reqData, reqData.s).then((data) => {
			let ret = {data};
			if(reqData.descNode) {
				ret.node = getNodeDesc(reqData.nodeId, userSession);
			}
			res(ret);
		});
	},
	"api/getMe.php":(reqData, userSession, res) => {
		res(userSession);
	},
	"api/getNodes.php":(reqData, userSession, res) => {
		res(getNodesTree(userSession));
	},
	"api/delete.php":(reqData, userSession, res) => {
		deleteRecord(reqData.nodeId, reqData.recId, userSession).then(res);
	},
	"api/setCurrentOrg.php":(reqData, userSession, res) => {
		setCurrentOrg(reqData.orgId, userSession, true).then(res);
	},
	"api/toggleMultilang.php":(reqData, userSession, res) => {
		setMultiLang(!userSession.langs, userSession).then(res);
	},
	"api/descNode.php":(reqData, userSession, res) => {
		res({data: getNodeDesc(reqData.nodeId, userSession)});
	},
	"api/submit.php":(reqData, userSession, res) => {
		submitRecord(reqData.nodeId, reqData.data, reqData.recId, userSession).then(res);
	},
	"api/uploadImage.php":(reqData, userSession, res) => {
		uploadImage(reqData, userSession).then(res);
	},
	"api/uploadFile.php":(reqData, userSession, res) => {
		uploadFile(reqData, userSession).then(res);
	},
	"register.php":(reqData, userSession, res) => {
		registerUser(reqData).then(res);
	},
	"login.php":(reqData, userSession, res) => {
		login(reqData.login_username, reqData.login_password).then(res);
	},
	"reset.php":(reqData, userSession, res) => {
		resetPassword(reqData.key).then(res);
	},
	"activate.php":(reqData, userSession, res) => {
		activateUser(reqData.key).then(res);
	},
	"admin/nodePrevs.php":(reqData, userSession, res) => {
		nodePrevs(reqData, userSession).then(res);
	},
	"admin/getEventHandler.php":(reqData, userSession, res) => {
		getClientEventHandler(reqData, userSession).then(res);
	}
};

module.exports = api;