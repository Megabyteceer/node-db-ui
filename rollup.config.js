import typescript from '@rollup/plugin-typescript';
const ifDefPlugin = require('./vite-plugin-ifdef/index.js');

export default {
	input: "./core/index.ts",
	output: {
		dir: 'build-prod',
		format: 'cjs'
	},
	plugins: [ifDefPlugin(), typescript({
		tsconfig: './tsconfig-prod.json'
	})]
};
