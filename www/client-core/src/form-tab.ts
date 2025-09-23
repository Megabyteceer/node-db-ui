import { h } from 'preact';
import { FieldAdmin } from './admin/field-admin';
import BaseField, { type BaseFieldProps, type BaseFieldState } from './base-field';
import { R } from './r';
import { globals } from './types/globals';
import { renderIcon } from './utils';

const activeTabContentProps = {
	className: 'form-tab'
};
const tabContentProps = {
	className: 'form-tab hidden'
};

export interface TabFieldProps extends BaseFieldProps {
	active: boolean;
}

export class TabField extends BaseField<TabFieldProps, BaseFieldState> {

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

		return R.span(
			{ key: tabField.fieldName, className: 'header-tab-wrap' },
			R.span(
				{
					className: this.props.active ? 'tab-header-button tab-header-button-active not-clickable' : 'tab-header-button tab-header-button-inactive clickable',
					onClick: this.props.active
						? undefined
						: () => {
							this.activate();
						}
				},
				renderIcon(tabField.icon),
				tabField.name
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

		return	R.div(this.props.active ? activeTabContentProps : tabContentProps,
			this.props.fieldDesc.tabFields!.map(i => this.parentForm.renderField(i, this)));

	}
}

globals.TabField = TabField;
globals.FormTabContent = FormTabContent;