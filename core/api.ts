import { RecordsDataResponse, UserSession } from '../www/client-core/src/bs-utils';
/// #if DEBUG
import { clearCache, getClientEventHandler, nodePrivileges } from './admin/admin';
import { getDeployPackage } from './admin/deploy';
/// #endif

import {
	activateUser,
	getGuestUserForBrowserLanguage,
	killSession,
	resetPassword,
	setCurrentOrg,
	setMultilingual,
} from './auth';
import { getNodeDesc, getNodesTree } from './describe-node';
import { deleteRecord, getRecords } from './get-records';
import { submitRecord, uniqueCheck } from './submit';
import { uploadFile, uploadImage } from './upload';

const api: Object = {
	'api/': async (reqData, userSession: UserSession) => {
		const data = await getRecords(
			reqData.nodeId,
			reqData.viewFields,
			reqData.recId,
			userSession,
			reqData,
			reqData.s
		);
		let ret: RecordsDataResponse = { data };
		if (reqData.descNode) {
			ret.node = getNodeDesc(reqData.nodeId, userSession);
		}
		return ret;
	},
	'api/logout': (reqData, userSession: UserSession) => {
		killSession(userSession);
		return Promise.resolve(getGuestUserForBrowserLanguage(userSession.lang.code));
	},
	'api/getMe': (reqData, userSession: UserSession) => {
		return Promise.resolve(userSession);
	},
	'api/getOptions': (reqData, userSession: UserSession) => {
		return Promise.resolve(getNodesTree(userSession));
	},
	'api/delete': (reqData, userSession: UserSession) => {
		return deleteRecord(reqData.nodeId, reqData.recId, userSession);
	},
	'api/setCurrentOrg': (reqData, userSession: UserSession) => {
		return setCurrentOrg(reqData.orgId, userSession, true);
	},
	'api/toggleMultilingual': (reqData, userSession: UserSession) => {
		return setMultilingual(!userSession.multilingualEnabled, userSession);
	},
	'api/descNode': (reqData, userSession: UserSession) => {
		return Promise.resolve(getNodeDesc(reqData.nodeId, userSession));
	},
	'api/submit': (reqData, userSession: UserSession) => {
		return submitRecord(reqData.nodeId, reqData.data, reqData.recId, userSession);
	},
	'api/uploadImage': (reqData, userSession: UserSession) => {
		return uploadImage(reqData, userSession);
	},
	'api/uploadFile': (reqData, userSession: UserSession) => {
		return uploadFile(reqData, userSession);
	},
	'api/uniqueCheck': (reqData, userSession: UserSession) => {
		return uniqueCheck(reqData.fieldId, reqData.nodeId, reqData.val, reqData.recId, userSession);
	},
	'api/reset': (reqData, userSession: UserSession) => {
		return resetPassword(reqData.resetCode, reqData.userId, userSession);
	},
	'api/activate': (reqData, userSession: UserSession) => {
		return activateUser(reqData.activationKey, userSession);
	},
	/// #if DEBUG
	'admin/nodePrivileges': (reqData, userSession: UserSession) => {
		return nodePrivileges(reqData, userSession);
	},
	'admin/cache_info': (reqData, userSession: UserSession) => {
		return clearCache(userSession);
	},
	'admin/editEventHandler': (reqData, userSession: UserSession) => {
		return getClientEventHandler(reqData, userSession);
	},
	'admin/getDeployPackage': (reqData, userSession: UserSession) => {
		return getDeployPackage(reqData, userSession);
	},
	/// #endif
};

export default api;
