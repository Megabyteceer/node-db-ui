
import { mysqlExec } from "../mysql-connection";
import { shouldBeAdmin } from "../admin/admin";
import { mustBeUnset } from "../auth";
import { getLangs, reloadMetadataSchedule, getNodeDesc, NodeEventsHandlers } from "../describe-node";
import { getRecords } from "../get-records";
import { submitRecord } from "../submit";
import { L } from "../locale";
import { FIELD_TYPE, NODE_ID, RecordData, RecordDataWrite, throwError, UserSession, VIEW_MASK, FIELD_ID } from "../../www/client-core/src/bs-utils";

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
		if(fieldType === FIELD_TYPE.LOOKUP_1toN) {

			const parentNode = await getRecords(NODE_ID.NODES, 1, data.node_fields_linker, userSession);

			const linkerFieldData = {
				status: 1,
				fieldName: fieldName + '_linker',
				node_fields_linker: data.nodeRef,
				nodeRef: data.node_fields_linker,
				name: parentNode.singleName,
				show: VIEW_MASK.EDITABLE,
				prior: 1000,
				sendToServer: 1,
				storeInDB: 1,
				fieldType: FIELD_TYPE.LOOKUP,
				forSearch: 1,
				selectFieldName: parentNode.tableName,
				_usersID: userSession.id,
				_organizationID: userSession.orgId
			};
			await submitRecord(NODE_ID.FIELDS, linkerFieldData);
		}

		// update priority
		let fields = await getRecords(NODE_ID.FIELDS, VIEW_MASK.ALL, null, userSession, { node_fields_linker: data.node_fields_linker });
		fields.items.sort((a, b) => {
			return a.prior - b.prior;
		});
		let prior = 0;
		await Promise.all(fields.items.map((i) => {
			prior += 10;
			if(i.prior !== prior) {
				return submitRecord(NODE_ID.FIELDS, { prior }, i.id, userSession);
			}
		}));

		reloadMetadataSchedule();
	},

	beforeUpdate: async function(currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {

		shouldBeAdmin(userSession);

		if((currentData.id === FIELD_ID.MAX_LENGTH) && newData.hasOwnProperty('maxLength')) {
			throwError(L('SIZE_FLD_BLOCKED', userSession));
		}

		mustBeUnset(newData, 'fieldName');
		mustBeUnset(newData, 'storeInDB');
		mustBeUnset(newData, 'node_fields_linker');

		if(currentData.storeInDB) {

			if(newData.hasOwnProperty('fieldName') || newData.hasOwnProperty('maxLength') || newData.hasOwnProperty('multilingual') || newData.hasOwnProperty('forSearch')) {

				const multilingualChanged = newData.hasOwnProperty('multilingual') && currentData.multilingual !== newData.multilingual;

				const node = getNodeDesc(currentData.node_fields_linker.id);
				const realFieldName = currentData.fieldName;
				const fieldType = currentData.fieldType;

				if(currentData.forSearch !== newData.forSearch) {
					if(newData.forSearch) {
						await mysqlExec('ALTER TABLE `' + node.tableName + '` ADD INDEX (`' + realFieldName + '`);');
					} else {
						await mysqlExec('ALTER TABLE `' + node.tableName + '` DROP INDEX `' + realFieldName + '`;');
					}
				}

				currentData = Object.assign(currentData, newData);

				if((realFieldName !== '_organizationID') && (realFieldName !== '_usersID') && (realFieldName !== '_createdON') && (realFieldName !== 'id')) {
					if(currentData.storeInDB && (fieldType !== FIELD_TYPE.STATIC_TEXT) && (fieldType !== FIELD_TYPE.LOOKUP_NtoM) && (fieldType !== FIELD_TYPE.LOOKUP_1toN)) {
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
		case FIELD_TYPE.PASSWORD:
		case FIELD_TYPE.TEXT:
			if(data.maxLength <= 255) {
				return 'VARCHAR(' + data.maxLength + ") NOT NULL DEFAULT ''";
			} else if(data.maxLength <= 65535) {
				return "TEXT NOT NULL DEFAULT ''";
			} else {
				return "MEDIUMTEXT NOT NULL DEFAULT ''";
			}
		case FIELD_TYPE.COLOR:
			return "BIGINT (11) UNSIGNED NOT NULL DEFAULT 4294967295";
		case FIELD_TYPE.NUMBER:
			if(data.maxLength <= 9) {
				return 'INT(' + data.maxLength + ') NOT NULL DEFAULT 0';
			} else {
				return 'BIGINT(' + data.maxLength + ') NOT NULL DEFAULT 0';
			}
		case FIELD_TYPE.DATE_TIME:
		case FIELD_TYPE.DATE:
			return 'timestamp NOT NULL DEFAULT \'0000-00-00 00:00:00\'';
		case FIELD_TYPE.BOOL:
			return "TINYINT(1) NOT NULL DEFAULT b'0'";
		case FIELD_TYPE.ENUM:
		case FIELD_TYPE.LOOKUP:
			return 'BIGINT(15) UNSIGNED NOT NULL DEFAULT 0';
		case FIELD_TYPE.PICTURE:
			return "VARCHAR(32) NOT NULL DEFAULT ''";
		case FIELD_TYPE.RATING:
			throwError('Field type ' + FIELD_TYPE.RATING + ' is not editable');
		case FIELD_TYPE.RICH_EDITOR:
			return "MEDIUMTEXT NOT NULL DEFAULT ''";
		case FIELD_TYPE.FILE:
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

	const fieldType = data.fieldType;
	const fieldName = data.fieldName;

	const node = getNodeDesc(nodeId);
	const nodeName = node.tableName;
	let linkedNodeName;

	if(fieldType === FIELD_TYPE.LOOKUP || fieldType === FIELD_TYPE.LOOKUP_NtoM || fieldType === FIELD_TYPE.LOOKUP_1toN) {
		const linkedNodeId = data.nodeRef;
		linkedNodeName = getNodeDesc(linkedNodeId).tableName;

		if(fieldType === FIELD_TYPE.LOOKUP || fieldType === FIELD_TYPE.LOOKUP_NtoM) {

			const filters = {
				status: 1,
				node_fields_linker: linkedNodeId,
				fieldType: FIELD_TYPE.PICTURE
			};
			const records = await getRecords(6, VIEW_MASK.LIST, undefined, undefined, filters);
			if(records.total) {
				data.lookupIcon = records.items[0].fieldName;
			}
		}
	}

	if(fieldType === FIELD_TYPE.LOOKUP_1toN) {
		data.storeInDB = 0;
	} else if(fieldType === FIELD_TYPE.LOOKUP_NtoM) {

		data.selectFieldName = linkedNodeName;
		data.forSearch = 1;

		const fld1 = nodeName + 'Id';
		const fld2 = linkedNodeName + 'Id';

		await mysqlExec(`CREATE TABLE \`${fieldName}\` (
			id bigint(15) unsigned NOT NULL AUTO_INCREMENT,
			\`${fld1}\` bigint(15) unsigned NOT NULL DEFAULT 0,
			\`${fld2}\` bigint(15) unsigned NOT NULL DEFAULT 0,
			primary key(id),
			INDEX(\`${fld1}\`),
			INDEX(\`${fld2}\`)
		) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = utf8mb4; `);
	} else if(data.storeInDB) {
		if(fieldType === FIELD_TYPE.LOOKUP) {
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

			if(fieldType === FIELD_TYPE.LOOKUP) {
				await mysqlExec('ALTER TABLE \`' + nodeName + '\` ADD INDEX(\`' + fieldName + '\`);')
			}
		}
	}
}