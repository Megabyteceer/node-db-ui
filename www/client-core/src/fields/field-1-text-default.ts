import type { ComponentChild } from 'preact';
import BaseField from '../base-field';
import { R } from '../r';
import { FIELD_TYPE } from '../types/generated';
import { consoleDir, isAutoFocus, registerFieldClass } from '../utils';

export default class TextField extends BaseField {

	setValue(value: any) {
		this.refToInput!.value = value;
		super.setValue(value);
	}

	renderFieldEditable() {
		let value = this.currentValue;

		if (typeof value === 'undefined') {
			value = '';
			this.valueListener('', false);
		}

		const field = this.props.fieldDesc;

		if (typeof value !== 'string') {
			if (value === null || value === undefined) {
				value = '';
			} else {
				setTimeout(() => {
					console.error('non string value for field ' + field.name + ' with default type');
					// debugError('non string value for field '+field.name+' with default type');
				}, 1);
				/// #if DEBUG
				consoleDir(field);
				consoleDir(value);
				/// #endif
				value = JSON.stringify(value);
			}
		}

		let className;
		if (this.props.isCompact) {
			if (field.maxLength! > 600) {
				className = 'middle-size-input';
			}
		} else {
			if (field.maxLength! > 600) {
				className = 'large-input';
			} else if (field.maxLength! > 200) {
				className = 'middle-size-input';
			}
		}

		if (this.props.fieldDisabled) {
			className += ' not-clickable';
		}

		const inputsProps = {
			className,
			autoFocus: isAutoFocus(),
			defaultValue: value,
			maxLength: field.maxLength,
			title: field.name,
			name: field.fieldName,
			placeholder: field.name + (field.lang ? ' (' + field.lang + ')' : ''),
			readOnly: this.props.fieldDisabled,
			ref: this.refGetter,
			onInput: () => {
				this.valueListener(this.refToInput!.value, true);
			}
		};

		if (field.maxLength! > 200) {
			return R.textarea(inputsProps);
		} else {
			return R.input(inputsProps);
		}
	}

	renderField(): ComponentChild {
		return this.renderTextValue(this.currentValue);
	}

}

registerFieldClass(FIELD_TYPE.TEXT, TextField);
