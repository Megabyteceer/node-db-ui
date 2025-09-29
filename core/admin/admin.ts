/// #if DEBUG
/*
/// #endif
throw new Error('admin file imported to prod build');
// */
import { SERVER_ENV } from '../ENV';

import { getFieldDesc, getNodeDesc, reloadMetadataSchedule } from '../describe-node';

import { execSync } from 'child_process';
import * as fs from 'fs';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { throwError } from '../../www/client-core/src/assert';
import { USER_ID, type PRIVILEGES_MASK, type RecId } from '../../www/client-core/src/bs-utils';
import { CLIENT_SIDE_FORM_EVENTS, SERVER_SIDE_FORM_EVENTS } from '../../www/client-core/src/events-handle';
import type { FIELD_ID, NODE_ID } from '../../www/client-core/src/types/generated';
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

const shouldBeAdmin = (userSession?: UserSession) => {
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

const handlersArgs = {
	[SERVER_SIDE_FORM_EVENTS.beforeCreate]: 'data, userSession',
	[SERVER_SIDE_FORM_EVENTS.afterCreate]: 'data, userSession',
	[SERVER_SIDE_FORM_EVENTS.beforeUpdate]: 'currentData, newData, userSession',
	[SERVER_SIDE_FORM_EVENTS.afterUpdate]: 'data, userSession',
	[SERVER_SIDE_FORM_EVENTS.beforeDelete]: 'data, userSession',
	[SERVER_SIDE_FORM_EVENTS.afterDelete]: 'data, userSession',
	[SERVER_SIDE_FORM_EVENTS.onSubmit]: 'data, userSession',
	[CLIENT_SIDE_FORM_EVENTS.onLoad]: 'form',
	[CLIENT_SIDE_FORM_EVENTS.onSave]: 'form',
	[CLIENT_SIDE_FORM_EVENTS.afterSave]: 'form, submitResult',
	[CLIENT_SIDE_FORM_EVENTS.onChange]: 'form, value, isUserAction, prevValue',
	[CLIENT_SIDE_FORM_EVENTS.onClick]: 'form'
};

function escapeRegex(string: string) {
	return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function editFunction(fileName: string, eventName: string, nodeId: NODE_ID, fieldId: FIELD_ID, isServer?: boolean) {

	const side = isServer ? 'server' : 'client';
	let functionName = (IS_PROJECT_MODE ? (side + '.' + side + 'On(') : (side + 'On(')) + (IS_PROJECT_MODE ? (side + '.') : '') + 'E.' + getNodeDesc(nodeId).tableName;

	if (fieldId) {
		functionName += '.' + getFieldDesc(fieldId).fieldName;
	}
	functionName += '.' + eventName + ',';

	let text = readFileSync(fileName, 'utf8').replace(/\r\n/g, '\n');

	const functionSearchPattern = new RegExp(
		escapeRegex(functionName),
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
		text += '\n\n' + functionName + ' async (' + (handlersArgs as any)[eventName] + ') => {\n\n});';
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

export interface EditSourceRequest {
	eventName: string;
	nodeId: NODE_ID;
	fieldId: FIELD_ID;
	fileName: string;
}

export const IS_PROJECT_MODE = fs.existsSync('./node_modules/crud-js');

async function editEventHandler(
	request: EditSourceRequest,	userSession: UserSession
) {
	shouldBeAdmin(userSession);

	let fileName!: string;

	let isServerFileName = (SERVER_SIDE_FORM_EVENTS as any)[request.eventName];
	const nodeName = getNodeDesc(request.nodeId).tableName!;
	if (isServerFileName) {
		fileName = nodeName.startsWith('_') ? ('core/events/' + nodeName + '.ts') : ((IS_PROJECT_MODE ? 'server/' : '') + ('events/' + nodeName + '.ts'));
	} else {
		fileName = nodeName.startsWith('_') ? ('www/client-core/src/events/' + nodeName + '.ts') : ('www/src/events/' + nodeName + '.ts');
	}

	const dirName = path.dirname(fileName);

	const importPath = dirName.split('/').map(_p => '..').join('/');

	if (!fs.existsSync(fileName)) {
		debugger;
		fs.writeFileSync(fileName,
			IS_PROJECT_MODE ? (isServerFileName ? `import { serverOn } from 'crud-js/core';
import { E } from 'crud-js/www/client-core/src/types/generated';` : `import { clientOn } from 'crud-js/www/client-core/src';
import { E } from 'crud-js/www/client-core/src/types/generated';
`) :
				`import { E } from '${importPath}/types/generated';
import { clientOn } from '${importPath}/www/client-core/src/events-handle';`
		);

		const files = fs.readdirSync(dirName);
		writeFileSync(path.join(dirName, 'index.ts'),
			files.filter(f => f !== 'index.ts' && f.endsWith('.ts')).map((f) => {
				return 'import \'./' + (f.replace(/\.ts$/, '')) + '\';';
			}).join('\n'));

	}

	return editFunction(fileName, request.eventName, request.nodeId, request.fieldId, isServerFileName);

}

export const dumpDB = async (userSession: UserSession) => {
	shouldBeAdmin(userSession);

	const dataDir = path.join(process.cwd(), 'data');
	const files = fs.readdirSync(dataDir);
	let next = 1;
	for (const f of files) {
		const v = parseInt(f);
		if (v >= next) {
			next = v + 1;
		}
	}
	try {
		execSync('pg_dump ' + SERVER_ENV.DB_NAME + ' > "' + path.join(dataDir, next + '.sql') + '"');
	} catch (er: any) {
		return { error: er.message };
	}

	const readFile = (num: number) => {
		return readFileSync(path.join(dataDir, num + '.sql'), 'utf8').replace(/\\restrict.+/gm, '').replace(/\\unrestrict.+/gm, '');
	};

	if ((next > 1) && (readFile(next) === readFile(next - 1))) {
		fs.unlinkSync(path.join(dataDir, next + '.sql'));
		return false;
	}
	return true;

};

export const recoveryDB = async (userSession?: UserSession) => {
	shouldBeAdmin(userSession);

	for (const dir of ['data', 'node_modules/crud-js/data']) {
		const dataDir = path.join(process.cwd(), dir);
		console.log('Recovery file search in: ' + dataDir);
		if (fs.existsSync(dataDir)) {
			const files = fs.readdirSync(dataDir);
			let last = 0;
			for (const f of files) {
				const v = parseInt(f);
				if (v >= last) {
					last = v;
				}
			}

			if (last > 0) {
				await mysqlExec(
					`DROP SCHEMA IF EXISTS public CASCADE;
				CREATE SCHEMA public;`);
				try {
					const file = path.join(dataDir, last + '.sql');
					console.log('Database recovery attempt with file: ' + file);
					execSync('psql --dbname=' + SERVER_ENV.DB_NAME + ' < ' + file);
					console.log('Database successfully recovered');
					reloadMetadataSchedule();
					return true;
				} catch (er: any) {
					return { error: er.message };
				}
			}
		}
	}
	console.error('no .sql file found to recovery database.');
};

export { editEventHandler, nodePrivileges, shouldBeAdmin };
