
import { mysqlExec } from "../mysql-connection";
import { shouldBeAdmin } from "../admin/admin";
import { NodeEventsHandlers, reloadMetadataSchedule } from "../describe-node";
import { FIELD_TYPE, NODE_ID, RecordData, RecordDataWrite, throwError, UserSession, VIEW_MASK, NODE_TYPE } from "../../www/client-core/src/bs-utils";
import { L } from "../locale";
import { getRecords } from "../get-records";
import { submitRecord } from "../submit";

const handlers: NodeEventsHandlers = {

	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);
		// shift all nodes in the same parent node
		await mysqlExec("UPDATE _nodes SET prior=prior+10 WHERE (_nodes_id =" + data._nodes_id + ") AND (prior >=" + data.prior + ")");
	},

	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {

		shouldBeAdmin(userSession);

		const createdID = data.id;

		//inherit access privileges from parent node
		const rpQ = "SELECT role_id, privileges FROM _role_privileges, _roles " +
			"WHERE (_role_privileges.role_id = _roles.id)AND(_role_privileges.node_id=" + data._nodes_id + ")";

		const parentPrivileges = await mysqlExec(rpQ);

		if(parentPrivileges.length) {
			await mysqlExec(parentPrivileges.map((prev) => {
				return 'INSERT INTO _role_privileges SET node_id=' + createdID + ', role_id=' + prev.role_id + ', privileges=' + prev.privileges + ';';
			}).join(''));
		}

		if((data.node_type === NODE_TYPE.DOCUMENT) && data.store_forms) {

			const tblCrtQ = `CREATE TABLE \`${data.table_name}\` (
			id bigint(15) unsigned NOT NULL AUTO_INCREMENT,
			status int(1) unsigned NOT NULL DEFAULT '1',
			name VARCHAR(64) NOT NULL default '',
			_users_id bigint(15) unsigned NOT NULL,
			_created_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
			_organization_id bigint(15) unsigned NOT NULL DEFAULT '0',
			PRIMARY KEY (id),
			KEY _users_id (_users_id),
			KEY _created_on (_created_on),
			KEY _organization_id (_organization_id)
			) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;`;

			await mysqlExec(tblCrtQ);

			const insertedId = (await mysqlExec("INSERT INTO \`" + data.table_name + "\` SET status=0, _users_id=0"))[0].id;
			await mysqlExec("UPDATE \`" + data.table_name + "\` SET id=0 WHERE id=" + insertedId);

			//create default fields
			const mainFieldQ = `INSERT INTO \`_fields\`
				(\`node_fields_linker\`, \`status\`, \`show\`,          \`prior\`, \`field_type\`,         \`field_name\`, \`select_field_name\`, \`name\`,                           \`description\`, \`max_length\`, \`requirement\`, \`unique\`, \`_users_id\`, \`for_search\`, \`store_in_db\`, \`send_to_server\`) VALUES
				(${createdID},             1,          ${VIEW_MASK.ALL},  0,        ${FIELD_TYPE.TEXT},   'name',        '',                  '${L('FIELD_NAME', userSession)}',   '',              64,             1,               0,         0,             1,             1,              1);`;
			await mysqlExec(mainFieldQ);

			if(data.addCreatedOnFiled) {
				const createdOnQ = `INSERT INTO \`_fields\`
				(\`node_fields_linker\`,  \`status\`, \`show\`,                                 \`prior\`, \`field_type\`,                \`field_name\`,    \`select_field_name\`, \`name\`,                                \`description\`, \`max_length\`, \`requirement\`, \`unique\`, \`_users_id\`, \`for_search\`, \`store_in_db\`) VALUES
				(${createdID},            1,          ${VIEW_MASK.LIST | VIEW_MASK.READONLY},   10,         ${FIELD_TYPE.DATE_TIME},     '_created_on',    '',                  '${L('FIELD_CREATED_ON', userSession)}',  '',             0,              0,               0,           0,            1,             1);`;
				const dateFieldId = (await mysqlExec(createdOnQ))[0].id;
				await mysqlExec('UPDATE _nodes SET _fields_id=' + dateFieldId + ', reverse = 1 WHERE id=' + createdID);
			}

			if(data.addCreatedByFiled) {
				const createdByQ = `INSERT INTO _fields
				(\`node_fields_linker\`, \`status\`, \`show\`,                                 \`prior\`, \`field_type\`,            \`field_name\`,      \`select_field_name\`, \`name\`,                                \`description\`, \`max_length\`, \`requirement\`, \`unique\`, \`_users_id\`, \`for_search\`, \`store_in_db\`, \`node_ref\`) VALUES
				(${createdID},            1,          ${VIEW_MASK.LIST | VIEW_MASK.READONLY},   20,         ${FIELD_TYPE.LOOKUP},    '_organization_id',  '_organization',     '${L('FIELD_ORGANIZATION', userSession)}', '',              0,            0,               0,           0,           1,              1,             ${NODE_ID.ORGANIZATIONS});`;
				await mysqlExec(createdByQ);
			}

			if(data.addCreatorUserFld) {
				const createdByQ = `INSERT INTO _fields
				(\`node_fields_linker\`, \`status\`, \`show\`,                                 \`prior\`, \`field_type\`,          \`field_name\`,  \`select_field_name\`,  \`name\`,                            \`description\`, \`max_length\`, \`requirement\`, \`unique\`, \`_users_id\`, \`for_search\`, \`store_in_db\`, \`node_ref\`,          \`lookup_icon\`) VALUES
				(${createdID},           1,           ${VIEW_MASK.LIST | VIEW_MASK.READONLY},   30,        ${FIELD_TYPE.LOOKUP},   '_users_id',     '_users',             '${L('FIELD_OWNER', userSession)}',   '',               0,              0,              0,          0,            1,             1,             ${NODE_ID.USERS},    'avatar');`;
				await mysqlExec(createdByQ);
			}
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

	beforeUpdate: async function(currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);
		reloadMetadataSchedule();
	},

	beforeDelete: async function(data: RecordData, userSession: UserSession) {
		throwError('_nodes beforeCreate deletion event is not implemented');
	}
}

export default handlers;