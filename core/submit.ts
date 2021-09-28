import {
	throwError, FIELD_TYPE_LOOKUP_NtoM_14, FIELD_TYPE_DATE_TIME_4, FIELD_TYPE_DATE_11, FIELD_TYPE_LOOKUP_7, FIELD_TYPE_TAB_17, FIELD_TYPE_RICH_EDITOR_19,
	FIELD_TYPE_PASSWORD_10, FIELD_TYPE_TEXT_1, FIELD_TYPE_PICTURE_12, FIELD_TYPE_FILE_21, FIELD_TYPE_BOOL_5, FIELD_TYPE_LOOKUP_1toN_15, PRIVILEGES_ANY,
	PRIVILEGES_PUBLISH, assert, PRIVILEGES_CREATE, RecId, RecordDataWrite, VIEW_MASK_DROPDOWN_LOOKUP
} from "../www/src/bs-utils";

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

async function submitRecord(nodeId: RecId, data: RecordDataWrite, recId: RecId | null = null, userSession?: UserSession): Promise<RecId> {

	let node = getNodeDesc(nodeId);
	let currentData;
	if(recId !== null) {
		currentData = await getRecords(nodeId, PRIVILEGES_ANY, recId, userSession);
	}

	const tableName = node.tableName;
	const privileges = node.privileges;
	let filesToDelete;

	if(node.draftable) {
		if((privileges & PRIVILEGES_PUBLISH) === 0) {
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
		if(!(node.privileges & PRIVILEGES_CREATE)) {
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
		} else if(!f.noStore) {

			if(f.requirement) {
				if(((!data.hasOwnProperty(fieldName) || !data[fieldName])) && (!currentData || !currentData[fieldName])) {
					throwError("Required field '" + fieldName + "' is empty.");
				}
			}
			if(data.hasOwnProperty(fieldName)) {
				if(f.fieldType === FIELD_TYPE_RICH_EDITOR_19) {
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
				if(!f.noStore && data.hasOwnProperty(fieldName) && currentData[fieldName]) {
					let fieldType = f.fieldType;
					if((fieldType === FIELD_TYPE_PICTURE_12) || (fieldType === FIELD_TYPE_FILE_21)) {
						if(!realDataBefore) {
							realDataBefore = {};
						}
						realDataBefore[fieldName] = currentData[fieldName];
					}
				}

				/// #if DEBUG
				if(f.clientOnly && data.hasOwnProperty('fieldName')) {
					notificationOut(userSession, L('CLIENT_ONLY_ON_SERVER', userSession, fieldName));
				}
				/// #endif
			}
		}

		if(recId !== null) {
			await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.beforeUpdate, currentData, data, userSession);
		} else {
			let createHandlerResult = await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.beforeCreate, data, userSession);
			if(!node.storeForms) {
				recId = createHandlerResult as unknown as number || 1; // allows to return no store events results to the client.
			}
		}
		if(node.storeForms) {

			let needProcess_n2m;
			for(let f of node.fields) {

				let fieldName = f.fieldName;

				if(!f.noStore && data.hasOwnProperty(fieldName)) {

					let fieldType = f.fieldType;

					let fieldVal = data[fieldName];

					if(fieldType === FIELD_TYPE_LOOKUP_NtoM_14) {
						//will process later
						needProcess_n2m = 1;
					} else if(fieldType === FIELD_TYPE_LOOKUP_1toN_15) {
						throwError('children records addition/deletion is independent.');
					} else {
						leastOneTablesFieldUpdated = true;
						if(!noNeedComma) {
							insQ.push(",");
						}
						noNeedComma = false;
						insQ.push("`", fieldName, "`=");

						switch(fieldType) {

							case FIELD_TYPE_BOOL_5:
								insQ.push(fieldVal);
								break;

							case FIELD_TYPE_FILE_21:

							//continue to process as uploaded image
							case FIELD_TYPE_PICTURE_12:
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
										if(fieldType === FIELD_TYPE_PICTURE_12) {
											filesToDelete.push(idToImgURLServer(realDataBefore[fieldName]));
										} else {
											filesToDelete.push(join(UPLOADS_FILES_PATH, realDataBefore[fieldName]));
										}
									}
								}

							//continue to process as text
							case FIELD_TYPE_TEXT_1:
							case FIELD_TYPE_PASSWORD_10:
								if(f.maxLength && (fieldVal.length > f.maxLength)) {
									throwError("Value length for field '" + fieldName + "' (" + tableName + ") is " + fieldVal.length + " longer that " + f.maxLength);
								}
								insQ.push("'", fieldVal, "'");
								break;

							case FIELD_TYPE_RICH_EDITOR_19:
								if(fieldVal.length > 16000000) {
									throwError("Value length for field '" + fieldName + "' (" + tableName + ") is longer that 16000000");
								}
								insQ.push("'", fieldVal, "'");
								break;
							case FIELD_TYPE_TAB_17:
								break;

							case FIELD_TYPE_LOOKUP_7:
								if(!isAdmin(userSession) && fieldVal) {
									await getRecords(f.nodeRef, VIEW_MASK_DROPDOWN_LOOKUP, fieldVal, userSession); //check if you have read access to referenced item
								}
								insQ.push(fieldVal);
								break;
							case FIELD_TYPE_DATE_TIME_4:
							case FIELD_TYPE_DATE_11:
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
						assert(node.fields.find(f => (f.fieldName === key) && !f.clientOnly), "Unknown field '" + key + "' in data set detected.");
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

					if(f.fieldType === FIELD_TYPE_LOOKUP_NtoM_14) {
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
		return recId;

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