import { Component, h, type ComponentChild, type ComponentChildren } from 'preact';
import { FieldAdmin } from './admin/field-admin';
import type { GetRecordsFilter } from './bs-utils';
import { SAVE_REJECTED } from './consts';
import type { BaseLookupFieldProps } from './fields/base-lookup-field';
import type Form from './form';
import FormNode, { type FormNodeAccessor, type FormNodeProps, type FormNodeState } from './form-node';
import { R } from './r';
import { scrollToVisible } from './scroll-to-visible';
import { FIELD_DISPLAY, FIELD_TYPE } from './types/generated';
import { iAdmin } from './user';
import { L, renderIcon } from './utils';

const DEBOUNCING_DELAY = 300;

export interface FieldAlertInfo {
	txt: string;
	focus: boolean;
}

export interface BaseFieldProps extends FormNodeProps {
	parentForm: Form;
	initialValue: any;
	fieldDesc: FieldDesc;
	fieldHidden?: boolean;
	fieldDisabled?: boolean;
	hideControls: boolean;
	isEdit?: boolean;
	isCompact?: boolean;
}

export interface BaseFieldState extends FormNodeState {
	alertText?: string;
	hideControls?: boolean;
	isSuccessAlert?: boolean;
	inlineEditing?: boolean;
	showToolTip?: boolean;
}

export default class BaseField<T1 extends BaseFieldProps = BaseFieldProps, T2 extends BaseFieldState = BaseFieldState> extends FormNode<T1, T2> {

	fieldFilters?: GetRecordsFilter;

	refToInput!: HTMLInputElement;

	declare parentForm: Form;

	hidden = false;
	fieldDisabled = false;
	required = false;
	labelOverride?: string;

	_alerts = {} as KeyedMap<FieldAlertInfo>;

	constructor(props: T1) {
		super(props);
		/// #if DEBUG
		// @ts-ignore
		this.___FIELD = props.fieldDesc;
		/// #endif
		this.fieldDisabled = !!props.fieldDisabled;
		this.hidden = !!props.fieldHidden;

		this.required = !!props.fieldDesc.requirement;
		this.currentValue = props.initialValue;
		if (!(this.props as BaseLookupFieldProps).isN2M) {
			this.parentForm._registerField(this);
		}
		this.refGetter = this.refGetter.bind(this);
	}

	setValue(value: any) {
		this.clearChangeTimeout();
		this.currentValue = value;
		this.forceUpdate();
	}

	hideControls() {
		this.setState({ hideControls: true });
	}

	getValue(): any {
		return this.currentValue;
	}

	makeFieldRequired(requirement = true) {
		if (this.required !== requirement) {
			this.required = requirement;
			this.forceUpdate();
		}
	}

	isEmpty(): boolean {
		return !this.currentValue;
	}

	clearChangeTimeout() {
		if (this.onChangeTimeout) {
			clearTimeout(this.onChangeTimeout);
			this.onChangeTimeout = 0;
		}
	}

	async forceBouncingTimeout() {
		await super.forceBouncingTimeout();
		if (this.onChangeTimeout) {
			this.clearChangeTimeout();
			return this.sendCurrentValueToForm();
		}
	}

	onChangeTimeout = 0;

	currentValue: any;

	async sendCurrentValueToForm() {

		if (this.required && !this.isEmpty()) {
			this.alert(undefined, undefined, undefined, 'core-required');
		}

		return this.parentForm.setFieldValue(this.props.fieldDesc.fieldName, this.currentValue, true);
	}

	hideTooltip() {
		if (this.state.showToolTip) this.setState({ showToolTip: false });
	}

	valueListener(newVal: any, withBounceDelay?: boolean | number) {
		this.currentValue = newVal;

		if (withBounceDelay) {
			this.clearChangeTimeout();
			this.onChangeTimeout = window.setTimeout(() => {
				this.onChangeTimeout = 0;
				this.sendCurrentValueToForm();
			}, (typeof withBounceDelay === 'number') ? withBounceDelay : DEBOUNCING_DELAY);
		} else {
			this.sendCurrentValueToForm();
		}
	}

	refGetter(refToInput: HTMLInputElement) {
		this.refToInput = refToInput;
	}

	setLabel(label?: string) {
		if (this.labelOverride !== label) {
			this.labelOverride = label;
			this.forceUpdate();
		}
	}

	async beforeSave(): Promise<void> {
		if (this.required && this.isEmpty()) {
			this.alert(L('REQUIRED_FLD'), false, true, 'core-required');
		}
		return super.beforeSave();
	}

	async focus() {
		await (this.parent as any as FormNodeAccessor).beforeFocus();
		scrollToVisible(this.getDomElement());
		this.focusElement!();
	}

	async alert(txt?: string, isSuccess = false, focus = false, source?: string) {
		if (source) {
			if (!txt || isSuccess) {
				delete this._alerts[source];
			} else if (!isSuccess) {
				this._alerts[source] = {
					txt,
					focus
				};
			}
		}

		if (!txt) {
			const a = Object.keys(this._alerts);
			if (a.length) {
				const al = this._alerts[a[0]];
				if (al) {
					txt = al.txt;
					focus = al.focus;
					isSuccess = false;
				}
			}
		}
		this.parentForm.asyncOpsInProgress++;
		await (this.parent as any as FormNodeAccessor).beforeAlert(isSuccess);
		this.setState({ alertText: txt, isSuccessAlert: isSuccess });
		if (focus && txt && !isSuccess) {
			setTimeout(() => {
				if (this.base && Object.keys(this._alerts).length) {
					this.focus();
				}
			}, 10);
		}
		this.parentForm.asyncOpsInProgress--;
	}

	inlineEditable() {
		this.setState({ inlineEditing: true });
	}

	hide() {
		if (!this.hidden) {
			this.hidden = true;
			this.forceUpdate();
		}
	}

	show() {
		if (this.hidden) {
			this.hidden = false;
			this.forceUpdate();
		}
	}

	disable() {
		if (!this.fieldDisabled) {
			this.fieldDisabled = true;
			this.forceUpdate();
		}
	}

	enable() {
		if (this.fieldDisabled) {
			this.fieldDisabled = false;
			this.forceUpdate();
		}
	}

	renderTextValue(txt: string) {
		/* if (this.props.field.forSearch) { // TODO: searching highlighting
			const list = this.props.form.props.list;
			if (list && list.filters && list.filters.s) {
				return h(Highlighter, {
					highlightClassName: 'mark-search',
					searchWords: [
						typeof list.filters.s === 'string' ? list.filters.s : String(list.filters.s),
					],
					autoEscape: true,
					textToHighlight: txt,
				});
			}
		} */
		return txt;
	}

	getClassName() {

	}

	render(): ComponentChildren {
		const field = this.props.fieldDesc;

		let className =
			'field-wrap field-container-' + this.parentForm.nodeDesc.tableName + '--' + field.fieldName +
			' field-container-type-' + FIELD_TYPE[field.fieldType].toLowerCase().replaceAll('_', '-') +
			' field-container-name-' + field.fieldName;

		if (this.hidden) {
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

		const fieldTypedBody = this.props.isEdit ? this.renderFieldEditable() : this.renderField();

		const noLabel = !field.name || field.fieldType === FIELD_TYPE.BUTTON; // (field.fieldType===FIELD_TYPE.LOOKUP_N_TO_M)||(field.fieldType===FIELD_TYPE.LOOKUP_1_TO_N);

		let help;
		if (field.description) {
			help = h(FieldHelp, {
				text: R.div(null, R.h4(null, field.name), field.description)
			});
		}
		/// #if DEBUG
		let fieldAdmin;
		if (iAdmin() && !field.lang && !this.props.isCompact) {
			fieldAdmin = h(FieldAdmin, { field, form: this.parentForm });
		}
		/// #endif

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
						this.state && this.state.alertText ? ' (' + this.state.alertText + ')' : ''
					)
				);
			}
			const hasCompactToolTip = field.fieldType !== FIELD_TYPE.BUTTON && field.fieldType !== FIELD_TYPE.LOOKUP_N_TO_M;
			return R.span(
				{
					className,
					onFocusIn: hasCompactToolTip ? () => {
						this.setState({ showToolTip: true });
					} : undefined,
					onFocusOut: hasCompactToolTip ? () => {
						this.setState({ showToolTip: false });
					} : undefined
				},
				fieldTypedBody,
				/// #if DEBUG
				fieldAdmin,
				/// #endif
				tooltip
			);
		} else {
			if (field.lang) {
				className += ' field-wrap-lang';
			}
			let alertBody;
			let label;
			if (!noLabel) {
				label = h(FieldLabel, {
					field,
					required: this.required,
					isEdit: this.props.isEdit,
					labelOverride: this.labelOverride,
					fieldAlert: this.state ? this.state.alertText : undefined,
					isSuccessAlert: this.state ? this.state.isSuccessAlert : undefined
				});

				if (this.state.alertText) {
					if (this.state.isSuccessAlert) {
						alertBody = R.div(
							{ className: 'fade-in field-wrap-alert field-wrap-alert-success' },
							this.state.alertText
						);
					} else {
						alertBody = R.div({ className: 'fade-in field-wrap-alert' }, this.state.alertText);
					}
				}
			}
			return R.div(
				{ className },
				label,
				R.div(
					{
						className: noLabel ? 'field-wrap-value field-wrap-value-no-label' : 'field-wrap-value'
					},
					fieldTypedBody,
					/// #if DEBUG
					fieldAdmin,
					/// #endif
					alertBody,
					help
				)
			);
		}
	}

	isValid(): typeof SAVE_REJECTED | undefined {
		if (super.isValid()) {
			return SAVE_REJECTED;
		}
		if (this.state.alertText && !this.state.isSuccessAlert) {
			this.focus();
			return SAVE_REJECTED;
		}
	}

	renderField(): ComponentChild {
		return R.span(null, this.currentValue || ' ');
	}

	renderFieldEditable(): ComponentChild {
		return R.div(null, 'No editable view');
	}

	focusElement() {
		(this.getDomElement().querySelector('input') as HTMLInputElement)?.focus();
	}

	declare static encodeValue?: (val: any) => any;
	declare static decodeValue?: (val: any) => any;

}

class FieldHelp extends Component<any, any> {
	constructor(props: any) {
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
				className: 'field-wrap-help-container'
			},
			btn,
			body
		);
	}
}

interface FieldLabelProps {
	field: FieldDesc;
	required?: boolean;
	isEdit?: boolean;
	isSuccessAlert?: boolean;
	fieldAlert?: string;
	labelOverride?: string;
}

class FieldLabel extends Component<FieldLabelProps, any> {
	render() {
		const field: FieldDesc = this.props.field;
		let star;
		if (this.props.isEdit && this.props.required) {
			star = R.span({ className: 'field-wrap-required-star' }, '*');
		} else {
			star = '';
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
			star
		);
	}
}