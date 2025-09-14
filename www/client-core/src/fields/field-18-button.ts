import { FIELD_TYPE } from '../../../../types/generated';
import type { FormFull } from '../forms/form-full';
import { R } from '../r';
import { registerFieldClass, renderIcon } from '../utils';
import { BaseField, type FieldProps } from './base-field';

registerFieldClass(FIELD_TYPE.BUTTON, class ButtonField extends BaseField {

	constructor(props: FieldProps) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	setValue(_val: any) {
		throw new Error('Cant set value for button');
	}

	onClick() {
		(this.props.form as FormFull).processFieldEvent(this.props.field, true);
	}

	render() {

		const field = this.props.field;

		let bIcon;
		if (field.icon) {
			bIcon = renderIcon(field.icon);
		}

		return R.button({ className: (this.props.disabled ? 'not-clickable field-button' : 'clickable field-button'), onClick: this.onClick, title: field.name },
			R.span({ className: 'icon' }, bIcon),
			R.span({ className: 'label' }, field.name)
		);
	}
});
