
function appendCSS(src) {
	let s = document.createElement('link');
	s.rel = 'stylesheet';
	s.href = src;
	document.head.appendChild(s);
}

appendCSS('js/lib/codemirror/lib/codemirror.css');
appendCSS('js/lib/codemirror/addon/search/matchesonscrollbar.css');
appendCSS('js/lib/codemirror/addon/scroll/simplescrollbars.css');
appendCSS('js/lib/codemirror/addon/hint/show-hint.css');

/// #if DEBUG
import './lib/react/umd/react.development.js';
import './lib/react-dom/umd/react-dom.development.js';
/*
/// #endif
import('./lib/react/umd/react.production.min.js');
import('./lib/react-dom/umd/react-dom.production.min.js');
//*/

import './lib/jquery/dist/jquery.js'
import Cropper from "./lib/cropperjs/dist/cropper.esm.js";

//TODO: add release imports
window.module = {};
window.exports = {};
window.require = function (name) {
	if(name === 'react') {
		return window.React;
	}
	if(name === 'react-dom') {
		return window.ReactDOM;
	}
	if(name === 'cropperjs') {
		return Cropper;
	}
	if(name === 'moment') {
		return window.moment;
	}
	debugger;
	throw new Error('unknown module required');
};


Promise.all([
	import('./lib/codemirror/lib/codemirror.js').then(() => {
		window.CodeMirror = window.module.exports;
	}),
	import("./lib/moment/dist/moment.js").then((m) => {
		window.moment = m.default;
	})
]).then(() => {
	Promise.all([
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

//TODO: add release imports