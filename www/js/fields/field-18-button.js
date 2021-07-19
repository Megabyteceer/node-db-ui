import constants from "../custom/consts.js";
import fieldsEvents from "../events/fields_events.js";
import eventProcessingMixins from "../forms/event-processing-mixins.js";
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
			eventProcessingMixins.processFormEvent.call(this.props.form, fieldsEvents[this.props.field.id], true);
		}
	}

	render() {

		var field = this.props.field;

		var bIcon;
		if(field.icon) {
			bIcon = renderIcon(field.icon);
		}

		return ReactDOM.button({className: (this.props.disabled ? 'btn-' + this.props.field.id + ' unclickable' : 'btn-' + this.props.field.id + ' clickable clickable-edit btn-' + this.props.field.fieldName), style: {padding: '5px 20px 6px 20px', fontSize: '80%', background: constants.EDIT_COLOR, color: '#fff'}, onClick: this.onClick},
			bIcon,
			field.name
		);
	}
});