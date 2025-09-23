import { h } from 'preact';
import { throwError } from '../assert';
import BaseField from '../base-field';
import { R } from '../r';
import { FIELD_TYPE } from '../types/generated';
import { globals } from '../types/globals';
import { registerFieldClass } from '../utils';

export default class StaticTextField extends BaseField {

	setValue(_val: any) {
		throwError('Cant set value for STATIC_HTML_BLOCK');
	}

	render() {
		const field = this.props.fieldDesc;
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
}

registerFieldClass(FIELD_TYPE.STATIC_HTML_BLOCK, StaticTextField);