
import { throwError } from '../../www/client-core/src/assert';
import { FIELD_ID, FIELD_TYPE, NODE_ID, RecordData, RecordDataWrite, UserSession, VIEW_MASK } from "../../www/client-core/src/bs-utils";
import { shouldBeAdmin } from "../admin/admin";
import { mustBeUnset } from "../auth";
import { getLangs, getNodeDesc, NodeEventsHandlers, reloadMetadataSchedule } from "../describe-node";
import { getRecords } from "../get-records";
import { L } from "../locale";
import { mysqlExec } from "../mysql-connection";
import { submitRecord } from "../submit";

const handlers: NodeEventsHandlers = {
	beforeCreate: async function (data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);

		if(data.multilingual) {
			const langs = getLangs();
			const fn = data.field_name;
			for(let l of langs) {
				if(l.prefix) {
					data.field_name = fn + l.prefix;
					await createFieldInTable(data);
				}
			}
			data.field_name = fn;
		}

		await createFieldInTable(data);
	},

	afterCreate: async function (data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);

		const field_type = data.field_type;
		const field_name = data.field_name;
		if(field_type === FIELD_TYPE.LOOKUP_1toN) {

			const parentNode = await getRecords(NODE_ID.NODES, 1, data.node_fields_linker, userSession);

			const linkerFieldData = {
				status: 1,
				field_name: field_name + '_linker',
				node_fields_linker: data.node_ref,
				node_ref: data.node_fields_linker,
				name: parentNode.single_name,
				show: VIEW_MASK.EDITABLE,
				prior: 1000,
				send_to_server: 1,
				store_in_db: 1,
				field_type: FIELD_TYPE.LOOKUP,
				for_search: 1,
				select_field_name: parentNode.table_name,
				_users_id: userSession.id,
				_organization_id: userSession.orgId
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

	beforeUpdate: async function (currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {

		shouldBeAdmin(userSession);

		if((currentData.id === FIELD_ID.MAX_LENGTH) && newData.hasOwnProperty('max_length')) {
			throwError(L('SIZE_FLD_BLOCKED', userSession));
		}

		mustBeUnset(newData, 'field_name');
		mustBeUnset(newData, 'store_in_db');
		mustBeUnset(newData, 'node_fields_linker');

		if(currentData.store_in_db) {

			if(newData.hasOwnProperty('field_name') || newData.hasOwnProperty('max_length') || newData.hasOwnProperty('multilingual') || newData.hasOwnProperty('for_search')) {

				const multilingualChanged = newData.hasOwnProperty('multilingual') && currentData.multilingual !== newData.multilingual;

				const node = getNodeDesc(currentData.node_fields_linker.id);
				const realFieldName = currentData.field_name;
				const field_type = currentData.field_type;

				if(currentData.for_search !== newData.for_search) {
					if(newData.for_search) {
						await mysqlExec(`CREATE INDEX "${node.table_name}${realFieldName}" ON ${node.table_name} USING btree (${realFieldName});`);
					} else {
						await mysqlExec(`DROP INDEX IF EXISTS "${node.table_name}${realFieldName};`);
					}
				}

				currentData = Object.assign(currentData, newData);

				if((realFieldName !== '_organization_id') && (realFieldName !== '_users_id') && (realFieldName !== '_created_on') && (realFieldName !== 'id')) {
					if(currentData.store_in_db && (field_type !== FIELD_TYPE.STATIC_TEXT) && (field_type !== FIELD_TYPE.LOOKUP_NtoM) && (field_type !== FIELD_TYPE.LOOKUP_1toN)) {
						const typeQ = getFieldTypeSQL(currentData);
						if(typeQ) {
							const langs = getLangs();

							if(multilingualChanged) {
								if(currentData.multilingual) {
									for(let l of langs) {
										if(l.prefix) {
											currentData.field_name = realFieldName + l.prefix;
											await createFieldInTable(currentData);
										}
									}
									currentData.field_name = realFieldName;
								} else {
									for(let l of langs) {
										if(l.prefix) {
											await mysqlExec('ALTER TABLE ' + node.table_name + ' DROP COLUMN ' + realFieldName + l.prefix);
										}
									}
								}
							} else if(currentData.multilingual) {
								for(let l of langs) {
									if(l.prefix) {
										await mysqlExec('ALTER TABLE ' + node.table_name + ' MODIFY COLUMN ' + realFieldName + l.prefix + ' ' + typeQ);
									}
								}
							}
							await mysqlExec('ALTER TABLE ' + node.table_name + ' MODIFY COLUMN ' + realFieldName + ' ' + typeQ);
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
}

export default handlers;
export { createFieldInTable };

function getFieldTypeSQL(data) {
	switch(data.field_type) {
		case FIELD_TYPE.PASSWORD:
		case FIELD_TYPE.TEXT:
			if(data.max_length <= 255) {
				return 'VARCHAR(' + data.max_length + ") NOT NULL DEFAULT ''";
			} else {
				return "text NOT NULL DEFAULT ''";
			}
		case FIELD_TYPE.COLOR:
			return "int8 NOT NULL DEFAULT 4294967295";
		case FIELD_TYPE.NUMBER:
			if(data.max_length <= 5) {
				return 'int2 NOT NULL DEFAULT 0';
			} else if(data.max_length <= 9) {
				return 'int4 NOT NULL DEFAULT 0';
			} else if(data.max_length <= 19) {
				return 'int8 NOT NULL DEFAULT 0';
			} else {
				return 'NUMERIC(' + data.max_length + ', 0) NOT NULL DEFAULT 0';
			}
		case FIELD_TYPE.DATE_TIME:
		case FIELD_TYPE.DATE:
			return 'timestamp NOT NULL DEFAULT \'0000-00-00 00:00:00\'';
		case FIELD_TYPE.BOOL:
			return "int2 NOT NULL DEFAULT 0";
		case FIELD_TYPE.ENUM:
		case FIELD_TYPE.LOOKUP:
			return 'int4 UNSIGNED NOT NULL DEFAULT 0';
		case FIELD_TYPE.PICTURE:
			return "VARCHAR(32) NOT NULL DEFAULT ''";
		case FIELD_TYPE.RATING:
			throwError('Field type ' + FIELD_TYPE.RATING + ' is not editable');
		case FIELD_TYPE.RICH_EDITOR:
			return "text NOT NULL DEFAULT ''";
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

	const field_type = data.field_type;
	const field_name = data.field_name;

	const node = getNodeDesc(nodeId);
	const nodeName = node.table_name;
	let linkedNodeName;

	if(field_type === FIELD_TYPE.LOOKUP || field_type === FIELD_TYPE.LOOKUP_NtoM || field_type === FIELD_TYPE.LOOKUP_1toN) {
		const linkedNodeId = data.node_ref;
		linkedNodeName = getNodeDesc(linkedNodeId).table_name;

		if(field_type === FIELD_TYPE.LOOKUP || field_type === FIELD_TYPE.LOOKUP_NtoM) {

			const filters = {
				status: 1,
				node_fields_linker: linkedNodeId,
				field_type: FIELD_TYPE.PICTURE
			};
			const records = await getRecords(6, VIEW_MASK.LIST, undefined, undefined, filters);
			if(records.total) {
				data.lookup_icon = records.items[0].field_name;
			}
		}
	}

	if(field_type === FIELD_TYPE.LOOKUP_1toN) {
		data.store_in_db = 0;
	} else if(field_type === FIELD_TYPE.LOOKUP_NtoM) {

		data.select_field_name = linkedNodeName;
		data.for_search = 1;

		const fld1 = nodeName + '_id';
		const fld2 = linkedNodeName + '_id';

		await mysqlExec(`
			CREATE TABLE ${field_name} (
				id serial8,
				${fld1} int4,
				${fld2} int4
			);

			ALTER TABLE ${field_name} ADD CONSTRAINT ${field_name}_key PRIMARY KEY (${fld1}, ${fld2});
			CREATE INDEX ON "_user_roles" USING hash (${fld1});
			CREATE INDEX ON "_user_roles" USING hash (${fld2});
			`);


	} else if(data.store_in_db) {
		if(field_type === FIELD_TYPE.LOOKUP) {
			data.for_search = 1;
			data.select_field_name = linkedNodeName;
		}

		const typeQ = getFieldTypeSQL(data);
		if(typeQ) {
			const altQ = ['ALTER TABLE ', nodeName, ' ADD COLUMN ', field_name, ' ', typeQ];

			if(data.for_search || data.unique) {
				altQ.push(', ADD', (data.unique ? ' UNIQUE' : ''), 'ALTER TABLE \"', nodeName, '\" ADD INDEX (\"', field_name, '\");');
			}

			await mysqlExec(altQ.join(''));

			if(field_type === FIELD_TYPE.LOOKUP) {
				await mysqlExec('ALTER TABLE ' + nodeName + ' ADD INDEX(' + field_name + ');')
			}
		}
	}
}