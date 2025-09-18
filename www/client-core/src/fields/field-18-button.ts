import { FIELD_TYPE } from '../../../../types/generated';
import BaseField, { type BaseFieldProps } from '../base-field';
import { R } from '../r';
import { registerFieldClass, renderIcon } from '../utils';

export default class ButtonField extends BaseField {

	constructor(props: BaseFieldProps) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	setValue(_val: any) {
		throw new Error('Cant set value for button');
	}

	onClick() {
		this.props.parentForm.processFieldEvent(this.props.fieldDesc, true);
	}

	render() {

		const field = this.props.fieldDesc;

		let bIcon;
		if (field.icon) {
			bIcon = renderIcon(field.icon);
		}

		return R.button({ className: (this.props.fieldDisabled ? 'not-clickable field-button' : 'clickable field-button'), onClick: this.onClick, title: field.name },
			R.span({ className: 'icon' }, bIcon),
			R.span({ className: 'label' }, field.name)
		);
	}
}

registerFieldClass(FIELD_TYPE.BUTTON, ButtonField);
