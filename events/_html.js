const fs = require("fs");
const path = require("path");

module.exports = {

	pre: async function (data, userSession) {
		saveDoc(data);
	},

	post: async function (data, userSession) {
		
	},

	update: async function (currentData, newData, userSession) {
		currentData = Object.assign(currentData, newData);
		saveDoc(currentData);
	},

	delete: async function(data, userSession) {
		fs.unlink(getDocFilename(data));
	}
}

async function saveDoc(data) {
	return new Promise((resolve, rejects) => {
		debugger;
		fs.readFile(path.join(__dirname,'/../custom/html/_template.htmp'), 'utf8', (err, txt) => {
			debugger;
			if(err) {
				rejects(err);
			} else {
				txt = txt.replace('xBODYx', data.body);
				fs.writeFile(getDocFilename(data), txt, (err) => {
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
	return path.join(__dirname, '../custom/html/', data.title, '.html');
}
