const webpack = require('webpack');
const path = require('path');
const {readdirSync} = require("fs");

for(let src of readdirSync(path.join(__dirname, 'js/libs/src'))) {


	webpack({
		entry: {
			bundle: path.join(__dirname, 'js/libs/src', src),
		},
		mode: 'development',
		output: {
			filename: src,
			path: path.join(__dirname, 'js/libs'),
			libraryTarget: 'module',
		},
		experiments: {
			outputModule: true
		}
	}, (err, stats) => {
		const isErrors = err || stats.hasErrors();
		if(isErrors) {
			console.error(`\n[1m[31mBUILD FAILED![0m\n\n${err ? err.message : stats.toString({warnings: false, assets: false, modules: false, colors: true})}`);
		}
		if(stats) {
			console.log(isErrors ? '[1m[31mBUILD FAILED![0m\n' : '[1m[32mBUILD SUCCESS![0m\n');
			console.log(stats.toString({assets: false, modules: false, colors: true}));
		}
	});
}