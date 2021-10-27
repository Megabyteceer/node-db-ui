import {
	throwError, FIELD_TYPE, PRIVILEGES_MASK, assert, RecId, RecordDataWrite, VIEW_MASK, RecordSubmitResult
} from "../www/src/bs-utils";

const axios = require('axios')
const captchaRequestConfig = {
	headers: { "Content-Type": "application/x-www-form-urlencoded" }
};

import ENV from "../ENV";
import { getNodeEventHandler, getNodeDesc, getFieldDesc, ServerSideEventHandlersNames } from "./describe-node";
import { getRecords } from "./get-records";
import { mysqlExec, mysqlStartTransaction, mysqlRollback, mysqlCommit, mysqlRowsResult } from "./mysql-connection";
import { UPLOADS_FILES_PATH, idToImgURLServer } from './upload';
import { L } from "./locale";
import { join } from "path";
import { unlink } from "fs";
import { isAdmin, notificationOut, UserSession } from "./auth";

const blockTags = [];
for(let tag of ENV.BLOCK_RICH_EDITOR_TAGS) {
	blockTags.push({
		exp: new RegExp('<' + tag + '(\\s|>)', 'img'),
		val: '&lt;' + tag + '&gt;'
	}, {
		exp: new RegExp('<\/' + tag + '(\\s|>)', 'img'),
		val: '&lt;/' + tag + '&gt;'
	});
}

async function submitRecord(nodeId: RecId, data: RecordDataWrite, recId: RecId | null = null, userSession?: UserSession): Promise<RecordSubmitResult> {

	let node = getNodeDesc(nodeId);

	if(node.captcha && ENV.CAPTCHA_SERVER_SECRET) {
		let captchaRes = await axios.post('https://www.google.com/recaptcha/api/siteverify',
			'secret=' + encodeURIComponent(ENV.CAPTCHA_SERVER_SECRET) + '&response=' + data.c,
			captchaRequestConfig
		);
		if(!captchaRes.data || !captchaRes.data.success) {
			throwError(L("CAPTCHA_ERROR", userSession));
		}
	}

	let currentData;
	if(recId !== null) {
		currentData = await getRecords(nodeId, VIEW_MASK.ALL, recId, userSession);
	}

	const tableName = node.tableName;
	const privileges = node.privileges;
	let filesToDelete;

	if(node.draftable) {
		if((privileges & PRIVILEGES_MASK.PUBLISH) === 0) {
			if(recId !== null) {
				if(currentData.status !== 1) {
					data.status = 2;
				}
			} else {
				data.status = 2;
			}
		}
		if(!data.status) {
			if(recId === null) {
				data.status = 1;
			}
		}
	} else {
		data.status = 1;
	}

	if(recId !== null) {
		if(!currentData.isE) {
			throwError('Update access denied.');
		}
	} else {
		if(!(node.privileges & PRIVILEGES_MASK.CREATE)) {
			throwError('Creation access denied: ' + node.id);
		}
	}

	//check if required fields is filled, and hidden fields is unfilled
	for(let f of node.fields) {
		let fieldName = f.fieldName;

		if((f.show & 1) === 0) {
			if(data.hasOwnProperty(fieldName) && !isAdmin(userSession)) {
				throwError('Field ' + f['fieldName'] + ' hidden for update, but present in request.');
			}
		} else if(f.storeInDB) {

			if(f.requirement) {
				if(((!data.hasOwnProperty(fieldName) || !data[fieldName])) && (!currentData || !currentData[fieldName])) {
					throwError("Required field '" + fieldName + "' is empty.");
				}
			}
			if(data.hasOwnProperty(fieldName)) {
				if(f.fieldType === FIELD_TYPE.RICH_EDITOR) {
					for(let replacer of blockTags) {
						data[fieldName] = data[fieldName].replace(replacer.exp, replacer.val);
					}
				}

				if(f.unique && data[fieldName]) {
					if(!(await uniqueCheckInner(tableName, fieldName, data[fieldName], recId))) {
						throwError('Record with "' + f.fieldName + '" equal to value "' + data[fieldName] + '" is already exist.');
					}
				}
			}
		}
	}

	if(userSession) {
		await mysqlStartTransaction();
	}
	let handlerResult;
	try {

		let insQ;

		if(recId !== null) {
			insQ = ["UPDATE "];
		} else {
			insQ = ["INSERT "];
		}

		insQ.push(tableName, " SET ");
		let noNeedComma = true;

		let leastOneTablesFieldUpdated = false;

		if(recId === null) {
			if(data.hasOwnProperty('_usersID')) {
				if(userSession && !isAdmin(userSession) && (userSession.id !== data._usersID)) {
					throwError("wrong _usersID detected");
				};
			} else {
				assert(userSession, "submitRecord without userSession requires _usersID to be defined.");
				noNeedComma = false;
				insQ.push('_usersID=', userSession.id);
				leastOneTablesFieldUpdated = true;
			}

			if(data.hasOwnProperty('_organizationID')) {
				if(userSession && !isAdmin(userSession) && (userSession.id !== data._organizationID)) {
					throwError("wrong _organizationID detected");
				};
			} else {
				assert(userSession, "submitRecord without userSession requires _organizationID to be defined.");

				if(!noNeedComma) {
					insQ.push(",");
				}
				noNeedComma = false;
				insQ.push('_organizationID=', userSession.orgId);
				leastOneTablesFieldUpdated = true;
			}
		}

		let realDataBefore;
		if(currentData) {
			for(let f of node.fields) { // save filenames to delete updated files later
				let fieldName = f.fieldName;
				if(f.storeInDB && data.hasOwnProperty(fieldName) && currentData[fieldName]) {
					let fieldType = f.fieldType;
					if((fieldType === FIELD_TYPE.PICTURE) || (fieldType === FIELD_TYPE.FILE)) {
						if(!realDataBefore) {
							realDataBefore = {};
						}
						realDataBefore[fieldName] = currentData[fieldName];
					}
				}

				/// #if DEBUG
				if(!f.sendToServer && data.hasOwnProperty('fieldName')) {
					notificationOut(userSession, L('CLIENT_ONLY_ON_SERVER', userSession, fieldName));
				}
				/// #endif
			}
		}

		if(recId !== null) {
			handlerResult = await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.beforeUpdate, currentData, data, userSession);
		} else {
			handlerResult = await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.beforeCreate, data, userSession);
			if(!node.storeForms) {
				recId = 1;
			}
		}
		if(node.storeForms) {

			let needProcess_n2m;
			for(let f of node.fields) {

				let fieldName = f.fieldName;

				if(f.storeInDB && data.hasOwnProperty(fieldName)) {

					let fieldType = f.fieldType;

					let fieldVal = data[fieldName];

					if(fieldType === FIELD_TYPE.LOOKUP_NtoM) {
						//will process later
						needProcess_n2m = 1;
					} else if(fieldType === FIELD_TYPE.LOOKUP_1toN) {
						throwError('children records addition/deletion is independent.');
					} else {
						leastOneTablesFieldUpdated = true;
						if(!noNeedComma) {
							insQ.push(",");
						}
						noNeedComma = false;
						insQ.push("`", fieldName, "`=");

						switch(fieldType) {

							case FIELD_TYPE.BOOL:
								insQ.push(fieldVal);
								break;

							case FIELD_TYPE.FILE:

							//continue to process as uploaded image
							case FIELD_TYPE.PICTURE:
								if(fieldVal) {
									if(userSession.uploaded && (userSession.uploaded[f.id] === fieldVal)) {
										delete userSession.uploaded[fieldVal];
									} else {
										throwError("Error. Couldn't link uploaded file to the record.");
									}
								}
								if(realDataBefore && realDataBefore[fieldName]) {
									if(realDataBefore[fieldName] !== fieldVal) {
										if(!filesToDelete) {
											filesToDelete = [];
										}
										if(fieldType === FIELD_TYPE.PICTURE) {
											filesToDelete.push(idToImgURLServer(realDataBefore[fieldName]));
										} else {
											filesToDelete.push(join(UPLOADS_FILES_PATH, realDataBefore[fieldName]));
										}
									}
								}

							//continue to process as text
							case FIELD_TYPE.TEXT:
							case FIELD_TYPE.PASSWORD:
								if(f.maxLength && (fieldVal.length > f.maxLength)) {
									throwError("Value length for field '" + fieldName + "' (" + tableName + ") is " + fieldVal.length + " longer that " + f.maxLength);
								}
								insQ.push("'", fieldVal, "'");
								break;

							case FIELD_TYPE.RICH_EDITOR:
								if(fieldVal.length > 16000000) {
									throwError("Value length for field '" + fieldName + "' (" + tableName + ") is longer that 16000000");
								}
								insQ.push("'", fieldVal, "'");
								break;
							case FIELD_TYPE.TAB:
								break;

							case FIELD_TYPE.LOOKUP:
								if(!isAdmin(userSession) && fieldVal) {
									await getRecords(f.nodeRef, VIEW_MASK.DROPDOWN_LIST, fieldVal, userSession); //check if you have read access to referenced item
								}
								insQ.push(fieldVal);
								break;
							case FIELD_TYPE.DATE_TIME:
							case FIELD_TYPE.DATE:
								insQ.push("'", fieldVal, "'");
								break;
							default:

								if((typeof fieldVal !== 'number') || isNaN(fieldVal)) {
									throwError("Value for field " + fieldName + " (" + tableName + ") expected as numeric.");
								}
								if(f.maxLength && fieldVal.toString().length > f.maxLength) {
									throwError("Value -length for field '" + fieldName + "' (" + tableName + ") is longer that " + f.maxLength);
								}
								insQ.push(fieldVal as unknown as string);
								break;
						}
					}
				}
			}


			if(data.hasOwnProperty('status')) {
				if(!noNeedComma) {
					insQ.push(",");
				}
				leastOneTablesFieldUpdated = true;
				insQ.push(' status=', data.status);
			}

			if(recId !== null) {
				insQ.push(" WHERE id=", recId as unknown as string, " LIMIT 1");
			}
			let qResult;
			if(leastOneTablesFieldUpdated) {
				/// #if DEBUG
				for(let key in data) {
					if(key !== 'status' && key !== '_organizationID' && key !== '_usersID') {
						assert(node.fields.find(f => (f.fieldName === key) && f.sendToServer), "Unknown field '" + key + "' in data set detected.");
					}
				}
				/// #endif
				qResult = (await mysqlExec(insQ.join('')));
			}
			/// #if DEBUG
			else {
				throwError('No fields updated in submitRecord.');
			}
			/// #endif

			if(recId === null) {
				recId = qResult.insertId;
				data.id = recId;
				await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.afterCreate, data, userSession);
			}
			if(needProcess_n2m) {
				for(let f of node.fields) {

					if(f.fieldType === FIELD_TYPE.LOOKUP_NtoM) {
						let fieldName = f.fieldName;
						if(data.hasOwnProperty(fieldName)) {

							//clear all n2m links
							await mysqlExec("DELETE FROM `" + fieldName + "` WHERE `" + tableName + "id` = " + recId);
							let fieldVal = data[fieldName];

							if(fieldVal.length) {
								//add new n2m links
								const n2miQ = ['INSERT INTO `', fieldName, '` (`', tableName, 'id`, `', f.selectFieldName, "id`) VALUES"];

								let isNotFirst = false;
								for(let id of fieldVal) {
									if(isNotFirst) {
										n2miQ.push(',');
									}

									if(!isAdmin(userSession) && id) {
										await getRecords(f.nodeRef, 8, id, userSession); //check if you have read access to referenced item
									}

									n2miQ.push("(", recId as unknown as string, ',', id, ")");
									isNotFirst = true;
								}
								await mysqlExec(n2miQ.join(''));
							}
						}
					}
				}
			}
		}
		if(userSession) {
			await mysqlCommit();
		}
		if(filesToDelete) {
			for(let f of filesToDelete) {
				unlink(f, () => { });
			}
		}
		return { recId, handlerResult };

	} catch(er) {
		if(userSession) {
			mysqlRollback();
		}
		throw er;
	}
}

async function uniqueCheckInner(tableName, fieldName, val, recId) {
	let query = ["SELECT id FROM ", tableName, " WHERE ", fieldName, " ='", val, "'"];
	if(recId !== null) {
		query.push(" AND id<>", recId);
	}
	query.push(" LIMIT 1");

	let exists = await mysqlExec(query.join('')) as mysqlRowsResult;
	return !exists.length;
}

function uniqueCheck(fieldId, nodeId, val, recId, userSession) {
	return uniqueCheckInner(getNodeDesc(nodeId, userSession).tableName, getFieldDesc(fieldId).fieldName, val, recId);
}

export { submitRecord, uniqueCheck };