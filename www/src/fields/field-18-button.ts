import { FIELD_TYPE } from "../bs-utils";
import { R } from "../r";
import { renderIcon } from "../utils";
import { registerFieldClass } from "../utils";
import { BaseField } from "./base-field";

registerFieldClass(FIELD_TYPE.BUTTON, class ButtonField extends BaseField {

	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	setValue(val) {
		throw new Error('Cant set value for button');
	}

	onClick() {
		this.props.form.processFieldEvent(this.props.field, true);
	}

	render() {

		var field = this.props.field;

		var bIcon;
		if(field.icon) {
			bIcon = renderIcon(field.icon);
		}

		return R.button({ className: (this.props.disabled ? 'not-clickable field-button' : 'clickable field-button'), onClick: this.onClick },
			bIcon,
			field.name
		);
	}
});