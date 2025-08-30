import { throwError } from '../../www/client-core/src/assert';
import type { RecordData, RecordDataWrite, UserSession } from '../../www/client-core/src/bs-utils';
import { FIELD_TYPE, NODE_ID, NODE_TYPE, VIEW_MASK } from '../../www/client-core/src/bs-utils';
import { shouldBeAdmin } from '../admin/admin';
import type { NodeEventsHandlers } from '../describe-node';
import { reloadMetadataSchedule } from '../describe-node';
import { getRecords } from '../get-records';
import { mysqlExec } from '../mysql-connection';
import { submitRecord } from '../submit';

const handlers: NodeEventsHandlers = {
	beforeCreate: async function (data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);
		// shift all nodes in the same parent node
		await mysqlExec('UPDATE _nodes SET prior=prior+10 WHERE (_nodesId =' + data._nodesId + ') AND (prior >=' + data.prior + ')');
	},

	afterCreate: async function (data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);

		const createdID = data.id;

		//inherit access privileges from parent node
		const rpQ = 'SELECT roleId, privileges FROM rolePrivileges, _roles ' + 'WHERE (rolePrivileges.roleId = _roles.id)AND(rolePrivileges.nodeId=' + data._nodesId + ')';

		const parentPrivileges = await mysqlExec(rpQ);

		if (parentPrivileges.length) {
			await mysqlExec(
				parentPrivileges
					.map((prev) => {
						return 'INSERT INTO rolePrivileges SET nodeId=' + createdID + ', roleId=' + prev.roleId + ', privileges=' + prev.privileges + ';';
					})
					.join('')
			);
		}

		if (data.nodeType === NODE_TYPE.DOCUMENT && data.storeForms) {
			const tblCrtQ = `CREATE TABLE ${data.tableName} (
			id serial4  NOT NULL,
			status int2  NOT NULL,
			name VARCHAR(64) NOT NULL,
			_usersId int4  NOT NULL,
			_createdOn timestamp NOT NULL,
			_organizationId int4 NOT NULL
			);
			ALTER TABLE ${data.tableName} ALTER COLUMN _createdOn SET DEFAULT now();
			ALTER TABLE ${data.tableName} ALTER COLUMN status SET DEFAULT 0;
			ALTER TABLE ${data.tableName} ALTER COLUMN name SET DEFAULT '';

			ALTER TABLE ${data.tableName}  ADD CONSTRAINT ${data.tableName}_key PRIMARY KEY (id);
			CREATE INDEX ${data.tableName}_usersId ON ${data.tableName} USING hash (_usersId);
			CREATE INDEX ${data.tableName}_organizationId ON ${data.tableName} USING hash (_organizationId);
			CREATE INDEX ${data.tableName}_createdOn ON ${data.tableName} USING btree (_createdOn);
			CREATE INDEX ${data.tableName}name ON ${data.tableName} USING btree (name);
		`;

			/**
			 * ;
			 *
			 */

			await mysqlExec(tblCrtQ);

			//create default fields
			const mainFieldQ = `INSERT INTO _fields
				(nodeFieldsLinker, status, show,              prior, fieldType,           fieldName,    selectFieldName,   name,        description,    maxLength,      requirement,     "unique",  _usersId,    forSearch,     storeInDb,    sendToServer, _organizationId) VALUES
				(${createdID},        1,     ${VIEW_MASK.ALL},  0,     ${FIELD_TYPE.TEXT},   'name',        '',                  'Name',      '',              64,             1,               0,         0,             1,             1,              1,              1);`;
			await mysqlExec(mainFieldQ);

			const createdOnQ = `INSERT INTO _fields
			(nodeFieldsLinker,  status, show,                                    prior, fieldType,                fieldName,       selectFieldName,   name,          description,    maxLength,     requirement,     "unique",    _usersId,    forSearch,    storeInDb,  _organizationId) VALUES
			(${createdID},        1,      ${VIEW_MASK.LIST | VIEW_MASK.READONLY},  10,    ${FIELD_TYPE.DATE_TIME},   '_createdOn',    '',                  'Created on',  '',             0,              0,               0,           0,            1,             1,            1) RETURNING id;`;
			const dateFieldId = (await mysqlExec(createdOnQ))[0].id;
			await mysqlExec('UPDATE _nodes SET _fieldsId=' + dateFieldId + ', reverse = 1 WHERE id=' + createdID);

			const createdByQ = `INSERT INTO _fields
			(nodeFieldsLinker,   status, show,                                    prior, fieldType,            fieldName,          selectFieldName,   name,           description,     maxLength,   requirement,     "unique",    _usersId,   forSearch,     storeInDb,   nodeRef,                  _organizationId) VALUES
			(${createdID},         1,      ${VIEW_MASK.LIST | VIEW_MASK.READONLY},  20,    ${FIELD_TYPE.LOOKUP},  '_organizationId',  '_organization',     'Organization', '',              0,            0,               0,           0,           1,              1,             ${NODE_ID.ORGANIZATION},  1);`;
			await mysqlExec(createdByQ);

			const createdByOrganization = `INSERT INTO _fields
			(nodeFieldsLinker,    status,   show,                                     prior,     fieldType,              fieldName,  selectFieldName,    name,      description,   maxLength,  requirement,  "unique",    _usersId,    forSearch,    storeInDb,   nodeRef,            lookupIcon,  _organizationId) VALUES
			(${createdID},          1,        ${VIEW_MASK.LIST | VIEW_MASK.READONLY},   30,        ${FIELD_TYPE.LOOKUP},   '_usersId',  '_users',             'Owner',   '',            0,           0,             0,          0,            1,             1,             ${NODE_ID.USERS},    'avatar',     1);`;
			await mysqlExec(createdByOrganization);
		}

		const nodes = await getRecords(NODE_ID.NODES, VIEW_MASK.ALL, null, userSession, {
			_nodesId: data._nodesId
		});
		nodes.items.sort((a, b) => {
			return a.prior - b.prior;
		});
		let prior = 0;
		nodes.items.forEach(async (node) => {
			prior += 10;
			if (node.prior !== prior) {
				await submitRecord(NODE_ID.NODES, { prior }, node.id, userSession);
			}
		});

		reloadMetadataSchedule();
	},

	beforeUpdate: async function (_currentData: RecordData, _newData: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);
		reloadMetadataSchedule();
	},

	beforeDelete: async function (_data: RecordData, _userSession: UserSession) {
		throwError('_nodes beforeCreate deletion event is not implemented');
	}
};

export default handlers;
