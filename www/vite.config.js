import {defineConfig} from 'vite';

debugger;

export default defineConfig({
	mode: "development",
	base: '/',
	root: './.',
	build: {
		minify: false,
		sourcemap: 'inline',
		watch: true
	},
	server: {
		allowedHosts: ['node-db-ui.com'],
		host: true,
		proxy: {
			'/core': 'http://127.0.0.1:1443'
		},
		hmr: false,
		fs: {
			strict: false
		}
	},
	esbuild: {
		keepNames: true
	}
})
