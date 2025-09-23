import { FIELD_TYPE } from '../../../../types/generated';
import BaseField from '../base-field';
import { R } from '../r';
import { registerFieldClass } from '../utils';

const splitterProps = { className: 'form-splitter' };

export default class SplitterField extends BaseField {
	renderFieldEditable() {
		return R.div(splitterProps);
	}

	renderField() {
		return R.div(splitterProps);
	}
}

registerFieldClass(FIELD_TYPE.SPLITTER, SplitterField);
