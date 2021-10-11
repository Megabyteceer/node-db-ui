
import ENV from "../ENV";
import type { LANG_KEYS_SERVER_SIDE } from "../www/src/locales/en/lang-server";
import { UserSession } from "./auth";

const dictionaries: Map<string, {}> = new Map();

function initDictionaryServerSide(o, langId) {
	dictionaries.set(langId, Object.assign(dictionaries.get(langId) || {}, o));
}

function L(key: LANG_KEYS_SERVER_SIDE, userSession: UserSession, param?: any) {
	const dictionary = dictionaries.get(userSession.lang.code || ENV.DEFAULT_LANG_CODE);
	if(dictionary.hasOwnProperty(key)) {
		if(typeof (param) !== 'undefined') {
			return dictionary[key].replace('%', param);
		}
		return dictionary[key];
	}
	/// #if DEBUG
	throw new Error(L('NO_TRANSLATION', userSession, key));
	/// #endif
	return ('#' + key);
}
export { L, initDictionaryServerSide };