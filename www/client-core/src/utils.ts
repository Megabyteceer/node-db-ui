import jQuery from 'jquery';
//@ts-ignore
window.jQuery = jQuery;
window.$ = jQuery;

import type { LANG_KEYS } from "./locales/en/lang";
import type { LANG_KEYS_CUSTOM } from "../../src/locales/en/lang";

import { Notify } from "./notify";
import ReactDOM from "react-dom";
import { R } from "./r";
import { assert, FieldDesc, FIELD_TYPE, GetRecordsParams, HASH_DIVIDER, NODE_ID, RecordSubmitResult, ROLE_ID, UserSession, USER_ID, VIEW_MASK } from "./bs-utils";
import type { Filters, IFormParameters, NodeDesc, RecId, RecordData, RecordsData } from "./bs-utils";
import { LoadingIndicator } from "./loading-indicator";
import { User } from "./user";
import { Modal } from "./modal";
import { ENV } from "./main-frame";
/// #if DEBUG
import { DebugPanel } from "./debug-panel";
/// #endif
import React, { Component } from "react";
import { HotkeyButton } from "./components/hotkey-button";
import { List } from "./forms/list";

const LITE_UI_PREFIX = '?liteUI';

enum CLIENT_SIDE_FORM_EVENTS {
	ON_FORM_SAVE = 'onSave',
	ON_FORM_AFTER_SAVE = 'onAfterSave',
	ON_FORM_LOAD = 'onLoad',
	ON_FIELD_CHANGE = 'onChange',
}
/// #if DEBUG
const __corePath = 'http://127.0.0.1:1443/core/';
/*
/// #endif
const __corePath = '/core/';
//*/

const headersJSON = new Headers();
headersJSON.append("Content-Type", "application/json");

const restrictedRecords = new Map();

interface RestrictDeletionData {
	[nodeId: number]: RecId[];
}

function restrictRecordsDeletion(nodes: RestrictDeletionData) {
	for(let nodeId in nodes) {
		if(nodeId) {
			const recordsIds = nodes[nodeId];
			//@ts-ignore
			nodeId = parseInt(nodeId);
			if(!restrictedRecords.has(nodeId)) {
				restrictedRecords.set(nodeId, new Map);
			}
			let nodeMap = restrictedRecords.get(nodeId);
			for(var recordId of recordsIds) {
				nodeMap.set(recordId, 1);
			}
		}
	}
}

restrictRecordsDeletion({
	4: [1, 2, 4, 5, 6, 7, 8, 9, 10, 12, 20, 22, 50, 52, 53], /* disable critical sections  deletion/hiding*/
	5: [1, 2, 3], /* disable admin,user,guest deletion*/
	7: [1, 2, 3], /* disable critical organizations deletion*/
	8: [1, 2, 3], /* disable critical roles deletion*/
	12: [1], /* disable default language deletion*/
	52: [1], /* disable field type enum deletion*/
	53: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 30, 43], /* disable field type enum deletion*/
});

function isRecordRestrictedForDeletion(nodeId, recordId) {
	if(restrictedRecords.has(nodeId)) {
		return restrictedRecords.get(nodeId).has(recordId);
	}
}

function myAlert(txt: string | React.ReactElement, isSuccess?: boolean, autoHide?: boolean, noDiscardByBackdrop?: boolean, onOk?: () => void, okButtonText?: string) {
	if(!Modal.instance) {
		alert(txt);
	} else {
		var className;
		if(isSuccess) {
			className = "alert-bg alert-bg-success";
		} else {
			className = "alert-bg alert-bg-danger";
		}

		var button;
		if(onOk) {
			button = R.div({ className: 'alert-button-container' },
				R.button({
					title: L('GO_TO_LOGIN'),
					className: 'clickable success-button save-btn', onClick: () => {
						Modal.instance.hide(modalId);
						onOk();
					}
				}, okButtonText || L('OK')
				)
			);
		}

		var modalId = Modal.instance.show(R.div({ className }, txt, button), noDiscardByBackdrop);

		if(autoHide) {
			setTimeout(() => {
				Modal.instance.hide(modalId);
			}, 1100);
		}
	}
}

async function showPrompt(txt: string | Component, yesLabel?: string, noLabel?: string, yesIcon?: string, noIcon?: string, discardByOutsideClick?: boolean) {
	return new Promise((resolve) => {
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

		noButton = React.createElement(HotkeyButton, {
			hotkey: 27,
			onClick: () => {
				Modal.instance.hide();
				resolve(false);
			},
			className: 'clickable prompt-no-button',
			label: R.span(null, renderIcon(noIcon), ' ', noLabel)
		});

		var body = R.span({ className: 'prompt-body' },
			txt,
			R.div({ className: 'prompt-footer' },
				noButton,
				React.createElement(HotkeyButton, {
					hotkey: 13,
					onClick: () => {
						Modal.instance.hide();
						resolve(true);
					}, className: 'clickable prompt-yes-button',
					label: R.span(null, renderIcon(yesIcon), ' ', yesLabel)
				})
			)
		);
		Modal.instance.show(body, !discardByOutsideClick);
	});
}

function debugError(txt) {
	/// #if DEBUG
	debugger;
	DebugPanel.instance.addEntry('ERROR: ' + txt, true);
	/// #endif
	console.error(txt);
}

var triesGotoHome = 0;

var _oneFormShowed;
const onOneFormShowed = () => {
	_oneFormShowed = true;
}

function handleError(error, url, callStack) {

	error = error.error || error;

	if(!callStack) {
		callStack = '';
	}

	/// #if DEBUG
	if(error.debug) {
		error.debug.message = (error.message || error) + callStack;
		error.debug.request = url;
	};


	if(DebugPanel.instance) {
	} else {
		throw error;
	}
	/*
	/// #endif


	if(!_oneFormShowed) {
		if(triesGotoHome < 5) {
			triesGotoHome++;
			goToHome();
		}
	} else 
	//*/
	{
		if(error.message) {
			error = error.message;
		}
		if(typeof error === 'string') {
			myAlert(error);
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
	if(data.hasOwnProperty('debug') && data.debug) {
		/// #if DEBUG
		data.debug.request = url;
		if(DebugPanel.instance) {
			DebugPanel.instance.addEntry(data.debug);
		}
		/// #endif
		delete data.debug;
	}
	if(data.hasOwnProperty('notifications')) {
		data.notifications.some((n) => {
			Notify.add(n);
		});
	}

}

var innerDateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
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

function toReadableDateTime(d) {
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
	if(location.pathname !== '/') {
		location.href = '/';
	} else {
		location.hash = '#';
	}
}

function locationToHash(nodeId: RecId, recId: RecId | 'new', filters?: Filters, editable?: boolean) {
	var newHash = [
		'n', encodeURIComponent(nodeId)];

	if(recId || recId === 0) {
		newHash.push('r');
		newHash.push(recId as unknown as string);
	}
	if(editable) {
		newHash.push('e');
	}

	if(filters && (Object.keys(filters).length > 0)) {
		var complicatedFilters = false;
		for(var k in filters) {
			var v = filters[k];
			if(typeof v === 'object') {
				complicatedFilters = true;
				break;
			}
		}

		if(complicatedFilters) {
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
						filtersHash.push(encodeURIComponent(filters[k] as string));
					}
				}
			}
			if(filtersHash && filtersHash.length) {
				newHash.push('f');
				newHash = newHash.concat(filtersHash);
			}
		}
	}

	let retHash = newHash.join('/');

	if(retHash === 'n/' + ENV.HOME_NODE) {
		retHash = '';
	}
	return retHash;
}

function isCurrentlyShowedLeftBarItem(item) {
	const currentFormParameters = window.crudJs.Stage.currentForm;
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

function hashToFormParams(hashTxt: string): IFormParameters {
	if(!hashTxt) {
		return { nodeId: ENV.HOME_NODE, filters: {} };
	}
	let nodeId;
	let recId;
	let editable;
	let filters = {};
	let hash = hashTxt.split('/');
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
				while(hash.length) {
					let key = hash.shift();
					let val = decodeURIComponent(hash.shift());
					let numVal = parseInt(val); // return numeric values to filter
					if(val == numVal.toString()) {
						// @ts-ignore
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
	return { recId, nodeId, editable, filters };
}

function getTopHashNodeId() {
	let hash = window.location.hash.substr(1);
	return hashToFormParams(hash.split(HASH_DIVIDER).pop()).nodeId;
}

async function goToPageByHash() {
	const isPageLoading = !_oneFormShowed;

	let hash = window.location.hash.substr(1);
	var formParamsByLevels = hash.split(HASH_DIVIDER).map(hashToFormParams);

	const Stage = window.crudJs.Stage;
	let level;

	for(level = 0; (level < formParamsByLevels.length) && (level < Stage.allForms.length); level++) {
		const formParams = formParamsByLevels[level];
		const form = Stage.allForms[level].form;


		let isTheSame = form && (formParams.nodeId === form.nodeId && formParams.recId === form.recId && Boolean(formParams.editable) === Boolean(form.editable));
		if(isTheSame) {
			if(JSON.stringify(form.filters) !== JSON.stringify(formParams.filters)) {
				isTheSame = false;
			}
		}
		if(!isTheSame) {
			if(level === 0) {
				Stage.destroyForm();
			} else {
				while(Stage.allForms.length > (level + 1)) {
					Stage.goBackIfModal();
				}
			}
			break;
		}
	}

	if(formParamsByLevels.length <= level) {
		while(formParamsByLevels.length <= level) {
			Stage.goBackIfModal();
			level--;
		}
	} else {
		while(level < formParamsByLevels.length) {
			let paramsToShow = formParamsByLevels[level];
			await Stage.showForm(paramsToShow.nodeId, paramsToShow.recId, paramsToShow.filters, paramsToShow.editable, level > 0, undefined, isPageLoading);
			level++;
		}
	}
};


const SKIP_HISTORY_NODES = {};
SKIP_HISTORY_NODES[NODE_ID.LOGIN] = true;
SKIP_HISTORY_NODES[NODE_ID.REGISTER] = true;
SKIP_HISTORY_NODES[NODE_ID.RESET] = true;

async function goBack(isAfterDelete?: boolean) {
	const currentFormParameters = window.crudJs.Stage.currentForm;

	if(isLitePage() && window.history.length < 2) {
		window.close();
	} else if(!isAfterDelete && window.history.length) {

		if(window.history.length > 0) {
			isHistoryChanging = true;
			goBackUntilValidNode = true;
			window.history.back();
			isHistoryChanging = false;
		} else {
			window.crudJs.Stage.showForm(ENV.HOME_NODE);
		}

	} else if(currentFormParameters && currentFormParameters.recId) {
		window.crudJs.Stage.showForm(currentFormParameters.nodeId, undefined, currentFormParameters.filters);
	} else if(isAfterDelete) {
		window.crudJs.Stage.refreshForm();
	}
}

function assignFilters(src, desc): boolean {
	var leastOneUpdated;
	var keys = Object.keys(src);
	for(var i = keys.length; i > 0;) {
		i--;
		var name = keys[i];
		var value = src[name];
		if(desc[name] !== value) {
			desc[name] = value;
			leastOneUpdated = true;
		}
	}
	return leastOneUpdated;
}


let isHistoryChanging = false;
let goBackUntilValidNode = false;

function updateHashLocation(replaceState = false) {
	if(isHistoryChanging) {
		return;
	}
	var newHash = '#' + window.crudJs.Stage.allForms.map((formEntry) => {
		const formParameters = formEntry.form;
		const filters = formParameters.filters;
		return locationToHash(formParameters.nodeId, formParameters.recId, filters, formParameters.editable);
	}).join(HASH_DIVIDER);

	if((location.hash != newHash) && (location.hash != newHash.substr(1))) {
		if(replaceState) {
			history.replaceState(null, null, newHash);
		} else {
			history.pushState(null, null, newHash);
		}
	}
}

$(window).on('hashchange', () => {
	if(goBackUntilValidNode && SKIP_HISTORY_NODES[getTopHashNodeId()]) {
		goBack();
		return;
	} else {
		goBackUntilValidNode = false;
	}
	isHistoryChanging = true;
	goToPageByHash();
	isHistoryChanging = false;
});

var nodes;
var nodesRequested;

function onNewUser() {
	nodes = {};
	nodesRequested = {};
}

onNewUser();

function waitForNodeInner(nodeId, callback) {
	if(nodes.hasOwnProperty(nodeId)) {
		callback(nodes[nodeId]);
	} else {
		setTimeout(() => {
			waitForNodeInner(nodeId, callback);
		}, 50);
	}
}

async function waitForNode(nodeId) {
	if(nodes.hasOwnProperty(nodeId)) {
		return nodes[nodeId];
	}
	return new Promise((resolve) => {
		waitForNodeInner(nodeId, resolve);
	});
}

function getNodeIfPresentOnClient(nodeId: RecId): NodeDesc {
	return nodes[nodeId];
}

async function getNode(nodeId: RecId, forceRefresh = false, callStack?: string): Promise<NodeDesc> {

	if(!callStack) {
		callStack = new Error('getNode called from: ').stack;
	}

	if(forceRefresh) {
		delete (nodes[nodeId]);
		delete (nodesRequested[nodeId]);
	}

	if(nodes.hasOwnProperty(nodeId)) {
		return nodes[nodeId];
	} else {
		if(nodesRequested.hasOwnProperty(nodeId)) {
			return waitForNode(nodeId);
		} else {
			try {
				nodesRequested[nodeId] = true;
				let data = await getData('api/descNode', { nodeId });
				normalizeNode(data);
				nodes[nodeId] = data;
				return data;
			} catch(er) {
				delete (nodesRequested[nodeId]);
			}
		}
	}
}

function normalizeNode(node: NodeDesc) {
	node.fieldsById = {};
	node.fieldsByName = {};
	if(node.fields) {
		node.fields.forEach((f: FieldDesc, i) => {
			f.index = i;
			f.node = node;
			node.fieldsById[f.id] = f;
			node.fieldsByName[f.fieldName] = f;
			if(f.enum) {
				f.enumNamesById = {};
				for(let e of f.enum) {
					f.enumNamesById[e.value] = e.name;
				}
			}
			if(f.lang) {
				const fieldId = f.id as unknown as string; // language data fields have string ids of format: "77$ru"
				const parentField: FieldDesc = node.fieldsById[fieldId.substr(0, fieldId.indexOf('$'))];
				if(!parentField.childrenFields) {
					parentField.childrenFields = [];
				}
				parentField.childrenFields.push(f);
				f.fieldNamePure = parentField.fieldName;
			} else {
				f.fieldNamePure = f.fieldName;
			}
		});
	}
	if(node.filters) {
		node.filtersList = Object.keys(node.filters).sort((a, b) => {
			return node.filters[a].order - node.filters[b].order;
		}).map((k) => {
			return { value: k, name: node.filters[k].name };
		});
		if(node.defaultFilterId && !node.filters[node.defaultFilterId]) {
			node.defaultFilterId = node.filtersList.length ? node.filtersList[0].value : 0;
		}
		if(!node.defaultFilterId) {
			node.filtersList.unshift({ value: undefined, name: '-' });
		}
	}
}

async function getNodeData(nodeId: RecId, recId: undefined, filters?: { [key: string]: any }, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean, onError?: (er: any) => void): Promise<RecordsData>;
async function getNodeData(nodeId: RecId, recId: RecId, filters?: undefined, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean, onError?: (er: any) => void): Promise<RecordData>;
async function getNodeData(nodeId: RecId, recId: RecId | undefined, filters?: undefined, editable?: boolean, viewMask?: VIEW_MASK | boolean, isForCustomList?: boolean, noLoadingIndicator?: boolean, onError?: (er: any) => void): Promise<RecordData | RecordsData> {

	/// #if DEBUG
	if(typeof (recId) !== 'undefined' && typeof (filters) !== 'undefined') {
		throw 'Can\'t use recId and filters in one request';
	}
	/// #endif

	var callStack = new Error('getNodeData called from: ').stack;

	let params: GetRecordsParams = { nodeId };

	if(typeof (recId) !== 'undefined') {
		params.recId = recId;
		if(editable) {
			params.viewFields = VIEW_MASK.EDITABLE;
		} else {
			params.viewFields = VIEW_MASK.READONLY;
		}
	} else {
		if(editable) {
			params.viewFields = VIEW_MASK.EDITABLE;
		} else {
			if(typeof viewMask === 'number') {
				params.viewFields = viewMask;
			} else if(isForCustomList) {
				params.viewFields = VIEW_MASK.CUSTOM_LIST;
			} else {
				params.viewFields = VIEW_MASK.LIST;
			}
		}
	}

	if(!nodes.hasOwnProperty(nodeId) && !nodesRequested.hasOwnProperty(nodeId)) {
		params.descNode = true;
		nodesRequested[nodeId] = true;
	}
	try {
		if(filters) {
			Object.assign(params, filters);
		}

		let data = await getData('api/', params, callStack, noLoadingIndicator);

		if(data.hasOwnProperty('node')) {
			if(nodes[nodeId]) {
				debugError('Node description overriding.');
			}
			normalizeNode(data.node);
			nodes[nodeId] = data.node;
			delete (data.node);
		}

		let node = await waitForNode(nodeId);

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
		return data;
	} catch(err) {
		delete (nodesRequested[nodeId]);
	}
}

var _fieldClasses = {};
var fieldsEncoders = [];
var fieldsDecoders = [];

function getClassForField(type) {
	if(_fieldClasses.hasOwnProperty(type)) {
		return _fieldClasses[type];
	}
	return _fieldClasses[FIELD_TYPE.TEXT];
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
function encodeData(data, node): RecordData {
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
	Object.assign(Class.prototype, mixins);
}

async function submitRecord(nodeId: RecId, data: RecordData, recId?: RecId): Promise<RecordSubmitResult> {
	if(Object.keys(data).length === 0) {
		throw 'Tried to submit empty object';
	}
	let node = await getNode(nodeId);
	return submitData('api/submit', { nodeId, recId, data: encodeData(data, node) });
}

var UID_counter = 1;
function UID(obj): number {
	if(!obj.hasOwnProperty('__uid109Hd')) {
		obj.__uid109Hd = UID_counter++;
	}
	return obj.__uid109Hd;
}

function idToImgURL(imgId, holder) {
	if(imgId) {
		if(imgId.indexOf('//') >= 0) {
			return imgId;
		}
		return 'images/uploads/' + imgId;
	}
	return 'images/placeholder_' + holder + '.png';
}

function idToFileUrl(fileId) {
	return 'uploads/file/' + fileId;
}

let __requestsOrder = [];
function releaseQuiresOrder(requestRecord) {
	var roi = __requestsOrder.indexOf(requestRecord);
	/// #if DEBUG
	if(roi < 0) {
		throw new Error('requests order is corrupted');
	}
	/// #endif
	requestRecord.reject(requestRecord.result);
	__requestsOrder.splice(roi, 1);
}

async function getData(url: string, params?: { [key: string]: any }, callStack?: string, noLoadingIndicator?: boolean): Promise<any> {
	return new Promise((resolve, reject) => {
		assert(url.indexOf('?') < 0, 'More parameters to data');

		var requestRecord: {
			url: string;
			resolve: (value: unknown) => void;
			reject: (value: unknown) => void;
			result?: any
		} = {
			/// #if DEBUG
			url: url,
			/// #endif
			resolve,
			reject
		}

		if(!params) {
			params = {};
		}

		params.sessionToken = getSessionToken();

		__requestsOrder.push(requestRecord);


		if(!callStack) {
			callStack = new Error('GetData called from: ').stack;
		}

		if(!noLoadingIndicator && LoadingIndicator.instance) {
			LoadingIndicator.instance.show();
		} else {
			noLoadingIndicator = true;
		}
		let isOrderNeedDispose = true;
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

				} else if(data.hasOwnProperty('result')) {
					isOrderNeedDispose = false;
					requestRecord.result = data.result;
				} else {
					handleError(data, url, callStack);
				}
			})
			/// #if DEBUG
			/*
			/// #endif
			.catch((error) => {
				releaseQuiresOrder(requestRecord);
				handleError(error, url, callStack);
				
				myAlert(L('CHECK_CONNECTION'), false, true);
			})
			//*/
			.finally(() => {
				if(isOrderNeedDispose) {
					releaseQuiresOrder(requestRecord);
				}
				while(__requestsOrder.length > 0 && __requestsOrder[0].hasOwnProperty('result')) {
					var rr = __requestsOrder.shift();
					rr.resolve(rr.result);
				}
				if(!noLoadingIndicator) {
					LoadingIndicator.instance.hide();
				}
			})
	});
}

const isUserHaveRole = (roleId: ROLE_ID) => {
	return User.currentUserData && User.currentUserData.userRoles[roleId];
}

const isAdmin = () => {
	return isUserHaveRole(ROLE_ID.ADMIN);
}

async function publishRecord(nodeId, recId): Promise<RecordSubmitResult> {
	return submitRecord(nodeId, { status: 1 }, recId);
}

async function draftRecord(nodeId, recId): Promise<RecordSubmitResult> {
	return submitRecord(nodeId, { status: 2 }, recId);
}

function isAuthNeed(data) {
	let token = getSessionToken();
	if((token && (token !== "guest-session")) && (data.error && (data.error.startsWith('Error: <auth>') || data.error.startsWith('<auth>')))) {
		clearSessionToken();
		window.crudJs.Stage.showForm(NODE_ID.LOGIN, 'new', undefined, true);
		return true;
	} else if(data.error && (data.error.startsWith('Error: <access>') || data.error.startsWith('<access>'))) {
		if(window.crudJs.Stage?.currentForm?.props?.node?.id !== NODE_ID.LOGIN) {
			goToHome();
		}
		return true;
	}
}

function serializeForm(form): FormData {
	var obj = $(form);
	/* ADD FILE TO PARAM AJAX */
	var formData = new FormData();
	$.each($(obj).find("input[type='file']"), (i, tag) => {
		// @ts-ignore
		$.each($(tag)[0].files, (i, file) => {
			// @ts-ignore
			formData.append(tag.name, file);
		});
	});
	formData.append('sessionToken', getSessionToken());
	var params = $(obj).serializeArray();
	$.each(params, (i, val) => {
		formData.append(val.name, val.value);
	});
	return formData;
}

var requestsInProgress = 0;

window.addEventListener("beforeunload", function (e) {
	if(requestsInProgress) {
		var confirmationMessage = L("DATA_NOT_SAVED");
		(e || window.event).returnValue = confirmationMessage;
		return confirmationMessage;
	}
});

function submitData(url: string, dataToSend: FormData, noProcessData): Promise<any>;
function submitData(url: string, dataToSend: any): Promise<any>;
function submitData(url: string, dataToSend: any, noProcessData?: boolean): Promise<any> {
	LoadingIndicator.instance.show();

	let body: FormData;
	if(!noProcessData) {
		if(getSessionToken()) {
			dataToSend.sessionToken = getSessionToken();
		}
		body = JSON.stringify(dataToSend) as unknown as FormData;
	} else {
		body = dataToSend;
	}

	var callStack = new Error('submitData called from: ').stack;
	let options: RequestInit = {
		method: 'POST',
		body
	}
	if(!noProcessData) {
		options.headers = headersJSON;
	}
	requestsInProgress++;
	return fetch(__corePath + url, options)
		.then((res) => {
			return res.json();
		})
		.then((data) => {
			handleAdditionalData(data, url);
			if(isAuthNeed(data)) {

			} else if(data.hasOwnProperty('result')) {
				return data.result;
			} else {
				handleError(data, url, JSON.stringify(dataToSend) + ';\n' + callStack);
			}
		})
		/// #if DEBUG
		/*
		/// #endif
		.catch((error) => {
			myAlert(error.message);
			consoleDir(error);
		})
		//*/
		.finally(() => {
			requestsInProgress--;
			LoadingIndicator.instance.hide();
		})
}

let isCaptchaInitialized;

async function getCaptchaToken(): Promise<string | undefined> {
	if(!ENV.CAPTCHA_CLIENT_SECRET) {
		return;
	}

	let resolve;
	const requireCaptcha = () => {
		//@ts-ignore
		window.grecaptcha.ready(function () {
			//@ts-ignore
			window.grecaptcha.execute(ENV.CAPTCHA_CLIENT_SECRET, { action: 'submit' }).then((token) => {
				resolve(token);
			});
		});
	}

	if(!isCaptchaInitialized) {
		isCaptchaInitialized = true;
		var scriptElement = document.createElement('script');
		scriptElement.src = 'https://www.google.com/recaptcha/api.js?render=' + ENV.CAPTCHA_CLIENT_SECRET;
		scriptElement.addEventListener('load', requireCaptcha);
		document.head.appendChild(scriptElement);
	} else {
		requireCaptcha();
	}


	return new Promise((resolve_) => {
		//@ts-ignore
		resolve = resolve_;
	});
}


async function deleteRecord(name, nodeId: RecId, recId: RecId, noPrompt?: boolean, onYes?: () => void) {
	if(noPrompt) {
		if(onYes) {
			onYes();
		} else {
			await submitData('api/delete', { nodeId, recId });
			window.crudJs.Stage.dataDidModified(null);
			return true;
		}
	} else {
		let node = await getNode(nodeId);
		if(await showPrompt(L('SURE_DELETE', (node.creationName || node.singleName)) + ' "' + name + '"?',
			L('DELETE'), L('CANCEL'), 'times', 'caret-left', true)) {
			return deleteRecord(null, nodeId, recId, true, onYes);
		}
	}
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
		return undefined;
	}
	return R.p({ className: 'fa fa-' + name });
}

function isLitePage() {
	return window.location.href.indexOf(LITE_UI_PREFIX) >= 0;
}

if(isLitePage()) {
	document.body.classList.add('lite-ui');
}

function scrollToVisible(elem, doNotShake = false) {
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
			$('html,body').animate({ scrollTop: elemTop }, 300, undefined, () => { !doNotShake && shakeDomElement($elem); });
		} else if(elemBottom > docViewBottom) {
			$('html,body').animate({ scrollTop: Math.min(elemBottom - $window.height(), elemTop) }, 300, undefined, () => { !doNotShake && shakeDomElement($elem) });
		} else {
			!doNotShake && shakeDomElement($elem);
		}
	}
}

function shakeDomElement(e) {
	e[0].classList.remove('shake');
	setTimeout(() => {
		e[0].classList.add('shake');
	}, 10);
	setTimeout(() => {
		e[0].classList.remove('shake');
	}, 1000);
};

function getItem(name: string, def?: any) {
	if(typeof (Storage) !== "undefined") {
		if(localStorage.hasOwnProperty(name)) {
			return JSON.parse(localStorage[name]);
		}
	}
	return def;
}

function setItem(name, val) {
	if(typeof (Storage) !== "undefined") {
		assert(typeof val !== 'undefined', 'setItem() got an invalid value.');
		localStorage.setItem(name, JSON.stringify(val));
	}
}

function removeItem(name) {
	if(typeof (Storage) !== "undefined") {
		localStorage.removeItem(name);
	}
}


function openIndexedDB() {
	var indexedDB = window.indexedDB;
	var openDB = indexedDB.open("MyDatabase", 1);
	openDB.onupgradeneeded = function () {
		var db: any = {};
		db.result = openDB.result;
		db.store = db.result.createObjectStore("MyObjectStore", { keyPath: "id" });
	};
	return openDB;
}

function getStoreIndexedDB(openDB: IDBOpenDBRequest) {
	var db: any = {};
	db.result = openDB.result;
	db.tx = db.result.transaction("MyObjectStore", "readwrite");
	db.store = db.tx.objectStore("MyObjectStore");
	return db;
}

var dbWriteInProgress;

function saveIndexedDB(filename: string, fileData: any) {
	return new Promise((resolve) => {
		dbWriteInProgress = true;
		var openDB = openIndexedDB();
		openDB.onsuccess = function () {
			dbWriteInProgress = false;
			var db = getStoreIndexedDB(openDB);
			db.store.put({ id: filename, data: fileData });
			resolve(true);
		};
	});
}

function isDBWriteInProgress() {
	return dbWriteInProgress;
}

async function loadIndexedDB(filename: string): Promise<any> {
	return new Promise((resolve) => {
		var openDB = openIndexedDB();
		openDB.onsuccess = function () {
			var db = getStoreIndexedDB(openDB);

			var getData;
			if(filename) {
				getData = db.store.get(filename);
				getData.onsuccess = function () {
					resolve(getData.result && getData.result.data);
				};
				db.tx.oncomplete = function () {
					db.result.close();
				};
			}
		};
	});
}

async function deleteIndexedDB(filename: string): Promise<any> {
	var openDB = openIndexedDB();
	openDB.onsuccess = function () {
		var db = getStoreIndexedDB(openDB);
		db.store.delete(filename);
	};
	return true;
}

function keepInWindow(body) {
	if(body) {
		body = ReactDOM.findDOMNode(body);

		let modalContainer = body.closest('.form-modal-container');
		var screenR = window.innerWidth - 10;
		var screenL = 0;
		if(modalContainer) {
			const cRect = modalContainer.getBoundingClientRect()
			screenR = cRect.right - 13;
			screenL = cRect.left;
		}

		const bodyRect = body.getBoundingClientRect()
		var l = bodyRect.left;
		var r = bodyRect.right;


		if(l < screenL) {
			addTranslateX(body, -l);
		} else {
			var out = r - screenR;
			if(out > 0) {
				addTranslateX(body, -out);
			}
		}
	}
}

function addTranslateX(element, x) {
	x = Math.round(x);
	var curMatrix = element.style.transform;
	if(curMatrix && (curMatrix !== 'none')) {
		curMatrix = curMatrix.split(',');
		curMatrix[4] = parseInt(curMatrix[4]) + x;
	} else {
		curMatrix = ['matrix(1', 0, 0, 1, x, '0)'];
	}

	element.style.transform = curMatrix.join(',');
}

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

	var regex = new RegExp('\.(' + ENV.ALLOWED_UPLOADS.join('|') + ')$', 'gi');

	if(!regex.exec(file.name)) {
		myAlert(L('TYPES_ALLOWED', ENV.ALLOWED_UPLOADS));
		return true;
	}

	if(file.size > ENV.MAX_FILE_SIZE_TO_UPLOAD) {
		myAlert(L('FILE_BIG', (file.size / 1000000.0).toFixed(0)) + getReadableUploadSize());
		return true;
	}
}

function getReadableUploadSize() {
	return (ENV.MAX_FILE_SIZE_TO_UPLOAD / 1000000.0).toFixed(0) + L('MB');
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
		submitRecord(NODE_ID.ERROR_REPORTS, {
			name: name + ' (' + window.location.href + ')',
			stack: stack.substring(0, 3999)
		});
	}

}

function reloadLocation() {
	setTimeout(() => {
		location.reload();
	}, 10);
}

var dictionary = {};

function initDictionary(o) {
	dictionary = Object.assign(dictionary, o);
}

function L(key: LANG_KEYS | LANG_KEYS_CUSTOM, param?: any) {
	if(dictionary.hasOwnProperty(key)) {
		if(typeof (param) !== 'undefined') {
			return dictionary[key].replace('%', param);
		}
		return dictionary[key];
	}
	/// #if DEBUG
	debugger;
	throw new Error('NO_TRANSLATION FOR KEY: ' + key);
	/// #endif
	return ('#' + key);
}

var listRenderers = [];

function registerListRenderer(nodeId: RecId, renderFunction: (this: List) => React.ReactNode) {
	if(listRenderers.hasOwnProperty(nodeId)) {
		throw 'List renderer for node ' + nodeId + ' is already registered.';
	}
	listRenderers[nodeId] = renderFunction;
}

function isPresentListRenderer(nodeId: RecId) {
	return listRenderers.hasOwnProperty(nodeId);
}

function getListRenderer(nodeId: RecId): (this: List) => React.ReactNode {
	return listRenderers[nodeId];
}

function getSessionToken() {
	return getItem('cud-js-session-token');
}

function clearSessionToken() {
	removeItem('cud-js-session-token');
}

async function loginIfNotLoggedIn(enforced = false): Promise<UserSession> {
	if(User.currentUserData && User.currentUserData.id !== USER_ID.GUEST) {
		return User.currentUserData;
	} else {
		setItem('go-to-after-login', location.href);
		let backdrop = document.createElement('div');
		backdrop.className = 'modal-back' + (enforced ? '' : ' clickable');
		let iframe = document.createElement('iframe');
		iframe.className = 'login-iframe';
		iframe.src = location.origin + User.getLoginURL(true);
		backdrop.appendChild(iframe);
		document.body.appendChild(backdrop);
		backdrop.addEventListener('pointerdown', () => {
			backdrop.remove();
		});
		return new Promise((resolve) => {
			iframe.contentWindow.onCurdJSLogin = (userData) => {
				User.currentUserData = userData;
				resolve(userData);
				backdrop.remove();
			};
		});
	}
}

var googleLoginAPIattached;
async function attachGoogleLoginAPI(enforces = false) {
	if(ENV.clientOptions.googleSigninClientId && !googleLoginAPIattached) {
		var meta = document.createElement('meta');
		meta.name = "google-signin-client_id";
		meta.content = ENV.clientOptions.googleSigninClientId;
		document.getElementsByTagName('head')[0].appendChild(meta);
	}
	if(ENV.clientOptions.googleSigninClientId && (!googleLoginAPIattached || enforces)) {
		let s = document.createElement('script');
		s.src = "https://apis.google.com/js/platform.js";
		s.async = true;
		s.defer = true;
		document.head.append(s);
		await (new Promise((resolve) => {
			setInterval(() => {
				//@ts-ignore
				if(window.gapi) {
					resolve(true);
				}
			}, 10);
		}));
	}
	googleLoginAPIattached = true;
}

export {
	shakeDomElement,
	attachGoogleLoginAPI,
	getSessionToken,
	clearSessionToken,
	loginIfNotLoggedIn,
	onNewUser,
	registerListRenderer,
	isPresentListRenderer,
	getListRenderer,
	Filters,
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
	keepInWindow,
	getItem,
	setItem,
	removeItem,
	scrollToVisible,
	n2mValuesEqual,
	deleteRecord,
	submitData,
	submitRecord,
	draftRecord,
	publishRecord,
	idToImgURL,
	idToFileUrl,
	isCurrentlyShowedLeftBarItem,
	addMixins,
	goToPageByHash,
	consoleLog,
	consoleDir,
	sp,
	innerDateTimeFormat,
	toReadableDate,
	toReadableTime,
	toReadableDateTime,
	updateHashLocation,
	goBack,
	getNodeData,
	getNode,
	getNodeIfPresentOnClient,
	showPrompt,
	UID,
	myAlert,
	serializeForm,
	readableTimeFormat,
	readableDateFormat,
	debugError,
	isUserHaveRole,
	isAdmin,
	CLIENT_SIDE_FORM_EVENTS,
	onOneFormShowed,
	isRecordRestrictedForDeletion,
	reloadLocation,
	assignFilters,
	getCaptchaToken,
	__corePath,
	saveIndexedDB,
	loadIndexedDB,
	isDBWriteInProgress,
	goToHome,
	deleteIndexedDB,
	LITE_UI_PREFIX
}