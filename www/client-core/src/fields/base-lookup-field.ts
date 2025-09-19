import { FIELD_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import { throwError } from '../assert';
import BaseField, { type BaseFieldProps, type BaseFieldState } from '../base-field';
import type { GetRecordsFilter, RecId, RecordData } from '../bs-utils';
import { scrollToVisible } from '../scroll-to-visible';
import { assignFilters } from '../utils';

export interface BaseLookupFieldProps extends BaseFieldProps {
	isNew?: boolean;
	isN2M?: boolean;
	excludeIDs?: RecId[];
	pos?: number;
	preventCreateButton?: boolean; // TODO
}

export interface BaseLookupFieldState extends BaseFieldState {
	expanded?: boolean;
}

export default class BaseLookupField extends BaseField<BaseLookupFieldProps, BaseLookupFieldState> {

	excludeIDs?: RecId[];
	preventCreateButton = false;

	constructor(props: BaseLookupFieldProps) {
		super(props);
		this.fieldFilters = this.generateDefaultFiltersByProps(props);
		this.excludeIDs = props.excludeIDs;
	}

	valueSelected(_recordData?: RecordData, _isNewCreated?: boolean, _noToggleList?: boolean): void {
		throwError('not implemented');
	}

	clearValue() {
		this.valueSelected();
		this.collapseList();
	}

	setLookupFilter(filtersObjOrName: string | GetRecordsFilter, val?: any) {
		if (typeof filtersObjOrName === 'string') {
			if ((this.fieldFilters as KeyedMap<any>)[filtersObjOrName] !== val) {
				(this.fieldFilters as KeyedMap<any>)[filtersObjOrName] = val;
				this.forceUpdate();
			}
		} else {
			if (assignFilters(this.fieldFilters as KeyedMap<any>, filtersObjOrName)) {
				this.forceUpdate();
			}
		}
	}

	getLinkerFieldName() {
		return this.props.fieldDesc.fieldName + 'Linker';
	}

	toggleList() {
		if (!this.props.fieldDisabled || this.state.expanded) {
			this.setState({
				expanded: !this.state.expanded
			});
		}
	}

	collapseList() {
		if (this.state.expanded) {
			this.toggleList();
		}
	}

	getParentLookupField(): BaseLookupField | undefined {
		return this.parent as BaseLookupField;
	}

	hideCreateButton() {
		this.preventCreateButton = true;
		this.forceUpdate();
	}

	generateDefaultFiltersByProps(props: BaseLookupFieldProps) {
		const ret = {} as KeyedMap<number | 'new'>;

		const parentId =
			props.parentForm.formData!.id ||
			(props.parentForm!.formFilters as KeyedMap<number>)[props.fieldDesc.fieldName] ||
			'new';

		if (props.fieldDesc.fieldType === FIELD_TYPE.LOOKUP_1_TO_N) {
			ret[props.fieldDesc.fieldName + 'Linker'] = parentId;
		} /* else {
				ret[props.field.fieldName] = parentId;
			} */

		return ret;
	}

	async saveParentFormBeforeCreation() {
		if (this.props.parentForm.props.editable) {
			await this.props.parentForm.saveClick();
		}
		const linkerFieldName = this.getLinkerFieldName();
		(this.fieldFilters as KeyedMap<any>)[linkerFieldName] = this.props.parentForm.formData!.id;
	}

	toggleCreateDialogue(recIdToEdit?: RecId | 'new') {
		this.collapseList();
		const filters = this.parentForm
			? {
				[this.getLinkerFieldName()]: { id: this.parentForm.formData!.id }
			}
			: undefined;
		globals.Stage.showForm(
			this.props.fieldDesc.nodeRef!.id,
			recIdToEdit,
			filters,
			true,
			true,
			(newData?: RecordData) => {
				const value = this.currentValue;
				if (recIdToEdit === value.id) {
					if (!newData) {
						this.clearValue();
					} else {
						this.setValue(newData);
					}
					scrollToVisible(this);
				} else if (recIdToEdit === 'new' && newData) {
					this.valueSelected(newData, true, true);
					scrollToVisible(this);
				}
			}
		);
	}

}