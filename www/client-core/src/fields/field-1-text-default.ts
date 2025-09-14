import { FIELD_TYPE } from '../../../../types/generated';
import { R } from '../r';
import { consoleDir, registerFieldClass } from '../utils';
import { BaseField__old } from './base-field';

registerFieldClass(
	FIELD_TYPE.TEXT,
	class TextField extends BaseField__old {

		setValue(value: string) {
			this.refToInput!.value = value;
			this.setState({ value });
		}

		render() {
			let value = this.state.value;
			const field = this.props.field;

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

			if (this.props.isEdit) {
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
					autoFocus: this.isAutoFocus(),
					defaultValue: value,
					maxLength: this.props.maxLen || field.maxLength,
					title: field.name,
					name: field.fieldName,
					placeholder: field.name + (field.lang ? ' (' + field.lang + ')' : ''),
					readOnly: this.props.fieldDisabled,
					ref: this.refGetter,
					onInput: () => {
						this.props.wrapper!.valueListener(this.refToInput!.value, true, this);
					}
				};

				if (field.maxLength! > 200) {
					return R.textarea(inputsProps);
				} else {
					return R.input(inputsProps);
				}
			} else {
				return this.renderTextValue(value);
			}
		}
	}
);
