/// #if DEBUG
import './lib/react/umd/react.development.js';
import './lib/react-dom/umd/react-dom.development.js';
import './lib/promise-polyfill/dist/polyfill.js';

//TODO:  remove
window.constants = {};

/*
/// #endif
import('./lib/react/umd/react.production.min.js');
import('./lib/react-dom/umd/react-dom.production.min.js');
//*/

import './lib/jquery/dist/jquery.js'
import Cropper from "./lib/cropperjs/dist/cropper.esm.js";

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
	import("./lib/react-highlight-words/dist/main.umd.js").then((m) => {
		window.Highlighter = window.module.exports;
	})
]).then(() => {
	Promise.all([
		import('./lib/codemirror/lib/codemirror.js').then(() => {
			window.CodeMirror = window.module.exports;
		}),
		import("./lib/moment/dist/moment.js").then((m) => {
			window.moment = m.default;
		})
	]).then(() => {
		Promise.all([
			import('./lib/codemirror/addon/hint/javascript-hint.js'),
			import('./lib/codemirror/addon/hint/show-hint.js'),
			import('./lib/codemirror/mode/javascript/javascript.js'),
			import("./lib/react-datetime/dist/react-datetime.cjs.js").then(() => {
				window.Datetime = window.module.exports.default;
			}),
			import("./lib/react-cropper/dist/react-cropper.umd.js").then(() => {
				window.ReactCropper = window.exports.default;
			})
		]).then(() => {
			import('./entry.js');
		});
	});
});
//TODO: add release imports