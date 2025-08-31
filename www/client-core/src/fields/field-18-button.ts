import { FIELD_TYPE } from '../../../../types/generated';
import { R } from '../r';
import { registerFieldClass, renderIcon } from '../utils';
import { BaseField } from './base-field';

registerFieldClass(FIELD_TYPE.BUTTON, class ButtonField extends BaseField {

	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	setValue(_val) {
		throw new Error('Cant set value for button');
	}

	onClick() {
		this.props.form.processFieldEvent(this.props.field, true);
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
