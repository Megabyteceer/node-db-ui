
import { h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import { BaseField } from './base-field';

registerFieldClass(FIELD_TYPE.STATIC_HTML_BLOCK, class StaticTextField extends BaseField {

	setValue(_val) { }

	render() {
		const field = this.props.field;
		if (globals.customClasses[field.htmlContent]) {
			return h(globals.customClasses[field.htmlContent], this.props);
		} else {
			return R.span({
				dangerouslySetInnerHTML: {
					__html: field.htmlContent
				}
			});
		}
	}
});
