/// #if DEBUG
import './node_modules/react/umd/react.development.js';
import './node_modules/react-dom/umd/react-dom.development.js';
import './node_modules/promise-polyfill/dist/polyfill.js';

//TODO:  remove
window.constants = {};

/*
/// #endif
import('./node_modules/react/umd/react.production.min.js');
import('./node_modules/react-dom/umd/react-dom.production.min.js');
//*/

import './node_modules/jquery/dist/jquery.js'
import Cropper from "./node_modules/cropperjs/dist/cropper.esm.js";

window.Component = React.Component;

window.module = {};
window.exports = {};
window.require = function (name) {
	if(name === 'react') {
		return window.React;
	}
	if(name === 'react-dom') {
		return window.R;
	}
	if(name === 'cropperjs') {
		return Cropper;
	}
	if(name === 'moment') {
		return window.moment;
	}
	if(name === 'jquery') {
		return $;
	}
	if(name === '../../lib/codemirror') {
		return window.CodeMirror;
	}
	debugger;
	throw new Error('unknown module required');
};

Promise.all([
	import("./node_modules/react-highlight-words/dist/main.umd.js").then((m) => {
		window.Highlighter = window.module.exports;
	})
]).then(() => {
	Promise.all([
		import('./node_modules/codemirror/lib/codemirror.js').then(() => {
			window.CodeMirror = window.module.exports;
		}),
		import("./node_modules/moment/dist/moment.js").then((m) => {
			window.moment = m.default;
		})
	]).then(() => {
		Promise.all([
			import('./node_modules/codemirror/addon/hint/javascript-hint.js'),
			import('./node_modules/codemirror/addon/hint/show-hint.js'),
			import('./node_modules/codemirror/mode/javascript/javascript.js'),
			import("./node_modules/react-datetime/dist/react-datetime.cjs.js").then(() => {
				window.Datetime = window.module.exports.default;
			}),
			import("./node_modules/react-cropper/dist/react-cropper.umd.js").then(() => {
				window.ReactCropper = window.exports.default;
			})
		]).then(() => {
			import('./entry.js');
		});
	});
});
//TODO: add release imports