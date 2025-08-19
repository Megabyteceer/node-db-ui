import {defineConfig} from 'vite';

debugger;

export default defineConfig({
	mode: "development",
	build: {
		minify: false,
		sourcemap: 'inline',
		watch: true
	},
	server: {
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
