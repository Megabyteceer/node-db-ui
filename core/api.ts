import { NODE_TYPE, type NODE_ID } from '../types/generated';
import type { APIResult, GetRecordsFilter, GetRecordsParams, RecId, RecordDataWriteDraftable, RecordsDataResponse, UserSession } from '../www/client-core/src/bs-utils';
/// #if DEBUG
import { dumpDB, editEventHandler, nodePrivileges, recoveryDB } from './admin/admin';
import { getDeployPackage, isFiledExists, isTableExists } from './admin/deploy';
/// #endif

import { activateUser, getGuestUserForBrowserLanguage, killSession, resetPassword, setCurrentOrg, setMultilingual } from './auth';
import { getNodeDesc, getNodesTree } from './describe-node';
import { deleteRecord, getRecords } from './get-records';
import { submitRecord, uniqueCheck } from './submit';
import { uploadFile, uploadImage } from './upload';

export type APIHandler = (any: any, UserSession: UserSession) => APIResult;

const api: object = {
	'api/': async (reqData: GetRecordsParams & GetRecordsFilter, userSession: UserSession) => {
		const node = getNodeDesc(reqData.nodeId, userSession);
		const data = (node.nodeType === NODE_TYPE.DOCUMENT && node.storeForms) ? await getRecords(
			reqData.nodeId,
			reqData.viewFields!,
			reqData.recId as RecId[],
			userSession,
			reqData,
			reqData.s
		) : undefined;
		const ret: RecordsDataResponse = { data };
		if (reqData.descNode) {
			ret.node = node;
		}
		return ret;
	},
	'api/logout': (_reqData, userSession: UserSession) => {
		killSession(userSession);
		return Promise.resolve(getGuestUserForBrowserLanguage(userSession.lang.code));
	},
	'api/getMe': (_reqData, userSession: UserSession) => {
		return Promise.resolve(userSession);
	},
	'api/getOptions': (_reqData, userSession: UserSession) => {
		return Promise.resolve(getNodesTree(userSession));
	},
	'api/delete': (reqData, userSession: UserSession) => {
		return deleteRecord(reqData.nodeId, reqData.recId, userSession);
	},
	'api/setCurrentOrg': (reqData, userSession: UserSession) => {
		return setCurrentOrg(reqData.orgId, userSession, true);
	},
	'api/toggleMultilingual': (_reqData, userSession: UserSession) => {
		return setMultilingual(!userSession.multilingualEnabled, userSession);
	},
	'api/descNode': (reqData, userSession: UserSession) => {
		return Promise.resolve(getNodeDesc(reqData.nodeId, userSession));
	},
	'api/submit': (reqData: { recId?: RecId; data: RecordDataWriteDraftable; nodeId: NODE_ID }, userSession: UserSession) => {
		return submitRecord(reqData.nodeId, reqData.data, reqData.recId!, userSession);
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
	'admin/editEventHandler': (reqData, userSession: UserSession) => {
		return editEventHandler(reqData, userSession);
	},
	'admin/getDeployPackage': (reqData, userSession: UserSession) => {
		return getDeployPackage(reqData, userSession);
	},
	'admin/isFiledExists': (reqData, userSession: UserSession) => {
		return isFiledExists(reqData, userSession);
	},
	'admin/isTableExists': (reqData, userSession: UserSession) => {
		return isTableExists(reqData, userSession);
	},
	'admin/dumpDb': (_reqData, userSession: UserSession) => {
		return dumpDB(userSession);
	},
	'admin/recoveryDb': (_reqData, userSession: UserSession) => {
		return recoveryDB(userSession);
	}
	/// #endif
} as KeyedMap<APIHandler>;

export default api;
