import MainFrame from "./main-frame.js";
import "./fields/field-1-text-default.js";
import "./fields/field-2-numeric.js";

import "./fields/field-4-datetime.js";
import "./fields/field-5-bool.js";
import "./fields/field-6-enum.js";
import "./fields/field-7-nto1.js";
import "./fields/field-8-static-text.js";
import "./fields/field-10-password.js";
import "./fields/field-11-date.js";
import "./fields/field-12-picture.js";
import "./fields/field-14-n2m.js";
import "./fields/field-15-12n.js";
import "./fields/field-16-rating.js";
import "./fields/field-17-compact-area.js";
import "./fields/field-18-button.js";
import "./fields/field-19-rich-ditor.js";
import "./fields/field-20-color.js";
import "./fields/field-21-file.js";

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


if(!window.DEBUG) {throw "DEBUG directives nadnt cutted of in PRODUCTION mode"};


/*
/// #endif
window.onerror = (msg, url, line, col, error) => {
		var stack;
		try {
			stack = error.stack;
		} catch(e){};
		submitErrorReport(msg, stack);
	};
//*/
setTimeout(() => { //TODO: get to ReactDOM sync
	for(let factoryType of ['div', 'form', 'span', 'p', 'img', 'button', 'input', 'label', 'b', 'a', 'br', 'hr', 'svg', 'td', 'tr', 'tbody', 'thead', 'table', 'polyline', 'textarea', 'iframe', 'h4', 'h5']) {
		ReactDOM[factoryType] = (...theArgs) => {
			return React.createElement.call(this, factoryType, ...theArgs);
		};
	}

	ReactDOM.render(
		React.createElement(MainFrame),
		document.getElementById('container')
	);
}, 100);
