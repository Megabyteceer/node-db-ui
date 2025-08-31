import React from 'react';
import { FIELD_TYPE } from '../../../../types/generated';
import { R } from '../r';
import { registerFieldClass } from '../utils';
import { BaseField } from './base-field';

registerFieldClass(FIELD_TYPE.STATIC_HTML_BLOCK, class StaticTextField extends BaseField {

	setValue(_val) { }

	render() {
		const field = this.props.field;
		if (crudJs.customClasses[field.htmlContent]) {
			//@ts-ignore
			return React.createElement(crudJs.customClasses[field.htmlContent], this.props);
		} else {
			return R.span({
				dangerouslySetInnerHTML: {
					__html: field.htmlContent
				}
			});
		}
	}
});
