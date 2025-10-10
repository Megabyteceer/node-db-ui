import { assert, throwError } from '../www/client-core/src/assert';
import type { LookupValue, RecId, RecordData, RecordDataWriteDraftable, RecordSubmitResult, RecordSubmitResultNewRecord } from '../www/client-core/src/bs-utils';
import { IMAGE_THUMBNAIL_PREFIX, PRIVILEGES_MASK, STATUS, VIEW_MASK } from '../www/client-core/src/bs-utils';

import { unlink } from 'fs';
import { join } from 'path';
import type { UserSession } from './auth';
import { isAdmin, notificationOut } from './auth';
import { getFieldDesc, getNodeDesc } from './describe-node';
import { ENV } from './ENV';
import { getRecord, getRecords } from './get-records';
import { L } from './locale';
/// #if DEBUG
/*
/// #endif
import {mysqlRollback} } from './mysql-connection';
// */

import {
	/// #if DEBUG
	__destroyRecordToPreventAccess,
	/// #endif
	eventDispatch, SERVER_SIDE_FORM_EVENTS
} from '../www/client-core/src/events-handle';
import { FIELD_TYPE, type FIELD_ID, type NODE_ID, type TypeGenerationHelper } from '../www/client-core/src/types/generated';
import { D, escapeString, mysqlCommit, mysqlExec, mysqlStartTransaction, NUM_1 } from './mysql-connection';
import { idToImgURLServer, UPLOADS_FILES_PATH } from './upload';

const blockTags = [] as { exp: RegExp; val: string }[];
for (const tag of ENV.BLOCK_RICH_EDITOR_TAGS) {
	blockTags.push(
		{
			exp: new RegExp('<' + tag + '(\\s|>)', 'img'),
			val: '&lt;' + tag + '&gt;'
		},
		{
			exp: new RegExp('</' + tag + '(\\s|>)', 'img'),
			val: '&lt;/' + tag + '&gt;'
		}
	);
}

let _submitRecord = async (nodeId: NODE_ID, data: RecordDataWriteDraftable, recId?: RecId, userSession?: UserSession): Promise<RecordSubmitResult | RecordSubmitResultNewRecord> => {
	const node = getNodeDesc(nodeId);

	let currentData: RecordData | undefined;
	if (recId) {
		currentData = await getRecord(nodeId, VIEW_MASK.ALL, recId, userSession);
	}

	const tableName = node.tableName!;
	const privileges = node.privileges!;
	let filesToDelete;

	if (node.draftable) {
		if ((privileges & PRIVILEGES_MASK.PUBLISH) === 0) {
			if (recId) {
				if (currentData!.status !== 1) {
					data.status = STATUS.DRAFT;
				}
			} else {
				data.status = STATUS.DRAFT;
			}
		}
		if (!data.status) {
			if (!recId) {
				data.status = STATUS.PUBLIC;
			}
		}
	} else {
		data.status = STATUS.PUBLIC;
	}

	if (recId) {
		if (!currentData!.isE) {
			throwError('Update access denied.');
		}
	} else {
		if (!(node.privileges & PRIVILEGES_MASK.CREATE)) {
			throwError('Creation access denied: ' + node.id);
		}
	}

	// check if required fields is filled, and hidden fields is unfilled
	for (const f of node.fields!) {
		const fieldName = f.fieldName;

		if (!(f.show & 1)) {
			if (data.hasOwnProperty(fieldName) && !isAdmin(userSession)) {
				throwError('Field ' + f['fieldName'] + ' hidden for update, but present in request.');
			}
		} else if (f.storeInDb) {
			if (f.requirement) {
				if ((!data.hasOwnProperty(fieldName)) && !currentData!) {
					throwError('Required field \'' + fieldName + '\' is empty.');
				}
			}
			if (data.hasOwnProperty(fieldName)) {
				if (f.fieldType === FIELD_TYPE.HTML_EDITOR) {
					for (const replacer of blockTags) {
						(data as KeyedMap<any>)[fieldName] = (data as KeyedMap<any>)[fieldName].replace(replacer.exp, replacer.val);
					}
				}

				if (f.unique && (data as KeyedMap<any>)[fieldName]) {
					if (!(await uniqueCheckInner(tableName, fieldName, (data as KeyedMap<any>)[fieldName], recId!))) {
						throwError('Record with "' + f.fieldName + '" equal to value "' + (data as KeyedMap<any>)[fieldName] + '" is already exist.');
					}
				}
			}
		}
	}

	if (userSession && node.storeForms) {
		await mysqlStartTransaction();
	}
	let handlerResult1: KeyedMap<any> | undefined;
	let handlerResult2: KeyedMap<any> | undefined;
	/// #if DEBUG
	/*
	/// #endif
	try {
	// */
	let insQ: (string | string[])[];
	const fieldsNames: string[] = [];
	const values: string[] = [];

	if (recId) {
		insQ = ['UPDATE "', tableName, '" SET '];
	} else {
		insQ = ['INSERT INTO "', tableName, '" (', fieldsNames, ') VALUES (', values, ')'];
	}

	let leastOneTablesFieldUpdated = false;

	if (!recId) {
		if (data.hasOwnProperty('_usersId')) {
			if (!isAdmin(userSession)) {
				throwError('_usersId admin expected');
			}
		} else {
			assert(userSession, 'submitRecord without userSession requires _usersId to be defined.');
			fieldsNames.push('"_usersId"');
			values.push(D(userSession!.id));
			leastOneTablesFieldUpdated = true;
		}
		if (data.hasOwnProperty('_organizationId')) {
			if (!isAdmin(userSession)) {
				throwError('_organizationId admin expected');
			}
		} else {
			assert(userSession, 'submitRecord without userSession requires _organizationId to be defined.');

			fieldsNames.push('"_organizationId"');
			values.push(D(userSession!.orgId));

			leastOneTablesFieldUpdated = true;
		}
	}

	let realDataBefore;
	if (currentData!) {
		for (const f of node.fields!) {
			// save filenames to delete updated files later
			const fieldName = f.fieldName;
			if (f.storeInDb && data.hasOwnProperty(fieldName) && (currentData as KeyedMap<any>)[fieldName]) {
				const fieldType = f.fieldType;
				if (fieldType === FIELD_TYPE.IMAGE || fieldType === FIELD_TYPE.FILE) {
					if (!realDataBefore) {
						realDataBefore = {};
					}
					(realDataBefore as KeyedMap<any>)[fieldName] = (currentData as KeyedMap<any>)[fieldName];
				}
			}

			/// #if DEBUG
			if (!f.sendToServer && data.hasOwnProperty('fieldName')) {
				notificationOut(userSession!, L('CLIENT_ONLY_ON_SERVER', userSession, fieldName));
			}
			/// #endif
		}
	}

	if (recId) {
		handlerResult1 = await eventDispatch(node.tableName!, SERVER_SIDE_FORM_EVENTS.beforeUpdate, currentData!, data, userSession);
	} else {
		handlerResult1 = await eventDispatch(node.tableName!, node.storeForms ? SERVER_SIDE_FORM_EVENTS.beforeCreate : SERVER_SIDE_FORM_EVENTS.onSubmit, data, userSession);
		if (!node.storeForms) {
			recId = 1;
		}
	}
	if (node.storeForms) {
		let needProcess_n2m;
		for (const f of node.fields!) {
			const fieldName = f.fieldName;

			if (f.storeInDb && data.hasOwnProperty(fieldName)) {
				const fieldType = f.fieldType;

				const fieldVal = (data as KeyedMap<any>)[fieldName];

				if (fieldType === FIELD_TYPE.LOOKUP_N_TO_M) {
					// will process later
					needProcess_n2m = 1;
					(data as KeyedMap<any>)[fieldName] = fieldVal.map((id: RecId) => {
						return { id };
					});
				} else if (fieldType === FIELD_TYPE.LOOKUP_1_TO_N) {
					throwError('children records addition/deletion is independent.');
				} else {
					leastOneTablesFieldUpdated = true;

					fieldsNames.push('"' + fieldName + '"');

					switch (fieldType) {
					case FIELD_TYPE.BOOL:
						values.push(D(fieldVal));
						break;

					case FIELD_TYPE.FILE:

						// continue to process as uploaded image
					case FIELD_TYPE.IMAGE:
						if (fieldVal) {
							if (userSession!.uploaded?.[f.id!] === fieldVal) {
								delete userSession!.uploaded![f.id];
							} else {
								throwError('Error. Couldn\'t link uploaded file to the record.');
							}
						}
						if (realDataBefore && realDataBefore[fieldName]) {
							if (realDataBefore[fieldName] !== fieldVal) {
								if (!filesToDelete) {
									filesToDelete = [];
								}
								if (fieldType === FIELD_TYPE.IMAGE) {
									filesToDelete.push(idToImgURLServer(realDataBefore[fieldName]));
									filesToDelete.push(idToImgURLServer(realDataBefore[fieldName]) + IMAGE_THUMBNAIL_PREFIX);
								} else {
									filesToDelete.push(join(UPLOADS_FILES_PATH, realDataBefore[fieldName]));
								}
							}
						}

						// continue to process as text
					case FIELD_TYPE.TEXT:
					case FIELD_TYPE.PASSWORD:
						if (f.maxLength && fieldVal.length > f.maxLength) {
							throwError('Value length for field \'' + fieldName + '\' (' + tableName + ') is ' + fieldVal.length + ' longer that ' + f.maxLength);
						}
						values.push(escapeString(fieldVal));
						break;

					case FIELD_TYPE.HTML_EDITOR:
						if (fieldVal.length > 16000000) {
							throwError('Value length for field \'' + fieldName + '\' (' + tableName + ') is longer that 16000000');
						}
						values.push(escapeString(fieldVal));
						break;
					case FIELD_TYPE.TAB:
						break;

					case FIELD_TYPE.LOOKUP:
						if (!isAdmin(userSession) && fieldVal) {
							await getRecord(f.nodeRef!.id, VIEW_MASK.DROPDOWN_LIST, (fieldVal as LookupValue).id, userSession); // check if you have read access to referenced item
						}
						values.push(D((fieldVal as LookupValue).id));
						break;
					case FIELD_TYPE.DATE_TIME:
					case FIELD_TYPE.DATE:
						values.push(escapeString(fieldVal));
						break;
					default:
						if (f.decimals! > 0) {
							values.push(escapeString(fieldVal));
						} else {
							if (typeof fieldVal !== 'number' || isNaN(fieldVal)) {
								throwError('Value for field ' + fieldName + ' (' + tableName + ') expected as numeric.');
							}
							if (f.maxLength && fieldVal.toString().length > f.maxLength) {
								throwError('Value -length for field \'' + fieldName + '\' (' + tableName + ') is longer that ' + f.maxLength);
							}
							values.push(D(fieldVal));
						}
						break;
					}
				}
			}
		}

		if (data.hasOwnProperty('status')) {
			leastOneTablesFieldUpdated = true;
			fieldsNames.push('status');
			values.push(D(data.status!));
		}

		if (recId) {
			insQ.push(fieldsNames.map((name, i) => name + '=' + values[i]));
			insQ.push(' WHERE id=', D(recId));
		} else {
			insQ.push(' RETURNING id');
		}
		let qResult;
		if (leastOneTablesFieldUpdated) {
			/// #if DEBUG
			for (const key in data) {
				if (key !== 'status' && key !== '_organizationId' && key !== '_usersId') {
					assert(
						node.fields!.find(f => f.fieldName === key && f.sendToServer),
						'Unknown field \'' + key + '\' in data set detected.'
					);
				}
			}
			/// #endif
			qResult = await mysqlExec(insQ.join(''));
		} // eslint-disable-line @stylistic/brace-style
		/// #if DEBUG
		else if (!needProcess_n2m) {
			throwError('No fields updated in submitRecord.');
		}
		/// #endif

		if (!recId) {
			recId = qResult![0].id;
			data.id = recId!;
			handlerResult2 = await eventDispatch(node.tableName!, SERVER_SIDE_FORM_EVENTS.afterCreate, data, userSession);
		} else {
			handlerResult2 = await eventDispatch(node.tableName!, SERVER_SIDE_FORM_EVENTS.afterUpdate, Object.assign(currentData!, data), userSession);
		}

		/// #if DEBUG
		__destroyRecordToPreventAccess(data);
		if (currentData) {
			__destroyRecordToPreventAccess(currentData!);
		}
		/// #endif

		if (needProcess_n2m) {
			for (const f of node.fields!) {
				if (f.fieldType === FIELD_TYPE.LOOKUP_N_TO_M) {
					const fieldName = f.fieldName;
					if (data.hasOwnProperty(fieldName)) {
						// clear all n2m links
						await mysqlExec('DELETE FROM "' + fieldName + '" WHERE "' + tableName + 'Id" = ' + D(recId!));
						const fieldVal = (data as KeyedMap<any>)[fieldName];

						if (fieldVal.length) {
							// add new n2m links
							const n2miQ = ['INSERT INTO "', fieldName, '" ("', tableName, 'Id", "', f.selectFieldName, 'Id") VALUES'];

							let isNotFirst = false;
							for (const id of fieldVal) {
								if (isNotFirst) {
									n2miQ.push(',');
								}

								if (!isAdmin(userSession) && id.id) {
									await getRecords(f.nodeRef!.id, 8, id, userSession); // check if you have read access to referenced item
								}

								n2miQ.push('(', D(recId!), ',', D(id.id), ')');
								isNotFirst = true;
							}
							await mysqlExec(n2miQ.join(''));
						}
					}
				}
			}
		}
	}
	if (userSession && node.storeForms) {
		await mysqlCommit();
	}
	if (filesToDelete) {
		for (const f of filesToDelete) {
			unlink(f, () => {});
		}
	}

	if (handlerResult1 && handlerResult2) {
		Object.assign(handlerResult1, handlerResult2);
	}

	return { recId, handlerResult: handlerResult1 || handlerResult2 };
	/// #if DEBUG
	/*
	/// #endif
	} catch (er) {
		if (userSession && node.storeForms) {
			mysqlRollback();
		}
		throw er;
	}
	// */
};

const submitRecord: TypeGenerationHelper['s'] = _submitRecord as unknown as TypeGenerationHelper['s'];

const LIMIT_SQL_PART = ' LIMIT ' + NUM_1;
async function uniqueCheckInner(tableName: string, fieldName: string, val: string, recId: RecId) {
	const query = ['SELECT id FROM "', tableName, '" WHERE "', fieldName, '" =', escapeString(val)];
	if (typeof recId === 'number') {
		query.push(' AND id != ', D(recId));
	}
	query.push(LIMIT_SQL_PART);

	const exists = await mysqlExec(query.join(''));
	return !exists.length;
}

function uniqueCheck(fieldId: FIELD_ID, nodeId: NODE_ID, val: string, recId: RecId, userSession: UserSession) {
	return uniqueCheckInner(getNodeDesc(nodeId, userSession).tableName!, getFieldDesc(fieldId).fieldName, val, recId);
}

export { submitRecord, uniqueCheck };
