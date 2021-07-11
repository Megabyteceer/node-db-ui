import MainFrame from "./main-frame.js";
import "./fields/field-default.js";

window.ENABLE_MULTILANG = false;
window.HOME_NODE = 5;
window.ALLOWED_UPLOADS = '';
window.MAX_FILESIZE_TO_UPLOAD = 10;
window.document.title =
window.appTitle = '';
window.DEBUG = true;

//TODO: fill vars on server getMe

/// #if DEBUG
window.DEPLOY_TO = '';


if (!window.DEBUG) { throw "DEBUG directives nadnt cutted of in PRODUCTION mode"};


/*
/// #endif
window.onerror = function(msg, url, line, col, error) {
		var stack;
		try {
			stack = error.stack;
		} catch(e){};
		submitErrorReport(msg, stack);
	};
//*/
setTimeout(() => { //TODO: get to ReactDOM sync
	for(let factoryType of ['div', 'span', 'p', 'img', 'button', 'input', 'label', 'b', 'a', 'br', 'hr', 'svg', 'td', 'tr', 'tbody', 'thead', 'table', 'polyline', 'textarea', 'iframe']) {
		ReactDOM[factoryType] = (...theArgs) => {
			return React.createElement.call(this, factoryType, ...theArgs);
		};
	}

	ReactDOM.render(
		React.createElement(MainFrame),
		document.getElementById('container')
	);
}, 100);
