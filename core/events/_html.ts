
import { unlink, readFile, writeFile } from "fs";
import { join } from "path";
import { NodeEventsHandlers } from "../describe-node";
import { RecordData, RecordDataWrite, UserSession } from "../../www/src/bs-utils";

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
				for(let name in data) {
					txt = txt.replaceAll('\\$\\{' + name + '\\}', data[name]);
				}

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
