import React, { Component } from 'react';
import type { FieldDesc } from '../bs-utils';
import { R } from '../r';
/// #if DEBUG
import { FieldAdmin } from '../admin/field-admin';
/// #endif
import { FIELD_DISPLAY, FIELD_TYPE } from '../../../../types/generated';
import { iAdmin } from '../user';
import { consoleLog, debugError, getClassForField, renderIcon, scrollToVisible } from '../utils';
import type { BaseField, FieldProps } from './base-field';

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
		this.UNSAFE_componentWillReceiveProps(this.props);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.hidden = nextProps.hidden;
		//this.currentValue = nextProps.initialValue;
		if (nextProps.fieldDisabled) {
			this.fieldDisabled = true;
		}
	}

	hideTooltip() {
		if (this.state.showToolTip) this.setState({ showToolTip: false });
	}

	componentWillUnmount() {
		this.forceBouncingTimeout();
	}

	isEmpty() {
		return this.fieldRef.isEmpty();
	}

	hide() {
		if (!this.hidden) {
			this.hidden = true;
			this.forceUpdate();
			const childrenFields = this.props.field.childrenFields;
			if (childrenFields) {
				for (const childField of childrenFields) {
					this.props.form.getField(childField.fieldName).hide();
				}
			}
		}
	}

	makeFieldRequired(requirement) {
		this.fieldRef.setState({ requirement });
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
		if (
			this.props.field.fieldType !== FIELD_TYPE.LOOKUP &&
			this.props.field.fieldType !== FIELD_TYPE.LOOKUP_N_TO_M &&
			this.props.field.fieldType !== FIELD_TYPE.LOOKUP_1_TO_N
		) {
			debugError('setLookupFilter applied to not lookUp field: ' + this.props.field.fieldName);
		}
		/// #endif
		this.fieldRef.setLookupFilter(filtersObjOrName, val);
	}

	show() {
		if (this.hidden) {
			this.hidden = false;
			this.forceUpdate();
			const childrenFields = this.props.field.childrenFields;
			if (childrenFields) {
				for (const childField of childrenFields) {
					this.props.form.getField(childField.fieldName).show();
				}
			}
		}
	}

	disable() {
		if (!this.fieldDisabled) {
			this.fieldDisabled = true;
			this.forceUpdate();
			const childrenFields = this.props.field.childrenFields;
			if (childrenFields) {
				for (const childField of childrenFields) {
					this.props.form.getField(childField.fieldName).disable();
				}
			}
		}
	}

	enable() {
		if (this.fieldDisabled) {
			this.fieldDisabled = false;
			this.forceUpdate();
			const childrenFields = this.props.field.childrenFields;
			if (childrenFields) {
				for (const childField of childrenFields) {
					this.props.form.getField(childField.fieldName).enable();
				}
			}
		}
	}

	setLabel(label: string) {
		if (this.labelOverride !== label) {
			this.labelOverride = label;
			this.forceUpdate();
		}
	}

	sendCurrentValueToForm() {
		if (this.props.form.setFieldValue) {
			this.props.form.setFieldValue(this.props.field.fieldName, this.currentValue, true);
		}
	}

	async checkValidityBeforeSave(focusIfInvalid) {
		if (!this.fieldRef || !this.fieldRef.getMessageIfInvalid) {
			return true;
		} else {
			const invalidMessage = await this.fieldRef.getMessageIfInvalid();
			if (!invalidMessage) {
				this.fieldAlert();
				return true;
			} else {
				if (typeof invalidMessage === 'string') {
					this.fieldAlert(invalidMessage, false, focusIfInvalid);
				}
				return false;
			}
		}
	}

	fieldAlert(text?: string, isSuccess?: boolean, focus?: boolean) {
		if (text) {
			if (this.hidden) {
				/// #if DEBUG
				throw 'Tried to alert hidden field';
				/// #endif
			}
		}

		this.setState({ fieldAlert: text, isSuccessAlert: isSuccess });
		if (focus && text && !isSuccess) {
			this.focus();
		}
	}

	focus() {
		/// #if DEBUG
		consoleLog('focus set ' + this.props.field.fieldName);
		/// #endif
		if (this.props.parentTabName) {
			this.props.form.setFormFilter('tab', this.props.parentTabName);
		}
		setTimeout(() => {
			scrollToVisible(this);
			this.fieldRef.focus();
		}, 1);
	}

	setValue(val) {
		this.clearChangeTimeout();
		if (this.fieldRef) {
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
		if (this.onChangeTimeout) {
			clearTimeout(this.onChangeTimeout);
			delete this.onChangeTimeout;
		}
	}

	forceBouncingTimeout() {
		if (this.onChangeTimeout) {
			this.clearChangeTimeout();
			this.sendCurrentValueToForm();
		}
		if (this.fieldRef.forceBouncingTimeout) {
			this.fieldRef.forceBouncingTimeout();
		}
	}

	valueListener(newVal, withBounceDelay, _sender) {
		this.currentValue = newVal;
		this.props.form.fieldAlert(this.props.field.fieldName);
		if (withBounceDelay) {
			this.clearChangeTimeout();
			this.onChangeTimeout = setTimeout(() => {
				delete this.onChangeTimeout;
				this.sendCurrentValueToForm();
			}, 200);
		} else {
			this.sendCurrentValueToForm();
		}
	}

	render() {
		const field = this.props.field;

		const domId = 'field-container-id-' + field.id;

		const fieldProps = {
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
			},
		};

		const fieldTypedBody = React.createElement(getClassForField(field.fieldType), fieldProps);
		let fieldCustomBody;

		const noLabel = !field.name; // (field.fieldType===FIELD_TYPE.LOOKUP_N_TO_M)||(field.fieldType===FIELD_TYPE.LOOKUP_1_TO_N);

		let help;
		if (field.description) {
			help = React.createElement(FieldHelp, {
				text: R.div(null, R.h4(null, field.name), field.description),
			});
		}
		/// #if DEBUG
		let fieldAdmin;
		if (iAdmin() && !field.lang && !this.props.isCompact) {
			fieldAdmin = React.createElement(FieldAdmin, { field, form: this.props.form });
		}
		/// #endif
		let className =
			domId +
			' field-wrap field-container-type-' +
			field.fieldType +
			' field-container-name-' +
			field.fieldName;
		if (
			this.hidden &&
			/// #if DEBUG
			!this.props.form.showAllDebug
			/// #endif
		) {
			className += ' hidden';
		}

		if (field.cssClass) {
			className += ' ' + field.cssClass;
		}

		if (field.display === FIELD_DISPLAY.INLINE) {
			className += ' field-wrap-inline';
		}

		if (this.fieldDisabled) {
			className += ' field-wrap-disabled';
		}

		if (!this.props.isEdit) {
			className += ' field-wrap-readonly';
		}

		if (this.props.isCompact) {
			let tooltip;
			if (this.state.showToolTip) {
				tooltip = R.span(
					{ className: 'field-wrap-tooltip' },
					R.span({ className: 'fa fa-caret-left field-wrap-tooltip-arrow' }),
					R.span(
						{ className: 'field-wrap-tooltip-body' },
						field.name,
						field.lang ? ' (' + field.lang + ')' : undefined,
						this.state && this.state.fieldAlert ? ' (' + this.state.fieldAlert + ')' : ''
					)
				);
			}
			return R.span(
				{
					className,
					onFocus: () => {
						if (field.fieldType !== FIELD_TYPE.BUTTON) {
							this.setState({ showToolTip: true });
						}
					},
					onBlur: () => {
						this.setState({ showToolTip: false });
					},
				},
				fieldTypedBody,
				fieldCustomBody,
				/// #if DEBUG
				fieldAdmin,
				/// #endif
				tooltip
			);
		} else {
			if (field.lang) {
				className += ' field-wrap-lang';
			}
			let label;
			if (!noLabel) {
				label = React.createElement(FieldLabel, {
					field,
					isEdit: this.props.isEdit,
					labelOverride: this.labelOverride,
					fieldAlert: this.state ? this.state.fieldAlert : undefined,
					isSuccessAlert: this.state ? this.state.isSuccessAlert : undefined,
				});
			}
			return R.div(
				{ className },
				label,
				R.div(
					{
						className: noLabel ? 'field-wrap-value field-wrap-value-no-label' : 'field-wrap-value',
					},
					fieldTypedBody,
					fieldCustomBody,
					/// #if DEBUG
					fieldAdmin,
					/// #endif
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
		let body;
		const btn = R.div({ className: 'field-wrap-help' }, renderIcon('question-circle'));
		if (this.state && this.state.hovered) {
			body = R.div({ className: 'field-wrap-help-body' }, this.props.text);
		}
		return R.div(
			{
				onMouseEnter: this.mouseOver,
				onMouseLeave: this.mouseOut,
				className: 'field-wrap-help-container',
			},
			btn,
			body
		);
	}
}

class FieldLabel extends Component<any, any> {
	render() {
		const field: FieldDesc = this.props.field;
		let star;
		if (this.props.isEdit && field.requirement) {
			star = R.span({ className: 'field-wrap-required-star' }, '*');
		} else {
			star = '';
		}

		let alertBody;
		if (this.props.fieldAlert) {
			if (this.props.isSuccessAlert) {
				alertBody = R.div(
					{ className: 'fade-in field-wrap-alert field-wrap-alert-success' },
					this.props.fieldAlert
				);
			} else {
				alertBody = R.div({ className: 'fade-in field-wrap-alert' }, this.props.fieldAlert);
			}
		}

		let body;
		if (field.lang) {
			body = R.span({ className: 'field-wrap-label-lang' }, field.lang);
		} else {
			body = field.fieldType !== FIELD_TYPE.BUTTON ? this.props.labelOverride || field.name : '';
		}

		return R.div(
			{ className: 'field-wrap-label' },
			field.fieldType !== FIELD_TYPE.BUTTON ? renderIcon(field.icon) : '',
			body,
			star,
			alertBody
		);
	}
}

export { FieldHelp, FieldLabel, FieldWrap };

