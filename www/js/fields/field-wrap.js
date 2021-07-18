


import FieldAdmin from "../admin/field-admin.js";
import constants from "../custom/consts.js";
import {iAdmin} from "../user.js";
import {consoleLog, getClassForField, renderIcon, scrollToVisible} from "../utils.js";

var style = {
	margin: '20px 0',
	maxWidth: 1124
};
var styleLang = {
	margin: '20px 0',
	marginTop: -22,
	maxWidth: 1124
}

var valuePartStyle = {
	verticalAlign: 'top',
	width: '70%',
	color: constants.TEXT_COLOR,
	fontSize: '110%',
	display: 'inline-block'
};
var valueNoLabelPartStyle = {
	width: '100%',
	color: constants.TEXT_COLOR,
	fontSize: '110%',
	display: 'inline-block'
};

var labelStyle = {
	fontSize: '110%',
	fontWeight: 'bold',
	padding: '5px 0',
	width: '25%',
	paddingRight: '20px',
	color: constants.TEXT_COLOR,
	textAlign: 'right',
	verticalAlign: 'top',
	display: 'inline-block'
};


class FieldHelp extends React.Component {
	constructor(props) {
		super(props);
		this.mouseOut = this.mouseOut.bind(this);
		this.mouseOver = this.mouseOver.bind(this);
	}

	mouseOut() {
		this.setState({hovered: false});
	}

	mouseOver() {
		this.setState({hovered: true});
	}

	render() {
		var body;

		if(this.state && this.state.hovered) {
			body = ReactDOM.div({style: {position: 'absolute', right: 0, zIndex: 2, width: 300, background: '#707072', color: '#f0f0f2', padding: 10, borderRadius: 5, fontSize: '80%'}},
				this.props.text
			);
		} else {
			body = ReactDOM.div({style: {position: 'absolute', right: 0, color: '#707072'}}, renderIcon('question-circle'));
		}

		return ReactDOM.div({onMouseOver: this.mouseOver, onMouseOut: this.mouseOut, style: {display: 'inline-block', position: 'relative', width: 0, left: 30, bottom: 10, overflow: 'visible', color: '#707072'}}, body);
	}
}

class FieldLabel extends React.Component {
	render() {
		var field = this.props.field;
		var star;
		if(this.props.isEdit && field.requirement) {
			star = ReactDOM.span({style: {color: 'red', fontSize: '60%', verticalAlign: 'top'}}, '*');
		} else {
			star = '';
		}

		var alertBody;
		if(this.props.fieldAlert) {
			if(this.props.isSucessAlert) {
				alertBody = ReactDOM.div({style: {background: '#efe', borderTop: '2px solid #3a3', color: '#070', fontSize: '70%', padding: '3px', marginTop: '2px', marginBottom: '-16px'}, className: 'fade-in'}, this.props.fieldAlert);
			} else {
				alertBody = ReactDOM.div({style: {background: '#fee', borderTop: '2px solid #a33', color: '#700', fontSize: '70%', padding: '3px', marginTop: '2px', marginBottom: '-16px'}, className: 'fade-in'}, this.props.fieldAlert);
			}
		}

		var body;
		if(field.lang) {
			body = ReactDOM.span({style: {color: '#aaa', fontSize: '65%'}},
				field.lang
			)
		} else {
			body = (field.fieldType !== FIELD_18_BUTTON) ? (this.props.labelOwerride || field.name) : '';
		}

		return ReactDOM.div({className: 'field-label', style: labelStyle},
			body,
			star,
			alertBody
		);
	}
}

export {FieldHelp, FieldLabel};

export default class FieldWrap extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
		this.hidden = props.hidden;
		props.form.fieldsRefs[props.field.fieldName] = this;
		this.UNSAFE_componentWillReceiveProps(this.props)
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.hidden = nextProps.hidden;
		//this.currentValue = nextProps.initialValue;
		this.fieldDisabled |= nextProps.fieldDisabled;
	}

	hideTooltip() {
		if(this.state.showtooltip)
			this.setState({showtooltip: false});
	}

	componentWillUnmount() {
		this.forceBouncingTimeout();
		if(this.props.form.fieldsRefs[this.props.field.fieldName] === this) {
			delete this.props.form.fieldsRefs[this.props.field.fieldName];
		}
	}

	isEmpty() {
		if(this.fieldRef.isEmpty) {
			return this.fieldRef.isEmpty();
		}
		return true;
	}

	hide() {
		if(!this.hidden) {
			this.hidden = true;
			this.forceUpdate();
		}
	}

	getBackupData() {
		return this.fieldRef.getBackupData();
	}

	setMin(val) {
		this.fieldRef.setMin(val);
	}

	setMax(val) {
		this.fieldRef.setMax(val);
	}

	setLookupFilter(filtersObjOrName, val) {
		/// #if DEBUG
		if((this.props.field.fieldType !== FIELD_7_Nto1) &&
			(this.props.field.fieldType !== FIELD_14_NtoM) &&
			(this.props.field.fieldType !== FIELD_15_1toN)) {

			debugError('setLookupFilter aplied to not lookUp field: ' + this.props.field.fieldName);
		}
		/// #endif
		this.fieldRef.setLookupFilter(filtersObjOrName, val);
	}

	show() {
		if(this.hidden) {
			this.hidden = false;
			this.forceUpdate();
		}
	}

	disable() {
		if(!this.fieldDisabled) {
			this.fieldDisabled = true;
			this.forceUpdate();
		}
	}

	enable() {
		if(this.fieldDisabled) {
			this.fieldDisabled = false;
			this.forceUpdate();
		}
	}

	setLabel(label) {
		if(this.labelOwerride !== label) {
			this.labelOwerride = label;
			this.forceUpdate();
		}
	}

	sendCurrentValueToForm() {
		if(this.props.form.setFieldValue) {
			console.log('sendCurrentValueToForm: ' + this.props.field.fieldName + '=' + this.currentValue);
			this.props.form.setFieldValue(this.props.field.fieldName, this.currentValue, true);
		}
	}

	checkValidityBeforeSave(focusIfInvalid, callback) {
		if(!this.fieldRef || !this.fieldRef.getMessageIfInvalid) {
			callback(true);
		} else {

			this.fieldRef.getMessageIfInvalid((invalidMessage) => {
				if(!invalidMessage) {
					this.fieldAlert();
					callback(true);
				} else {
					this.fieldAlert(invalidMessage, false, focusIfInvalid);
					callback(false);
				}
			});
		}
	}

	beforeSave(callback) {
		if(this.fieldRef.beforeSave) {
			this.fieldRef.beforeSave(callback);
		} else {
			callback();
		}
	}

	afterSave(callback) {
		if(this.fieldRef.afterSave) {
			this.fieldRef.afterSave(callback);
		} else {
			callback();
		}
	}

	fieldAlert(text, isSucess, focus) {

		if(text) {
			if(this.hidden) {
				/// #if DEBUG
				throw 'Tried to alert hidden field';
				/// #endif
			}
		}

		this.setState({fieldAlert: text, isSucessAlert: isSucess});
		if(focus && text) {
			this.focus();
		}
	}

	focus() {
		/// #if DEBUG
		consoleLog('focus set ' + this.props.field.fieldName);
		/// #endif
		if(this.props.parentTabName && !this.props.form.isSlave()) {
			setFormFilter('tab', this.props.parentTabName);
		}
		setTimeout(() => {
			if(this.fieldRef.focus() === false) {
				if(this.fieldRef) {
					scrollToVisible(this.fieldRef);
				}
			}
		}, 1);
	}

	setValue(val) {
		this.clearChangeTimout();
		if(this.fieldRef) {
			this.fieldRef.setValue(val);
		}
	}

	inlineEditable() {
		this.fieldRef.inlineEditable();
	}

	extendEditor() {
		this.fieldRef.extendEditor();
	}

	clearChangeTimout() {
		if(this.ChangeTimeout) {
			console.log('clearChangeTimout: ' + this.props.field.fieldName);
			clearTimeout(this.ChangeTimeout);
			delete (this.ChangeTimeout);
		}
	}

	forceBouncingTimeout() {
		if(this.ChangeTimeout) {
			console.log('forceBouncingTimeout: ' + this.props.field.fieldName);
			this.clearChangeTimout();
			this.sendCurrentValueToForm();
		}
	}

	valueListener(newVal, withBounceDelay, sender) {
		console.log('valueListener: ' + this.props.field.fieldName + ': ' + newVal);
		this.currentValue = newVal;
		if(withBounceDelay) {
			this.clearChangeTimout();
			this.ChangeTimeout = setTimeout(() => {
				delete (this.ChangeTimeout);
				this.sendCurrentValueToForm();
			}, 600);
		} else {
			this.sendCurrentValueToForm();
		}
	}

	render() {

		var field = this.props.field;

		var domId = 'fc-' + field.id;

		var fprops = {
			field,
			wrapper: this,
			form: this.props.form,
			initialValue: this.props.initialValue,
			isCompact: this.props.isCompact,
			isEdit: this.props.isEdit,
			fieldDisabled: this.fieldDisabled,
			additionalButtons: this.state.additionalButtons || this.props.additionalButtons,
			ref: (fieldRef) => {
				this.fieldRef = fieldRef;
			}
		};

		var fieldTypedBody = React.createElement(getClassForField(field.fieldType), fprops);
		var fieldCustomBody;
		if(field.customRender) {
			fieldCustomBody = field.customRender(fprops);
		}


		var noLabel = !field.name;// (field.fieldType===FIELD_14_NtoM)||(field.fieldType===FIELD_15_1toN);

		var help;
		if(field.fdescription && field.fieldType !== FIELD_8_STATICTEXT) {
			help = React.createElement(FieldHelp, {text: ReactDOM.div(null, ReactDOM.h4(null, field.name), field.fdescription)});
		}


		var fieldAdmin;
		if(iAdmin() && !field.lang && (!this.props.isCompact || this.props.parentCompactAreaName)) {
			fieldAdmin = React.createElement(FieldAdmin, {field, form: this.props.form, x: -10});
		}

		if(this.props.isCompact) {

			var tooltip;
			if(this.state.showtooltip) {
				tooltip = ReactDOM.span({style: {position: 'absolute', zIndex: 2, marginTop: 8, fontSize: 12, whiteSpace: 'nowrap', pointerEvents: 'none'}},
					ReactDOM.span({className: 'fa fa-caret-left', style: {color: '#665', margin: -1}}),
					ReactDOM.span({style: {background: '#665', borderRadius: 4, color: '#ddc', padding: '3px 10px'}}, field.name, (field.lang ? (' (' + field.lang + ')') : undefined), (this.state && this.state.fieldAlert) ? (' (' + this.state.fieldAlert + ')') : '')
				)
			}

			return ReactDOM.span({
				style: {width: this.props.isTable ? undefined : '30%', display: (this.hidden && !this.props.form.showAllDebug) ? 'none' : 'inline-block', verticalAlign: 'middle'},
				className: domId,
				onFocus: () => {

					this.setState({showtooltip: true});


				},
				onBlur: () => {
					this.setState({showtooltip: false});
				},
			},
				fieldTypedBody,
				fieldCustomBody,
				fieldAdmin,
				tooltip
			);
		} else {

			var label;

			if(!noLabel) {
				label = React.createElement(FieldLabel, {field, isEdit: this.props.isEdit, labelOwerride: this.labelOwerride, fieldAlert: this.state ? this.state.fieldAlert : undefined, isSucessAlert: this.state ? this.state.isSucessAlert : undefined});
			}

			return ReactDOM.div({className: domId, style: (this.hidden && !this.props.form.showAllDebug) ? {display: 'none'} : (field.lang ? styleLang : style)},
				label,
				ReactDOM.div({style: noLabel ? valueNoLabelPartStyle : valuePartStyle},
					fieldTypedBody,
					fieldCustomBody
				),
				help,
				fieldAdmin
			);
		}
	}
}

