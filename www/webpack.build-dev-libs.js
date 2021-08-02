const webpack = require('webpack');
const path = require('path');

webpack({
	entry: {
		libs: {
			import: path.join(__dirname, 'js/libs/src/libs.js')
		},
		"code-mirror": {
			import: path.join(__dirname, 'js/libs/src/code-mirror.js')
		},
		"react-cropper": {
			import: path.join(__dirname, 'js/libs/src/react-cropper.js'),
			dependOn: 'libs'
		},
		"react-datetime": {
			import: path.join(__dirname, 'js/libs/src/react-datetime.js'),
			dependOn: 'libs'
		}
	},
	mode: 'development',
	output: {
		filename: '[name].js',
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
