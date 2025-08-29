import { initDictionary } from '../../../client-core/src/utils';

const LANGS = {
};

initDictionary(LANGS);

type LANG_KEYS_CUSTOM = keyof typeof LANGS;
export { LANG_KEYS_CUSTOM };

