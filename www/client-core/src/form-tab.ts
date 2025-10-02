import { h } from 'preact';
import { FieldAdmin } from './admin/field-admin';
import BaseField, { type BaseFieldProps, type BaseFieldState } from './base-field';
import { R } from './r';
import { globals } from './types/globals';
import { renderIcon } from './utils';

export interface TabFieldProps extends BaseFieldProps {
	active: boolean;
}

export default class TabField extends BaseField<TabFieldProps, BaseFieldState> {

	activate() {
		if (!this.props.active) {
			this.parentForm.setFormFilter('tab', this.props.fieldDesc.fieldName);
		}
	}

	async beforeFocus() {
		if (!this.props.active) {
			this.activate();
			return new Promise((resolve) => {
				this.forceUpdate(async () => {
					await super.beforeFocus();
					resolve();
				});
			}) as Promise<void>;
		} else {
			return super.beforeFocus();
		}
	}

	render() {
		const tabField = this.props.fieldDesc;
		let alertBody;
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

		let className = this.props.active ? 'tab-header-button tab-header-button-active not-clickable' : 'tab-header-button tab-header-button-inactive clickable';
		className += ' tab-header-' + this.parentForm.nodeDesc.tableName + '--' + tabField.fieldName;

		return R.span(
			{ key: tabField.fieldName, className: this.parentForm.isFieldVisible(tabField.fieldName) ? 'header-tab-wrap' : 'header-tab-wrap hidden' },
			R.span(
				{
					className,
					onClick: this.props.active
						? undefined
						: () => {
							this.activate();
						}
				},
				renderIcon(tabField.icon),
				tabField.name,
				alertBody
			),
			/// #if DEBUG
			h(FieldAdmin, { field: tabField, form: this.parentForm })
			/// #endif
		);
	}

}

export class FormTabContent extends BaseField<TabFieldProps, BaseFieldState> {

	activate() {
		if (!this.props.active) {
			this.parentForm.setFormFilter('tab', this.props.fieldDesc.fieldName);
		}
	}

	_registerField(): void {
		/** disabled.  register tab button instead */
	}

	async beforeFocus() {
		if (!this.props.active) {
			this.activate();
			return new Promise((resolve) => {
				this.forceUpdate(async () => {
					await super.beforeFocus();
					resolve();
				});
			}) as Promise<void>;
		} else {
			return super.beforeFocus();
		}
	}

	render() {
		let className = 'form-tab form-tab-' + this.props.fieldDesc.fieldName;
		if (!this.props.active) {
			className += ' hidden';
		}
		return	R.div({ className },
			this.props.fieldDesc.tabFields!.map(i => this.parentForm.renderField(i, this)));
	}
}

globals.TabField = TabField;
globals.FormTabContent = FormTabContent;