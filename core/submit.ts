import {
	throwError, FIELD_14_NtoM, FIELD_4_DATE_TIME, FIELD_11_DATE, FIELD_7_Nto1, FIELD_17_TAB, FIELD_19_RICH_EDITOR,
	FIELD_10_PASSWORD, FIELD_1_TEXT, FIELD_12_PICTURE, FIELD_21_FILE, FIELD_5_BOOL, FIELD_15_1toN, PRIVILEGES_ANY,
	PRIVILEGES_PUBLISH, assert, PRIVILEGES_CREATE, RecId, RecordDataWrite, VIEW_MASK_DROPDOWN_LOOKUP
} from "../www/js/bs-utils";

import ENV from "../ENV";
import { getNodeEventHandler, getNodeDesc, getFieldDesc, ServerSideEventHandlersNames } from "./descript-node";
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
			if(data.hasOwnProperty(fieldName)) {
				throwError('Field ' + f['fieldName'] + ' hidden for update, but present in request.');
			}
		} else if(!f.noStore) {

			if(f.requirement) {
				if(((!data.hasOwnProperty(fieldName) || !data[fieldName])) && (!currentData || !currentData[fieldName])) {
					throwError("Required field '" + fieldName + "' is empty.");
				}
			}
			if(data.hasOwnProperty(fieldName)) {
				if(f.fieldType === FIELD_19_RICH_EDITOR) {
					for(let replacer of blockTags) {
						data[fieldName] = data[fieldName].replace(replacer.exp, replacer.val);
					}
				}

				if(f.unique) {
					if(!(await uniqueCheckInner(tableName, fieldName, data[fieldName], recId))) {
						throwError('Record ' + f.name + ' with value "' + data[fieldName] + '" already exist.');
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
					if((fieldType === FIELD_12_PICTURE) || (fieldType === FIELD_21_FILE)) {
						if(!realDataBefore) {
							realDataBefore = {};
						}
						realDataBefore[fieldName] = currentData[fieldName];
					}
				}

				/// #if DEBUG
				if(f.clientOnly && data.hasOwnProperty('fieldName')) {
					notificationOut(userSession, L('CLIENT_ONLY_ON_SERVER', fieldName));
				}
				/// #endif
			}
		}

		if(recId !== null) {
			await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.beforeUpdate, currentData, data, userSession);
		} else {
			await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.beforeCreate, data, userSession);
		}
		let needProcess_n2m;
		for(let f of node.fields) {

			let fieldName = f.fieldName;

			if(!f.noStore && data.hasOwnProperty(fieldName)) {

				let fieldType = f.fieldType;

				let fieldVal = data[fieldName];

				if(fieldType === FIELD_14_NtoM) {
					//will process later
					needProcess_n2m = 1;
				} else if(fieldType === FIELD_15_1toN) {
					throwError('children records addition/deletion is independent.');
				} else {
					leastOneTablesFieldUpdated = true;
					if(!noNeedComma) {
						insQ.push(",");
					}
					noNeedComma = false;
					insQ.push("`", fieldName, "`=");

					switch(fieldType) {

						case FIELD_5_BOOL:
							insQ.push(fieldVal);
							break;

						case FIELD_21_FILE:

						//continue to process as uploaded image
						case FIELD_12_PICTURE:
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
									if(fieldType === FIELD_12_PICTURE) {
										filesToDelete.push(idToImgURLServer(realDataBefore[fieldName]));
									} else {
										filesToDelete.push(join(UPLOADS_FILES_PATH, realDataBefore[fieldName]));
									}
								}
							}

						//continue to process as text
						case FIELD_1_TEXT:
						case FIELD_10_PASSWORD:
							if(f.maxLength && (fieldVal.length > f.maxLength)) {
								throwError("Value length for field '" + fieldName + "' (" + tableName + ") is " + fieldVal.length + " longer that " + f.maxLength);
							}
							insQ.push("'", fieldVal, "'");
							break;

						case FIELD_19_RICH_EDITOR:
							if(fieldVal.length > 16000000) {
								throwError("Value length for field '" + fieldName + "' (" + tableName + ") is longer that 16000000");
							}
							insQ.push("'", fieldVal, "'");
							break;
						case FIELD_17_TAB:
							break;

						case FIELD_7_Nto1:
							if(!isAdmin(userSession) && fieldVal) {
								await getRecords(f.nodeRef, VIEW_MASK_DROPDOWN_LOOKUP, fieldVal, userSession); //check if you have read access to referenced item
							}
							insQ.push(fieldVal);
							break;
						case FIELD_4_DATE_TIME:
						case FIELD_11_DATE:
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
			qResult = (await mysqlExec(insQ.join('')));
		}
		/// #if DEBUG
		else {
			throwError('No fields updated in submitRecord.');
		}

		for(let key in data) {
			if(key !== 'status' && key !== '_organizationID' && key !== '_usersID') {
				assert(node.fields.find(f => (f.fieldName === key) && !f.clientOnly), "Unknown field '" + key + "' in data set detected.");
			}
		}

		/// #endif

		if(recId === null) {
			recId = qResult.insertId;
			data.id = recId;
			await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.afterCreate, data, userSession);
		}
		if(needProcess_n2m) {
			for(let f of node.fields) {

				if(f.fieldType === FIELD_14_NtoM) {
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