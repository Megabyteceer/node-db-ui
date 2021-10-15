import {defineConfig} from 'vite';

export default defineConfig({
	mode: "development",
	build: {
		minify: false,
		sourcemap: 'inline',
		watch: true,
	},
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
