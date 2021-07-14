
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

Promise.all([
	import('./lib/jquery/dist/jquery.js'),
	/// #if DEBUG
	import('./lib/react/umd/react.development.js'),
	import('./lib/react-dom/umd/react-dom.development.js')
	/*
	/// #endif
	import('./lib/react/umd/react.production.min.js'),
	import('./lib/react-dom/umd/react-dom.production.min.js')
	//*/
]).then(() => {
	import('./entry.js');
});