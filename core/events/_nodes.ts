
import { throwError } from '../../www/client-core/src/assert';
import { FIELD_TYPE, NODE_ID, NODE_TYPE, RecordData, RecordDataWrite, UserSession, VIEW_MASK } from "../../www/client-core/src/bs-utils";
import { shouldBeAdmin } from "../admin/admin";
import { NodeEventsHandlers, reloadMetadataSchedule } from "../describe-node";
import { getRecords } from "../get-records";
import { mysqlExec } from "../mysql-connection";
import { submitRecord } from "../submit";

const handlers: NodeEventsHandlers = {

	beforeCreate: async function (data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);
		// shift all nodes in the same parent node
		await mysqlExec("UPDATE _nodes SET prior=prior+10 WHERE (_nodes_id =" + data._nodes_id + ") AND (prior >=" + data.prior + ")");
	},

	afterCreate: async function (data: RecordDataWrite, userSession: UserSession) {

		shouldBeAdmin(userSession);

		const createdID = data.id;

		//inherit access privileges from parent node
		const rpQ = "SELECT roleId, privileges FROM rolePrivileges, _roles " +
			"WHERE (rolePrivileges.roleId = _roles.id)AND(rolePrivileges.node_id=" + data._nodes_id + ")";

		const parentPrivileges = await mysqlExec(rpQ);

		if(parentPrivileges.length) {
			await mysqlExec(parentPrivileges.map((prev) => {
				return 'INSERT INTO rolePrivileges SET node_id=' + createdID + ', roleId=' + prev.roleId + ', privileges=' + prev.privileges + ';';
			}).join(''));
		}

		if((data.node_type === NODE_TYPE.DOCUMENT) && data.store_forms) {

			const tblCrtQ = `CREATE TABLE ${data.table_name} (
			id serial4  NOT NULL,
			status int2  NOT NULL,
			name VARCHAR(64) NOT NULL,
			_users_id int4  NOT NULL,
			_created_on timestamp NOT NULL,
			_organization_id int4 NOT NULL
			);
			ALTER TABLE ${data.table_name} ALTER COLUMN _created_on SET DEFAULT now();
			ALTER TABLE ${data.table_name} ALTER COLUMN status SET DEFAULT 0;
			ALTER TABLE ${data.table_name} ALTER COLUMN name SET DEFAULT '';

			ALTER TABLE ${data.table_name}  ADD CONSTRAINT ${data.table_name}_key PRIMARY KEY (id);
			CREATE INDEX ${data.table_name}_users_id ON ${data.table_name} USING hash (_users_id);
			CREATE INDEX ${data.table_name}_organization_id ON ${data.table_name} USING hash (_organization_id);
			CREATE INDEX ${data.table_name}_created_on ON ${data.table_name} USING btree (_created_on);
			CREATE INDEX ${data.table_name}name ON ${data.table_name} USING btree (name);
		`;

			/**
			 * ;
			 * 
			 */

			await mysqlExec(tblCrtQ);

			//create default fields
			const mainFieldQ = `INSERT INTO _fields
				(node_fields_linker, status, show,              prior, field_type,           field_name,    select_field_name,   name,        description,    max_length,      requirement,     "unique",  _users_id,    for_search,     store_in_db,    send_to_server, _organization_id) VALUES
				(${createdID},        1,     ${VIEW_MASK.ALL},  0,     ${FIELD_TYPE.TEXT},   'name',        '',                  'Name',      '',              64,             1,               0,         0,             1,             1,              1,              1);`;
			await mysqlExec(mainFieldQ);


			const createdOnQ = `INSERT INTO _fields
			(node_fields_linker,  status, show,                                    prior, field_type,                field_name,       select_field_name,   name,          description,    max_length,     requirement,     "unique",    _users_id,    for_search,    store_in_db,  _organization_id) VALUES
			(${createdID},        1,      ${VIEW_MASK.LIST | VIEW_MASK.READONLY},  10,    ${FIELD_TYPE.DATE_TIME},   '_created_on',    '',                  'Created on',  '',             0,              0,               0,           0,            1,             1,            1) RETURNING id;`;
			const dateFieldId = (await mysqlExec(createdOnQ))[0].id;
			await mysqlExec('UPDATE _nodes SET _fields_id=' + dateFieldId + ', reverse = 1 WHERE id=' + createdID);



			const createdByQ = `INSERT INTO _fields
			(node_fields_linker,   status, show,                                    prior, field_type,            field_name,          select_field_name,   name,           description,     max_length,   requirement,     "unique",    _users_id,   for_search,     store_in_db,   node_ref,                  _organization_id) VALUES
			(${createdID},         1,      ${VIEW_MASK.LIST | VIEW_MASK.READONLY},  20,    ${FIELD_TYPE.LOOKUP},  '_organization_id',  '_organization',     'Organization', '',              0,            0,               0,           0,           1,              1,             ${NODE_ID.ORGANIZATIONS},  1);`;
			await mysqlExec(createdByQ);



			const createdByOrganozation = `INSERT INTO _fields
			(node_fields_linker,    status,   show,                                     prior,     field_type,              field_name,  select_field_name,    name,      description,   max_length,  requirement,  "unique",    _users_id,    for_search,    store_in_db,   node_ref,            lookup_icon,  _organization_id) VALUES
			(${createdID},          1,        ${VIEW_MASK.LIST | VIEW_MASK.READONLY},   30,        ${FIELD_TYPE.LOOKUP},   '_users_id',  '_users',             'Owner',   '',            0,           0,             0,          0,            1,             1,             ${NODE_ID.USERS},    'avatar',     1);`;
			await mysqlExec(createdByOrganozation);

		}

		let nodes = await getRecords(NODE_ID.NODES, VIEW_MASK.ALL, null, userSession, { _nodes_id: data._nodes_id });
		nodes.items.sort((a, b) => {
			return a.prior - b.prior;
		});
		let prior = 0;
		nodes.items.forEach(async (node) => {
			prior += 10;
			if(node.prior !== prior) {
				await submitRecord(NODE_ID.NODES, { prior }, node.id, userSession);
			}
		});

		reloadMetadataSchedule();
	},

	beforeUpdate: async function (currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);
		reloadMetadataSchedule();
	},

	beforeDelete: async function (data: RecordData, userSession: UserSession) {
		throwError('_nodes beforeCreate deletion event is not implemented');
	}
}

export default handlers;