"use strict";
const fs = require('fs');
const path = require('path');
const ENV = require("../ENV.js");
const {isAdmin} = require("../www/both-side-utils");
const {getNodeEventHandler, getNodeDesc, ADMIN_USER_SESSION, getFieldDesc} = require("./desc-node");
const {getRecords} = require("./get-records");
const {mysqlExec, mysqlStartTransaction, mysqlRollback, mysqlCommit} = require("./mysql-connection");
const {UPLOADS_FILES_PATH, idToImgURLServer} = require('./upload');

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

async function submitRecord(nodeId, data, recId = false, userSession) {

	let node = getNodeDesc(nodeId);
	let currentData;
	if(recId !== false) {
		currentData = await getRecords(nodeId, PREVS_ANY, recId, userSession);
	}

	const tableName = node.tableName;
	const prevs = node.prevs;
	let filesToDelete;

	if(node.draftable) {
		if((prevs & PREVS_PUBLISH) === 0) {
			if(recId !== false) {
				if(currentData.status !== 1) {
					data.status = 2;
				}
			} else {
				data.status = 2;
			}
		}
		if(!data.status) {
			if(recId === false) {
				data.status = 1;
			}
		}
	} else {
		data.status = 1;
	}

	if(recId !== false) {
		if(!currentData.isEd) {
			throw new Error('Update access denied.');
		}
	} else {
		if(!node.canCreate) {
			throw new Error('Creation access denied: ' + node.id);
		}
	}

	//check if required fields is filled, and hidden fields is unfilled
	for(let f of node.fields) {
		let fieldName = f.fieldName;

		if((f.show & 1) === 0) {
			if(data.hasOwnProperty(fieldName)) {
				throw new Error('Field ' + f['fieldName'] + ' hidden for update, but present in request.');
			}
		} else if(!f.nostore) {

			if(f.requirement) {
				if(!data.hasOwnProperty(fieldName) && (!currentData || !currentData.hasOwnProperty(fieldName))) {
					throw new Error("Required field '" + fieldName + "' is empty.");
				}
			}
			if(data.hasOwnProperty(fieldName)) {
				if(f.fieldType === FIELD_19_RICHEDITOR) {
					for(let replacer of blockTags) {
						data[fieldName] = data[fieldName].replace(replacer.exp, replacer.val);
					}
				}

				if(f.uniqu) {
					if(!(await uniquCheckInner(tableName, fieldName, data[fieldName], recId))) {
						throw new Error('Record ' + f.label + ' with value "' + data[fieldName] + '" already exist.');
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

		if(recId !== false) {
			insQ = ["UPDATE "];
		} else {
			insQ = ["INSERT "];
		}

		insQ.push(tableName, " SET ");
		let noNeedComma = true;

		let leastOneTablesFieldUpdated = false;

		if(recId === false) {
			if(data.hasOwnProperty('_usersID')) {
				assert(!userSession || isAdmin(userSession) || userSession.id === data._usersID, "wrong _usersID detected");
			} else {
				assert(userSession, "submitRecord without userSession requires _usersID to be defined.");
				noNeedComma = false;
				insQ.push('_usersID=', userSession.id);
				leastOneTablesFieldUpdated = true;
			}

			if(data.hasOwnProperty('_organID')) {
				assert(!userSession || isAdmin(userSession) || userSession.orgId === data._organID, "wrong _organID detected");
			} else {
				assert(userSession, "submitRecord without userSession requires _organID to be defined.");

				if(!noNeedComma) {
					insQ.push(",");
				}
				noNeedComma = false;
				insQ.push('_organID=', userSession.orgId);
				leastOneTablesFieldUpdated = true;
			}
		}

		let realDataBefore;
		if(currentData) {
			for(let f of node.fields) { // save filenames to delete updated files later
				let fieldName = f.fieldName;
				if(!f.nostore && data.hasOwnProperty(fieldName) && currentData[fieldName]) {
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

		if(recId !== false) {
			await getNodeEventHandler(nodeId, 'update', currentData, data, userSession);
		} else {
			await getNodeEventHandler(nodeId, 'pre', data, userSession);
		}
		let needProcess_n2m;
		for(let f of node.fields) {

			let fieldName = f.fieldName;

			if(!f.nostore && data.hasOwnProperty(fieldName)) {

				let fieldType = f.fieldType;

				let fieldVal = data[fieldName];

				if(fieldType === FIELD_14_NtoM) {
					//will process later
					needProcess_n2m = 1;
				} else if(fieldType === FIELD_15_1toN) {
					throw new Error('children records addition/deletion is independent.');
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
									throw new Error("Error. Couldn't link uploaded file to the record.");
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
										filesToDelete.push(path.join(UPLOADS_FILES_PATH, realDataBefore[fieldName]));
									}
								}
							}

						//continue to process as text
						case FIELD_1_TEXT:
						case FIELD_10_PASSWORD:
							if(f.maxlen && (fieldVal.length > f.maxlen)) {
								throw new Error("Value length for field '" + fieldName + "' (" + tableName + ") is " + fieldVal.length + " longer that " + f.maxlen);
							}
							insQ.push("'", fieldVal, "'");
							break;

						case FIELD_19_RICHEDITOR:
							if(fieldVal.length > 16000000) {
								throw new Error("Value length for field '" + fieldName + "' (" + tableName + ") is longer that 16000000");
							}
							insQ.push("'", fieldVal, "'");
							break;
						case FIELD_17_TAB:
							break;

						case FIELD_7_Nto1:
							if(!isAdmin(userSession) && fieldVal) {
								await getRecords(f.nodeRef, 8, fieldVal, userSession); //check if you have read access to refered item
							}
							insQ.push(fieldVal);
							break;
						case FIELD_4_DATETIME:
						case FIELD_11_DATE:
							insQ.push("'", fieldVal, "'");
							break;
						default:

							if((typeof fieldVal !== 'number') || isNaN(fieldVal)) {
								throw new Error("Value for field " + fieldName + " (" + tableName + ") expected as numeric.");
							}
							if(f.maxlen && fieldVal.toString().length > f.maxlen) {
								throw new Error("Value -length for field '" + fieldName + "' (" + tableName + ") is longer that " + f.maxlen);
							}
							insQ.push(fieldVal);
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

		if(recId !== false) {
			insQ.push(" WHERE id=", recId, " LIMIT 1");
		}
		let qResult;
		if(leastOneTablesFieldUpdated) {
			qResult = (await mysqlExec(insQ.join('')));
		}
		/// #if DEBUG
		else {
			throw new Error('No fields updated in sumbitRecord.');
		}

		for(let key in data) {
			if(key !== 'status') {
				assert(node.fields.find(f => (f.fieldName === key) && !f.clientOnly), "Unknown field in '" + key + "' in data set detected.");
			}
		}

		/// #endif

		if(recId === false) {
			recId = qResult.insertId;
			data.id = recId;
			await getNodeEventHandler(nodeId, 'post', data, userSession);
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
									await getRecords(f.nodeRef, 8, id, userSession); //check if you have read access to refered item
								}

								n2miQ.push("(", recId, ',', id, ")");
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
				fs.unlink(f, () => { });
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

async function uniquCheckInner(tableName, fieldName, val, recId) {
	let query = ["SELECT id FROM ", tableName, " WHERE ", fieldName, " ='", val, "'"];
	if(recId !== false) {
		query.push(" AND id<>", recId);
	}
	query.push(" LIMIT 1");

	let exists = await mysqlExec(query.join(''));
	return !exists.length;
}

function uniquCheck(fieldId, nodeId, val, recId, userSession) {
	return uniquCheckInner(getNodeDesc(nodeId, userSession).tableName, getFieldDesc(fieldId).fieldName, val, recId);
}

module.exports = {submitRecord, uniquCheck};