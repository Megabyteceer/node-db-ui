import { getNodeByTableName } from '../../../core/get-node-by-table-name';
import { assert } from './assert';
import { isServer } from './bs-utils';
import { E, FIELD_TYPE, type TypeGenerationHelper } from './types/generated';

export enum SERVER_SIDE_FORM_EVENTS {
	beforeCreate = 'beforeCreate',
	afterCreate = 'afterCreate',
	beforeUpdate = 'beforeUpdate',
	afterUpdate = 'afterUpdate',
	beforeDelete = 'beforeDelete',
	afterDelete = 'afterDelete',
	onSubmit = 'onSubmit'
}

export enum CLIENT_SIDE_FORM_EVENTS {
	onSave = 'onSave',
	afterSave = 'afterSave',
	onLoad = 'onLoad',
	onChange = 'onChange',
	onClick = 'onClick'
}

export type Handler = ((...args: any[]) => any);

const handlers = new Map() as Map<number, Handler[]>;

export const getEventsHandlers = (nodeTableName: string, eventName: SERVER_SIDE_FORM_EVENTS) => {
	const eventFullName = (E as KeyedMap<any>)[nodeTableName!]?.[eventName];
	return handlers.get(eventFullName);
};

export const getEventsHandlersField = (nodeTableName: string, fieldName: string, fieldType: FIELD_TYPE) => {
	const eventFullName = (E as KeyedMap<any>)[nodeTableName!]?.[fieldName]?.[(fieldType === FIELD_TYPE.BUTTON || fieldType === FIELD_TYPE.TAB) ?
		CLIENT_SIDE_FORM_EVENTS.onClick :
		CLIENT_SIDE_FORM_EVENTS.onChange];
	return handlers.get(eventFullName);
};

const dispatch = async (nodeTableName: string, eventName: SERVER_SIDE_FORM_EVENTS, ...args: any[]): Promise<KeyedMap<any> | undefined> => {
	const eventFullName = (E as KeyedMap<any>)[nodeTableName!][eventName];
	const h = handlers.get(eventFullName);

	if (h) {
		let ret;
		for (const f of h) {
			const handlersRet = await f(...args);
			if (handlersRet) {

				assert(typeof handlersRet === 'object', eventFullName + ' handler has returned ' + handlersRet + '. But KeyedMap object expected. You can return your value wrapped in object { myHandlersReturnValue: ' + JSON.stringify(handlersRet) + ' }');

				if (ret) {
					Object.assign(ret, handlersRet);
				} else {
					ret = handlersRet;
				}
			}
		}
		return ret;
	}
};

export interface SourceMappedEventHandler {
	__sourceFile: string;
}

/// #if DEBUG
let nodeDescByEventName: Map<number, { node: NodeDesc; eventName: string }>;
/// #endif

const on = (eventName: number, handler: () => any) => {
	/// #if DEBUG
	const fileName = new Error('stack getter').stack!.split('\n')[3];
	(handler as any as SourceMappedEventHandler).__sourceFile = fileName;

	if (isServer()) {
		if (!nodeDescByEventName) {
			nodeDescByEventName = new Map();
			const enumNodes = (o: KeyedMap<any>, tableName?: string) => {
				for (const key in o) {
					const val = o[key];
					if (typeof val === 'number') {
						nodeDescByEventName.set(val, { node: getNodeByTableName(tableName!)!, eventName: key });
					} else {
						enumNodes(val, tableName || key);
					}
				}
			};
			enumNodes(E);
		}
		const nodeDesc = nodeDescByEventName.get(eventName)!;
		if (!nodeDesc.node.__serverSideHandlers) {
			nodeDesc.node.__serverSideHandlers = {};
		}
		if (!nodeDesc.node.__serverSideHandlers[nodeDesc.eventName]) {
			nodeDesc.node.__serverSideHandlers[nodeDesc.eventName] = [];
		}
		nodeDesc.node.__serverSideHandlers[nodeDesc.eventName].push({ __sourceFile: fileName });
	}
	/// #endif
	if (handlers.has(eventName)) {
		handlers.get(eventName)!.push(handler);
	} else {
		handlers.set(eventName, [handler]);
	}
};

export const eventDispatch = dispatch;

export const serverOn =
/// #if DEBUG
	((eventName: number, handler: () => any) => {
		on(eventName, handler);
		assert(!(handler as any as SourceMappedEventHandler).__sourceFile.includes('://'), 'serverOn invoked on client side. Please use clientOn() instead.');
	}) as any as TypeGenerationHelper['eventsServer'];
/*
/// #endif
on as any as TypeGenerationHelper['eventsServer'];
// */

export const clientOn =
/// #if DEBUG
	((eventName: number, handler: () => any) => {
		on(eventName, handler);
		assert((handler as any as SourceMappedEventHandler).__sourceFile.includes('://'), 'clientOn invoked on server side. Please use serverOn() instead.');
	}) as any as TypeGenerationHelper['eventsClient'];
/*
/// #endif
on as any as TypeGenerationHelper['eventsClient'];
// */
export const clientHandlers = handlers;

/// #if DEBUG

const errorText = 'Record processing is finished. Read only access.';

export const __destroyRecordToPreventAccess = (record: KeyedMap<any>) => {
	const a = Object.keys(record);
	a.map((key: string) => {
		const val = record[key];
		delete record[key];
		Object.defineProperty(record, key, {
			get: () => val,
			set: () => {
				throw new Error(errorText);
			},
			configurable: false
		});
	});
	(record as any).__recordIsDestroyed = errorText;
	Object.freeze(record);
};

/// #endif