// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
	mode: 'development',
	plugins: [
		'if-def-loader-snowpack'
	],
	buildOptions: {
		//	out: "dist-build",
		watch: false,
		sourcemap: false
	},
	devOptions: {
		hmr: false
	},
	exclude: [
		"**/build/**/**",
		"**/dist/**/**",
		"**/.vscode/**/**",
		"**/uploads/**/**",
		"**/images/**/**"
	]
};