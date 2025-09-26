import { ESCAPE_BEGIN, ESCAPE_END, throwError } from '../../www/client-core/src/assert';
import type { UserSession } from '../../www/client-core/src/bs-utils';
import { VIEW_MASK } from '../../www/client-core/src/bs-utils';
import { serverOn } from '../../www/client-core/src/events-handle';
import { E, FIELD_TYPE, NODE_ID, NODE_TYPE, type INodesRecord } from '../../www/client-core/src/types/generated';
import { shouldBeAdmin } from '../admin/admin';
import { reloadMetadataSchedule } from '../describe-node';
import { getRecords } from '../get-records';
import { D, mysqlExec, NUM_1 } from '../mysql-connection';
import { submitRecord } from '../submit';

serverOn(E._nodes.beforeCreate, async (data, userSession) => {
	shouldBeAdmin(userSession);
	// shift all nodes in the same parent node

	await mysqlExec('UPDATE _nodes SET prior = prior + ' + D(10) + ' WHERE ("_nodesId" =' + D(data._nodesId.id) + ') AND (prior >= ' + D(data.prior) + ')');
});

serverOn(E._nodes.afterCreate, async (data, userSession) => {
	shouldBeAdmin(userSession);

	const createdID = data.id!;

	// inherit access privileges from parent node
	const rpQ = 'SELECT "roleId", privileges FROM "_rolePrivileges", _roles ' + 'WHERE ("_rolePrivileges"."roleId" = _roles.id)AND("_rolePrivileges"."nodeId"=' + D(data._nodesId.id) + ')';

	const parentPrivileges = await mysqlExec(rpQ);

	if (parentPrivileges.length) {
		await mysqlExec(
			parentPrivileges
				.map((prev) => {
					return 'INSERT INTO "_rolePrivileges" ("nodeId", "roleId", privileges ) VALUES (' + D(createdID) + ', ' + D(prev.roleId) + ', ' + D(prev.privileges) + ');';
				})
				.join('')
		);
	}

	if (data.nodeType === NODE_TYPE.DOCUMENT && data.storeForms) {
		const tblCrtQ = ESCAPE_BEGIN + `CREATE TABLE ${data.tableName} (
			id serial4  NOT NULL,
			"status" int2  NOT NULL,
			name VARCHAR(64) NOT NULL,
			"_usersId" int4  NOT NULL,
			"_createdOn" timestamp NOT NULL,
			"_organizationId" int4 NOT NULL
			);
			ALTER TABLE "${data.tableName}" ALTER COLUMN "_createdOn" SET DEFAULT now();
			ALTER TABLE "${data.tableName}" ALTER COLUMN "status" SET DEFAULT 0;
			ALTER TABLE "${data.tableName}" ALTER COLUMN name SET DEFAULT '';

			ALTER TABLE "${data.tableName}"  ADD CONSTRAINT "${data.tableName}_key" PRIMARY KEY (id);
			CREATE INDEX "${data.tableName}_usersId" ON "${data.tableName}" USING hash ("_usersId");
			CREATE INDEX "${data.tableName}_organizationId" ON "${data.tableName}" USING hash ("_organizationId");
			CREATE INDEX "${data.tableName}_createdOn" ON "${data.tableName}" USING btree ("_createdOn");
			CREATE INDEX "${data.tableName}name" ON "${data.tableName}" USING btree (name);
			` + ESCAPE_END;

		/**
			 * ;
			 *
			 */

		await mysqlExec(tblCrtQ);

		// create default fields
		const mainFieldQ = `INSERT INTO _fields
				("nodeFieldsLinker", status, show,              prior,"fieldType",           "fieldName",   "selectFieldName",   name,        description,    "maxLength",     requirement,     "unique", "_usersId",    "forSearch",    "storeInDb",    "sendToServer", "_organizationId") VALUES
				(${createdID},        1,     ${VIEW_MASK.ALL},  0,     ${FIELD_TYPE.TEXT},   'name',        '',                  'Name',      '',              64,             1,               0,         0,             1,             1,              1,              1);`;
		await mysqlExec(ESCAPE_BEGIN + mainFieldQ + ESCAPE_END);

		const createdOnQ = `INSERT INTO _fields
			("nodeFieldsLinker",  status, show,                                    prior, "fieldType",               "fieldName",     "selectFieldName",   name,          description,    "maxLength",    requirement,     "unique",   "_usersId",  "forSearch",    "storeInDb",   "_organizationId") VALUES
			(${createdID},        1,      ${VIEW_MASK.LIST | VIEW_MASK.READONLY},  10,    ${FIELD_TYPE.DATE_TIME},   '_createdOn',    '',                  'Created on',  '',             0,              0,               0,           0,            1,             1,            1) RETURNING id;`;
		const dateFieldId = (await mysqlExec(ESCAPE_BEGIN + createdOnQ + ESCAPE_END))[0].id;
		await mysqlExec('UPDATE _nodes SET "_fieldsId"=' + D(dateFieldId) + ', "reverse" = ' + NUM_1 + ' WHERE id=' + D(createdID));

		const createdByQ = `INSERT INTO _fields
			("nodeFieldsLinker",   status, show,  prior, "fieldType",           "fieldName",       "selectFieldName",    name,           description,     "maxLength",  requirement,     "unique",   "_usersId",   "forSearch",    "storeInDb",   "nodeRef",                "_organizationId") VALUES
			(${createdID},         1,      0,     20,    ${FIELD_TYPE.LOOKUP},  '_organizationId',  '_organization',     'Organization', '',              0,            0,               0,           0,           1,              1,             ${NODE_ID.ORGANIZATION},  1);`;
		await mysqlExec(ESCAPE_BEGIN + createdByQ + ESCAPE_END);

		const createdByOrganization = `INSERT INTO _fields
			("nodeFieldsLinker",    status,   show,  prior,     "fieldType",            "fieldName", "selectFieldName",    name,      description,   "maxLength", requirement,  "unique",    "_usersId",  "forSearch",    "storeInDb",  "nodeRef",            "lookupIcon", "_organizationId") VALUES
			(${createdID},          1,        0,     30,        ${FIELD_TYPE.LOOKUP},   '_usersId',  '_users',             'Owner',   '',            0,           0,             0,          0,            1,             1,             ${NODE_ID.USERS},    'avatar',      1);`;
		await mysqlExec(ESCAPE_BEGIN + createdByOrganization + ESCAPE_END);
	}

	const nodes = await getRecords(NODE_ID.NODES, VIEW_MASK.ALL, undefined, userSession, {
		_nodesId: data._nodesId.id
	});
	nodes.items.sort((a, b) => {
		return a.prior - b.prior;
	});
	let prior = 0;
	nodes.items.forEach(async (node) => {
		prior += 10;
		if (node.prior !== prior) {
			await submitRecord(NODE_ID.NODES, { prior }, node.id!, userSession);
		}
	});

	reloadMetadataSchedule();
});

serverOn(E._nodes.beforeUpdate, async (_currentData, _newData, userSession) => {
	shouldBeAdmin(userSession);
	reloadMetadataSchedule();
});

serverOn(E._nodes.beforeDelete, async (_data: INodesRecord, _userSession: UserSession) => {
	throwError('_nodes beforeCreate deletion event is not implemented');
});
