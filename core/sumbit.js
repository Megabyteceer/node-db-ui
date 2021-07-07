"use strict";
const fs = require('fs');
const path = require('path');
const {isAdmin} = require("../www/both-side-utils");
const {getEventHandler, getNodeDesc, ADMIN_USER_SESSION} = require("./desc-node");
const {getRecords} = require("./get-records");
const {mysqlExec, mysqlStartTransaction, mysqlRollback, mysqlCommit, mysqlInsertedID} = require("./mysql-connection");
const {UPLOADS_FILES_PATH, idToImgURLServer} = require('./upload');

async function submitRecord(nodeId, data, recId = false, userSession = ADMIN_USER_SESSION) {
	
	let node = getNodeDesc(nodeId);
	let currentData;
	if(recId !== false) {
		currentData = await getRecords(nodeId, PREVS_EDIT_OWN, recId, false);
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
		
		if((f.show & 1) === 0){
			if(data.hasOwnProperty(fieldName)) {
				throw new Error('Field ' + f['fieldName'] + ' hidden for update, but present in request.');
			}
		} else if(!f.nostore) {
			
			if(f.requirement) {
				if(!data.hasOwnProperty(fieldName)) {
					throw new Error("Required field '" + fieldName + "' is empty.");
				}
			}
			
			if(data.hasOwnProperty(fieldName) && f.uniqu) {

				let query = ["SELECT id FROM ", tableName, " WHERE ", fieldName, " ='", data[fieldName], "'"];
				if(recId !== false) {
					query.push(" AND id<>", recId);
				}
				query.push(" LIMIT 1");

				let exists = await mysqlExec(query.join(''));
				if(exists.length) {
					throw new Error('Record ' + f.label + ' with value "' + data[fieldName] + '" already exist.');
				}
			}
		}
	}

	await mysqlStartTransaction(userSession);

	try	{

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
				assert(isAdmin(userSession) || userSession.id === data._usersID, "wrong _usersID detected");
			} else {
				noNeedComma = false;
				insQ.push('_usersID=', userSession.id);
				leastOneTablesFieldUpdated = true;
			}

			if(data.hasOwnProperty('_organID')) {
				assert(isAdmin(userSession) || userSession.orgId === data._organID, "wrong _organID detected");
			} else {
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
				if (!f.nostore && data.hasOwnProperty(fieldName) && currentData[fieldName]) {
					let fieldType = f.fieldType;
					if((fieldType === FIELD_12_PICTURE) || (fieldType === FIELD_21_FILE)) {
						if(realDataBefore) {
							realDataBefore = {};
						}
						realDataBefore[fieldName] = currentData[fieldName];
					}
				}
			}
		}
		
		if(recId !== false) {
			let h = getEventHandler(nodeId, 'update');
			let r = h && h(currentData, data, userSession);
			if(r && r.then) {
				await r;
			}
		} else {
			let h = getEventHandler(nodeId, 'pre');
			let r = h && h(data, userSession);
			if(r && r.then) {
				await r;
			}
		}
		let needProcess_n2m;
		for(let f of node.fields) {
			
			let fieldName = f.fieldName;
			
			/// #if DEBUG
			if(f.clientOnly && data.hasOwnProperty('fieldName')) {
				notificationOut(userSession, L('CLIENT_ONLY_ON_SERVER', fieldName));
			}
			/// #endif
			
			if(!f.nostore && data.hasOwnProperty(fieldName)) {
				
				let fieldType = f.fieldType;
				
				let fieldVal = data[fieldName];
				
				if(fieldType === FIELD_14_NtoM) {
					//will process later
					needProcess_n2m = 1;
				} else if(fieldType == FIELD_15_1toN) {
					throw new Error('children records addition/deletion is independent.');
				} else {
					leastOneTablesFieldUpdated = true;
					if(!noNeedComma) {
						insQ.push(",");
					}
					noNeedComma = false;
					insQ.push("`", fieldName, "`=");

					switch (fieldType) {
					
					case FIELD_5_BOOL:
						insQ.push(fieldVal);
						break;
					
					case FIELD_21_FILE:
						
						//continue to process as uploaded image
					case FIELD_12_PICTURE:
						if(fieldVal && (!userSession.uploaded || !userSession.uploaded[fieldVal])) {
							throw new Error("Error. Couldn't link uploaded file to the record.");
						} else {
							delete userSession.uploaded[fieldVal];
						}
						if(currentData && realDataBefore[fieldName]) {
							if(realDataBefore[fieldName] !== fieldVal) {
								if(!filesToDelete) {
									filesToDelete = [];
								}
								if (fieldType === FIELD_12_PICTURE) {
									filesToDelete.push(idToImgURLServer(currentData[fieldName]));
								} else {
									filesToDelete.push(path.join(UPLOADS_FILES_PATH, currentData[fieldName]));
								}
							}
						}


						if(realDataBefore && realDataBefore[fieldName]) {
							debugger;
							filesToDelete = filesToDelete || [];
							
						}
						//continue to process as text
					case FIELD_1_TEXT:
					case FIELD_9_EMAIL:
					case FIELD_10_PASSWORD:
					case FIELD_13_KEYWORDS:
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
							getRecords(f.nodeRef, 8, fieldVal, userSession); //check if you have read access to refered item
						}
						insQ.push(fieldVal);
						break;
					case FIELD_4_DATETIME:
					case FIELD_11_DATE:
						insQ.push("'",fieldVal,"'");
						break;
					default:
					
						if(typeof fieldVal !== Number || isNaN(fieldVal)) {
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
		
		if(leastOneTablesFieldUpdated) {
			await mysqlExec(insQ.join(''), userSession);
		}
		
		if(recId === false) {
			recId = await mysqlInsertedID(userSession);
			data.id = recId;
			let h = getEventHandler(nodeId, 'post');
			let r = h && h(data, userSession);
			if(r && r.then) {
				await r;
			}
		}
		
		if(needProcess_n2m){
			for(let f of node.fields) {
			
				if(f.fieldType === FIELD_14_NtoM) {
					let fieldName = f.fieldName;
					if(data.hasOwnProperty(fieldName)){
					
						//clear all n2m links
						await mysqlExec("DELETE FROM `" + fieldName + "` WHERE `" + tableName + "id` = " + recId);
						let fieldVal = data[fieldName];
						
						if(fieldVal.length) {
							//add new n2m links
							n2miQ = ['INSERT INTO `', fieldName, '` (`', tableName, 'id`, `', f.selectFieldName, "id`) VALUES'"];
							
							let isNotFirst = false;
							for(let v of fieldVal) {
								if(isNotFirst) {
									n2miQ.push(',');
								}
								let id = v.id;
								
								if(!isAdmin(userSession) && id) {
									getRecords(f.nodeRef, 8, id, userSession); //check if you have read access to refered item
								}
								
								n2miQ.push("(", recId, id, ")");
								isNotFirst = true;
							}
							await mysqlExec(n2miQ.join(''));
						}
					}
				}
			}
		}
		
		await mysqlCommit(userSession);
		if(filesToDelete) {
			debugger;
			for(let f of filesToDelete) {
				fs.unlink(path.join(__dirname, f),()=>{});
			}
		}
		return recId;
		
	} catch (er) {
		mysqlRollback(userSession);
		throw er;
	}
}

module.exports = {submitRecord};