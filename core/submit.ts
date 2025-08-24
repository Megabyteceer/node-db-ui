import { assert, throwError } from '../www/client-core/src/assert';
import {
	FIELD_TYPE, PRIVILEGES_MASK,
	RecId, RecordDataWrite,
	RecordSubmitResult,
	VIEW_MASK
} from "../www/client-core/src/bs-utils";

const axios = require('axios')
const captchaRequestConfig = {
	headers: { "Content-Type": "application/x-www-form-urlencoded" }
};


import { unlink } from "fs";
import { join } from "path";
import { isAdmin, notificationOut, UserSession } from "./auth";
import { getFieldDesc, getNodeDesc, getNodeEventHandler, ServerSideEventHandlersNames } from "./describe-node";
import { ENV, SERVER_ENV } from './ENV';
import { getRecords } from "./get-records";
import { L } from "./locale";
import { mysqlCommit, mysqlExec, mysqlRollback, mysqlStartTransaction } from "./mysql-connection";
import { idToImgURLServer, UPLOADS_FILES_PATH } from './upload';

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

	if(node.captcha && SERVER_ENV.CAPTCHA_SERVER_SECRET) {
		let captchaRes = await axios.post('https://www.google.com/recaptcha/api/siteverify',
			'secret=' + encodeURIComponent(SERVER_ENV.CAPTCHA_SERVER_SECRET) + '&response=' + data.c,
			captchaRequestConfig
		);
		if(!captchaRes.data || !captchaRes.data.success) {
			throwError(L("CAPTCHA_ERROR", userSession));
		}
	}

	let currentData;
	if(recId) {
		currentData = await getRecords(nodeId, VIEW_MASK.ALL, recId, userSession);
	}

	const table_name = node.table_name;
	const privileges = node.privileges;
	let filesToDelete;

	if(node.draftable) {
		if((privileges & PRIVILEGES_MASK.PUBLISH) === 0) {
			if(recId) {
				if(currentData.status !== 1) {
					data.status = 2;
				}
			} else {
				data.status = 2;
			}
		}
		if(!data.status) {
			if(!recId) {
				data.status = 1;
			}
		}
	} else {
		data.status = 1;
	}

	if(recId) {
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
		let field_name = f.field_name;

		if(!(f.show & 1)) {
			if(data.hasOwnProperty(field_name) && !isAdmin(userSession)) {
				throwError('Field ' + f['field_name'] + ' hidden for update, but present in request.');
			}
		} else if(f.store_in_db) {

			if(f.requirement) {
				if(((!data.hasOwnProperty(field_name) || !data[field_name])) && (!currentData || !currentData[field_name])) {
					throwError("Required field '" + field_name + "' is empty.");
				}
			}
			if(data.hasOwnProperty(field_name)) {
				if(f.field_type === FIELD_TYPE.RICH_EDITOR) {
					for(let replacer of blockTags) {
						data[field_name] = data[field_name].replace(replacer.exp, replacer.val);
					}
				}

				if(f.unique && data[field_name]) {
					if(!(await uniqueCheckInner(table_name, field_name, data[field_name], recId))) {
						throwError('Record with "' + f.field_name + '" equal to value "' + data[field_name] + '" is already exist.');
					}
				}
			}
		}
	}

	if(userSession && node.store_forms) {
		await mysqlStartTransaction();
	}
	let handlerResult;
	try {

		let insQ: any[];
		let fieldsNames: string[] = [];
		let values: (string | number)[] = [];

		if(recId) {
			insQ = ["UPDATE ", table_name, " SET "];
		} else {
			insQ = ["INSERT INTO ", table_name, " (", fieldsNames, ') VALUES (', values, ')'];
		}

		let leastOneTablesFieldUpdated = false;

		if(!recId) {
			if(data.hasOwnProperty('_users_id')) {
				if(userSession && !isAdmin(userSession) && (userSession.id !== data._users_id)) {
					throwError("wrong _users_id detected");
				};
			} else {
				assert(userSession, "submitRecord without userSession requires _users_id to be defined.");

				fieldsNames.push('_users_id');
				values.push(userSession.id);

				leastOneTablesFieldUpdated = true;
			}

			if(data.hasOwnProperty('_organization_id')) {
				if(userSession && !isAdmin(userSession) && (userSession.id !== data._organization_id)) {
					throwError("wrong _organization_id detected");
				};
			} else {
				assert(userSession, "submitRecord without userSession requires _organization_id to be defined.");

				fieldsNames.push('_organization_id');
				values.push(userSession.orgId);

				leastOneTablesFieldUpdated = true;
			}
		}

		let realDataBefore;
		if(currentData) {
			for(let f of node.fields) { // save filenames to delete updated files later
				let field_name = f.field_name;
				if(f.store_in_db && data.hasOwnProperty(field_name) && currentData[field_name]) {
					let field_type = f.field_type;
					if((field_type === FIELD_TYPE.PICTURE) || (field_type === FIELD_TYPE.FILE)) {
						if(!realDataBefore) {
							realDataBefore = {};
						}
						realDataBefore[field_name] = currentData[field_name];
					}
				}

				/// #if DEBUG
				if(!f.send_to_server && data.hasOwnProperty('field_name')) {
					notificationOut(userSession, L('CLIENT_ONLY_ON_SERVER', userSession, field_name));
				}
				/// #endif
			}
		}

		if(recId) {
			handlerResult = await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.beforeUpdate, currentData, data, userSession);
		} else {
			handlerResult = await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.beforeCreate, data, userSession);
			if(!node.store_forms) {
				recId = 1;
			}
		}
		if(node.store_forms) {

			let needProcess_n2m;
			for(let f of node.fields) {

				let field_name = f.field_name;

				if(f.store_in_db && data.hasOwnProperty(field_name)) {

					let field_type = f.field_type;

					let fieldVal = data[field_name];

					if(field_type === FIELD_TYPE.LOOKUP_NtoM) {
						//will process later
						needProcess_n2m = 1;
					} else if(field_type === FIELD_TYPE.LOOKUP_1toN) {
						throwError('children records addition/deletion is independent.');
					} else {
						leastOneTablesFieldUpdated = true;

						fieldsNames.push(field_name);

						switch(field_type) {

							case FIELD_TYPE.BOOL:
								values.push(fieldVal);
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
								if(realDataBefore && realDataBefore[field_name]) {
									if(realDataBefore[field_name] !== fieldVal) {
										if(!filesToDelete) {
											filesToDelete = [];
										}
										if(field_type === FIELD_TYPE.PICTURE) {
											filesToDelete.push(idToImgURLServer(realDataBefore[field_name]));
										} else {
											filesToDelete.push(join(UPLOADS_FILES_PATH, realDataBefore[field_name]));
										}
									}
								}

							//continue to process as text
							case FIELD_TYPE.TEXT:
							case FIELD_TYPE.PASSWORD:
								if(f.max_length && (fieldVal.length > f.max_length)) {
									throwError("Value length for field '" + field_name + "' (" + table_name + ") is " + fieldVal.length + " longer that " + f.max_length);
								}
								values.push("'" + fieldVal + "'");
								break;

							case FIELD_TYPE.RICH_EDITOR:
								if(fieldVal.length > 16000000) {
									throwError("Value length for field '" + field_name + "' (" + table_name + ") is longer that 16000000");
								}
								values.push("'", fieldVal, "'");
								break;
							case FIELD_TYPE.TAB:
								break;

							case FIELD_TYPE.LOOKUP:
								if(!isAdmin(userSession) && fieldVal) {
									await getRecords(f.node_ref, VIEW_MASK.DROPDOWN_LIST, fieldVal, userSession); //check if you have read access to referenced item
								}
								values.push(fieldVal);
								break;
							case FIELD_TYPE.DATE_TIME:
							case FIELD_TYPE.DATE:
								values.push("'" + fieldVal + "'");
								break;
							default:

								if((typeof fieldVal !== 'number') || isNaN(fieldVal)) {
									throwError("Value for field " + field_name + " (" + table_name + ") expected as numeric.");
								}
								if(f.max_length && fieldVal.toString().length > f.max_length) {
									throwError("Value -length for field '" + field_name + "' (" + table_name + ") is longer that " + f.max_length);
								}
								values.push(fieldVal as unknown as string);
								break;
						}
					}
				}
			}


			if(data.hasOwnProperty('status')) {
				leastOneTablesFieldUpdated = true;
				fieldsNames.push('status');
				values.push(data.status);
			}

			if(recId) {
				insQ.push(fieldsNames.map((name, i) => name + '=' + values[i]));
				insQ.push(" WHERE id=", recId);
			} else {

				insQ.push(' RETURNING id');
			}
			let qResult;
			if(leastOneTablesFieldUpdated) {
				/// #if DEBUG
				for(let key in data) {
					if(key !== 'status' && key !== '_organization_id' && key !== '_users_id') {
						assert(node.fields.find(f => (f.field_name === key) && f.send_to_server), "Unknown field '" + key + "' in data set detected.");
					}
				}
				/// #endif
				qResult = (await mysqlExec(insQ.join('')));
			}
			/// #if DEBUG
			else if(!needProcess_n2m) {
				throwError('No fields updated in submitRecord.');
			}
			/// #endif

			if(!recId) {
				recId = qResult[0].id;
				data.id = recId;
				await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.afterCreate, data, userSession);
			} else {
				await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.afterUpdate, Object.assign(currentData, data), userSession);
			}
			if(needProcess_n2m) {
				for(let f of node.fields) {

					if(f.field_type === FIELD_TYPE.LOOKUP_NtoM) {
						let field_name = f.field_name;
						if(data.hasOwnProperty(field_name)) {

							//clear all n2m links
							await mysqlExec("DELETE FROM \"" + field_name + "\" WHERE \"" + table_name + "_id\" = " + recId);
							let fieldVal = data[field_name];

							if(fieldVal.length) {
								//add new n2m links
								const n2miQ = ['INSERT INTO \"', field_name, '\" (\"', table_name, '_id\", \"', f.select_field_name, "_id\") VALUES"];

								let isNotFirst = false;
								for(let id of fieldVal) {
									if(isNotFirst) {
										n2miQ.push(',');
									}

									if(!isAdmin(userSession) && id) {
										await getRecords(f.node_ref, 8, id, userSession); //check if you have read access to referenced item
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
		if(userSession && node.store_forms) {
			await mysqlCommit();
		}
		if(filesToDelete) {
			for(let f of filesToDelete) {
				unlink(f, () => { });
			}
		}
		return { recId, handlerResult };

	} catch(er) {
		if(userSession && node.store_forms) {
			mysqlRollback();
		}
		throw er;
	}
}

async function uniqueCheckInner(table_name, field_name, val, recId) {
	let query = ["SELECT id FROM ", table_name, " WHERE ", field_name, " ='", val, "'"];
	if(typeof recId === 'number') {
		query.push(" AND id != ", recId);
	}
	query.push(" LIMIT 1");

	let exists = await mysqlExec(query.join(''));
	return !exists.length;
}

function uniqueCheck(fieldId, nodeId, val, recId, userSession) {
	return uniqueCheckInner(getNodeDesc(nodeId, userSession).table_name, getFieldDesc(fieldId).field_name, val, recId);
}

export { submitRecord, uniqueCheck };
