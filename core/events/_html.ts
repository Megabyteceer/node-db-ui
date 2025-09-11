import { readFile, unlink, writeFile } from 'fs';
import { join } from 'path';
import { E, type IHtmlRecordWrite } from '../../types/generated';
import { serverOn } from '../../www/client-core/src/events-handle';

serverOn(E._html.beforeCreate, async (data, _userSession) => {
	saveDoc(data);
});

serverOn(E._html.beforeUpdate, async (currentData, newData, _userSession) => {
	currentData = Object.assign(currentData, newData);
	saveDoc(currentData);
});

serverOn(E._html.beforeDelete, async (data, _userSession) => {
	unlink(getDocFilename(data), emptyCallback);
});

const emptyCallback = () => { };

async function saveDoc(data: IHtmlRecordWrite): Promise<void> {
	return new Promise((resolve, rejects) => {
		readFile(join(__dirname, '../../www/custom/html/_template.htmp'), 'utf8', (err, txt) => {

			if (err) {
				rejects(err);
			} else {
				for (const name in data) {
					txt = txt.replaceAll('\\$\\{' + name + '\\}', data[name]);
				}
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
