
import { readFile, unlink, writeFile } from 'fs';
import { join } from 'path';
import type { IHtmlRecord, IHtmlRecordWrite } from '../../types/generated';
import type { UserSession } from '../../www/client-core/src/bs-utils';
import type { NodeEventsHandlers } from '../describe-node';


const handlers: NodeEventsHandlers = {
	beforeCreate: async function(data: IHtmlRecordWrite, _userSession: UserSession) {
		saveDoc(data);
	},

	afterCreate: async function(_data: IHtmlRecordWrite, _userSession: UserSession) {

	},

	beforeUpdate: async function(currentData: IHtmlRecord, newData: IHtmlRecordWrite, _userSession: UserSession) {
		currentData = Object.assign(currentData, newData);
		saveDoc(currentData);
	},

	beforeDelete: async function(data: IHtmlRecord, _userSession: UserSession) {
		unlink(getDocFilename(data), emptyCallback);
	}
};
export default handlers;

const emptyCallback = () => { };

async function saveDoc(data: IHtmlRecordWrite): Promise<void> {
	return new Promise((resolve, rejects) => {
		readFile(join(__dirname, '../../www/custom/html/_template.htmp'), 'utf8', (err, txt) => {

			if (err) {
				rejects(err);
			} else {
				for (const name in data) {
					//@ts-ignore
					txt = txt.replaceAll('\\$\\{' + name + '\\}', data[name]);
				}
				//@ts-ignore
				txt = txt.replaceAll('\\$\\{name\\}', data.name);
				writeFile(getDocFilename(data), txt, (err) => {
					if (err) {
						rejects(err);
					} else {
						resolve();
					}
				});
			}
		});
	});
}

function getDocFilename(data) {
	return join(__dirname, '../../www/custom/html/', data.title + '.html');
}
