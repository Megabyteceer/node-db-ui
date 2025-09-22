import {resolve} from "path";
import {defineConfig} from 'vite';

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
		hmr: false,
		fs: {
			strict: false
		}
	},
	resolve: {
		alias: {
			"types": resolve(__dirname, '../types/')
		}
	},
	esbuild: {
		keepNames: true
	}
})
