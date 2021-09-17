import { RecordsDataResponse } from 'www/js/bs-utils';
import { nodePrivileges, getClientEventHandler, clearCache } from './admin/admin';
import { setCurrentOrg, setMultilingual, login, resetPassword, registerUser, activateUser } from './auth';
import { getNodeDesc, getNodesTree } from './descript-node';
import { getRecords, deleteRecord } from './get-records';
import { submitRecord, uniqueCheck } from './submit';
import { uploadImage, uploadFile } from './upload';

const api = {
	"api/": (reqData, userSession, res) => {
		getRecords(reqData.nodeId, reqData.viewFields, reqData.recId, userSession, reqData, reqData.s).then((data) => {
			let ret: RecordsDataResponse = { data };
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
	"api/toggleMultilingual": (reqData, userSession, res) => {
		setMultilingual(!userSession.langs, userSession).then(res);
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
	"api/uniqueCheck": (reqData, userSession, res) => {
		uniqueCheck(reqData.fieldId, reqData.nodeId, reqData.val, reqData.recId, userSession).then(res);
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
	"admin/nodePrivileges": (reqData, userSession, res) => {
		nodePrivileges(reqData, userSession).then(res);
	},
	"admin/cache_info": (reqData, userSession, res) => {
		clearCache(userSession).then(res);
	},
	"admin/editEventHandler": (reqData, userSession, res) => {
		getClientEventHandler(reqData, userSession).then(res);
	}
};

export default api;