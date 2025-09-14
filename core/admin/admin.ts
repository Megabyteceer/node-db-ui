import { ADMIN_USER_SESSION, getFieldDesc, getNodeDesc, reloadMetadataSchedule } from '../describe-node';

import * as fs from 'fs';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { FIELD_ID, NODE_ID } from '../../types/generated';
import { throwError } from '../../www/client-core/src/assert';
import { USER_ID, type PRIVILEGES_MASK, type RecId } from '../../www/client-core/src/bs-utils';
import { isAdmin, type UserSession } from '../auth.js';
import { D, mysqlExec, NUM_1 } from '../mysql-connection';

const { exec } = require('child_process'); // eslint-disable-line @typescript-eslint/no-require-imports

export interface NodePrivileges {
	id: RecId;
	name: string;
	privileges: PRIVILEGES_MASK;
}

export interface NodePrivilegesRequest {
	nodeId: NODE_ID;
	toChild?: boolean;
	privileges: NodePrivileges[];
}

export interface NodePrivilegesRes {
	privileges: NodePrivileges[];
}

async function nodePrivileges(reqData: NodePrivilegesRequest, userSession: UserSession) {
	shouldBeAdmin(userSession);
	const nodeId = reqData.nodeId;
	if (reqData.privileges) {
		// set node privileges
		const privileges = reqData.privileges;
		await setRolePrivilegesForNode(
			nodeId,
			privileges,
			reqData.toChild,
			userSession
		);
		reloadMetadataSchedule();
		return 1;
	} else {
		// get node privileges
		const privileges = await mysqlExec(
			'SELECT id, name, (SELECT privileges FROM "_rolePrivileges" WHERE ("nodeId"='
			+ D(nodeId)
			+ ') AND (_roles.id="roleId") LIMIT ' + NUM_1 + ') AS privileges FROM _roles WHERE id != '
			+ D(USER_ID.SUPER_ADMIN)
			+ ' AND id != '
			+ D(USER_ID.VIEW_ALL)
			+ ' AND status = ' + NUM_1
		) as NodePrivileges[];
		return { privileges, nodeType: getNodeDesc(nodeId).nodeType } as NodePrivilegesRes;
	}
}

const NEW_FUNCTION_MARKER = '//_insertNewHandlersHere_';

const shouldBeAdmin = (userSession = ADMIN_USER_SESSION) => {
	if (!isAdmin(userSession)) {
		throwError('Access denied');
	}
};

async function setRolePrivilegesForNode(
	nodeId: RecId,
	rolePrivileges: NodePrivileges[],
	toChild?: boolean,
	userSession?: UserSession
) {
	shouldBeAdmin(userSession);
	await mysqlExec(
		'DELETE FROM "rolePrivileges" WHERE "nodeId"=' + D(nodeId) + ';'
	);

	for (const p of rolePrivileges) {
		if (p.privileges) {
			await mysqlExec(
				'INSERT INTO rolePrivileges SET nodeId='
				+ D(nodeId)
				+ ', roleId='
				+ D(p.id)
				+ ', privileges='
				+ D(p.privileges)
				+ ';'
			);
		}
	}
	if (toChild) {
		// apply to sub sections
		const pgs = await mysqlExec(
			'SELECT id FROM _nodes WHERE _nodesId =' + nodeId
		);

		for (const pg of pgs) {
			await setRolePrivilegesForNode(
				pg.id,
				rolePrivileges,
				toChild,
				userSession
			);
		}
	}
}

function editFunction(fileName: string, functionName: string, args = '') {
	fileName = join(__dirname, fileName);

	let text = readFileSync(fileName, 'utf8').replace(/\r\n/g, '\n');

	const functionSearchPattern = new RegExp(
		'\\s+' + functionName + '\\(',
		'gi'
	);
	const c1 = (text.match(functionSearchPattern) || []).length;

	if (c1 > 1) {
		throwError(
			'function ('
			+ functionName
			+ ') present more that once in file: '
			+ fileName
		);
	} else if (!c1) {
		// TODO: add function and got to source
		const i = text.indexOf(NEW_FUNCTION_MARKER);
		if (i < 0) {
			throwError(
				'marker ('
				+ NEW_FUNCTION_MARKER
				+ ') is not detected in file: '
				+ fileName
			);
		}
		text
			= text.substr(0, i) + functionName + '(' + args + `) {
		
	}

	`
				+ text.substr(i);
		writeFileSync(fileName, text);
	}

	const a = text.split('\n');
	let line = a.findIndex(s => s.match(functionSearchPattern));
	line += 2;
	try {
		const arg = fileName + ':' + line + ':2';
		exec('code -r -g "' + arg + '"');
	} catch (_err) {
		return 'Can not open file to edit: ' + fileName;
	}
	return 1;
}

async function getClientEventHandler(
	request: { handler: string; nodeId: NODE_ID; fieldId: FIELD_ID; args: string },	userSession: UserSession
) {
	shouldBeAdmin(userSession);

	const node = getNodeDesc(request.nodeId);
	if (request.fieldId) {
		const field = getFieldDesc(request.fieldId);
		const customPath = '../../../www/src/events/fields_events_custom.ts';
		return editFunction(
			fs.existsSync(join(__dirname, customPath))
				? customPath
				: '../../../www/client-core/src/events/fields_events.ts',
			node.tableName + '_' + field.fieldName + '_' + request.handler,
			request.args
		);
	} else {
		const customPath = '../../../www/src/events/forms_events_custom.ts';
		return editFunction(
			fs.existsSync(join(__dirname, customPath))
				? customPath
				: '../../../www/client-core/src/events/forms_events.ts',
			node.tableName + '_' + request.handler,
			request.args
		);
	}
}

export { getClientEventHandler, nodePrivileges, shouldBeAdmin };
