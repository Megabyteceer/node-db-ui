
import { mysqlExec, mysqlInsertResult, mysqlRowsResult } from "../core/mysql-connection";
import { shouldBeAdmin } from "../core/admin/admin";
import { NodeEventsHandlers, reloadMetadataSchedule } from "../core/desc-node";
import { FIELD_1_TEXT, FIELD_4_DATE_TIME, FIELD_7_Nto1, NODE_ID_ORGS, NODE_ID_USERS, RecordData, RecordDataWrite, throwError, UserSession, VIEW_MASK_ALL, VIEW_MASK_LIST, VIEW_MASK_READONLY } from "../www/js/bs-utils";
import { L } from "../core/locale";

const handlers: NodeEventsHandlers = {

	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		shouldBeAdmin(userSession);
		// shift all nodes in the same parent node
		await mysqlExec("UPDATE _nodes SET prior=prior+10 WHERE (_nodesID =" + data._nodesID + ") AND (prior >=" + data.prior + ")");
	},

	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {

		shouldBeAdmin(userSession);

		const createdID = data.id;

		//inherit access previlegies from parent node
		const rpQ = "SELECT roleID, privileges FROM _roleprevs, _roles " +
			"WHERE (_roleprevs.roleID = _roles.ID)AND(_roleprevs.nodeID=" + data._nodesID + ")";

		const parentPrevs = await mysqlExec(rpQ) as mysqlRowsResult;

		if(parentPrevs.length) {
			await mysqlExec(parentPrevs.map((prev) => {
				return 'INSERT INTO _roleprevs SET nodeID=' + createdID + ', roleID=' + prev.roleID + ', privileges=' + prev.privileges + ';';
			}).join(''));
		}



		if(data.isDocument && !data.staticLink) {

			const tblCrtQ = `CREATE TABLE \`${data.tableName}\` (
			ID bigint(15) unsigned NOT NULL AUTO_INCREMENT,
			status int(1) unsigned NOT NULL DEFAULT '1',
			name VARCHAR(64) NOT NULL default '',
			_usersID bigint(15) unsigned NOT NULL,
			createdON timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
			_organID bigint(15) unsigned NOT NULL DEFAULT '0',
			PRIMARY KEY (ID),
			KEY creator_id (_usersID),
			KEY createdON (createdON),
			KEY _organID (_organID),
			CONSTRAINT creator_id_${data.tableName} FOREIGN KEY (_usersID) REFERENCES _users (ID) ON DELETE RESTRICT ON UPDATE RESTRICT,
			CONSTRAINT _organID_${data.tableName} FOREIGN KEY (_organID) REFERENCES _organ (ID) ON DELETE RESTRICT ON UPDATE RESTRICT
			) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;`;

			await mysqlExec(tblCrtQ);

			const insertedId = (await mysqlExec("INSERT INTO \`" + data.tableName + "\` SET status=0, _usersID=0") as mysqlInsertResult).insertId;
			await mysqlExec("UPDATE \`" + data.tableName + "\` SET ID=0 WHERE ID=" + insertedId);

			//create default fields
			const mainFieldQ = `INSERT INTO _fields
				(node_fields_linker, status, \`show\`,          prior, fieldType,       fieldName, selectFieldName, name,           description, maxLength, requirement, unique, _usersID, forSearch, noStore) VALUES
				(${createdID},       1,       ${VIEW_MASK_ALL}, 1,     ${FIELD_1_TEXT}, 'name',    '',              '${L('Name')}', '',          64,        1,           0,     0,         1,         0);`;
			await mysqlExec(mainFieldQ);

			if(data.createdon_field) {
				const createdOnQ = `INSERT INTO _fields 
				(node_fields_linker, status, \`show\`,                                 prior, fieldType,            fieldName,   selectFieldName, name,                 description, maxLength, requirement, unique, _usersID, forSearch, noStore) VALUES
				(${createdID},       1,        ${VIEW_MASK_LIST | VIEW_MASK_READONLY}, 2,     ${FIELD_4_DATE_TIME}, 'createdOn', '',              '${L('Created on')}', '',          0,         0,           0,      0,        1,         0);`;
				const dateFieldId = (await mysqlExec(createdOnQ) as mysqlInsertResult).insertId;
				await mysqlExec('UPDATE _nodes SET _fieldsID=' + dateFieldId + ', reverse = 1 WHERE id=' + createdID);
			}

			if(data.createdby_field) {
				const createdByQ = `INSERT INTO _fields
				(node_fields_linker, status, \`show\`,                                 prior, fieldType,       fieldName,  selectFieldName, name,                   description, maxLength, requirement, unique, _usersID, forSearch, noStore, nodeRef) VALUES
				(${createdID},       1,        ${VIEW_MASK_LIST | VIEW_MASK_READONLY}, 3,     ${FIELD_7_Nto1}, '_organID', '_organ',        '${L('Organization')}', '',          0,         0,           0,      0,        1,         0,       ${NODE_ID_ORGS});`;
				await mysqlExec(createdByQ);
			}

			if(data.createUserFld) {
				const createdByQ = `INSERT INTO _fields
				(node_fields_linker, status, \`show\`,                                 prior, fieldType,       fieldName,  selectFieldName,  name,           description, maxLength, requirement, unique, _usersID, forSearch, noStore, nodeRef,          icon) VALUES
				(${createdID},       1,        ${VIEW_MASK_LIST | VIEW_MASK_READONLY}, 4,     ${FIELD_7_Nto1}, '_usersID', '_users',        '${L('Owner')}', '',           0,        0,           0,      0,        1,         0,       ${NODE_ID_USERS}, 'avatar');`;
				await mysqlExec(createdByQ);
			}
		}
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