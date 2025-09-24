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
		allowedHosts: true,
		host: true,
		hmr: false,
		fs: {
			strict: false
		}
	},
	esbuild: {
		keepNames: true
	}
})
