import {defineConfig} from 'vite';

const ifDefPlugin = require('../vite-plugin-ifdef/index.js');

export default defineConfig({
	mode: "development",
	build: {
		minify: false,
		sourcemap: 'inline',
		outDir: 'dist',
		write: true,
		watch: true,
	},
	plugins: [
		ifDefPlugin()
	],
	server: {
		proxy: {
			'/core': 'http://127.0.0.1:1443'
		},
		hmr: false,
		fs: {
			strict: false
		}
	}
})
