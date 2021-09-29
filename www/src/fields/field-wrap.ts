import { FIELD_TYPE, FieldDesc, FIELD_DISPLAY_TYPE } from "../bs-utils";
import { R } from "../r";
import React, { Component } from "react";
import { FieldAdmin } from "../admin/field-admin";
import { consoleLog, debugError, getClassForField, renderIcon, scrollToVisible } from "../utils";
import { iAdmin } from "../user";
import { BaseField, FieldProps } from "./base-field";

class FieldWrap extends Component<FieldProps, any> {

	afterSave: () => Promise<any>;
	fieldRef: BaseField;
	hidden: boolean;
	fieldDisabled: boolean;
	private labelOverride: string;
	private currentValue: any;
	private onChangeTimeout: NodeJS.Timeout;

	constructor(props) {
		super(props);
		this.state = {};
		this.hidden = props.hidden;
		this.UNSAFE_componentWillReceiveProps(this.props)
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.hidden = nextProps.hidden;
		//this.currentValue = nextProps.initialValue;
		if(nextProps.fieldDisabled) {
			this.fieldDisabled = true;
		}
	}

	hideTooltip() {
		if(this.state.showToolTip)
			this.setState({ showToolTip: false });
	}

	componentWillUnmount() {
		this.forceBouncingTimeout();
	}

	isEmpty() {
		return this.fieldRef.isEmpty();
	}

	hide() {
		if(!this.hidden) {
			this.hidden = true;
			this.forceUpdate();
			const childrenFields = this.props.field.childrenFields;
			if(childrenFields) {
				for(let childField of childrenFields) {
					this.props.form.getField(childField.fieldName).hide();
				}
			}
		}
	}

	makeFieldRequired(requirement) {
		this.props.field.requirement = requirement;
		this.forceUpdate();
	}

	getBackupData() {
		return this.fieldRef.getBackupData();
	}

	setMin(val: number) {
		this.fieldRef.setMin(val);
	}

	setMax(val: number) {
		this.fieldRef.setMax(val);
	}

	setLookupFilter(filtersObjOrName, val) {
		/// #if DEBUG
		if((this.props.field.fieldType !== FIELD_TYPE.LOOKUP) &&
			(this.props.field.fieldType !== FIELD_TYPE.LOOKUP_NtoM) &&
			(this.props.field.fieldType !== FIELD_TYPE.LOOKUP_1toN)) {

			debugError('setLookupFilter applied to not lookUp field: ' + this.props.field.fieldName);
		}
		/// #endif
		this.fieldRef.setLookupFilter(filtersObjOrName, val);
	}

	show() {
		if(this.hidden) {
			this.hidden = false;
			this.forceUpdate();
			const childrenFields = this.props.field.childrenFields;
			if(childrenFields) {
				for(let childField of childrenFields) {
					this.props.form.getField(childField.fieldName).show();
				}
			}
		}
	}

	disable() {
		if(!this.fieldDisabled) {
			this.fieldDisabled = true;
			this.forceUpdate();
			const childrenFields = this.props.field.childrenFields;
			if(childrenFields) {
				for(let childField of childrenFields) {
					this.props.form.getField(childField.fieldName).disable();
				}
			}
		}
	}

	enable() {
		if(this.fieldDisabled) {
			this.fieldDisabled = false;
			this.forceUpdate();
			const childrenFields = this.props.field.childrenFields;
			if(childrenFields) {
				for(let childField of childrenFields) {
					this.props.form.getField(childField.fieldName).enable();
				}
			}
		}
	}

	setLabel(label: string) {
		if(this.labelOverride !== label) {
			this.labelOverride = label;
			this.forceUpdate();
		}
	}

	sendCurrentValueToForm() {
		if(this.props.form.setFieldValue) {
			this.props.form.setFieldValue(this.props.field.fieldName, this.currentValue, true);
		}
	}

	async checkValidityBeforeSave(focusIfInvalid) {

		if(!this.fieldRef || !this.fieldRef.getMessageIfInvalid) {
			return true;
		} else {

			let invalidMessage = await this.fieldRef.getMessageIfInvalid();
			if(!invalidMessage) {
				this.fieldAlert();
				return true;
			} else {
				if(typeof invalidMessage === 'string') {
					this.fieldAlert(invalidMessage, false, focusIfInvalid);
				}
				return false;
			}
		}
	}

	fieldAlert(text?: string, isSuccess?: boolean, focus?: boolean) {

		if(text) {
			if(this.hidden) {
				/// #if DEBUG
				throw 'Tried to alert hidden field';
				/// #endif
			}
		}

		this.setState({ fieldAlert: text, isSuccessAlert: isSuccess });
		if(focus && text && !isSuccess) {
			this.focus();
		}
	}

	focus() {
		/// #if DEBUG
		consoleLog('focus set ' + this.props.field.fieldName);
		/// #endif
		if(this.props.parentTabName) {
			this.props.form.setFormFilter('tab', this.props.parentTabName);
		}
		setTimeout(() => {
			scrollToVisible(this);
			this.fieldRef.focus();
		}, 1);
	}

	setValue(val) {
		this.clearChangeTimeout();
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

	clearChangeTimeout() {
		if(this.onChangeTimeout) {
			clearTimeout(this.onChangeTimeout);
			delete (this.onChangeTimeout);
		}
	}

	forceBouncingTimeout() {
		if(this.onChangeTimeout) {
			this.clearChangeTimeout();
			this.sendCurrentValueToForm();
		}
		if(this.fieldRef.forceBouncingTimeout) {
			this.fieldRef.forceBouncingTimeout();
		}
	}

	valueListener(newVal, withBounceDelay, sender) {
		this.currentValue = newVal;
		this.props.form.fieldAlert(this.props.field.fieldName);
		if(withBounceDelay) {
			this.clearChangeTimeout();
			this.onChangeTimeout = setTimeout(() => {
				delete (this.onChangeTimeout);
				this.sendCurrentValueToForm();
			}, 600);
		} else {
			this.sendCurrentValueToForm();
		}
	}

	render() {

		var field = this.props.field;

		var domId = 'field-container-id-' + field.id;

		var fieldProps = {
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

		var fieldTypedBody = React.createElement(getClassForField(field.fieldType), fieldProps);
		var fieldCustomBody;

		var noLabel = !field.name;// (field.fieldType===FIELD_TYPE.LOOKUP_NtoM)||(field.fieldType===FIELD_TYPE.LOOKUP_1toN);

		var help;
		if(field.description && field.fieldType !== FIELD_TYPE.STATIC_TEXT) {
			help = React.createElement(FieldHelp, { text: R.div(null, R.h4(null, field.name), field.description) });
		}

		var fieldAdmin;
		if(iAdmin() && !field.lang && (!this.props.isCompact)) {
			fieldAdmin = React.createElement(FieldAdmin, { field, form: this.props.form });
		}

		let className = domId + ' field-wrap field-container-type-' + field.fieldType + ' field-container-name-' + field.fieldName;
		if(this.hidden
			/// #if DEBUG
			&& !this.props.form.showAllDebug
			/// #endif
		) {
			className += ' hidden';
		}

		if(field.display === FIELD_DISPLAY_TYPE.INLINE) {
			className += ' field-wrap-inline';
		}

		if(this.fieldDisabled) {
			className += ' field-wrap-disabled';
		}

		if(!this.props.isEdit) {
			className += ' field-wrap-readonly';
		}

		if(this.props.isCompact) {
			var tooltip;
			if(this.state.showToolTip) {
				tooltip = R.span({ className: 'field-wrap-tooltip' },
					R.span({ className: 'fa fa-caret-left field-wrap-tooltip-arrow' }),
					R.span({ className: 'field-wrap-tooltip-body' }, field.name, (field.lang ? (' (' + field.lang + ')') : undefined), (this.state && this.state.fieldAlert) ? (' (' + this.state.fieldAlert + ')') : '')
				)
			}
			return R.span({
				className,
				onFocus: () => {
					if(field.fieldType !== FIELD_TYPE.BUTTON) {
						this.setState({ showToolTip: true });
					}
				},
				onBlur: () => {
					this.setState({ showToolTip: false });
				},
			},
				fieldTypedBody,
				fieldCustomBody,
				fieldAdmin,
				tooltip
			);
		} else {
			if(field.lang) {
				className += ' field-wrap-lang';
			}
			var label;
			if(!noLabel) {
				label = React.createElement(FieldLabel, { field, isEdit: this.props.isEdit, labelOverride: this.labelOverride, fieldAlert: this.state ? this.state.fieldAlert : undefined, isSuccessAlert: this.state ? this.state.isSuccessAlert : undefined });
			}
			return R.div({ className },
				label,
				R.div({ className: noLabel ? 'field-wrap-value field-wrap-value-no-label' : 'field-wrap-value' },
					fieldTypedBody,
					fieldCustomBody,
					fieldAdmin,
					help
				)
			);
		}
	}
}

class FieldHelp extends Component<any, any> {

	constructor(props) {
		super(props);
		this.mouseOut = this.mouseOut.bind(this);
		this.mouseOver = this.mouseOver.bind(this);
	}

	mouseOut() {
		this.setState({ hovered: false });
	}

	mouseOver() {
		this.setState({ hovered: true });
	}

	render() {
		var body;
		if(this.state && this.state.hovered) {
			body = R.div({ className: 'field-wrap-help field-wrap-help-open' },
				this.props.text
			);
		} else {
			body = R.div({ className: 'field-wrap-help' }, renderIcon('question-circle'));
		}
		return R.div({ onMouseOver: this.mouseOver, onMouseOut: this.mouseOut, className: 'field-wrap-help-container' }, body);
	}
}

class FieldLabel extends Component<any, any> {
	render() {
		var field: FieldDesc = this.props.field;
		var star;
		if(this.props.isEdit && field.requirement) {
			star = R.span({ className: 'field-wrap-required-star' }, '*');
		} else {
			star = '';
		}

		var alertBody;
		if(this.props.fieldAlert) {
			if(this.props.isSuccessAlert) {
				alertBody = R.div({ className: 'fade-in field-wrap-alert field-wrap-alert-success' }, this.props.fieldAlert);
			} else {
				alertBody = R.div({ className: 'fade-in field-wrap-alert' }, this.props.fieldAlert);
			}
		}

		var body;
		if(field.lang) {
			body = R.span({ className: 'field-wrap-label-lang' },
				field.lang
			)
		} else {
			body = (field.fieldType !== FIELD_TYPE.BUTTON) ? (this.props.labelOverride || field.name) : '';
		}

		return R.div({ className: 'field-wrap-label' },
			renderIcon(field.icon),
			body,
			star,
			alertBody
		);
	}
}

export { FieldHelp, FieldLabel, FieldWrap };
