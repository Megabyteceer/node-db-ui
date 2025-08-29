
import { readFile, unlink, writeFile } from "fs";
import { join } from "path";
import type { RecordData, RecordDataWrite, UserSession } from "../../www/client-core/src/bs-utils";
import type { NodeEventsHandlers } from "../describe-node";

const handlers: NodeEventsHandlers = {
	beforeCreate: async function(data: RecordDataWrite, userSession: UserSession) {
		saveDoc(data);
	},

	afterCreate: async function(data: RecordDataWrite, userSession: UserSession) {

	},

	beforeUpdate: async function(currentData: RecordData, newData: RecordDataWrite, userSession: UserSession) {
		currentData = Object.assign(currentData, newData);
		saveDoc(currentData);
	},

	beforeDelete: async function(data: RecordData, userSession: UserSession) {
		unlink(getDocFilename(data), emptyCallback);
	}
};
export default handlers;

const emptyCallback = () => { };

async function saveDoc(data): Promise<void> {
	return new Promise((resolve, rejects) => {
		readFile(join(__dirname, '../../www/custom/html/_template.htmp'), 'utf8', (err, txt) => {

			if(err) {
				rejects(err);
			} else {
				for(const name in data) {
					//@ts-ignore
					txt = txt.replaceAll('\\$\\{' + name + '\\}', data[name]);
				}
				//@ts-ignore
				txt = txt.replaceAll('\\$\\{name\\}', data.name);
				writeFile(getDocFilename(data), txt, (err) => {
					if(err) {
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
