import typescript from '@rollup/plugin-typescript';
const ifDefPlugin = require('./vite-plugin-ifdef/index.js');

const path = require("path");
const fs = require('fs');


let srcImports = ['// autogenerated file CRUD-JS engine.'];

let srcExports = ['export default {'];

for(let fileName of fs.readdirSync(path.join(__dirname, './core/events'))) {
	if(!fileName.startsWith('___')) {
		const nodeName = fileName.replace(/\.ts$/gm, '');
		srcImports.push('import ' + nodeName + ' from "./' + nodeName + '";');
		srcExports.push('\t' + nodeName + ',');
	}
}
srcExports.push("};");
let src = srcImports.concat(srcExports);

fs.writeFileSync(path.join(__dirname, './core/events/___index.ts'), src.join('\n'));

export default {
	input: "./core/index.ts",
	output: {
		dir: 'build-prod',
		format: 'cjs'
	},
	plugins: [ifDefPlugin(), typescript({
		tsconfig: './tsconfig-prod.json'
	})]
};
