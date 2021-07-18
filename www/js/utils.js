

import constants from "./custom/consts.js";
import Notify from "./notify.js";
import {Stage} from "./stage.js";


window.__corePath = 'https://node-db-ui.com:1443/core/';

import "../both-side-utils.js";
import LoadingIndicator from "./loading-indicator.js";
import DebugPanel from "./debug-panel.js";
import {isPresentListRenderer} from "./forms/list.js";
import User from "./user.js";
import Modal from "./modal.js";

const headersJSON = new Headers();
headersJSON.append("Content-Type", "application/json");

function myAlert(txt, isSucess, autoHide, noDiscardByBackdrop) {
	if(!Modal.instance) {
		alert(txt);
	} else {
		var style;
		if(isSucess) {
			style = {display: 'inline-block', background: constants.SUCCESS_ALERT_BG, color: constants.EDIT_COLOR, border: '1px solid ' + constants.EDIT_COLOR, padding: '30px', borderRadius: 4};
		} else {
			style = {display: 'inline-block', background: constants.ERROR_ALERT_BG, color: '#a00', border: '1px solid #922', padding: '30px', borderRadius: 4};
		}

		var modalId = Modal.instance.show(ReactDOM.div({style: style}, txt), noDiscardByBackdrop);

		if(autoHide) {
			setTimeout(() => {
				Modal.instance.hide(modalId);
			}, 1100);
		}
	}

}

function myPromt(txt, onYes, yesLabel, onNo, noLabel, yesIcon, noIcon, discardByOutsideClick) {
	if(!yesLabel) {
		yesLabel = L('OK');
	}
	if(!yesIcon) {
		yesIcon = 'check';
	}

	var noButton;

	if(!noLabel) {
		noLabel = L('CANCEL');
	}

	if(!noIcon) {
		noIcon = 'times';
	}

	noButton = ReactDOM.button({
		style: {background: '#f84c4c', padding: '10px 45px 10px 40px'}, onClick: () => {
			Modal.instance.hide();
			if(onNo) {
				onNo();
			}
		}, className: 'clickable clickable-neg'
	}, renderIcon(noIcon), ' ', noLabel);

	var body = ReactDOM.span({style: {minWidth: '700px', display: 'inline-block', background: '#F7F7F7', color: '#000', border: '3px solid #F7F7F7', padding: '30px'}},
		txt,
		ReactDOM.div({style: {marginTop: '30px'}},
			noButton,
			ReactDOM.button({
				style: {background: '#A8A9AD', padding: '10px 55px 10px 40px'}, onClick: () => {
					Modal.instance.hide();
					onYes();
				}, className: 'clickable clickable-cancel'
			}, renderIcon(yesIcon), ' ', yesLabel)
		)
	);
	Modal.instance.show(body, !discardByOutsideClick);
}

function debugError(txt) {
	/// #if DEBUG
	debugger;
	DebugPanel.instance.addEntry('ERROR: ' + txt, true);
	/// #endif
	submitErrorReport(txt, 'at debugError');
	console.error(txt);
}

var triesGotoHome = 0;
var oneFormShowed;


function handleError(error, url, callStack) {

	error = error.error || error;

	if(!callStack) {
		callStack = '';
	}


	submitErrorReport(url + JSON.stringify(error), callStack);
	/// #if DEBUG
	if(error.debug) {
		error.debug.message = (error.message || error) + callStack;
		error.debug.request = url;
	};


	if(DebugPanel.instance) {
		DebugPanel.instance.addEntry((error.debug || error), true, url);
	} else {
		throw error;
	}
	return;
	/// #endif



	if(!oneFormShowed) {
		if(triesGotoHome < 5) {
			triesGotoHome++;
			goToHome();
		}
	} else {
		if(error.message) {
			myAlert(error.message);
		} else {
			myAlert(L("CONNECTION_ERR"), false, true);
		}
	}
	if(error.hasOwnProperty('debug')) {
		consoleLog(error.debug.stack.join('\n'));
	}
}

function consoleLog(txt) {
	/// #if DEBUG
	console.log(txt);
	/// #endif
}

function consoleDir(o) {
	/// #if DEBUG
	console.dir(o);
	/// #endif
}

function sp(event) {
	event.stopPropagation();
	if(event.cancelable) {
		event.preventDefault();
	}
}

function handleAdditionalData(data, url) {
	if(data.hasOwnProperty('debug')) {
		/// #if DEBUG
		data.debug.request = url;
		DebugPanel.instance.addEntry(data.debug);
		/// #endif
		delete data.debug;
	}
	if(data.hasOwnProperty('notifications')) {
		data.notifications.some((n) => {
			Notify.add(n);
		});
	}

}

function editRecord(nodeId, recId) {
	showForm(nodeId, recId, undefined, true);
}

function clearForm() {
	Stage.instance._setFormData();
}

var innerDatetimeFormat = 'YYYY-MM-DD HH:mm:ss';
var readableDateFormat = 'D MMMM YYYY';
var readableTimeFormat = 'H:mm';

function toReadableDate(d) {
	if(d) {
		d = d.format(readableDateFormat);
		if(d === 'Invalid date') return '';
		return d;
	}
	return '';
}

function toReadableDatetime(d) {
	if(d) {
		d = d.format(readableDateFormat + ' ' + readableTimeFormat);
		if(d === 'Invalid date') return '';
		return d;
	}
	return '';
}
function toReadableTime(d) {
	if(d) {
		d = d.format(readableTimeFormat);
		if(d === 'Invalid date') return '';
		return d;
	}
	return '';
}


function goToHome() {
	if(typeof (goToHome_custom) != 'undefined') {
		if(goToHome_custom()) {
			return;
		}
	}
	if(typeof (HOME_NODE) !== 'undefined') {
		showForm(HOME_NODE);
	} else {
		location.href = '/';
	}
}


function loactionToHash(nodeId, recId, filters, editable) {


	var newHash = [
		'n', encodeURIComponent(nodeId)];

	if(recId || recId === 0) {
		newHash.push('r');
		newHash.push(recId);
	}
	if(editable) {
		newHash.push('e');
	}

	if(filters && (Object.keys(filters).length > 0)) {
		var copmlicatedFilters = false;
		for(var k in filters) {
			var v = filters[k];
			if(typeof v === 'object') {
				copmlicatedFilters = true;
				break;
			}
		}

		if(copmlicatedFilters) {
			newHash.push('j');
			newHash.push(encodeURIComponent(JSON.stringify(filters)));

		} else {

			var filtersHash;

			filtersHash = [];
			for(var k in filters) {
				if(filters.hasOwnProperty(k) && (filters[k] || filters[k] === 0)) {
					if((k !== 'p') || (filters[k] !== 0)) {
						var v = filters[k];
						filtersHash.push(k);
						filtersHash.push(encodeURIComponent(filters[k]));
					}
				}
			}
			if(filtersHash && filtersHash.length) {
				newHash.push('f');
				newHash = newHash.concat(filtersHash);
			}
		}
	}

	newHash = newHash.join('/');

	if(newHash === 'n/' + HOME_NODE) {
		newHash = '';
	}
	newHash = '#' + newHash;

	return newHash;
}

window.currentFormParameters = {};

function isCurrentlyShowedLeftbarItem(item) {

	if(item.id === false) {
		if(!currentFormParameters.filters || (Object.keys(currentFormParameters.filters).length === 0)) {
			return item.isDefault;
		}
		return item.tab === currentFormParameters.filters.tab;
	}
	return currentFormParameters.nodeId === item.id &&
		currentFormParameters.recId === item.recId &&
		currentFormParameters.editable === item.editable;
};

function goToPageByHash() {
	var hash = window.location.hash.substr(1);

	if(hash) {

		var nodeId;
		var recId;
		var editable;
		var filters;

		hash = hash.split('/');
		var i;
		while(hash.length) {
			i = hash.shift();
			switch(i) {
				case 'n':
					nodeId = parseInt(hash.shift());
					break;
				case 'r':
					recId = hash.shift();
					break;
				case 'e':
					editable = true;
					break;
				case 'j':
					filters = JSON.parse(decodeURIComponent(hash.shift()));
					break;
				case 'f':
					filters = {};
					while(hash.length) {
						let key = hash.shift();
						let val = decodeURIComponent(hash.shift());
						let numVal = parseInt(val); // return numeric values to filter
						if(val == numVal) {
							val = numVal;
						}
						filters[key] = val;
					}
					break;
				default:
					debugError('Unknown hash entry: ' + i);
					break;
			}
		}

		if(recId !== 'new') {
			if(recId) {
				recId = parseInt(recId);
			}
		}
		showForm(nodeId, recId, filters, editable);

	} else {
		goToHome();
	}

};


function goBack(isAfterDelete) {
	if(isLitePage() && window.history.length < 2) {
		if(window.location.href.indexOf('#n/28/f/p/*/formTitle') > 0) {
			refreshForm();
		} else {
			window.close();
		}
	} else if(!isAfterDelete && window.history.length) {
		isHistoryChanging = true;
		if(window.history.length > 0) {
			window.history.back();
		} else {
			showForm(HOME_NODE);
		}

	} else if(currentFormParameters.recId) {
		showForm(currentFormParameters.nodeId, undefined, currentFormParameters.filters);
	} else if(isAfterDelete) {
		refreshForm();
	}
}

var hashUpdateTimeout;
let isHistoryChanging = false;

function updateHashLocation(filters) {

	if(hashUpdateTimeout) {
		consoleLog('Hash updated more that once');
		clearTimeout(hashUpdateTimeout);
		hashUpdateTimeout = false;
	}

	hashUpdateTimeout = setTimeout(() => {
		hashUpdateTimeout = false;

		if(!filters) {
			filters = currentFormParameters.filters;
		}

		var newHash = loactionToHash(currentFormParameters.nodeId, currentFormParameters.recId, filters, currentFormParameters.editable);

		if((location.hash != newHash) && !isHistoryChanging) {

			if((window.location.hash.split('/f/').shift() === (newHash.split('/f/').shift())) && history.replaceState) { //only filters is changed
				history.replaceState(null, null, newHash);
			} else if(history.pushState) {
				history.pushState(null, null, newHash);
			} else {
				location.hash = newHash.replace('#', '');
			}
		}
		isHistoryChanging = false;
	}, 1);

}


$(window).on('hashchange', () => {
	isHistoryChanging = true;
	goToPageByHash();
});

function refreshForm() {
	showForm(currentFormParameters.nodeId, currentFormParameters.recId, currentFormParameters.filters, currentFormParameters.editable);
}

function showForm(nodeId, recId, filters, editable) {

	if(typeof nodeId === 'undefined') {
		Stage.instance.setCustomClass(filters.c, filters);
		currentFormParameters.nodeId = nodeId;
		currentFormParameters.recId = recId;
		currentFormParameters.filters = filters;
		currentFormParameters.editable = editable;
	} else {
		if(!filters) filters = {};
		if(recId === 'new') {
			createRecord(nodeId, filters);
		} else {
			getNodeData(nodeId, recId, (data) => {
				setFormData(nodeId, data, recId, filters, editable);

			}, (!recId && recId !== 0) ? filters : undefined, editable, false, isPresentListRenderer(nodeId))
		}
	}
}

function setFormData(nodeId, data, recId, filters, editable) {

	if(!filters) {
		throw 'filters must be an object.';
	}

	if(currentFormParameters.nodeId && ((currentFormParameters.nodeId !== nodeId) || (currentFormParameters.recId !== recId))) {
		window.scrollTo(0, 0);
	}

	currentFormParameters.nodeId = nodeId;
	currentFormParameters.recId = recId;
	currentFormParameters.filters = filters;
	currentFormParameters.editable = editable;
	updateHashLocation();

	getNode(nodeId, (node) => {
		Stage.instance._setFormData(node, data, recId, filters, editable);
		oneFormShowed = true;
	});
}

function setFormFilter(name, val) {
	Stage.instance.setFormFilter(name, val);
	updateHashLocation();
	oneFormShowed = true;
}


var nodes = {};
var nodesRequested = {};

function waitForNode(nodeId, callback) {
	if(nodes.hasOwnProperty(nodeId)) {
		callback(nodes[nodeId]);
	} else {
		setTimeout(() => {
			waitForNode(nodeId, callback);
		}, 50);
	}
}

function getNode(nodeId, callback, forceRefresh, callStack) {

	if(!callStack) {
		callStack = new Error('getNode called from: ').stack;
	}

	if(forceRefresh) {
		delete (nodes[nodeId]);
		delete (nodesRequested[nodeId]);
	}

	if(nodes.hasOwnProperty(nodeId)) {
		callback(nodes[nodeId]);
	} else {
		if(nodesRequested.hasOwnProperty(nodeId)) {
			waitForNode(nodeId, callback);
		} else {
			nodesRequested[nodeId] = true;
			getData('api/descNode', {nodeId}, (data) => {

				normalizeNode(data);

				nodes[nodeId] = data;

				callback(data);
			}, (data, url, callStack) => {
				delete (nodesRequested[nodeId]);
				handleError(data, url, callStack);
			}, callStack);
		}
	}
}

function normalizeNode(node) {
	node.fieldsById = [];
	if(node.fields) {
		node.fields.forEach((f, i) => {
			f.index = i;
			f.node = node;
			node.fieldsById[f.id] = f;
		});
	}
}

function getNodeData(nodeId, recId, callback, filters, editable, isForRefList, isForCustomList, noLoadingIndicator, onError) {

	/// #if DEBUG
	if(typeof (recId) !== 'undefined' && typeof (filters) !== 'undefined') {
		throw 'Can\'t use recId and filters in one request';
	}
	/// #endif

	var callStack = new Error('getNodeData called from: ').stack;

	let params = {nodeId};

	if(typeof (recId) !== 'undefined') {
		params.recId = recId;
		if(editable) {
			params.viewFields = 1;
		} else {
			params.viewFields = 4
		}
	} else {
		if(editable) {
			params.viewFields = 1;
		} else {
			if(isForRefList) {
				params.viewFields = 8;
			} else if(isForCustomList) {
				params.viewFields = 16;
			} else {
				params.viewFields = 2;
			}
		}
	}

	if(!nodes.hasOwnProperty(nodeId) && !nodesRequested.hasOwnProperty(nodeId)) {
		params.descNode = true;
		nodesRequested[nodeId] = true;
	}

	if(filters) {
		Object.assign(params, filters);
	}

	return getData('api/', params, (data) => {

		if(data.hasOwnProperty('node')) {
			if(nodes[nodeId]) {
				debugError('Node description owerriding.');
			}
			normalizeNode(data.node);
			nodes[nodeId] = data.node;
			delete (data.node);
		}

		waitForNode(nodeId, (node) => {
			data = data.data;
			if(data) {
				if(data.hasOwnProperty('items')) {
					for(var k in data.items) {
						decodeData(data.items[k], node);
					}
				} else {
					decodeData(data, node);
				}
			}
			callback(data);
		});


	}, (data, url, callStack) => {
		if(onError) {
			onError();
		}
		delete (nodesRequested[nodeId]);
		handleError(data, url, callStack);
	}, callStack, noLoadingIndicator);
}

var _fieldClasses = {};
var fieldsEncoders = [];
var fieldsDecoders = [];

function getClassForField(type) {
	if(_fieldClasses.hasOwnProperty(type)) {
		return _fieldClasses[type];
	}
	return _fieldClasses[FIELD_1_TEXT];
}

function registerFieldClass(type, class_) {
	if(_fieldClasses.hasOwnProperty(type)) {
		throw new Error('Class for field type ' + type + ' is registered already');
	}

	if(class_.hasOwnProperty('decodeValue')) {
		fieldsDecoders[type] = class_.decodeValue;
		delete (class_.decodeValue);
	}
	if(class_.hasOwnProperty('encodeValue')) {
		fieldsEncoders[type] = class_.encodeValue;
		delete (class_.encodeValue);
	}

	_fieldClasses[type] = class_;
}

function decodeData(data, node) {
	for(var k in node.fields) {
		var f = node.fields[k];
		if(data.hasOwnProperty(f.fieldName)) {
			if(fieldsDecoders.hasOwnProperty(f.fieldType)) {
				data[f.fieldName] = fieldsDecoders[f.fieldType](data[f.fieldName]);
			}
		}
	}
}
function encodeData(data, node) {
	var ret = Object.assign({}, data);
	for(var k in node.fields) {
		var f = node.fields[k];
		if(ret.hasOwnProperty(f.fieldName)) {
			if(fieldsEncoders.hasOwnProperty(f.fieldType)) {
				ret[f.fieldName] = fieldsEncoders[f.fieldType](ret[f.fieldName]);
			}
		}
	}
	return ret;
}

function addMixins(Class, mixins) {
	debugger;
	Object.assign(Class.prototype, mixins);
}

function submitRecord(nodeId, data, recId, callback, onError) {
	if(Object.keys(data).length === 0) {
		throw 'Tried to submit emty object';
	}
	getNode(nodeId, (node) => {
		submitData('api/submit', {nodeId, recId, data: encodeData(data, node)}, callback, undefined, onError);
	});

}

var UID_counter = 0;
function UID(obj) {
	if(!obj.hasOwnProperty('__uid109Hd')) {
		obj.__uid109Hd = UID_counter++;
	}
	return obj.__uid109Hd;
}

function idToImgURL(imgId, holder) {
	if(imgId) {
		return 'images/uploads/' + imgId;
	}
	return 'images/placeholder_' + holder + '.png';
}

function idToFileUrl(fileId) {
	return 'uploads/file/' + fileId;
}

let __requestsOrder = [];

function getData(url, params, callback, onError, callStack, noLoadingIndicator) {

	assert(url.indexOf('?') < 0, 'More parameters to data');

	var requestRecord = {
		/// #if DEBUG
		url: url,
		/// #endif
		callback: callback,
	}

	if(!params) {
		params = {};
	}
	params.sessionToken = User.sessionToken;

	__requestsOrder.push(requestRecord);


	if(!callStack) {
		callStack = new Error('GetData called from: ').stack;
	}

	if(!noLoadingIndicator && LoadingIndicator.instance) {
		LoadingIndicator.instance.show();
	} else {
		noLoadingIndicator = true;
	}

	fetch(__corePath + url, {
		method: 'POST',
		headers: headersJSON,
		body: JSON.stringify(params)
	})
		.then((res) => {
			return res.json();
		}).then((data) => {
			handleAdditionalData(data, url);
			if(isAuthNeed(data)) {

				authHerePopup

			} else if(data.hasOwnProperty('result')) {
				requestRecord.result = data.result;
			} else {
				var roi = __requestsOrder.indexOf(requestRecord);
				/// #if DEBUG
				if(roi < 0) {
					throw new Error('requests order is corrupted');
				}
				/// #endif
				__requestsOrder.splice(roi, 1);

				if(onError) {
					onError(data, url, callStack);
				} else {
					handleError(data, url, callStack);
				}
			}
		})
		/// #if DEBUG
		/*
		/// #endif
		.catch((error) => {
			var roi = __requestsOrder.indexOf(requestRecord);
			/// #if DEBUG
				if(roi < 0) {
					throw new Error('requests order is corrupted');
				}
			/// #endif
			__requestsOrder.splice(roi, 1);
	
			if (onError) {
				onError(error, url, callStack);
			} else {
				handleError(error, url, callStack);
			}
			myAlert(L('CHECK_CONNECTION'), false, true);
		})
		//*/
		.finally(() => {
			while(__requestsOrder.length > 0 && __requestsOrder[0].hasOwnProperty('result')) {
				var rr = __requestsOrder.shift();
				rr.callback(rr.result);
			}
			if(!noLoadingIndicator) {
				LoadingIndicator.instance.hide();
			}
		})
}

function publishRecord(nodeId, recId, callback) {
	submitRecord(nodeId, {status: 1}, recId, callback);
}
function draftRecord(nodeId, recId, callback) {
	submitRecord(nodeId, {status: 2}, recId, callback);
}

function isAuthNeed(data) {
	return (data.isGuest && window.isUserHaveRole && isUserHaveRole(3)) || (data.error && (data.error.message === 'auth'));
}

function serializeForm(form) {
	var obj = $(form);
	/* ADD FILE TO PARAM AJAX */
	var formData = new FormData();
	$.each($(obj).find("input[type='file']"), (i, tag) => {
		$.each($(tag)[0].files, (i, file) => {
			formData.append(tag.name, file);
		});
	});
	formData.append('sessionToken', User.sessionToken);
	var params = $(obj).serializeArray();
	$.each(params, (i, val) => {
		formData.append(val.name, val.value);
	});
	return formData;
}

function submitData(url, dataToSend, callback, noProcessData, onError) {
	LoadingIndicator.instance.show();

	if(!noProcessData) {
		dataToSend.sessionToken = User.sessionToken;
		dataToSend = JSON.stringify(dataToSend);
	}

	var callStack = new Error('submitData called from: ').stack;
	let options = {
		method: 'POST',
		body: dataToSend
	}
	if(!noProcessData) {
		options.headers = headersJSON;
	}
	fetch(__corePath + url, options)
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			dataDidModifed();
			handleAdditionalData(data, url);
			if(isAuthNeed(data)) {
				authHerePopup
			} else if(data.hasOwnProperty('result')) {
				callback(data.result);
			} else {
				handleError(data, url, JSON.stringify(dataToSend) + ';\n' + callStack);
			}
		})
		/// #if DEBUG
		/*
		/// #endif
		.catch((r, error) => {
			if (onError) {
				onError(error);
			}
			debugError(JSON.stringify(error)+';\nDATA:'+JSON.stringify(dataToSend)+';\n'+url+';\n'+callStack+'\n'+r.responseText);
			myAlert(error);
			consoleDir(error);
		})
		//*/
		.finally(() => {
			LoadingIndicator.instance.hide();
		})
}


function deleteRecord(name, nodeId, recId, callback, noPromt, onYes) {
	if(noPromt) {
		if(onYes) {
			onYes();
		} else {
			submitData('api/delete', {nodeId, recId}, () => {
				dataDidModifed();
				callback();
			});
		}
	} else {

		getNode(nodeId, (node) => {

			myPromt(L('SURE_DELETE', (node.creationName || node.singleName)) + ' "' + name + '"?', () => { }, L('CANCEL'), () => {
				deleteRecord(null, nodeId, recId, callback, true, onYes);
			}, L('DELETE'), 'caret-left', 'times', true);
		});


	}
}

function createRecord(nodeId, parameters) {
	if(!parameters) {
		parameters = {};
	}
	getNode(nodeId, (node) => {
		var emptyData = {};
		if(node.draftable && (node.prevs & PREVS_PUBLISH)) { //access to publish records
			emptyData.isPub = 1;
		}

		setFormData(nodeId, emptyData, 'new', parameters, true);
	})
}

function redirect(href) {
	document.location.href = href;
}

function n2mValuesEqual(v1, v2) {

	if(!v1 && !v2) {
		return true;
	}

	if(Boolean(v1) !== Boolean(v2)) {
		return false;
	}

	if(v1.length != v2.length) {
		return false;
	} else {
		for(var i in v1) {
			var i1 = v1[i];
			var i2 = v2[i];

			if(Boolean(i1) !== Boolean(i2)) {
				return false;
			}

			if(i1) {
				if((i1.id !== i2.id) || (i1.name !== i2.name)) {
					return false;
				}
			}
		}
	}
	return true;

}

function renderIcon(name) {
	if(!name) {
		name = 'circle-o';
	}
	if(typeof (icon_custom) !== 'undefined') {
		var i;
		if(i = icon_custom(name)) {
			return i;
		}
	}
	return ReactDOM.p({className: 'fa fa-' + name});
}

function isLitePage() {
	return window.location.href.indexOf('?liteUI') >= 0;
}

function scrollToVisible(elem) {
	if(elem) {
		var $elem = $(ReactDOM.findDOMNode(elem));
		if(!$elem.is(":visible")) {
			return;
		}
		var $window = $(window);

		var docViewTop = $window.scrollTop();
		var docViewBottom = docViewTop + $window.height();

		var elemTop = $elem.offset().top - 40;
		var elemBottom = elemTop + $elem.height() + 40;

		if(elemTop < docViewTop) {

			$('html,body').animate({scrollTop: elemTop}, 300);

		} else if(elemBottom > docViewBottom) {

			$('html,body').animate({scrollTop: Math.min(elemBottom - $window.height(), elemTop)}, 300);
		}
		//TODO:  shake after scroll.
	}
}

function getItem(name, def) {
	if(typeof (Storage) !== "undefined") {
		if(localStorage.hasOwnProperty(name)) {
			return JSON.parse(localStorage[name]);
		}
	}
	return def;
}

function setItem(name, val) {
	if(typeof (Storage) !== "undefined") {
		localStorage.setItem(name, JSON.stringify(val));
	}
}

function removeItem(name) {
	if(typeof (Storage) !== "undefined") {
		localStorage.removeItem(name);
	}
}

function backupCreationData(nodeId, data, backupPrefix) {
	setItem('backup_for_node' + nodeId + (backupPrefix ? backupPrefix : ''), data);
}

function getBackupData(nodeId, backupPrefix) {
	return getItem('backup_for_node' + nodeId + (backupPrefix ? backupPrefix : '')) || {};
}

function removeBackup(nodeId, backupPrefix) {
	removeItem('backup_for_node' + nodeId + (backupPrefix ? backupPrefix : ''));
}

function keepInWindow(body) {
	if(body) {

		body = $(ReactDOM.findDOMNode(body));
		var x = body.offset().left;
		var w = body.outerWidth();
		var screenW = window.innerWidth;

		if(x < 0) {
			addTranslateX(body, -x);
		} else {
			var out = (x + w) - screenW;
			if(out > 0) {
				addTranslateX(body, -out);
			}
		}
	}
}

function addTranslateX(element, x) {
	var curMatrix = element.css('transform');
	if(curMatrix !== 'none') {
		curMatrix = curMatrix.split(',');
		curMatrix[4] = parseInt(curMatrix[4]) + x;
	} else {
		curMatrix = ['matrix(1', 0, 0, 1, x, '0)'];
	}

	element.css({'transform': curMatrix.join(',')});
}


function dataDidModifed() {
	try {
		if(window.hasOwnProperty('reloadParentIfSomethingUpdated_qwi012d')) {
			window.reloadParentIfSomethingUpdated_qwi012d();
		}
	} catch(e) { };
}

function popup(url, W = 900, reloadParentIfSomethingUpdated) { //new window

	var dataDidModifedInChildren;

	var leftVal = (screen.width - W) / 2;
	var topVal = (screen.height - 820) / 2;
	var popUp = window.open('?liteUI' + url, '', 'width=' + W + ',height=820,resizable=yes,scrollbars=yes,status=yes,menubar=no,toolbar=no,left=' + leftVal + ',top=' + topVal);
	if(!popUp) {
		myAlert(L('ALLOW_POPUPS'));
		return;
	}
	if(reloadParentIfSomethingUpdated) {
		popUp.reloadParentIfSomethingUpdated_qwi012d = () => {
			dataDidModifedInChildren = true;
		}
		var intr = setInterval(() => {
			if(popUp.closed) {
				if(dataDidModifedInChildren) {
					location.reload();
				}
				clearInterval(intr);
			}
		}, 100);
	}
}

let loadedScripts;

function loadJS(name, callback) {
	if(!loadedScripts) {
		loadedScripts = {};
	}
	if(loadedScripts[name] === true) {
		if(callback) {
			callback();
		}
		return;
	}
	if(!loadedScripts[name]) {
		loadedScripts[name] = [];
	} else {
		if(callback) {
			loadedScripts[name].push(callback);
		}
		return;
	}

	LoadingIndicator.instance.show();
	var script = document.createElement('script');
	script.onload = () => {
		LoadingIndicator.instance.hide();
		loadedScripts[name].some((f) => {f()});

		if(callback) {
			callback();
		}
		loadedScripts[name] = true;
	}
	script.src = name;
	script.type = "module";
	document.head.appendChild(script);
}

//TODO: uncomment
//setInterval(() => {

//if(window.location.href.indexOf('#n/28/f/p/*/formTitle')>0 || window.location.href.indexOf('#n/73/f/event_consultations_linker')>0){
//	refreshForm();
//}


//}, 10000)

function strip_tags(input) {
	if(typeof (input !== 'string')) return input;
	var allowed = '<p><a><img><b><i><div><span>';
	allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
	var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi

	return input.replace(commentsAndPhpTags, '').replace(tags, ($0, $1) => {
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
	})
}

function checkFileSize(file) {

	var regex = new RegExp('\.(' + ALLOWED_UPLOADS + ')$', 'gi');

	if(!regex.exec(file.name)) {
		myAlert(L('TYPES_ALLOWED', ALLOWED_UPLOADS));
		return true;
	}

	if(file.size > MAX_FILESIZE_TO_UPLOAD) {
		myAlert(L('FILE_BIG', (file.size / 1000000.0).toFixed(0)) + getReadableUploadSize());
		return true;
	}
}

function getReadableUploadSize() {
	return (MAX_FILESIZE_TO_UPLOAD / 1000000.0).toFixed(0) + L('MB');
}

var __errorsSent = {};
function submitErrorReport(name, stack) {

	/// #if DEBUG
	return;

	/// #endif

	if(typeof (name) !== 'string') {
		name = JSON.stringify(name);
	}


	name += '; ' + navigator.appVersion + '; ';

	var k = stack;
	if(!__errorsSent.hasOwnProperty(k)) {
		__errorsSent[k] = 1;
		submitRecord(81, {
			name: name + ' (' + window.location.href + ')',
			stack: stack.substring(0, 3999)
		}, undefined, () => { });
	}

}

var dictionary_0u23hiewf = {};

function initDictionary(o) {
	dictionary_0u23hiewf = Object.assign(dictionary_0u23hiewf, o);
}

function L(key, param) {
	if(dictionary_0u23hiewf.hasOwnProperty(key)) {
		if(typeof (param) !== 'undefined') {
			return dictionary_0u23hiewf[key].replace('%', param);
		}
		return dictionary_0u23hiewf[key];
	}
	/// #if DEBUG
	throw new Error(L('NO_TRANSLATION', key));
	/// #endif
	return ('#'.key);
}

export {
	isLitePage,
	renderIcon,
	getClassForField,
	registerFieldClass,
	getData,
	L,
	initDictionary,
	submitErrorReport,
	getReadableUploadSize,
	checkFileSize,
	strip_tags,
	loadJS,
	popup,
	keepInWindow,
	removeBackup,
	getBackupData,
	backupCreationData,
	getItem,
	setItem,
	removeItem,
	scrollToVisible,
	n2mValuesEqual,
	createRecord,
	deleteRecord,
	submitData,
	submitRecord,
	draftRecord,
	publishRecord,
	idToImgURL,
	idToFileUrl,
	isCurrentlyShowedLeftbarItem,
	addMixins,
	loactionToHash,
	goToPageByHash,
	consoleLog,
	consoleDir,
	sp,
	innerDatetimeFormat,
	toReadableDate,
	toReadableTime,
	toReadableDatetime,
	updateHashLocation,
	goBack,
	setFormFilter,
	getNodeData,
	getNode,
	myPromt,
	UID,
	myAlert,
	serializeForm,
	readableTimeFormat,
	readableDateFormat
}