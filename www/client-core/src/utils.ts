import type { LANG_KEYS_CUSTOM } from '../../src/locales/en/lang';
import { LITE_UI_PREFIX, NEW_RECORD } from './consts';
import type { LANG_KEYS } from './locales/en/lang';

import type { ApiResponse, FieldDesc, GetRecordsFilter, GetRecordsParams, IFormParameters, LookupValue, NodeDesc, RecId, RecordData, RecordDataWrite, RecordDataWriteDraftable, RecordsData, RecordSubmitResult, RecordSubmitResultNewRecord, UserSession } from './bs-utils';
import { HASH_DIVIDER, ROLE_ID, STATUS, USER_ID, VIEW_MASK } from './bs-utils';
import { LoadingIndicator } from './loading-indicator';
import { Modal } from './modal';
import { Notify } from './notify';
import { R } from './r';
import { User } from './user';

/// #if DEBUG
import { DebugPanel } from './debug-panel';
/// #endif

import type moment from 'moment';
import type { Component, ComponentChild } from 'preact';
import { h } from 'preact';
import { FIELD_TYPE, NODE_ID, type TypeGenerationHelper } from '../../../types/generated';
import { globals } from '../../../types/globals';
import { assert } from './assert';
import type BaseField from './base-field';
import type { BaseFieldProps } from './base-field';
import { HotkeyButton } from './components/hotkey-button';
import { ENV } from './main-frame';

/// #if DEBUG
const __corePath = 'http://127.0.0.1:1443/core/';
/*
/// #endif
const __corePath = '/core/';
// */

const headersJSON = new Headers();
headersJSON.append('Content-Type', 'application/json');

const restrictedRecords = new Map();

const getHomeNode = () => {
	return isUserHaveRole(ROLE_ID.GUEST) ? ENV.HOME_NODE_GUEST : ENV.HOME_NODE;
};

interface RestrictDeletionData {
	[nodeId: number]: RecId[];
}

function restrictRecordsDeletion(nodes: RestrictDeletionData) {
	for (let key in nodes) {
		if (key) {
			const recordsIds = nodes[key];

			const nodeId = parseInt(key);
			if (!restrictedRecords.has(nodeId)) {
				restrictedRecords.set(nodeId, new Map());
			}
			const nodeMap = restrictedRecords.get(nodeId);
			for (const recordId of recordsIds) {
				nodeMap.set(recordId, 1);
			}
		}
	}
}

restrictRecordsDeletion({
	[NODE_ID.NODES]: [1, 2, 4, 5, 6, 7, 8, 9, 10, 12, 20, 22, 50, 52, 53] /* disable critical sections  deletion/hiding */,
	[NODE_ID.USERS]: [1, 2, 3] /* disable admin,user,guest deletion */,
	[NODE_ID.ORGANIZATION]: [1, 2, 3] /* disable critical organizations deletion */,
	[NODE_ID.ROLES]: [1, 2, 3] /* disable critical roles deletion */,
	[NODE_ID.LANGUAGES]: [1] /* disable default language deletion */,
	[NODE_ID.ENUMS]: [1, 2, 3] /* disable field type enum deletion */,
	[NODE_ID.ENUM_VALUES]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 22, 30, 43, 50] /* disable field type enum deletion */
});

function isRecordRestrictedForDeletion(nodeId: NODE_ID, recordId?: RecId) {
	if (recordId && restrictedRecords.has(nodeId)) {
		return restrictedRecords.get(nodeId).has(recordId);
	}
}

function myAlert(txt: string | preact.Component, isSuccess?: boolean, autoHide?: boolean, noDiscardByBackdrop?: boolean, onOk?: () => void, okButtonText?: string) {
	if (!Modal.instance) {
		alert(txt);
	} else {
		let className;
		if (isSuccess) {
			className = 'alert-bg alert-bg-success';
		} else {
			className = 'alert-bg alert-bg-danger';
		}

		let button;
		if (onOk) {
			button = R.div(
				{ className: 'alert-button-container' },
				R.button(
					{
						title: L('GO_TO_LOGIN'),
						className: 'clickable success-button save-btn',
						onClick: () => {
							Modal.instance.hide(modalId);
							onOk();
						}
					},
					okButtonText || L('OK')
				)
			);
		}

		const modalId = Modal.instance.show(R.div({ className }, txt, button), noDiscardByBackdrop);

		if (autoHide) {
			setTimeout(() => {
				Modal.instance.hide(modalId);
			}, 1100);
		}
	}
}

async function showPrompt(txt: string | Component, yesLabel?: string, noLabel?: string, yesIcon?: string, noIcon?: string, discardByOutsideClick = true, greenButton = false) {
	return new Promise((resolve) => {
		if (!yesLabel) {
			yesLabel = L('OK');
		}
		if (!yesIcon) {
			yesIcon = 'check';
		}

		if (!noLabel) {
			noLabel = L('CANCEL');
		}

		if (!noIcon) {
			noIcon = 'times';
		}

		const noButton = h(HotkeyButton, {
			hotkey: 27,
			onClick: () => {
				Modal.instance.hide();
				resolve(false);
			},
			className: 'clickable prompt-no-button',
			label: R.span(null, renderIcon(noIcon), ' ', noLabel)
		});

		const body = R.span(
			{ className: 'prompt-body' },
			txt,
			R.div(
				{ className: 'prompt-footer' },
				noButton,
				h(HotkeyButton, {
					hotkey: 13,
					onClick: () => {
						Modal.instance.hide();
						resolve(true);
					},
					className: greenButton ? 'clickable success-button' : 'clickable prompt-yes-button',
					label: R.span(null, renderIcon(yesIcon), ' ', yesLabel)
				})
			)
		);
		Modal.instance.show(body, !discardByOutsideClick);
	});
}

function debugError(txt: string) {
	/// #if DEBUG
	debugger;
	DebugPanel.instance!.addEntry('ERROR: ' + txt, true);
	/// #endif
	console.error(txt);
}

let _oneFormShowed = false;
const onOneFormShowed = () => {
	_oneFormShowed = true;
};

function handleError(error: any, url: string, callStack = '') {
	error = error.error || error;

	/// #if DEBUG
	if (error.debug) {
		error.debug.message = (error.message || error) + callStack;
		error.debug.request = url;
	}

	if (!DebugPanel.instance) {
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
	// */
	{
		if (error.message) {
			error = error.message;
		}
		if (typeof error === 'string') {
			myAlert(error);
		} else {
			myAlert(L('CONNECTION_ERR'), false, true);
		}
	}
	if (error.hasOwnProperty('debug')) {
		consoleLog(error.debug.stack.join('\n'));
	}
}

function consoleLog(txt: string) {
	/// #if DEBUG
	console.log(txt);
	/// #endif
}

function consoleDir(o: any) {
	/// #if DEBUG
	console.dir(o);
	/// #endif
}

function sp(event: Event) {
	event.stopPropagation();
	if (event.cancelable) {
		event.preventDefault();
	}
}

/** SQL debug and server events notifications (notificationOut) */
function handleAdditionalData(data: ApiResponse, url: string) {
	if (data.hasOwnProperty('debug') && data.debug) {
		/// #if DEBUG
		data.debug.request = url;
		if (DebugPanel.instance) {
			DebugPanel.instance.addEntry(data.debug);
		}
		/// #endif
		delete data.debug;
	}
	if (data.notifications) {
		data.notifications.some((n) => {
			Notify.add(n);
		});
	}
}

const INNER_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const readableDateFormat = 'D MMMM YYYY';
const readableTimeFormat = 'H:mm';

function toReadableDate(d: moment.Moment) {
	if (d) {
		const txt = d.format(readableDateFormat);
		if (txt !== 'Invalid date') {
			return txt;
		}
	}
	return '';
}

function toReadableDateTime(d: moment.Moment | undefined) {
	if (d) {
		const txt = d.format(readableDateFormat + ' ' + readableTimeFormat);
		if (txt !== 'Invalid date') {
			return txt;
		}
	}
	return '';
}

function toReadableTime(d: moment.Moment) {
	if (d) {
		const txt = d.format(readableTimeFormat);
		if (txt !== 'Invalid date') {
			return txt;
		}
	}
	return '';
}

function goToHome() {
	if (location.pathname !== '/') {
		location.href = '/';
	} else {
		location.hash = '#';
	}
}

function locationToHash(nodeId: RecId, recId: RecId | typeof NEW_RECORD, filters?: GetRecordsFilter, editable?: boolean) {
	let newHash = ['n', encodeURIComponent(nodeId)];

	if (recId || recId === 0) {
		newHash.push('r');
		newHash.push(recId as unknown as string);
	}
	if (editable) {
		newHash.push('e');
	}

	if (filters && Object.keys(filters).length > 0) {
		let complicatedFilters = false;
		for (const k in filters) {
			const v = (filters as KeyedMap<any>)[k];
			if (typeof v === 'object') {
				complicatedFilters = true;
				break;
			}
		}

		if (complicatedFilters) {
			newHash.push('j');
			newHash.push(encodeURIComponent(JSON.stringify(filters)));
		} else {
			const filtersHash = [];
			for (const k in filters) {
				if (filters.hasOwnProperty(k) && ((filters as KeyedMap<any>)[k] || (filters as KeyedMap<any>)[k] === 0)) {
					if (k !== 'p' || filters[k] !== 0) {
						filtersHash.push(k);
						filtersHash.push(encodeURIComponent((filters as KeyedMap<any>)[k] as string));
					}
				}
			}
			if (filtersHash && filtersHash.length) {
				newHash.push('f');
				newHash = newHash.concat(filtersHash);
			}
		}
	}

	let retHash = newHash.join('/');

	if (retHash === 'n/' + getHomeNode()) {
		retHash = '';
	}
	return retHash;
}

function hashToFormParams(hashTxt: string): IFormParameters {
	if (!hashTxt) {
		return { nodeId: getHomeNode(), filters: {} };
	}
	let nodeId!: NODE_ID;
	let recId!: RecId | typeof NEW_RECORD | string;
	let editable;
	let filters = {} as GetRecordsFilter;
	const hash = hashTxt.split('/');
	let i;
	while (hash.length) {
		i = hash.shift();
		switch (i) {
		case 'n':
			nodeId = parseInt(hash.shift()!);
			break;
		case 'r':
			recId = hash.shift()!;
			break;
		case 'e':
			editable = true;
			break;
		case 'j':
			filters = JSON.parse(decodeURIComponent(hash.shift()!));
			break;
		case 'f':
			while (hash.length) {
				const key = hash.shift()!;
				let val = decodeURIComponent(hash.shift()!);
				const numVal = parseInt(val); // return numeric values to filter
				if (val == numVal.toString()) {
					(filters as KeyedMap<any>)[key] = numVal;
				} else {
					(filters as KeyedMap<any>)[key] = val;
				}
			}
			break;
		default:
			debugError('Unknown hash entry: ' + i);
			break;
		}
	}
	if (recId !== NEW_RECORD) {
		if (recId) {
			recId = parseInt(recId as string);
		}
	}
	return { recId: recId as RecId, nodeId, editable, filters };
}

function getTopHashNodeId() {
	const hash = window.location.hash.substr(1);
	return hashToFormParams(hash.split(HASH_DIVIDER).pop()!).nodeId;
}

async function goToPageByHash() {
	const isPageLoading = !_oneFormShowed;

	const hash = window.location.hash.substr(1);
	const formParamsByLevels = hash.split(HASH_DIVIDER).map(hashToFormParams);

	const Stage = globals.Stage;
	let level;

	for (level = 0; level < formParamsByLevels.length && level < Stage.allForms.length; level++) {
		const formParams = formParamsByLevels[level];
		const form = Stage.allForms[level].form!;

		let isTheSame = form && formParams.nodeId === form.nodeId && formParams.recId === form.recId && Boolean(formParams.editable) === Boolean(form.props.editable);
		if (isTheSame) {
			if (JSON.stringify(form.formFilters) !== JSON.stringify(formParams.filters)) {
				isTheSame = false;
			}
		}
		if (!isTheSame) {
			if (level === 0) {
				Stage.destroyForm();
			} else {
				while (Stage.allForms.length > level + 1) {
					Stage.goBackIfModal();
				}
			}
			break;
		}
	}

	if (formParamsByLevels.length <= level) {
		while (formParamsByLevels.length <= level) {
			Stage.goBackIfModal();
			level--;
		}
	} else {
		while (level < formParamsByLevels.length) {
			const paramsToShow = formParamsByLevels[level];
			await Stage.showForm(paramsToShow.nodeId, paramsToShow.recId, paramsToShow.filters, paramsToShow.editable, level > 0, undefined, isPageLoading);
			level++;
		}
	}
}

const SKIP_HISTORY_NODES = {
	[NODE_ID.LOGIN]: true,
	[NODE_ID.REGISTRATION]: true,
	[NODE_ID.RESET_PASSWORD]: true
} as KeyedMap<boolean>;

async function goBack(isAfterDelete?: boolean) {
	const currentForm = globals.Stage.currentForm;

	if (isLitePage() && window.history.length < 2) {
		window.close();
	} else if (!isAfterDelete && window.history.length) {
		if (window.history.length > 0) {
			isHistoryChanging++;
			goBackUntilValidNode = true;
			window.history.back();
			isHistoryChanging--;
		} else {
			globals.Stage.showForm(getHomeNode());
		}
	} else if (currentForm && currentForm.recId) {
		globals.Stage.showForm(currentForm.nodeId, undefined, currentForm.formFilters);
	} else if (isAfterDelete) {
		globals.Stage.refreshForm();
	}
}

function assignFilters(desc: KeyedMap<any>, src: KeyedMap<any>): boolean {
	let leastOneUpdated = false;
	const keys = Object.keys(src);
	for (let i = keys.length; i > 0;) {
		i--;
		const name = keys[i];
		const value = src[name];
		if (desc[name] !== value) {
			desc[name] = value;
			leastOneUpdated = true;
		}
	}
	return leastOneUpdated;
}

let isHistoryChanging = 0;
let goBackUntilValidNode = false;

function updateHashLocation(replaceState = false) {
	if (isHistoryChanging) {
		return;
	}
	const newHash =
		'#' +
		globals.Stage.allForms
			.map((formEntry) => {
				const form = formEntry.form!;
				const filters = form.formFilters;
				return locationToHash(form.nodeId, form.recId!, filters, form.props.editable);
			})
			.join(HASH_DIVIDER);

	if (location.hash != newHash && location.hash != newHash.substr(1)) {
		if (replaceState) {
			history.replaceState(null, '', newHash);
		} else {
			history.pushState(null, '', newHash);
		}
	}
}

window.addEventListener('hashchange', () => {
	if (goBackUntilValidNode && SKIP_HISTORY_NODES[getTopHashNodeId()]) {
		goBack();
		return;
	} else {
		goBackUntilValidNode = false;
	}
	isHistoryChanging++;
	goToPageByHash();
	isHistoryChanging--;
});

let nodes: Map<NODE_ID, NodeDesc>;
let nodesRequested: Set<NODE_ID>;

function onNewUser() {
	nodes = new Map();
	nodesRequested = new Set();
}

onNewUser();

function waitForNodeInner(nodeId: NODE_ID, callback: (node: NodeDesc) => void) {
	if (nodes.has(nodeId)) {
		callback(nodes.get(nodeId)!);
	} else {
		setTimeout(() => {
			waitForNodeInner(nodeId, callback);
		}, 50);
	}
}

async function waitForNode(nodeId: NODE_ID): Promise<NodeDesc> {
	if (nodes.has(nodeId)) {
		return nodes.get(nodeId)!;
	}
	return new Promise((resolve) => {
		waitForNodeInner(nodeId, resolve);
	});
}

function getNodeIfPresentOnClient(nodeId: RecId) {
	return nodes.get(nodeId);
}

async function getNode(nodeId: NODE_ID, forceRefresh = false, callStack?: string): Promise<NodeDesc> {
	assert(!isNaN(nodeId), 'invalid NODE_ID');
	if (!callStack) {
		callStack = new Error('getNode called from: ').stack;
	}

	if (forceRefresh) {
		nodes.delete(nodeId);
		nodesRequested.delete(nodeId);
	}

	if (nodes.hasOwnProperty(nodeId)) {
		return nodes.get(nodeId)!;
	} else {
		if (nodesRequested.has(nodeId)) {
			return waitForNode(nodeId);
		} else {
			nodesRequested.add(nodeId);
			const data = (await getData('api/descNode', { nodeId })) as NodeDesc;
			normalizeNode(data);
			nodes.set(nodeId, data);
			return data;
		}
	}
}

function normalizeNode(node: NodeDesc) {
	node.fieldsById = {};
	node.fieldsByName = {};
	if (node.fields) {
		node.fields.forEach((f: FieldDesc, i) => {
			f.index = i;
			f.node = node;
			node.fieldsById![f.id] = f;
			node.fieldsByName![f.fieldName] = f;
			if (f.lang) {
				const fieldId = f.id as unknown as string; // language data fields have string ids of format: "77$ru"
				const parentField: FieldDesc = node.fieldsById![fieldId.split('$')[0] as any];
				if (!parentField.childrenFields) {
					parentField.childrenFields = [];
				}
				parentField.childrenFields.push(f);
				f.fieldNamePure = parentField.fieldName;
			} else {
				f.fieldNamePure = f.fieldName;
			}
		});
		node.rootFields = node.fields; // TODO remove
		// node.rootFields = node.fields.filter(f => !f.tab);
	}
	if (node.filters) {
		node.filtersList = Object.keys(node.filters)
			.sort((a, b) => {
				return node.filters![a].order! - node.filters![b].order!;
			})
			.map((k) => {
				return { value: k, name: node.filters![k].name };
			});
		if (node.defaultFilterId && !node.filters[node.defaultFilterId.id]) {
			node.defaultFilterId = node.filtersList.length ? node.filtersList[0].value : 0;
		}
		if (!node.defaultFilterId) {
			node.filtersList.unshift({ value: undefined, name: L('NO_FILTER') });
		}
	}

	const tabs = node.fields?.filter((f) => {
		if (f.fieldType === FIELD_TYPE.TAB) {
			f.tabFields = [];
			return true;
		}
	});
	if (tabs?.length) {
		if (tabs.length > 1) {
			node.tabs = tabs;
			let currentTab = tabs[0];
			for (let field of node.fields!) {
				if (field.fieldType === FIELD_TYPE.TAB) {
					currentTab = field;
				} else {
					currentTab.tabFields!.push(field);
					field.parenTab = currentTab;
				}
			}
		} else {
			node.fields = node.fields!.filter(t => t.fieldType !== FIELD_TYPE.TAB);
		}
	}
}

const _getRecordsClient = async (
	nodeId: NODE_ID,
	recId?: RecId | RecId[],
	filters?: undefined,
	editable?: boolean,
	viewMask?: VIEW_MASK | boolean,
	isForCustomList?: boolean,
	noLoadingIndicator?: boolean
): Promise<RecordData | RecordsData> => {
	/// #if DEBUG
	if (typeof recId !== 'undefined' && typeof filters !== 'undefined') {
		throw 'Can\'t use recId and filters in one request';
	}
	/// #endif

	const callStack = new Error('getRecordsClient called from: ').stack;

	const params: GetRecordsParams = { nodeId };

	if (typeof recId !== 'undefined') {
		params.recId = recId;
		if (editable) {
			params.viewFields = VIEW_MASK.EDITABLE;
		} else {
			params.viewFields = VIEW_MASK.READONLY;
		}
	} else {
		if (editable) {
			params.viewFields = VIEW_MASK.EDITABLE;
		} else {
			if (typeof viewMask === 'number') {
				params.viewFields = viewMask;
			} else if (isForCustomList) {
				params.viewFields = VIEW_MASK.CUSTOM_LIST;
			} else {
				params.viewFields = VIEW_MASK.LIST;
			}
		}
	}

	if (!nodes.hasOwnProperty(nodeId) && !nodesRequested.has(nodeId)) {
		params.descNode = true;
		nodesRequested.add(nodeId);
	}

	if (filters) {
		Object.assign(params, filters);
	}

	let data = await getData('api/', params, callStack, noLoadingIndicator);

	if (data.hasOwnProperty('node')) {
		if (nodes.has(nodeId)) {
			debugError('Node description overriding.');
		}
		normalizeNode(data.node);
		nodes.set(nodeId, data.node);
		delete data.node;
	}

	const node = await waitForNode(nodeId);

	data = data.data;
	if (data) {
		if (data.hasOwnProperty('items')) {
			for (const k in data.items) {
				decodeRecoreData(data.items[k], node);
			}
		} else {
			decodeRecoreData(data, node);
		}
	}
	return data;

};

const _fieldClasses = {} as KeyedMap<typeof BaseField>;
const fieldsEncoders = {} as KeyedMap<(val: any) => any>;
const fieldsDecoders = {} as KeyedMap<(val: any) => any>;

function getClassForField(type: FIELD_TYPE): typeof BaseField {
	if (_fieldClasses.hasOwnProperty(type)) {
		return _fieldClasses[type];
	}
	return _fieldClasses[FIELD_TYPE.TEXT];
}

function registerFieldClass(type: FIELD_TYPE, class_: new(props: BaseFieldProps) => BaseField) {
	if (_fieldClasses.hasOwnProperty(type)) {
		throw new Error('Class for field type ' + type + ' is registered already');
	}

	const c: typeof BaseField = class_ as any;

	if (c.decodeValue) {
		fieldsDecoders[type] = c.decodeValue;
		delete c.decodeValue;
	}
	if (c.encodeValue) {
		fieldsEncoders[type] = c.encodeValue;
	}

	_fieldClasses[type] = c;
}

function decodeRecoreData(data: KeyedMap<any>, node: NodeDesc) {
	for (const f of node.fields!) {
		if (data.hasOwnProperty(f.fieldName)) {
			if (fieldsDecoders.hasOwnProperty(f.fieldType)) {
				data[f.fieldName] = fieldsDecoders[f.fieldType](data[f.fieldName]);
			}
		}
	}
}
function encodeData(data: KeyedMap<any>, node: NodeDesc): RecordData {
	const ret = Object.assign({}, data);
	for (const f of node.fields!) {
		if (ret.hasOwnProperty(f.fieldName)) {
			if (fieldsEncoders.hasOwnProperty(f.fieldType)) {
				ret[f.fieldName] = fieldsEncoders[f.fieldType](ret[f.fieldName]);
			}
		}
	}
	return ret as RecordData;
}

const submitRecord = async (nodeId: NODE_ID, data: RecordDataWrite | RecordDataWriteDraftable, recId?: RecId): Promise<RecordSubmitResult | RecordSubmitResultNewRecord> => {
	if (Object.keys(data).length === 0) {
		throw 'Tried to submit empty object';
	}
	const node = await getNode(nodeId);
	return submitData('api/submit', { nodeId, recId, data: encodeData(data, node) });
};

let UID_counter = 1;
function UID(obj: KeyedMap<any>): number {
	if (!obj.hasOwnProperty('__uid109Hd')) {
		obj.__uid109Hd = UID_counter++;
	}
	return obj.__uid109Hd;
}

function idToImgURL(imgId: string | undefined, holder: string) {
	if (imgId) {
		if (imgId.indexOf('//') >= 0) {
			return imgId;
		}
		return 'images/uploads/' + imgId;
	}
	return 'images/placeholder_' + holder + '.png';
}

function idToFileUrl(fileId: string) {
	return 'uploads/file/' + fileId;
}

const __requestsOrder = [] as RequestRecord[];
function releaseQuiresOrder(requestRecord: RequestRecord) {
	const roi = __requestsOrder.indexOf(requestRecord);
	/// #if DEBUG
	if (roi < 0) {
		throw new Error('requests order is corrupted');
	}
	/// #endif
	requestRecord.reject(requestRecord.result);
	__requestsOrder.splice(roi, 1);
}

interface RequestRecord {
	url: string;
	resolve: (value: unknown) => void;
	reject: (value: unknown) => void;
	result?: any;
}

async function getData(url: string, params?: { [key: string]: any }, callStack?: string, noLoadingIndicator?: boolean): Promise<any> {
	return new Promise((resolve, reject) => {
		assert(url.indexOf('?') < 0, 'More parameters to data');

		const requestRecord: RequestRecord = {
			/// #if DEBUG
			url: url,
			/// #endif
			resolve,
			reject
		};

		if (!params) {
			params = {};
		}

		params.sessionToken = getSessionToken();

		__requestsOrder.push(requestRecord);

		if (!callStack) {
			callStack = new Error('GetData called from: ').stack;
		}

		if (!noLoadingIndicator && LoadingIndicator.instance) {
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
			})
			.then((data) => {
				handleAdditionalData(data, url);
				if (isAuthNeed(data)) {
					/** wait for user login */
				} else if (data.hasOwnProperty('result')) {
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
			// */
			.finally(() => {
				if (isOrderNeedDispose) {
					releaseQuiresOrder(requestRecord);
				}
				while (__requestsOrder.length > 0 && __requestsOrder[0].hasOwnProperty('result')) {
					const rr = __requestsOrder.shift()!;
					rr.resolve(rr.result);
				}
				if (!noLoadingIndicator) {
					LoadingIndicator.instance!.hide();
				}
			});
	});
}

const isUserHaveRole = (roleId: ROLE_ID) => {
	return User.currentUserData && User.currentUserData.userRoles[roleId];
};

const isAdmin = () => {
	return isUserHaveRole(ROLE_ID.ADMIN);
};

async function publishRecord(nodeId: NODE_ID, recId: RecId): Promise<RecordSubmitResult> {
	return submitRecord(nodeId, { status: STATUS.PUBLIC }, recId);
}

async function draftRecord(nodeId: NODE_ID, recId: RecId): Promise<RecordSubmitResult> {
	return submitRecord(nodeId, { status: STATUS.DRAFT }, recId);
}

function isAuthNeed(data: ApiResponse) {
	const token = getSessionToken();
	if (token && token !== 'guest-session' && data.error && (data.error.startsWith('Error: <auth>') || data.error.startsWith('<auth>'))) {
		clearSessionToken();
		globals.Stage.showForm(NODE_ID.LOGIN, NEW_RECORD, undefined, true);
		return true;
	} else if (data.error && (data.error.startsWith('Error: <access>') || data.error.startsWith('<access>'))) {
		if (globals.Stage.currentForm?.nodeId !== NODE_ID.LOGIN) {
			goToHome();
		}
		return true;
	}
}

function serializeForm(form: HTMLFormElement): FormData {
	const ret = new FormData(form);
	ret.set('sessionToken', User.currentUserData!.sessionToken);
	return ret;
}

let requestsInProgress = 0;

window.addEventListener('beforeunload', function (e) {
	if (requestsInProgress) {
		const confirmationMessage = L('DATA_NOT_SAVED');
		(e || window.event).returnValue = confirmationMessage;
		return confirmationMessage;
	}
});

function submitData(url: string, dataToSend: FormData, noProcessData?: boolean): Promise<any>;
function submitData(url: string, dataToSend: any): Promise<any>;
function submitData(url: string, dataToSend: any, noProcessData?: boolean): Promise<any> {
	LoadingIndicator.instance!.show();

	let body: FormData;
	if (!noProcessData) {
		if (getSessionToken()) {
			dataToSend.sessionToken = getSessionToken();
		}
		body = JSON.stringify(dataToSend) as unknown as FormData;
	} else {
		body = dataToSend;
	}

	const callStack = new Error('submitData called from: ').stack;
	const options: RequestInit = {
		method: 'POST',
		body
	};
	if (!noProcessData) {
		options.headers = headersJSON;
	}
	requestsInProgress++;
	return (
		fetch(__corePath + url, options)
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				handleAdditionalData(data, url);
				if (isAuthNeed(data)) {
					/** wait for user login */
				} else if (data.hasOwnProperty('result')) {
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
		// */
			.finally(() => {
				requestsInProgress--;
				LoadingIndicator.instance!.hide();
			})
	);
}

async function deleteRecordClient(name: string | null, nodeId: RecId, recId: RecId, noPrompt?: boolean, onYes?: () => void) {
	if (noPrompt) {
		if (onYes) {
			onYes();
		} else {
			await submitData('api/delete', { nodeId, recId });
			globals.Stage.dataDidModified(undefined);
			return true;
		}
	} else {
		const node = await getNode(nodeId);
		if (await showPrompt(L('SURE_DELETE', node.creationName || node.singleName) + ' "' + name + '"?', L('DELETE'), L('CANCEL'), 'times', 'caret-left', true)) {
			return deleteRecordClient(null, nodeId, recId, true, onYes);
		}
	}
}

function n2mValuesEqual(v1: LookupValue[] | undefined, v2: LookupValue[] | undefined) {
	if (!v1 && !v2) {
		return true;
	}

	if (Boolean(v1) !== Boolean(v2)) {
		return false;
	}

	if (v1?.length !== v2?.length) {
		return false;
	} else {
		for (const i in v1) {
			const i1 = v1![i as any];
			const i2 = v2![i as any];

			if (Boolean(i1) !== Boolean(i2)) {
				return false;
			}

			if (i1) {
				if (i1.id !== i2.id || i1.name !== i2.name) {
					return false;
				}
			}
		}
	}
	return true;
}

function renderIcon(name: string) {
	if (!name) {
		return undefined;
	}
	return R.p({ className: 'fa fa-' + name });
}

function isLitePage() {
	return window.location.href.includes(LITE_UI_PREFIX);
}

if (isLitePage()) {
	document.body.classList.add('lite-ui');
}

function getItem(name: string, def?: any) {
	if (typeof Storage !== 'undefined') {
		if (localStorage.hasOwnProperty(name)) {
			return JSON.parse(localStorage[name]);
		}
	}
	return def;
}

function setItem(name: string, val: any) {
	if (typeof Storage !== 'undefined') {
		assert(typeof val !== 'undefined', 'setItem() got an invalid value.');
		localStorage.setItem(name, JSON.stringify(val));
	}
}

function removeItem(name: string) {
	if (typeof Storage !== 'undefined') {
		localStorage.removeItem(name);
	}
}

function openIndexedDB() {
	const indexedDB = window.indexedDB;
	const openDB = indexedDB.open('MyDatabase', 1);
	openDB.onupgradeneeded = function () {
		const db: any = {};
		db.result = openDB.result;
		db.store = db.result.createObjectStore('MyObjectStore', { keyPath: 'id' });
	};
	return openDB;
}

interface DBRef {
	result: IDBDatabase;
	tx: IDBTransaction;
	store: IDBObjectStore;
}

function getStoreIndexedDB(openDB: IDBOpenDBRequest) {
	const db = {} as DBRef;
	db.result = openDB.result;
	db.tx = db.result.transaction('MyObjectStore', 'readwrite');
	db.store = db.tx.objectStore('MyObjectStore');
	return db;
}

function saveIndexedDB(filename: string, fileData: any) {
	return new Promise((resolve) => {
		const openDB = openIndexedDB();
		openDB.onsuccess = function () {
			const db = getStoreIndexedDB(openDB);
			db.store.put({ id: filename, data: fileData });
			resolve(true);
		};
	});
}

async function loadIndexedDB(filename: string): Promise<any> {
	return new Promise((resolve) => {
		const openDB = openIndexedDB();
		openDB.onsuccess = function () {
			const db = getStoreIndexedDB(openDB);

			let getData: IDBRequest<any>
;
			if (filename) {
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
	const openDB = openIndexedDB();
	openDB.onsuccess = function () {
		const db = getStoreIndexedDB(openDB);
		db.store.delete(filename);
	};
	return true;
}

function keepInWindow(bodyComponent: HTMLDivElement) {
	if (bodyComponent) {
		const body = bodyComponent as HTMLDivElement;

		const modalContainer = body.closest('.form-modal-container');
		let screenR = window.innerWidth - 10;
		let screenL = 0;
		if (modalContainer) {
			const cRect = modalContainer.getBoundingClientRect();
			screenR = cRect.right - 13;
			screenL = cRect.left;
		}

		const bodyRect = body.getBoundingClientRect();
		const l = bodyRect.left;
		const r = bodyRect.right;

		if (l < screenL) {
			addTranslateX(body, -l);
		} else {
			const out = r - screenR;
			if (out > 0) {
				addTranslateX(body, -out);
			}
		}
	}
}

function addTranslateX(element: HTMLDivElement, x: number) {
	x = Math.round(x);
	let curMatrix = element.style.transform;
	let ret: string[];
	if (curMatrix && curMatrix !== 'none') {
		ret = curMatrix.split(',');
		ret[4] = (parseInt(ret[4]) + x).toString();
	} else {
		ret = ['matrix(1, 0, 0, 1', x.toString(), '0)'];
	}

	element.style.transform = ret.join(',');
}

function strip_tags(input: any) {
	if (typeof input !== 'string') return input;
	let allowed = '<p><a><img><b><i><div><span>';
	allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
	const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
	const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

	return input.replace(commentsAndPhpTags, '').replace(tags, ($0, $1) => {
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	});
}

function checkFileSize(file: File) {
	const regex = new RegExp('.(' + ENV.ALLOWED_UPLOADS.join('|') + ')$', 'gi');

	if (!regex.exec(file.name)) {
		myAlert(L('TYPES_ALLOWED', ENV.ALLOWED_UPLOADS));
		return true;
	}

	if (file.size > ENV.MAX_FILE_SIZE_TO_UPLOAD) {
		myAlert(L('FILE_BIG', (file.size / 1000000.0).toFixed(0)) + getReadableUploadSize());
		return true;
	}
}

function getReadableUploadSize() {
	return (ENV.MAX_FILE_SIZE_TO_UPLOAD / 1000000.0).toFixed(0) + L('MB');
}

function reloadLocation() {
	setTimeout(() => {
		location.reload();
	}, 10);
}

let dictionary = {} as KeyedMap<string>;

function initDictionary(o: KeyedMap<string>) {
	dictionary = Object.assign(dictionary, o);
}

function L(key: LANG_KEYS | LANG_KEYS_CUSTOM, param?: any) {
	if (dictionary.hasOwnProperty(key)) {
		if (typeof param !== 'undefined') {
			return dictionary[key].replace('%', param);
		}
		return dictionary[key];
	}
	/// #if DEBUG
	debugger;
	throw new Error('NO_TRANSLATION FOR KEY: ' + key);
	/// #endif
	return '#' + key;
}

type ListRenderer = (node: NodeDesc, items: RecordData[], refreshFunction?: () => void) => ComponentChild;
const listRenderers = {} as KeyedMap<ListRenderer>;

function registerListRenderer(nodeId: RecId, renderFunction: ListRenderer) {
	if (listRenderers.hasOwnProperty(nodeId)) {
		throw 'List renderer for node ' + nodeId + ' is already registered.';
	}
	listRenderers[nodeId] = renderFunction;
}

function isPresentListRenderer(nodeId: RecId) {
	return listRenderers.hasOwnProperty(nodeId);
}

function getListRenderer(nodeId: RecId): ListRenderer {
	return listRenderers[nodeId];
}

function getSessionToken() {
	return getItem('cud-js-session-token');
}

function clearSessionToken() {
	removeItem('cud-js-session-token');
}

async function loginIfNotLoggedIn(enforced = false): Promise<UserSession> {
	if (User.currentUserData && User.currentUserData.id !== USER_ID.GUEST) {
		return User.currentUserData;
	} else {
		setItem('go-to-after-login', location.href);
		const backdrop = document.createElement('div');
		backdrop.className = 'modal-back' + (enforced ? '' : ' clickable');
		const iframe = document.createElement('iframe');
		iframe.className = 'login-iframe';
		iframe.src = location.origin + User.getLoginURL(true);
		backdrop.appendChild(iframe);
		document.body.appendChild(backdrop);
		backdrop.addEventListener('pointerdown', () => {
			backdrop.remove();
		});
		return new Promise((resolve) => {
			iframe.contentWindow!.onCurdJSLogin = (userData) => {
				User.currentUserData = userData;
				resolve(userData);
				backdrop.remove();
			};
		});
	}
}

let googleLoginAPIattached = false;
async function attachGoogleLoginAPI(enforces = false) {
	if (ENV.clientOptions.googleSigninClientId && !googleLoginAPIattached) {
		const meta = document.createElement('meta');
		meta.name = 'google-signin-client_id';
		meta.content = ENV.clientOptions.googleSigninClientId;
		document.getElementsByTagName('head')[0].appendChild(meta);
	}
	if (ENV.clientOptions.googleSigninClientId && (!googleLoginAPIattached || enforces)) {
		const s = document.createElement('script');
		s.src = 'https://apis.google.com/js/platform.js';
		s.async = true;
		s.defer = true;
		document.head.append(s);
		await new Promise((resolve) => {
			setInterval(() => {
				if (window.gapi) {
					resolve(true);
				}
			}, 10);
		});
	}
	googleLoginAPIattached = true;
}

const getRecordsClient: TypeGenerationHelper['gcm'] = _getRecordsClient as any;
const getRecordClient: TypeGenerationHelper['gc'] = _getRecordsClient as any;

const resetAutofocus = () => {
	autoFocusNow = true;
};
let autoFocusNow = true;
export const isAutoFocus = () => {
	const ret = autoFocusNow;
	if (autoFocusNow) {
		autoFocusNow = false;
		setTimeout(resetAutofocus, 10);
	}
	return ret;
};

export {
	__corePath,
	assignFilters,
	attachGoogleLoginAPI,
	checkFileSize,
	clearSessionToken,
	consoleDir,
	consoleLog,
	debugError,
	deleteIndexedDB,
	deleteRecordClient,
	draftRecord,
	getClassForField,
	getData,
	getItem,
	getListRenderer,
	getNode, getNodeIfPresentOnClient,
	getReadableUploadSize, getRecordClient, getRecordsClient, getSessionToken,
	goBack,
	goToHome,
	goToPageByHash,
	idToFileUrl,
	idToImgURL,
	initDictionary,
	INNER_DATE_TIME_FORMAT as innerDateTimeFormat,
	isAdmin,
	isLitePage,
	isPresentListRenderer,
	isRecordRestrictedForDeletion,
	isUserHaveRole,
	keepInWindow,
	L,
	loadIndexedDB,
	loginIfNotLoggedIn,
	myAlert,
	n2mValuesEqual,
	onNewUser,
	onOneFormShowed,
	publishRecord,
	readableDateFormat,
	readableTimeFormat,
	registerFieldClass,
	registerListRenderer,
	reloadLocation,
	removeItem,
	renderIcon,
	saveIndexedDB,
	serializeForm,
	setItem,
	showPrompt,
	sp,
	strip_tags,
	submitData,
	submitRecord,
	toReadableDate,
	toReadableDateTime,
	toReadableTime,
	UID,
	updateHashLocation
};
