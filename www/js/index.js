
function appendCSS(src) {
	let s = document.createElement('link');
	s.rel = 'stylesheet';
	s.href = src;
	document.head.appendChild(s);
}

import('./lib/jquery/dist/jquery.js');
import('./utils.js');

/// #if DEBUG
import('./lib/react/umd/react.development.js');
import('./lib/react-dom/umd/react-dom.development.js');



appendCSS('js/lib/codemirror/lib/codemirror.css');
appendCSS('js/lib/codemirror/addon/search/matchesonscrollbar.css');
appendCSS('js/lib/codemirror/addon/scroll/simplescrollbars.css');
appendCSS('js/lib/codemirror/addon/hint/show-hint.css');

import('./entry.js');

