import {FIELD_18_BUTTON} from "../bs-utils";
import {R} from "../r.ts";
import {renderIcon} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import {fieldMixins} from "./field-mixins.js";

registerFieldClass(FIELD_18_BUTTON, class ButtonField extends fieldMixins {

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

		return R.button({className: (this.props.disabled ? 'unclickable field-button' : 'clickable field-button'), onClick: this.onClick},
			bIcon,
			field.name
		);
	}
});