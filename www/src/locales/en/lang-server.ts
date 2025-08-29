import { initDictionaryServerSide } from '../../../../core/locale';

const LANGS = {

};

initDictionaryServerSide(LANGS, 'en');

type LANG_KEYS_SERVER_SIDE_CUSTOM = keyof typeof LANGS;
export { LANG_KEYS_SERVER_SIDE_CUSTOM };

