
import { mysqlExec, mysqlInsertResult, mysqlRowsResult } from "../mysql-connection";
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
		await mysqlExec("UPDATE _nodes SET prior=prior+10 WHERE (_nodesID =" + data._nodesID + ") AND (prior >=" + data.prior + ")");
	},

	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {

		shouldBeAdmin(userSession);

		const createdID = data.id;

		//inherit access privileges from parent node
		const rpQ = "SELECT roleID, privileges FROM _role_privileges, _roles " +
			"WHERE (_role_privileges.roleID = _roles.id)AND(_role_privileges.nodeID=" + data._nodesID + ")";

		const parentPrivileges = await mysqlExec(rpQ) as mysqlRowsResult;

		if(parentPrivileges.length) {
			await mysqlExec(parentPrivileges.map((prev) => {
				return 'INSERT INTO _role_privileges SET nodeID=' + createdID + ', roleID=' + prev.roleID + ', privileges=' + prev.privileges + ';';
			}).join(''));
		}

		if((data.nodeType === NODE_TYPE.DOCUMENT) && data.storeForms) {

			const tblCrtQ = `CREATE TABLE \`${data.tableName}\` (
			id bigint(15) unsigned NOT NULL AUTO_INCREMENT,
			status int(1) unsigned NOT NULL DEFAULT '1',
			name VARCHAR(64) NOT NULL default '',
			_usersID bigint(15) unsigned NOT NULL,
			_createdON timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
			_organizationID bigint(15) unsigned NOT NULL DEFAULT '0',
			PRIMARY KEY (id),
			KEY _usersID (_usersID),
			KEY _createdON (_createdON),
			KEY _organizationID (_organizationID),
			CONSTRAINT creator_id_${data.tableName} FOREIGN KEY (_usersID) REFERENCES _users (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
			CONSTRAINT _organizationID_${data.tableName} FOREIGN KEY (_organizationID) REFERENCES _organization (id) ON DELETE RESTRICT ON UPDATE RESTRICT
			) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;`;

			await mysqlExec(tblCrtQ);

			const insertedId = (await mysqlExec("INSERT INTO \`" + data.tableName + "\` SET status=0, _usersID=0") as mysqlInsertResult).insertId;
			await mysqlExec("UPDATE \`" + data.tableName + "\` SET id=0 WHERE id=" + insertedId);

			//create default fields
			const mainFieldQ = `INSERT INTO \`_fields\`
				(\`node_fields_linker\`, \`status\`, \`show\`,          \`prior\`, \`fieldType\`,         \`fieldName\`, \`selectFieldName\`, \`name\`,                           \`description\`, \`maxLength\`, \`requirement\`, \`unique\`, \`_usersID\`, \`forSearch\`, \`storeInDB\`, \`sendToServer\`) VALUES
				(${createdID},             1,          ${VIEW_MASK.ALL},  0,        ${FIELD_TYPE.TEXT},   'name',        '',                  '${L('FIELD_NAME', userSession)}',   '',              64,             1,               0,         0,             1,             1,              1);`;
			await mysqlExec(mainFieldQ);

			if(data.addCreatedOnFiled) {
				const createdOnQ = `INSERT INTO \`_fields\`
				(\`node_fields_linker\`,  \`status\`, \`show\`,                                 \`prior\`, \`fieldType\`,                \`fieldName\`,    \`selectFieldName\`, \`name\`,                                \`description\`, \`maxLength\`, \`requirement\`, \`unique\`, \`_usersID\`, \`forSearch\`, \`storeInDB\`) VALUES
				(${createdID},            1,          ${VIEW_MASK.LIST | VIEW_MASK.READONLY},   10,         ${FIELD_TYPE.DATE_TIME},     '_createdON',    '',                  '${L('FIELD_CREATED_ON', userSession)}',  '',             0,              0,               0,           0,            1,             1);`;
				const dateFieldId = (await mysqlExec(createdOnQ) as mysqlInsertResult).insertId;
				await mysqlExec('UPDATE _nodes SET _fieldsID=' + dateFieldId + ', reverse = 1 WHERE id=' + createdID);
			}

			if(data.addCreatedByFiled) {
				const createdByQ = `INSERT INTO _fields
				(\`node_fields_linker\`, \`status\`, \`show\`,                                 \`prior\`, \`fieldType\`,            \`fieldName\`,      \`selectFieldName\`, \`name\`,                                \`description\`, \`maxLength\`, \`requirement\`, \`unique\`, \`_usersID\`, \`forSearch\`, \`storeInDB\`, \`nodeRef\`) VALUES
				(${createdID},            1,          ${VIEW_MASK.LIST | VIEW_MASK.READONLY},   20,         ${FIELD_TYPE.LOOKUP},    '_organizationID',  '_organization',     '${L('FIELD_ORGANIZATION', userSession)}', '',              0,            0,               0,           0,           1,              1,             ${NODE_ID.ORGANIZATIONS});`;
				await mysqlExec(createdByQ);
			}

			if(data.addCreatorUserFld) {
				const createdByQ = `INSERT INTO _fields
				(\`node_fields_linker\`, \`status\`, \`show\`,                                 \`prior\`, \`fieldType\`,          \`fieldName\`,  \`selectFieldName\`,  \`name\`,                            \`description\`, \`maxLength\`, \`requirement\`, \`unique\`, \`_usersID\`, \`forSearch\`, \`storeInDB\`, \`nodeRef\`,          \`lookupIcon\`) VALUES
				(${createdID},           1,           ${VIEW_MASK.LIST | VIEW_MASK.READONLY},   30,        ${FIELD_TYPE.LOOKUP},   '_usersID',     '_users',             '${L('FIELD_OWNER', userSession)}',   '',               0,              0,              0,          0,            1,             1,             ${NODE_ID.USERS},    'avatar');`;
				await mysqlExec(createdByQ);
			}
		}

		let nodes = await getRecords(NODE_ID.NODES, VIEW_MASK.ALL, null, userSession, {_nodesID: data._nodesID});
		nodes.items.sort((a, b) => {
			return a.prior - b.prior;
		});
		let prior = 0;
		nodes.items.forEach(async (node) => {
			prior += 10;
			if(node.prior !== prior) {
				await submitRecord(NODE_ID.NODES, {prior}, node.id, userSession);
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