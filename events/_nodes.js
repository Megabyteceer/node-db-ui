
import {mysqlExec} from "../core/mysql-connection";
import {shouldBeAdmin} from "../core/admin/admin.js";
import {reloadMetadataSchedule} from "../core/desc-node.js";
import {throwError} from "../core/utils.js";
import {L} from "../core/locale.js";

export default {

	beforeCreate: async function(data, userSession) {
		shouldBeAdmin(userSession);
		// shift all nodes in the same parent node
		return mysqlExec("UPDATE _nodes SET prior=prior+10 WHERE (_nodesID =" + data._nodesID + ") AND (prior >=" + data.prior + ")");
	},

	afterCreate: async function(data, userSession) {

		shouldBeAdmin(userSession);

		const createdID = data.id;

		//inherit access previlegies from parent node
		const rpQ = "SELECT roleID, prevs FROM _roleprevs, _roles " +
			"WHERE (_roleprevs.roleID = _roles.ID)AND(_roleprevs.nodeID=" + data._nodesID + ")";

		const parentPrevs = await mysqlExec(rpQ);

		if(parentPrevs.length) {
			await mysqlExec(parentPrevs.map((prev) => {
				return 'INSERT INTO _roleprevs SET nodeID=' + createdID + ', roleID=' + prev.roleID + ', prevs=' + prev.prevs + ';';
			}).join(''));
		}



		if(data.isDoc && !data.staticLink) {

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

			const insertedId = (await mysqlExec("INSERT INTO \`" + data.tableName + "\` SET status=0, _usersID=0")).insertId;
			await mysqlExec("UPDATE \`" + data.tableName + "\` SET ID=0 WHERE ID=" + insertedId);

			//create default fields
			const mainFieldQ = `INSERT INTO _fields
				(node_fields_linker, status, \`show\`, prior, fieldType, fieldName, selectFieldName, name,           fdescription, maxLen, requirement, uniqu, _usersID, forSearch, nostore) VALUES
				(${createdID},       1,       255,     1,     1,         'name',    '',              '${L('Name')}', '',           64,     1,           0,     0,        1,         0);`; //TODO add all languages
			await mysqlExec(mainFieldQ);

			if(data.createdon_field) {
				const createdOnQ = `INSERT INTO _fields 
				(node_fields_linker, status, \`show\`, prior, fieldType, fieldName,   selectFieldName, name,                 fdescription, maxLen, requirement, uniqu, _usersID, forSearch, nostore) VALUES
				(${createdID},       1,        62,     2,     4,         'createdOn', '',              '${L('Created on')}', '',           0,      0,           0,     0,        1,         0);`;  //TODO add all languages
				const dateFieldId = (await mysqlExec(createdOnQ)).insertId;
				await mysqlExec('UPDATE _nodes SET _fieldsID=' + dateFieldId + ', reverse = 1 WHERE id=' + createdID);
			}

			if(data.createdby_field) {
				const createdByQ = `INSERT INTO _fields
				(node_fields_linker, status, \`show\`, prior, fieldType, fieldName,  selectFieldName, name,                   fdescription, maxLen, requirement, uniqu, _usersID, forSearch, nostore, nodeRef) VALUES
				(${createdID},       1,        6,      2,     7,         '_organID', '_organ',        '${L('Organization')}', '',           0,      0,           0,     0,        1,         0,       7);`; //TODO add all languages
				await mysqlExec(createdByQ);
			}

			if(data.createUserFld) {
				const createdByQ = `INSERT INTO _fields
				(node_fields_linker, status, \`show\`, prior, fieldType, fieldName,  selectFieldName,  name,           fdescription, maxLen, requirement, uniqu, _usersID, forSearch, nostore, nodeRef, icon) VALUES
				(${createdID},       1,        6,      3,     7,         '_usersID', '_users',        '${L('Owner')}', '',           0,      0,           0,     0,        1,         0,       5,       'avatar');`; //TODO add all languages
				await mysqlExec(createdByQ);
			}
		}
		reloadMetadataSchedule();
	},

	beforeDelete: async function(data, userSession) {
		throwError('_nodes beforeCreate deletion event is not implemented');
	},

	beforeUpdate: (currentData, newData, userSession) => {
		shouldBeAdmin(userSession);
		reloadMetadataSchedule();
	}
}