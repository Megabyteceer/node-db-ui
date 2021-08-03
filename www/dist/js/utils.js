var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./notify.js", "./stage.js", "../both-side-utils.js", "./loading-indicator.js", "./debug-panel.js", "./forms/list.js", "./user.js", "./modal.js", "./main-frame.js", "./entry.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.debugError = exports.showForm = exports.refreshForm = exports.clearForm = exports.readableDateFormat = exports.readableTimeFormat = exports.serializeForm = exports.myAlert = exports.UID = exports.myPromt = exports.getNode = exports.getNodeData = exports.setFormFilter = exports.goBack = exports.updateHashLocation = exports.toReadableDatetime = exports.toReadableTime = exports.toReadableDate = exports.innerDatetimeFormat = exports.sp = exports.consoleDir = exports.consoleLog = exports.goToPageByHash = exports.loactionToHash = exports.addMixins = exports.isCurrentlyShowedLeftbarItem = exports.idToFileUrl = exports.idToImgURL = exports.publishRecord = exports.draftRecord = exports.submitRecord = exports.submitData = exports.deleteRecord = exports.createRecord = exports.n2mValuesEqual = exports.scrollToVisible = exports.removeItem = exports.setItem = exports.getItem = exports.backupCreationData = exports.getBackupData = exports.removeBackup = exports.keepInWindow = exports.popup = exports.loadJS = exports.strip_tags = exports.checkFileSize = exports.getReadableUploadSize = exports.submitErrorReport = exports.initDictionary = exports.L = exports.getData = exports.registerFieldClass = exports.getClassForField = exports.renderIcon = exports.isLitePage = void 0;
    var notify_js_1 = __importDefault(require("./notify.js"));
    var stage_js_1 = require("./stage.js");
    // @ts-ignore
    window.__corePath = 'https://node-db-ui.com:1443/core/';
    require("../both-side-utils.js");
    var loading_indicator_js_1 = __importDefault(require("./loading-indicator.js"));
    var debug_panel_js_1 = __importDefault(require("./debug-panel.js"));
    var list_js_1 = require("./forms/list.js");
    var user_js_1 = __importDefault(require("./user.js"));
    var modal_js_1 = __importDefault(require("./modal.js"));
    var main_frame_js_1 = require("./main-frame.js");
    var entry_js_1 = require("./entry.js");
    var headersJSON = new Headers();
    headersJSON.append("Content-Type", "application/json");
    function myAlert(txt, isSucess, autoHide, noDiscardByBackdrop) {
        if (!modal_js_1.default.instance) {
            alert(txt);
        }
        else {
            var className;
            if (isSucess) {
                className = "alert-bg alert-bg-success";
            }
            else {
                className = "alert-bg alert-bg-danger";
            }
            var modalId = modal_js_1.default.instance.show(entry_js_1.R.div({ className: className }, txt), noDiscardByBackdrop);
            if (autoHide) {
                setTimeout(function () {
                    modal_js_1.default.instance.hide(modalId);
                }, 1100);
            }
        }
    }
    exports.myAlert = myAlert;
    function myPromt(txt, yesLabel, noLabel, yesIcon, noIcon, discardByOutsideClick) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        if (!yesLabel) {
                            yesLabel = L('OK');
                        }
                        if (!yesIcon) {
                            yesIcon = 'check';
                        }
                        var noButton;
                        if (!noLabel) {
                            noLabel = L('CANCEL');
                        }
                        if (!noIcon) {
                            noIcon = 'times';
                        }
                        noButton = entry_js_1.R.button({
                            onClick: function () {
                                modal_js_1.default.instance.hide();
                                resolve(false);
                            }, className: 'clickable prompt-no-button'
                        }, renderIcon(noIcon), ' ', noLabel);
                        var body = entry_js_1.R.span({ className: 'prompt-body' }, txt, entry_js_1.R.div({ className: 'prompt-footer' }, noButton, entry_js_1.R.button({
                            onClick: function () {
                                modal_js_1.default.instance.hide();
                                resolve(true);
                            }, className: 'clickable prompt-yes-button'
                        }, renderIcon(yesIcon), ' ', yesLabel)));
                        modal_js_1.default.instance.show(body, !discardByOutsideClick);
                    })];
            });
        });
    }
    exports.myPromt = myPromt;
    function debugError(txt) {
        /// #if DEBUG
        debugger;
        debug_panel_js_1.default.instance.addEntry('ERROR: ' + txt, true);
        /// #endif
        submitErrorReport(txt, 'at debugError');
        console.error(txt);
    }
    exports.debugError = debugError;
    var triesGotoHome = 0;
    var oneFormShowed;
    function handleError(error, url, callStack) {
        error = error.error || error;
        if (!callStack) {
            callStack = '';
        }
        submitErrorReport(url + JSON.stringify(error), callStack);
        /// #if DEBUG
        if (error.debug) {
            error.debug.message = (error.message || error) + callStack;
            error.debug.request = url;
        }
        ;
        if (debug_panel_js_1.default.instance) {
            debug_panel_js_1.default.instance.addEntry((error.debug || error), true, url);
        }
        else {
            throw error;
        }
        return;
        /// #endif
        if (!oneFormShowed) {
            if (triesGotoHome < 5) {
                triesGotoHome++;
                goToHome();
            }
        }
        else {
            if (error.message) {
                myAlert(error.message);
            }
            else {
                myAlert(L("CONNECTION_ERR"), false, true);
            }
        }
        if (error.hasOwnProperty('debug')) {
            consoleLog(error.debug.stack.join('\n'));
        }
    }
    function consoleLog(txt) {
        /// #if DEBUG
        console.log(txt);
        /// #endif
    }
    exports.consoleLog = consoleLog;
    function consoleDir(o) {
        /// #if DEBUG
        console.dir(o);
        /// #endif
    }
    exports.consoleDir = consoleDir;
    function sp(event) {
        event.stopPropagation();
        if (event.cancelable) {
            event.preventDefault();
        }
    }
    exports.sp = sp;
    function handleAdditionalData(data, url) {
        if (data.hasOwnProperty('debug')) {
            /// #if DEBUG
            data.debug.request = url;
            debug_panel_js_1.default.instance.addEntry(data.debug);
            /// #endif
            delete data.debug;
        }
        if (data.hasOwnProperty('notifications')) {
            data.notifications.some(function (n) {
                notify_js_1.default.add(n);
            });
        }
    }
    function clearForm() {
        stage_js_1.Stage.instance._setFormData();
    }
    exports.clearForm = clearForm;
    var innerDatetimeFormat = 'YYYY-MM-DD HH:mm:ss';
    exports.innerDatetimeFormat = innerDatetimeFormat;
    var readableDateFormat = 'D MMMM YYYY';
    exports.readableDateFormat = readableDateFormat;
    var readableTimeFormat = 'H:mm';
    exports.readableTimeFormat = readableTimeFormat;
    function toReadableDate(d) {
        if (d) {
            d = d.format(readableDateFormat);
            if (d === 'Invalid date')
                return '';
            return d;
        }
        return '';
    }
    exports.toReadableDate = toReadableDate;
    function toReadableDatetime(d) {
        if (d) {
            d = d.format(readableDateFormat + ' ' + readableTimeFormat);
            if (d === 'Invalid date')
                return '';
            return d;
        }
        return '';
    }
    exports.toReadableDatetime = toReadableDatetime;
    function toReadableTime(d) {
        if (d) {
            d = d.format(readableTimeFormat);
            if (d === 'Invalid date')
                return '';
            return d;
        }
        return '';
    }
    exports.toReadableTime = toReadableTime;
    function goToHome() {
        if (typeof (main_frame_js_1.ENV.HOME_NODE) !== 'undefined') {
            showForm(main_frame_js_1.ENV.HOME_NODE);
        }
        else {
            location.href = '/';
        }
    }
    function loactionToHash(nodeId, recId, filters, editable) {
        var newHash = [
            'n', encodeURIComponent(nodeId)
        ];
        if (recId || recId === 0) {
            newHash.push('r');
            newHash.push(recId);
        }
        if (editable) {
            newHash.push('e');
        }
        if (filters && (Object.keys(filters).length > 0)) {
            var copmlicatedFilters = false;
            for (var k in filters) {
                var v = filters[k];
                if (typeof v === 'object') {
                    copmlicatedFilters = true;
                    break;
                }
            }
            if (copmlicatedFilters) {
                newHash.push('j');
                newHash.push(encodeURIComponent(JSON.stringify(filters)));
            }
            else {
                var filtersHash;
                filtersHash = [];
                for (var k in filters) {
                    if (filters.hasOwnProperty(k) && (filters[k] || filters[k] === 0)) {
                        if ((k !== 'p') || (filters[k] !== 0)) {
                            var v = filters[k];
                            filtersHash.push(k);
                            filtersHash.push(encodeURIComponent(filters[k]));
                        }
                    }
                }
                if (filtersHash && filtersHash.length) {
                    newHash.push('f');
                    newHash = newHash.concat(filtersHash);
                }
            }
        }
        var retHash = newHash.join('/');
        if (retHash === 'n/' + main_frame_js_1.ENV.HOME_NODE) {
            retHash = '';
        }
        retHash = '#' + retHash;
        return retHash;
    }
    exports.loactionToHash = loactionToHash;
    window.currentFormParameters = {};
    function isCurrentlyShowedLeftbarItem(item) {
        if (item.id === false) {
            if (!currentFormParameters.filters || (Object.keys(currentFormParameters.filters).length === 0)) {
                return item.isDefault;
            }
            return item.tab === currentFormParameters.filters.tab;
        }
        return currentFormParameters.nodeId === item.id &&
            currentFormParameters.recId === item.recId &&
            currentFormParameters.editable === item.editable;
    }
    exports.isCurrentlyShowedLeftbarItem = isCurrentlyShowedLeftbarItem;
    ;
    function goToPageByHash() {
        var hashTxt = window.location.hash.substr(1);
        if (hashTxt) {
            var nodeId;
            var recId;
            var editable;
            var filters;
            var hash = hashTxt.split('/');
            var i;
            while (hash.length) {
                i = hash.shift();
                switch (i) {
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
                        while (hash.length) {
                            var key = hash.shift();
                            var val = decodeURIComponent(hash.shift());
                            var numVal = parseInt(val); // return numeric values to filter
                            if (val == numVal.toString()) {
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
            if (recId !== 'new') {
                if (recId) {
                    recId = parseInt(recId);
                }
            }
            showForm(nodeId, recId, filters, editable);
        }
        else {
            goToHome();
        }
    }
    exports.goToPageByHash = goToPageByHash;
    ;
    function goBack(isAfterDelete) {
        if (isLitePage() && window.history.length < 2) {
            if (window.location.href.indexOf('#n/28/f/p/*/formTitle') > 0) {
                refreshForm();
            }
            else {
                window.close();
            }
        }
        else if (!isAfterDelete && window.history.length) {
            isHistoryChanging = true;
            if (window.history.length > 0) {
                window.history.back();
            }
            else {
                showForm(main_frame_js_1.ENV.HOME_NODE);
            }
        }
        else if (currentFormParameters.recId) {
            showForm(currentFormParameters.nodeId, undefined, currentFormParameters.filters);
        }
        else if (isAfterDelete) {
            refreshForm();
        }
    }
    exports.goBack = goBack;
    var hashUpdateTimeout;
    var isHistoryChanging = false;
    function updateHashLocation(filters) {
        if (hashUpdateTimeout) {
            consoleLog('Hash updated more that once');
            clearTimeout(hashUpdateTimeout);
            hashUpdateTimeout = false;
        }
        hashUpdateTimeout = setTimeout(function () {
            hashUpdateTimeout = false;
            if (!filters) {
                filters = currentFormParameters.filters;
            }
            var newHash = loactionToHash(currentFormParameters.nodeId, currentFormParameters.recId, filters, currentFormParameters.editable);
            if ((location.hash != newHash) && !isHistoryChanging) {
                if ((window.location.hash.split('/f/').shift() === (newHash.split('/f/').shift())) && history.replaceState) { //only filters is changed
                    history.replaceState(null, null, newHash);
                }
                else if (history.pushState) {
                    history.pushState(null, null, newHash);
                }
                else {
                    location.hash = newHash.replace('#', '');
                }
            }
            isHistoryChanging = false;
        }, 1);
    }
    exports.updateHashLocation = updateHashLocation;
    $(window).on('hashchange', function () {
        isHistoryChanging = true;
        goToPageByHash();
    });
    function refreshForm() {
        showForm(currentFormParameters.nodeId, currentFormParameters.recId, currentFormParameters.filters, currentFormParameters.editable);
    }
    exports.refreshForm = refreshForm;
    function showForm(nodeId, recId, filters, editable) {
        if (typeof nodeId === 'undefined') {
            stage_js_1.Stage.instance.setCustomClass(filters.c, filters);
            currentFormParameters.nodeId = nodeId;
            currentFormParameters.recId = recId;
            currentFormParameters.filters = filters;
            currentFormParameters.editable = editable;
        }
        else {
            if (!filters)
                filters = {};
            if (recId === 'new') {
                createRecord(nodeId, filters);
            }
            else {
                getNodeData(nodeId, recId, (!recId && recId !== 0) ? filters : undefined, editable, false, list_js_1.isPresentListRenderer(nodeId)).then(function (data) {
                    setFormData(nodeId, data, recId, filters, editable);
                });
            }
        }
    }
    exports.showForm = showForm;
    function setFormData(nodeId, data, recId, filters, editable) {
        if (!filters) {
            throw 'filters must be an object.';
        }
        if (currentFormParameters.nodeId && ((currentFormParameters.nodeId !== nodeId) || (currentFormParameters.recId !== recId))) {
            window.scrollTo(0, 0);
        }
        currentFormParameters.nodeId = nodeId;
        currentFormParameters.recId = recId;
        currentFormParameters.filters = filters;
        currentFormParameters.editable = editable;
        updateHashLocation();
        getNode(nodeId).then(function (node) {
            stage_js_1.Stage.instance._setFormData(node, data, recId, filters, editable);
            oneFormShowed = true;
        });
    }
    function setFormFilter(name, val) {
        if (stage_js_1.Stage.instance.setFormFilter(name, val)) {
            updateHashLocation();
        }
        oneFormShowed = true;
    }
    exports.setFormFilter = setFormFilter;
    var nodes = {};
    var nodesRequested = {};
    function waitForNodeInner(nodeId, callback) {
        if (nodes.hasOwnProperty(nodeId)) {
            callback(nodes[nodeId]);
        }
        else {
            setTimeout(function () {
                waitForNodeInner(nodeId, callback);
            }, 50);
        }
    }
    function waitForNode(nodeId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (nodes.hasOwnProperty(nodeId)) {
                    return [2 /*return*/, nodes[nodeId]];
                }
                return [2 /*return*/, new Promise(function (resolve) {
                        waitForNodeInner(nodeId, resolve);
                    })];
            });
        });
    }
    function getNode(nodeId, forceRefresh, callStack) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!callStack) {
                            callStack = new Error('getNode called from: ').stack;
                        }
                        if (forceRefresh) {
                            delete (nodes[nodeId]);
                            delete (nodesRequested[nodeId]);
                        }
                        if (!nodes.hasOwnProperty(nodeId)) return [3 /*break*/, 1];
                        return [2 /*return*/, nodes[nodeId]];
                    case 1:
                        if (!nodesRequested.hasOwnProperty(nodeId)) return [3 /*break*/, 2];
                        return [2 /*return*/, waitForNode(nodeId)];
                    case 2:
                        nodesRequested[nodeId] = true;
                        return [4 /*yield*/, getData('api/descNode', { nodeId: nodeId })];
                    case 3:
                        data = _a.sent();
                        normalizeNode(data);
                        nodes[nodeId] = data;
                        return [2 /*return*/, data];
                }
            });
        });
    }
    exports.getNode = getNode;
    function normalizeNode(node) {
        node.fieldsById = [];
        if (node.fields) {
            node.fields.forEach(function (f, i) {
                f.index = i;
                f.node = node;
                node.fieldsById[f.id] = f;
                if (f.enum) {
                    f.enumNamesById = {};
                    for (var _i = 0, _a = f.enum; _i < _a.length; _i++) {
                        var e = _a[_i];
                        f.enumNamesById[e.value] = e.name;
                    }
                }
            });
        }
    }
    function getNodeData(nodeId, recId, filters, editable, isForRefList, isForCustomList, noLoadingIndicator, onError) {
        return __awaiter(this, void 0, void 0, function () {
            var callStack, params, data, node, k, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /// #if DEBUG
                        if (typeof (recId) !== 'undefined' && typeof (filters) !== 'undefined') {
                            throw 'Can\'t use recId and filters in one request';
                        }
                        callStack = new Error('getNodeData called from: ').stack;
                        params = { nodeId: nodeId };
                        if (typeof (recId) !== 'undefined') {
                            params.recId = recId;
                            if (editable) {
                                params.viewFields = 1;
                            }
                            else {
                                params.viewFields = 4;
                            }
                        }
                        else {
                            if (editable) {
                                params.viewFields = 1;
                            }
                            else {
                                if (isForRefList) {
                                    params.viewFields = 8;
                                }
                                else if (isForCustomList) {
                                    params.viewFields = 16;
                                }
                                else {
                                    params.viewFields = 2;
                                }
                            }
                        }
                        if (!nodes.hasOwnProperty(nodeId) && !nodesRequested.hasOwnProperty(nodeId)) {
                            params.descNode = true;
                            nodesRequested[nodeId] = true;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        if (filters) {
                            Object.assign(params, filters);
                        }
                        return [4 /*yield*/, getData('api/', params, callStack, noLoadingIndicator)];
                    case 2:
                        data = _a.sent();
                        if (data.hasOwnProperty('node')) {
                            if (nodes[nodeId]) {
                                debugError('Node description owerriding.');
                            }
                            normalizeNode(data.node);
                            nodes[nodeId] = data.node;
                            delete (data.node);
                        }
                        return [4 /*yield*/, waitForNode(nodeId)];
                    case 3:
                        node = _a.sent();
                        data = data.data;
                        if (data) {
                            if (data.hasOwnProperty('items')) {
                                for (k in data.items) {
                                    decodeData(data.items[k], node);
                                }
                            }
                            else {
                                decodeData(data, node);
                            }
                        }
                        return [2 /*return*/, data];
                    case 4:
                        err_1 = _a.sent();
                        delete (nodesRequested[nodeId]);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    exports.getNodeData = getNodeData;
    var _fieldClasses = {};
    var fieldsEncoders = [];
    var fieldsDecoders = [];
    function getClassForField(type) {
        if (_fieldClasses.hasOwnProperty(type)) {
            return _fieldClasses[type];
        }
        return _fieldClasses[FIELD_1_TEXT];
    }
    exports.getClassForField = getClassForField;
    function registerFieldClass(type, class_) {
        if (_fieldClasses.hasOwnProperty(type)) {
            throw new Error('Class for field type ' + type + ' is registered already');
        }
        if (class_.hasOwnProperty('decodeValue')) {
            fieldsDecoders[type] = class_.decodeValue;
            delete (class_.decodeValue);
        }
        if (class_.hasOwnProperty('encodeValue')) {
            fieldsEncoders[type] = class_.encodeValue;
            delete (class_.encodeValue);
        }
        _fieldClasses[type] = class_;
    }
    exports.registerFieldClass = registerFieldClass;
    function decodeData(data, node) {
        for (var k in node.fields) {
            var f = node.fields[k];
            if (data.hasOwnProperty(f.fieldName)) {
                if (fieldsDecoders.hasOwnProperty(f.fieldType)) {
                    data[f.fieldName] = fieldsDecoders[f.fieldType](data[f.fieldName]);
                }
            }
        }
    }
    function encodeData(data, node) {
        var ret = Object.assign({}, data);
        for (var k in node.fields) {
            var f = node.fields[k];
            if (ret.hasOwnProperty(f.fieldName)) {
                if (fieldsEncoders.hasOwnProperty(f.fieldType)) {
                    ret[f.fieldName] = fieldsEncoders[f.fieldType](ret[f.fieldName]);
                }
            }
        }
        return ret;
    }
    function addMixins(Class, mixins) {
        Object.assign(Class.prototype, mixins);
    }
    exports.addMixins = addMixins;
    function submitRecord(nodeId, data, recId) {
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (Object.keys(data).length === 0) {
                            throw 'Tried to submit emty object';
                        }
                        return [4 /*yield*/, getNode(nodeId)];
                    case 1:
                        node = _a.sent();
                        return [2 /*return*/, submitData('api/submit', { nodeId: nodeId, recId: recId, data: encodeData(data, node) })];
                }
            });
        });
    }
    exports.submitRecord = submitRecord;
    var UID_counter = 0;
    function UID(obj) {
        if (!obj.hasOwnProperty('__uid109Hd')) {
            obj.__uid109Hd = UID_counter++;
        }
        return obj.__uid109Hd;
    }
    exports.UID = UID;
    function idToImgURL(imgId, holder) {
        if (imgId) {
            return 'images/uploads/' + imgId;
        }
        return 'images/placeholder_' + holder + '.png';
    }
    exports.idToImgURL = idToImgURL;
    function idToFileUrl(fileId) {
        return 'uploads/file/' + fileId;
    }
    exports.idToFileUrl = idToFileUrl;
    var __requestsOrder = [];
    function getData(url, params, callStack, noLoadingIndicator) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        assert(url.indexOf('?') < 0, 'More parameters to data');
                        var requestRecord = {
                            /// #if DEBUG
                            url: url,
                            /// #endif
                            resolve: resolve,
                        };
                        if (!params) {
                            params = {};
                        }
                        params.sessionToken = user_js_1.default.sessionToken;
                        __requestsOrder.push(requestRecord);
                        if (!callStack) {
                            callStack = new Error('GetData called from: ').stack;
                        }
                        if (!noLoadingIndicator && loading_indicator_js_1.default.instance) {
                            loading_indicator_js_1.default.instance.show();
                        }
                        else {
                            noLoadingIndicator = true;
                        }
                        fetch(__corePath + url, {
                            method: 'POST',
                            headers: headersJSON,
                            body: JSON.stringify(params)
                        })
                            .then(function (res) {
                            return res.json();
                        }).then(function (data) {
                            handleAdditionalData(data, url);
                            if (isAuthNeed(data)) {
                                alert('authHerePopup');
                                //authHerePopup
                            }
                            else if (data.hasOwnProperty('result')) {
                                requestRecord.result = data.result;
                            }
                            else {
                                var roi = __requestsOrder.indexOf(requestRecord);
                                /// #if DEBUG
                                if (roi < 0) {
                                    throw new Error('requests order is corrupted');
                                }
                                /// #endif
                                __requestsOrder.splice(roi, 1);
                                handleError(data, url, callStack);
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
                        
                                handleError(error, url, callStack);
                                
                                myAlert(L('CHECK_CONNECTION'), false, true);
                            })
                            //*/
                            .finally(function () {
                            while (__requestsOrder.length > 0 && __requestsOrder[0].hasOwnProperty('result')) {
                                var rr = __requestsOrder.shift();
                                rr.resolve(rr.result);
                            }
                            if (!noLoadingIndicator) {
                                loading_indicator_js_1.default.instance.hide();
                            }
                        });
                    })];
            });
        });
    }
    exports.getData = getData;
    function publishRecord(nodeId, recId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, submitRecord(nodeId, { status: 1 }, recId)];
            });
        });
    }
    exports.publishRecord = publishRecord;
    function draftRecord(nodeId, recId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, submitRecord(nodeId, { status: 2 }, recId)];
            });
        });
    }
    exports.draftRecord = draftRecord;
    function isAuthNeed(data) {
        return (data.isGuest && window.isUserHaveRole && isUserHaveRole(3)) || (data.error && (data.error.message === 'auth'));
    }
    function serializeForm(form) {
        var obj = $(form);
        /* ADD FILE TO PARAM AJAX */
        var formData = new FormData();
        $.each($(obj).find("input[type='file']"), function (i, tag) {
            // @ts-ignore
            $.each($(tag)[0].files, function (i, file) {
                // @ts-ignore
                formData.append(tag.name, file);
            });
        });
        formData.append('sessionToken', user_js_1.default.sessionToken);
        var params = $(obj).serializeArray();
        $.each(params, function (i, val) {
            formData.append(val.name, val.value);
        });
        return formData;
    }
    exports.serializeForm = serializeForm;
    function submitData(url, dataToSend, noProcessData) {
        loading_indicator_js_1.default.instance.show();
        if (!noProcessData) {
            dataToSend.sessionToken = user_js_1.default.sessionToken;
            dataToSend = JSON.stringify(dataToSend);
        }
        var callStack = new Error('submitData called from: ').stack;
        var options = {
            method: 'POST',
            body: dataToSend
        };
        if (!noProcessData) {
            options.headers = headersJSON;
        }
        return fetch(__corePath + url, options)
            .then(function (res) {
            return res.json();
        })
            .then(function (data) {
            dataDidModifed();
            handleAdditionalData(data, url);
            if (isAuthNeed(data)) {
                alert('authHerePopup');
                //authHerePopup
            }
            else if (data.hasOwnProperty('result')) {
                return data.result;
            }
            else {
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
            .finally(function () {
            loading_indicator_js_1.default.instance.hide();
        });
    }
    exports.submitData = submitData;
    function deleteRecord(name, nodeId, recId, noPromt, onYes) {
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!noPromt) return [3 /*break*/, 4];
                        if (!onYes) return [3 /*break*/, 1];
                        onYes();
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, submitData('api/delete', { nodeId: nodeId, recId: recId })];
                    case 2:
                        _a.sent();
                        dataDidModifed();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, getNode(nodeId)];
                    case 5:
                        node = _a.sent();
                        return [4 /*yield*/, myPromt(L('SURE_DELETE', (node.creationName || node.singleName)) + ' "' + name + '"?', L('CANCEL'), L('DELETE'), 'caret-left', 'times', true)];
                    case 6:
                        if (!(_a.sent())) {
                            return [2 /*return*/, deleteRecord(null, nodeId, recId, true, onYes)];
                        }
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    exports.deleteRecord = deleteRecord;
    function createRecord(nodeId, parameters) {
        if (!parameters) {
            parameters = {};
        }
        getNode(nodeId).then(function (node) {
            var emptyData = {};
            if (node.draftable && (node.prevs & PREVS_PUBLISH)) { //access to publish records
                emptyData.isP = 1;
            }
            setFormData(nodeId, emptyData, 'new', parameters, true);
        });
    }
    exports.createRecord = createRecord;
    function redirect(href) {
        document.location.href = href;
    }
    function n2mValuesEqual(v1, v2) {
        if (!v1 && !v2) {
            return true;
        }
        if (Boolean(v1) !== Boolean(v2)) {
            return false;
        }
        if (v1.length != v2.length) {
            return false;
        }
        else {
            for (var i in v1) {
                var i1 = v1[i];
                var i2 = v2[i];
                if (Boolean(i1) !== Boolean(i2)) {
                    return false;
                }
                if (i1) {
                    if ((i1.id !== i2.id) || (i1.name !== i2.name)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    exports.n2mValuesEqual = n2mValuesEqual;
    function renderIcon(name) {
        if (!name) {
            name = 'circle-o';
        }
        return entry_js_1.R.p({ className: 'fa fa-' + name });
    }
    exports.renderIcon = renderIcon;
    function isLitePage() {
        return window.location.href.indexOf('?liteUI') >= 0;
    }
    exports.isLitePage = isLitePage;
    function scrollToVisible(elem, doNotShake) {
        if (doNotShake === void 0) { doNotShake = false; }
        if (elem) {
            var $elem = $(ReactDOM.findDOMNode(elem));
            if (!$elem.is(":visible")) {
                return;
            }
            var $window = $(window);
            var docViewTop = $window.scrollTop();
            var docViewBottom = docViewTop + $window.height();
            var elemTop = $elem.offset().top - 40;
            var elemBottom = elemTop + $elem.height() + 40;
            if (elemTop < docViewTop) {
                $('html,body').animate({ scrollTop: elemTop }, 300, undefined, function () { !doNotShake && shakeDomElement($elem); });
            }
            else if (elemBottom > docViewBottom) {
                $('html,body').animate({ scrollTop: Math.min(elemBottom - $window.height(), elemTop) }, 300, undefined, function () { !doNotShake && shakeDomElement($elem); });
            }
            else {
                !doNotShake && shakeDomElement($elem);
            }
        }
    }
    exports.scrollToVisible = scrollToVisible;
    function shakeDomElement(e) {
        e[0].classList.remove('shake');
        setTimeout(function () {
            e[0].classList.add('shake');
        }, 10);
        setTimeout(function () {
            e[0].classList.remove('shake');
        }, 1000);
    }
    ;
    function getItem(name, def) {
        if (typeof (Storage) !== "undefined") {
            if (localStorage.hasOwnProperty(name)) {
                return JSON.parse(localStorage[name]);
            }
        }
        return def;
    }
    exports.getItem = getItem;
    function setItem(name, val) {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem(name, JSON.stringify(val));
        }
    }
    exports.setItem = setItem;
    function removeItem(name) {
        if (typeof (Storage) !== "undefined") {
            localStorage.removeItem(name);
        }
    }
    exports.removeItem = removeItem;
    function backupCreationData(nodeId, data, backupPrefix) {
        setItem('backup_for_node' + nodeId + (backupPrefix ? backupPrefix : ''), data);
    }
    exports.backupCreationData = backupCreationData;
    function getBackupData(nodeId, backupPrefix) {
        return getItem('backup_for_node' + nodeId + (backupPrefix ? backupPrefix : '')) || {};
    }
    exports.getBackupData = getBackupData;
    function removeBackup(nodeId, backupPrefix) {
        removeItem('backup_for_node' + nodeId + (backupPrefix ? backupPrefix : ''));
    }
    exports.removeBackup = removeBackup;
    function keepInWindow(body) {
        if (body) {
            body = $(ReactDOM.findDOMNode(body));
            var x = body.offset().left;
            var w = body.outerWidth();
            var screenW = window.innerWidth;
            if (x < 0) {
                addTranslateX(body, -x);
            }
            else {
                var out = (x + w) - screenW;
                if (out > 0) {
                    addTranslateX(body, -out);
                }
            }
        }
    }
    exports.keepInWindow = keepInWindow;
    function addTranslateX(element, x) {
        var curMatrix = element.css('transform');
        if (curMatrix !== 'none') {
            curMatrix = curMatrix.split(',');
            curMatrix[4] = parseInt(curMatrix[4]) + x;
        }
        else {
            curMatrix = ['matrix(1', 0, 0, 1, x, '0)'];
        }
        element.css({ 'transform': curMatrix.join(',') });
    }
    function dataDidModifed() {
        try {
            if (window.hasOwnProperty('reloadParentIfSomethingUpdated_qwi012d')) {
                window.reloadParentIfSomethingUpdated_qwi012d();
            }
        }
        catch (e) { }
        ;
    }
    function popup(url, W, reloadParentIfSomethingUpdated) {
        if (W === void 0) { W = 900; }
        var dataDidModifedInChildren;
        var leftVal = (screen.width - W) / 2;
        var topVal = (screen.height - 820) / 2;
        var popUp = window.open('?liteUI' + url, '', 'width=' + W + ',height=820,resizable=yes,scrollbars=yes,status=yes,menubar=no,toolbar=no,left=' + leftVal + ',top=' + topVal);
        if (!popUp) {
            myAlert(L('ALLOW_POPUPS'));
            return;
        }
        if (reloadParentIfSomethingUpdated) {
            popUp.reloadParentIfSomethingUpdated_qwi012d = function () {
                dataDidModifedInChildren = true;
            };
            var intr = setInterval(function () {
                if (popUp.closed) {
                    if (dataDidModifedInChildren) {
                        location.reload();
                    }
                    clearInterval(intr);
                }
            }, 100);
        }
    }
    exports.popup = popup;
    var loadedScripts;
    function loadJS(name) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!loadedScripts) {
                    loadedScripts = {};
                }
                if (loadedScripts[name] === true) {
                    return [2 /*return*/];
                }
                if (!loadedScripts[name]) {
                    loadedScripts[name] = new Promise(function (resolve) {
                        loading_indicator_js_1.default.instance.show();
                        var script = document.createElement('script');
                        script.onload = function () {
                            loading_indicator_js_1.default.instance.hide();
                            loadedScripts[name] = true;
                            resolve();
                        };
                        script.src = name;
                        script.type = "module";
                        document.head.appendChild(script);
                    });
                }
                return [2 /*return*/, loadedScripts[name]];
            });
        });
    }
    exports.loadJS = loadJS;
    function strip_tags(input) {
        if (typeof (input !== 'string'))
            return input;
        var allowed = '<p><a><img><b><i><div><span>';
        allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
        var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
    }
    exports.strip_tags = strip_tags;
    function checkFileSize(file) {
        var regex = new RegExp('\.(' + main_frame_js_1.ENV.ALLOWED_UPLOADS.join('|') + ')$', 'gi');
        if (!regex.exec(file.name)) {
            myAlert(L('TYPES_ALLOWED', main_frame_js_1.ENV.ALLOWED_UPLOADS));
            return true;
        }
        if (file.size > main_frame_js_1.ENV.MAX_FILESIZE_TO_UPLOAD) {
            myAlert(L('FILE_BIG', (file.size / 1000000.0).toFixed(0)) + getReadableUploadSize());
            return true;
        }
    }
    exports.checkFileSize = checkFileSize;
    function getReadableUploadSize() {
        return (main_frame_js_1.ENV.MAX_FILESIZE_TO_UPLOAD / 1000000.0).toFixed(0) + L('MB');
    }
    exports.getReadableUploadSize = getReadableUploadSize;
    var __errorsSent = {};
    function submitErrorReport(name, stack) {
        /// #if DEBUG
        return;
        /// #endif
        if (typeof (name) !== 'string') {
            name = JSON.stringify(name);
        }
        name += '; ' + navigator.appVersion + '; ';
        var k = stack;
        if (!__errorsSent.hasOwnProperty(k)) {
            __errorsSent[k] = 1;
            submitRecord(81, {
                name: name + ' (' + window.location.href + ')',
                stack: stack.substring(0, 3999)
            });
        }
    }
    exports.submitErrorReport = submitErrorReport;
    var dictionary_0u23hiewf = {};
    function initDictionary(o) {
        dictionary_0u23hiewf = Object.assign(dictionary_0u23hiewf, o);
    }
    exports.initDictionary = initDictionary;
    function L(key, param) {
        if (dictionary_0u23hiewf.hasOwnProperty(key)) {
            if (typeof (param) !== 'undefined') {
                return dictionary_0u23hiewf[key].replace('%', param);
            }
            return dictionary_0u23hiewf[key];
        }
        /// #if DEBUG
        throw new Error(L('NO_TRANSLATION', key));
        /// #endif
        return ('#' + key);
    }
    exports.L = L;
});
//# sourceMappingURL=utils.js.map