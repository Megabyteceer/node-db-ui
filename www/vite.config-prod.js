import {defineConfig} from 'vite';

const ifDefPlugin = require('../vite-plugin-ifdef/index.js');

export default defineConfig({
	mode: "production",
	build: {
		minify: true,
		sourcemap: false,
		outDir: 'build-www-prod',
		write: true,
		watch: false,
	},
	plugins: [
		ifDefPlugin()
	]
})
