import { FIELD_TYPE } from '../../../../types/generated';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import { BaseField__old } from './base-field';

registerFieldClass(FIELD_TYPE.SPLITTER, class StaticTextField extends BaseField__old {
	render() {
		return R.span();
	}
});
