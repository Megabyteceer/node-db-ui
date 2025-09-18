import { FIELD_TYPE } from '../../../../types/generated';
import BaseField from '../base-field';
import { R } from '../r';
import { registerFieldClass } from '../utils';

export default class SplitterField extends BaseField {
	render() {
		return R.span();
	}
}

registerFieldClass(FIELD_TYPE.SPLITTER, SplitterField);
