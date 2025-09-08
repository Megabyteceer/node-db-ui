import type { TypeGenerationHelper } from '../../../types/generated';
import { assert } from './assert';
import type { RecordData } from './bs-utils';

export const enum ServerEventName {
	beforeCreate = 'beforeCreate',
	afterCreate = 'afterCreate',
	beforeUpdate = 'beforeUpdate',
	afterUpdate = 'afterUpdate',
	beforeDelete = 'beforeDelete',
	afterDelete = 'afterDelete',
	onSubmit = 'onSubmit',
}

const handlers = new Map() as Map<string, ((...args:any[]) => any)[]>;

const dispatch = async (nodeTableName: string, eventName: ServerEventName, ...args: any[]):Promise<KeyedMap<any> | undefined> => {
	const eventFullName = nodeTableName + '.' + eventName;
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

const on = (eventName: string, handler: () => any) => {
	if (handlers.has(eventName)) {
		handlers.get(eventName)!.push(handler);
	} else {
		handlers.set(eventName, [handler]);
	}
};


export const eventDispatch = dispatch;

export const serverOn = on as any as TypeGenerationHelper['eventsServer'];
export const clientOn = on as any as TypeGenerationHelper['eventsClient'];
export const clientHandlers = handlers;


/// #if DEBUG

const errorText = 'Record processing is finished. Read only access.';

export const __destroyRecordToPreventAccess = (record: RecordData) => {
	const a = Object.keys(record);
	a.map((key:string) => {
		const val = a[key];
		delete a[key];
		Object.defineProperty(record, key, {
			get: () => val,
			set: () => {
				throw new Error(errorText);
			},
			configurable: false
		});
	});
	for (const key of a) {
		delete(record[key]);
	}
	(record as any).__recordIsDestroyed = errorText;
	Object.freeze(record);
};

/// #endif