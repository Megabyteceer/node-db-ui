import { h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import { throwError } from '../assert';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import { BaseField__old } from './base-field';

registerFieldClass(FIELD_TYPE.STATIC_HTML_BLOCK, class StaticTextField extends BaseField__old {

	setValue(_val: any) {
		throwError('Cant set value for STATIC_HTML_BLOCK');
	}

	render() {
		const field = this.props.field;
		if (globals.customClasses[field.htmlContent!]) {
			return h(globals.customClasses[field.htmlContent!], this.props);
		} else {
			return R.span({
				dangerouslySetInnerHTML: {
					__html: field.htmlContent
				}
			});
		}
	}
});
