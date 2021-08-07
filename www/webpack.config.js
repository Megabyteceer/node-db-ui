const path = require('path');

module.exports = {
	mode: 'development',

	entry: './js/index.js',

	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js',
	},

	target: ['web', 'es5'],

	devtool: 'source-map',

	watch: true,

	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?/,
				use: 'ts-loader',
				exclude: /node_modules/,
			}
		]
	}
};