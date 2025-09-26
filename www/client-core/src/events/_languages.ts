import { clientOn } from '../../../../www/client-core/src/events-handle';
import { LANGUAGE_ID_DEFAULT } from '../bs-utils';
import { R } from '../r';
import { E } from '../types/generated';
import { L } from '../utils';

clientOn(E._languages.onLoad, (form) => {
	if (form.recId === LANGUAGE_ID_DEFAULT) {
		form.disableField('isUILanguage');
	}
	if (form.isUpdateRecord) {
		form.disableField('code');
	} else if (form.props.editable) {
		form.setHeader(R.span({ className: 'danger' }, L('NEW_LANGUAGE_WARNING')));
	}
});

clientOn(E._languages.onSave, (form) => {
	if (form.isNewRecord && !form.getFieldValue('code')) {
		form.fieldAlert('code', L('REQUIRED_FLD'));
	}
});
