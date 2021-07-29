import fieldsEvents from "../events/fields_events.js";
import {renderIcon} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

registerFieldClass(FIELD_18_BUTTON, class ButtonField extends fieldMixins {

	constructor(props) {
		super(props);
		this.onClick = this.onClick.bind(this);
	}

	setValue(val) {
	}

	onClick() {
		if(fieldsEvents.hasOwnProperty(this.props.field.id)) {
			this.props.form.processFormEvent.call(this.props.form, fieldsEvents[this.props.field.id], true);
		}
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