import { FIELD_TYPE } from '../../../../types/generated';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import { BaseField } from './base-field';

registerFieldClass(FIELD_TYPE.SPLITTER, class StaticTextField extends BaseField {
	render() {
		return R.span();
	}
});
