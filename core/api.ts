import { RecordsDataResponse } from 'www/js/bs-utils';
import { nodePrivileges, getClientEventHandler, clearCache } from './admin/admin';
import { setCurrentOrg, setMultilingual, resetPassword, activateUser, killSession, getGuestUserForBrowserLanguage } from './auth';
import { getNodeDesc, getNodesTree } from './describe-node';
import { getRecords, deleteRecord } from './get-records';
import { submitRecord, uniqueCheck } from './submit';
import { uploadImage, uploadFile } from './upload';

const api = {
	"api/": async (reqData, userSession) => {
		const data = await getRecords(reqData.nodeId, reqData.viewFields, reqData.recId, userSession, reqData, reqData.s);
		let ret: RecordsDataResponse = { data };
		if(reqData.descNode) {
			ret.node = getNodeDesc(reqData.nodeId, userSession);
		}
		return ret;
	},
	"api/logout": (reqData, userSession) => {
		killSession(userSession);
		return Promise.resolve(getGuestUserForBrowserLanguage(reqData.headers['accept-language']));
	},
	"api/getMe": (reqData, userSession) => {
		return Promise.resolve(userSession);
	},
	"api/getOptions": (reqData, userSession) => {
		return Promise.resolve(getNodesTree(userSession));
	},
	"api/delete": (reqData, userSession) => {
		return deleteRecord(reqData.nodeId, reqData.recId, userSession);
	},
	"api/setCurrentOrg": (reqData, userSession) => {
		return setCurrentOrg(reqData.orgId, userSession, true);
	},
	"api/toggleMultilingual": (reqData, userSession) => {
		return setMultilingual(!userSession.langs, userSession);
	},
	"api/descNode": (reqData, userSession) => {
		return Promise.resolve(getNodeDesc(reqData.nodeId, userSession));
	},
	"api/submit": (reqData, userSession) => {
		return submitRecord(reqData.nodeId, reqData.data, reqData.recId, userSession);
	},
	"api/uploadImage": (reqData, userSession) => {
		return uploadImage(reqData, userSession);
	},
	"api/uploadFile": (reqData, userSession) => {
		return uploadFile(reqData, userSession);
	},
	"api/uniqueCheck": (reqData, userSession) => {
		return uniqueCheck(reqData.fieldId, reqData.nodeId, reqData.val, reqData.recId, userSession);
	},
	"api/reset": (reqData, userSession) => {
		return resetPassword(reqData.resetCode, reqData.userId, userSession);
	},
	"api/activate": (reqData, userSession) => {
		return activateUser(reqData.activationKey, userSession);
	},
	"admin/nodePrivileges": (reqData, userSession) => {
		return nodePrivileges(reqData, userSession);
	},
	"admin/cache_info": (reqData, userSession) => {
		return clearCache(userSession);
	},
	"admin/editEventHandler": (reqData, userSession) => {
		return getClientEventHandler(reqData, userSession);
	}
};

export default api;