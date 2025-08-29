import { throwError } from '../../www/client-core/src/assert';
import type { RecordData, RecordDataWrite, UserSession } from '../../www/client-core/src/bs-utils';
import { FIELD_ID, FIELD_TYPE, NODE_ID, VIEW_MASK } from '../../www/client-core/src/bs-utils';
import { shouldBeAdmin } from '../admin/admin';
import { mustBeUnset } from '../auth';
import type { NodeEventsHandlers } from '../describe-node';
import { getLangs, getNodeDesc, reloadMetadataSchedule } from '../describe-node';
import { getRecords } from '../get-records';
import { L } from '../locale';
import { mysqlExec } from '../mysql-connection';
import { submitRecord } from '../submit';

const handlers: NodeEventsHandlers = {
	beforeCreate: async function (data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);

		if (data.multilingual) {
			const langs = getLangs();
			const fn = data.fieldName;
			for (const l of langs) {
				if (l.prefix) {
					data.fieldName = fn + l.prefix;
					await createFieldInTable(data);
				}
			}
			data.fieldName = fn;
		}

		await createFieldInTable(data);
	},

	afterCreate: async function (data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);

		const fieldType = data.fieldType;
		const fieldName = data.fieldName;
		if (fieldType === FIELD_TYPE.LOOKUP_1_TO_N) {
			const parentNode = await getRecords(NODE_ID.NODES, 1, data.nodeFieldsLinker, userSession);

			const linkerFieldData = {
				status: 1,
				fieldName: fieldName + 'Linker',
				nodeFieldsLinker: data.nodeRef,
				nodeRef: data.nodeFieldsLinker,
				name: parentNode.singleName,
				show: VIEW_MASK.EDITABLE,
				prior: 1000,
				sendToServer: 1,
				storeInDb: 1,
				fieldType: FIELD_TYPE.LOOKUP,
				forSearch: 1,
				selectFieldName: parentNode.tableName,
				_usersId: userSession.id,
				_organizationId: userSession.orgId
			};
			await submitRecord(NODE_ID.FIELDS, linkerFieldData);
		}

		// update priority
		const fields = await getRecords(NODE_ID.FIELDS, VIEW_MASK.ALL, null, userSession, {
			nodeFieldsLinker: data.nodeFieldsLinker
		});
		fields.items.sort((a, b) => {
			return a.prior - b.prior;
		});
		let prior = 0;
		await Promise.all(
			fields.items.map((i) => {
				prior += 10;
				if (i.prior !== prior) {
					return submitRecord(NODE_ID.FIELDS, { prior }, i.id, userSession);
				}
			})
		);

		reloadMetadataSchedule();
	},

	beforeUpdate: async function (currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);

		if (currentData.id === FIELD_ID.MAX_LENGTH && newData.hasOwnProperty('maxLength')) {
			throwError(L('SIZE_FLD_BLOCKED', userSession));
		}

		mustBeUnset(newData, 'fieldName');
		mustBeUnset(newData, 'storeInDb');
		mustBeUnset(newData, 'nodeFieldsLinker');

		if (currentData.storeInDb) {
			if (newData.hasOwnProperty('fieldName') || newData.hasOwnProperty('maxLength') || newData.hasOwnProperty('multilingual') || newData.hasOwnProperty('forSearch')) {
				const multilingualChanged = newData.hasOwnProperty('multilingual') && currentData.multilingual !== newData.multilingual;

				const node = getNodeDesc(currentData.nodeFieldsLinker.id);
				const realFieldName = currentData.fieldName;
				const fieldType = currentData.fieldType;

				if (currentData.forSearch !== newData.forSearch) {
					if (newData.forSearch) {
						await mysqlExec(`CREATE INDEX "${node.tableName}${realFieldName}" ON ${node.tableName} USING btree (${realFieldName});`);
					} else {
						await mysqlExec(`DROP INDEX IF EXISTS "${node.tableName}${realFieldName};`);
					}
				}

				currentData = Object.assign(currentData, newData);

				if (realFieldName !== '_organizationId' && realFieldName !== '_usersId' && realFieldName !== '_createdOn' && realFieldName !== 'id') {
					if (currentData.storeInDb && fieldType !== FIELD_TYPE.STATIC_HTML_BLOCK && fieldType !== FIELD_TYPE.LOOKUP_N_TO_M && fieldType !== FIELD_TYPE.LOOKUP_1_TO_N) {
						const typeQ = getFieldTypeSQL(currentData);
						if (typeQ) {
							const langs = getLangs();

							if (multilingualChanged) {
								if (currentData.multilingual) {
									for (const l of langs) {
										if (l.prefix) {
											currentData.fieldName = realFieldName + l.prefix;
											await createFieldInTable(currentData);
										}
									}
									currentData.fieldName = realFieldName;
								} else {
									for (const l of langs) {
										if (l.prefix) {
											await mysqlExec('ALTER TABLE ' + node.tableName + ' DROP COLUMN ' + realFieldName + l.prefix);
										}
									}
								}
							} else if (currentData.multilingual) {
								for (const l of langs) {
									if (l.prefix) {
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

	beforeDelete: async function (data: RecordData, userSession: UserSession) {
		throwError('_fields beforeCreate deletion event is not implemented');
	}
};

export default handlers;
export { createFieldInTable };

function getFieldTypeSQL(data) {
	switch (data.fieldType) {
	case FIELD_TYPE.PASSWORD:
	case FIELD_TYPE.TEXT:
		if (data.maxLength <= 255) {
			return 'VARCHAR(' + data.maxLength + ') NOT NULL DEFAULT \'\'';
		} else {
			return 'text NOT NULL DEFAULT \'\'';
		}
	case FIELD_TYPE.COLOR:
		return 'int8 NOT NULL DEFAULT 4294967295';
	case FIELD_TYPE.NUMBER:
		if (data.maxLength <= 5) {
			return 'int2 NOT NULL DEFAULT 0';
		} else if (data.maxLength <= 9) {
			return 'int4 NOT NULL DEFAULT 0';
		} else if (data.maxLength <= 19) {
			return 'int8 NOT NULL DEFAULT 0';
		} else {
			return 'NUMERIC(' + data.maxLength + ', 0) NOT NULL DEFAULT 0';
		}
	case FIELD_TYPE.DATETIME:
	case FIELD_TYPE.DATE:
		return 'timestamp NOT NULL DEFAULT \'0000-00-00 00:00:00\'';
	case FIELD_TYPE.BOOL:
		return 'int2 NOT NULL DEFAULT 0';
	case FIELD_TYPE.ENUM:
	case FIELD_TYPE.LOOKUP:
		return 'int4 UNSIGNED NOT NULL DEFAULT 0';
	case FIELD_TYPE.IMAGE:
		return 'VARCHAR(32) NOT NULL DEFAULT \'\'';
	case FIELD_TYPE.HTML_EDITOR:
		return 'text NOT NULL DEFAULT \'\'';
	case FIELD_TYPE.FILE:
		return 'VARCHAR(127) NOT NULL DEFAULT \'\'';
	default:
		return false;
	}
}

async function createFieldInTable(data: RecordDataWrite) {
	let nodeId = data.nodeFieldsLinker;
	if (typeof nodeId !== 'number') {
		nodeId = nodeId.id;
	}

	// prepare space for field
	await mysqlExec('UPDATE _fields SET prior=prior+20 WHERE (nodeFieldsLinker =' + nodeId + ') AND (prior >' + data.prior + ')');

	const fieldType = data.fieldType;
	const fieldName = data.fieldName;

	const node = getNodeDesc(nodeId);
	const nodeName = node.tableName;
	let linkedNodeName;

	if (fieldType === FIELD_TYPE.LOOKUP || fieldType === FIELD_TYPE.LOOKUP_N_TO_M || fieldType === FIELD_TYPE.LOOKUP_1_TO_N) {
		const linkedNodeId = data.nodeRef;
		linkedNodeName = getNodeDesc(linkedNodeId).tableName;

		if (fieldType === FIELD_TYPE.LOOKUP || fieldType === FIELD_TYPE.LOOKUP_N_TO_M) {
			const filters = {
				status: 1,
				nodeFieldsLinker: linkedNodeId,
				fieldType: FIELD_TYPE.IMAGE
			};
			const records = await getRecords(6, VIEW_MASK.LIST, undefined, undefined, filters);
			if (records.total) {
				data.lookupIcon = records.items[0].fieldName;
			}
		}
	}

	if (fieldType === FIELD_TYPE.LOOKUP_1_TO_N) {
		data.storeInDb = 0;
	} else if (fieldType === FIELD_TYPE.LOOKUP_N_TO_M) {
		data.selectFieldName = linkedNodeName;
		data.forSearch = 1;

		const fld1 = nodeName + 'Id';
		const fld2 = linkedNodeName + 'Id';

		await mysqlExec(`
			CREATE TABLE ${fieldName} (
				id serial8,
				${fld1} int4,
				${fld2} int4
			);

			ALTER TABLE ${fieldName} ADD CONSTRAINT ${fieldName}_key PRIMARY KEY (${fld1}, ${fld2});
			CREATE INDEX ON "_userRoles" USING hash (${fld1});
			CREATE INDEX ON "_userRoles" USING hash (${fld2});
			`);
	} else if (data.storeInDb) {
		if (fieldType === FIELD_TYPE.LOOKUP) {
			data.forSearch = 1;
			data.selectFieldName = linkedNodeName;
		}

		const typeQ = getFieldTypeSQL(data);
		if (typeQ) {
			const altQ = ['ALTER TABLE ', nodeName, ' ADD COLUMN ', fieldName, ' ', typeQ];

			if (data.forSearch || data.unique) {
				altQ.push(', ADD', data.unique ? ' UNIQUE' : '', 'ALTER TABLE "', nodeName, '" ADD INDEX ("', fieldName, '");');
			}

			await mysqlExec(altQ.join(''));

			if (fieldType === FIELD_TYPE.LOOKUP) {
				await mysqlExec('ALTER TABLE ' + nodeName + ' ADD INDEX(' + fieldName + ');');
			}
		}
	}
}
