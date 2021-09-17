
import { mysqlExec } from "../core/mysql-connection";
import { shouldBeAdmin } from "../core/admin/admin";
import { mustBeUnset } from "../core/auth";
import { getLangs, reloadMetadataSchedule, getNodeDesc, NodeEventsHandlers } from "../core/descript-node";
import { getRecords } from "../core/get-records";
import { submitRecord } from "../core/submit";
import { L } from "../core/locale";
import { FIELD_10_PASSWORD, FIELD_11_DATE, FIELD_12_PICTURE, FIELD_14_NtoM, FIELD_15_1toN, FIELD_16_RATING, FIELD_19_RICH_EDITOR, FIELD_1_TEXT, FIELD_20_COLOR, FIELD_21_FILE, FIELD_2_INT, FIELD_4_DATE_TIME, FIELD_5_BOOL, FIELD_6_ENUM, FIELD_7_Nto1, FIELD_8_STATIC_TEXT, FIELD_ID_MAX_LENGTH, NODE_ID_FIELDS, NODE_ID_NODES, PRIVILEGES_VIEW_ORG, RecordData, RecordDataWrite, throwError, UserSession, VIEW_MASK_EDIT_CREATE } from "../www/js/bs-utils";

const handlers: NodeEventsHandlers = {
	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);

		if(data.multilingual) {
			const langs = getLangs();
			const fn = data.fieldName;
			for(let l of langs) {
				if(l.prefix) {
					data.fieldName = fn + l.prefix;
					await createFieldInTable(data);
				}
			}
			data.fieldName = fn;
		}

		await createFieldInTable(data);
	},

	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);

		const fieldType = data.fieldType;
		const fieldName = data.fieldName;
		if(fieldType === FIELD_15_1toN) {

			const parentNode = await getRecords(NODE_ID_NODES, 1, data.node_fields_linker, userSession);

			const linkerFieldData = {
				status: 1,
				fieldName: fieldName + '_linker',
				node_fields_linker: data.nodeRef,
				nodeRef: data.node_fields_linker,
				name: parentNode.singleName,
				show: VIEW_MASK_EDIT_CREATE,
				prior: 1000,
				fieldType: FIELD_7_Nto1,
				forSearch: 1,
				selectFieldName: parentNode.tableName,
				_usersID: userSession.id,
				_organizationID: userSession.orgId
			};
			await submitRecord(NODE_ID_FIELDS, linkerFieldData);
		}
		reloadMetadataSchedule();
	},

	beforeUpdate: async function(currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {

		shouldBeAdmin(userSession);

		if((currentData.id === FIELD_ID_MAX_LENGTH) && newData.hasOwnProperty('maxLength')) {
			throwError(L('SIZE_FLD_BLOCKED'));
		}

		mustBeUnset(newData, 'fieldName');
		mustBeUnset(newData, 'noStore');
		mustBeUnset(newData, 'node_fields_linker');

		if(!currentData.noStore) {

			if(newData.hasOwnProperty('fieldName') || newData.hasOwnProperty('maxLength') || newData.hasOwnProperty('multilingual')) {

				const multilingualChanged = newData.hasOwnProperty('multilingual') && currentData.multilingual !== newData.multilingual;

				currentData = Object.assign(currentData, newData);

				const node = getNodeDesc(currentData.node_fields_linker.id);

				const realFieldName = currentData.fieldName;
				const fieldType = currentData.fieldType;

				if((realFieldName !== '_organizationID') && (realFieldName !== '_usersID') && (realFieldName !== '_createdON') && (realFieldName !== 'id')) {
					if((currentData.noStore === 0) && (fieldType !== FIELD_8_STATIC_TEXT) && (fieldType !== FIELD_14_NtoM) && (fieldType !== FIELD_15_1toN)) {


						const typeQ = getFieldTypeSQL(currentData);
						if(typeQ) {


							const langs = getLangs();

							if(multilingualChanged) {
								if(currentData.multilingual) {
									for(let l of langs) {
										if(l.prefix) {
											currentData.fieldName = realFieldName + l.prefix;
											await createFieldInTable(currentData);
										}
									}
									currentData.fieldName = realFieldName;
								} else {
									for(let l of langs) {
										if(l.prefix) {
											await mysqlExec('ALTER TABLE ' + node.tableName + ' DROP COLUMN ' + realFieldName + l.prefix);
										}
									}
								}
							} else if(currentData.multilingual) {
								for(let l of langs) {
									if(l.prefix) {
										await mysqlExec('ALTER TABLE ' + node.tableName + ' MODIFY COLUMN ' + realFieldName + l.prefix + ' ' + typeQ);
									}
								}
							}
							await mysqlExec('ALTER TABLE ' + node.tableName + ' MODIFY COLUMN ' + realFieldName + ' ' + typeQ);
						}
					}
				}
			}
		}
		reloadMetadataSchedule();
	},

	beforeDelete: async function(data: RecordData, userSession: UserSession) {
		throwError('_fields beforeCreate deletion event is not implemented');
	}
}

export default handlers;
export { createFieldInTable };

function getFieldTypeSQL(data) {
	switch(data.fieldType) {
		case FIELD_10_PASSWORD:
		case FIELD_1_TEXT:
			if(data.maxLength <= 255) {
				return 'VARCHAR(' + data.maxLength + ") NOT NULL DEFAULT ''";
			} else if(data.maxLength <= 65535) {
				return "TEXT NOT NULL DEFAULT ''";
			} else {
				return "MEDIUMTEXT NOT NULL DEFAULT ''";
			}
		case FIELD_20_COLOR:
			return "BIGINT (11) UNSIGNED NOT NULL DEFAULT 4294967295";
		case FIELD_2_INT:
			if(data.maxLength <= 9) {
				return 'INT(' + data.maxLength + ') NOT NULL DEFAULT 0';
			} else {
				return 'BIGINT(' + data.maxLength + ') NOT NULL DEFAULT 0';
			}
		case FIELD_4_DATE_TIME:
		case FIELD_11_DATE:
			return 'timestamp NOT NULL DEFAULT \'0000-00-00 00:00:00\'';
		case FIELD_5_BOOL:
			return "TINYINT(1) NOT NULL DEFAULT b'0'";
		case FIELD_6_ENUM:
		case FIELD_7_Nto1:
			return 'BIGINT(15) UNSIGNED NOT NULL DEFAULT 0';
		case FIELD_12_PICTURE:
			return "VARCHAR(32) NOT NULL DEFAULT ''";
		case FIELD_16_RATING:
			throwError('Field type ' + FIELD_16_RATING + ' is not editable');
		case FIELD_19_RICH_EDITOR:
			return "MEDIUMTEXT NOT NULL DEFAULT ''";
		case FIELD_21_FILE:
			return "VARCHAR(127) NOT NULL DEFAULT ''";
		default:
			return false;
	}
}

async function createFieldInTable(data: RecordDataWrite) {

	let nodeId = data.node_fields_linker;
	if(typeof nodeId !== 'number') {
		nodeId = nodeId.id;
	}

	// prepare space for field
	await mysqlExec("UPDATE _fields SET prior=prior+20 WHERE (node_fields_linker =" + nodeId + ") AND (prior >" + data.prior + ")");

	data.prior += 10;

	const fieldType = data.fieldType;
	const fieldName = data.fieldName;

	const node = getNodeDesc(nodeId);
	const nodeName = node.tableName;
	let linkedNodeName;

	if(fieldType === FIELD_7_Nto1 || fieldType === FIELD_14_NtoM || fieldType === FIELD_15_1toN) {
		const linkedNodeId = data.nodeRef;
		linkedNodeName = getNodeDesc(linkedNodeId).tableName;

		if(fieldType === FIELD_7_Nto1 || fieldType === FIELD_14_NtoM) {

			const filters = {
				status: 1,
				node_fields_linker: linkedNodeId,
				fieldType: FIELD_12_PICTURE
			};
			const records = await getRecords(6, PRIVILEGES_VIEW_ORG, undefined, undefined, filters);
			if(records.total) {
				data.icon = records.items[0].fieldName;
			}
		}
	}

	if(fieldType === FIELD_15_1toN) {
		data.noStore = 1;
	} else if(fieldType === FIELD_14_NtoM) {

		data.selectFieldName = linkedNodeName;
		data.forSearch = 1;

		const fld1 = nodeName + 'id';
		const fld2 = linkedNodeName + 'id';

		await mysqlExec(`CREATE TABLE \`${fieldName}\` (
			id bigint(15) unsigned NOT NULL AUTO_INCREMENT,
			\`${fld1}\` bigint(15) unsigned NOT NULL DEFAULT 0,
			\`${fld2}\` bigint(15) unsigned NOT NULL DEFAULT 0,
			primary key(id),
			INDEX(\`${fld1}\`),
			INDEX(\`${fld2}\`),
			FOREIGN KEY (\`${fld1}\`) REFERENCES \`${nodeName}\`(id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (\`${fld2}\`) REFERENCES \`${linkedNodeName}\`(id) ON DELETE CASCADE ON UPDATE CASCADE
		) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4; `);
	} else if(!data.noStore) {
		if(fieldType === FIELD_7_Nto1) {
			data.forSearch = 1;
			data.selectFieldName = linkedNodeName;
		}

		const typeQ = getFieldTypeSQL(data);
		if(typeQ) {
			const altQ = ['ALTER TABLE \`', nodeName, '\` ADD COLUMN \`', fieldName, '\` ', typeQ];

			if(data.forSearch || data.unique) {
				altQ.push(', ADD', (data.unique ? ' UNIQUE' : ''), ' INDEX ', nodeName, '_', fieldName, ' (\`', fieldName, '\` ASC) ;');
			}

			await mysqlExec(altQ.join(''));

			if(fieldType === FIELD_7_Nto1) {
				await mysqlExec('ALTER TABLE \`' + nodeName + '\` ADD INDEX(\`' + fieldName + '\`);');
				await mysqlExec('ALTER TABLE \`' + nodeName + '\` ADD FOREIGN KEY (\`' + fieldName + '\`) REFERENCES \`' + linkedNodeName + '\`(id) ON DELETE RESTRICT ON UPDATE RESTRICT;');
			}
		}
	}
}