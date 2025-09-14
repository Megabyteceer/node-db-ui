import type { Component } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import type { GetRecordsFilter, RecordData } from '../bs-utils';
import type { FormListItem } from '../forms/form-list-item';
import { assignFilters } from '../utils';
import type { FieldProps, FieldState } from './base-field';
import { BaseField } from './base-field';

type AdditionalButtonsRenderer = (
	field: NodeDesc,
	data: RecordData,
	refreshFunction?: () => void,
	formItem?: FormListItem
) => Component[] | undefined;

interface LookupFieldState extends FieldState {
	filters?: GetRecordsFilter;
	expanded?: boolean;
	preventCreateButton?: boolean;
	extendedEditor?: boolean;
	inlineEditing?: boolean;
	noPreviewButton?: boolean;
	disableDrafting?: boolean;
	hideControls?: boolean;
	additionalButtons?: AdditionalButtonsRenderer;
	additionalButtonsN2MRenderer?: AdditionalButtonsRenderer;
}

export interface LookupFieldProps extends FieldProps {
	filters?: GetRecordsFilter;
	expanded?: boolean;
	hideIcon?: boolean;
	noPreviewButton?: boolean;
	preventCreateButton?: boolean;
	/** true - if this 1toM field is a item in NtoM lookup list */
	isN2M?: boolean;
	additionalButtonsN2MRenderer?: AdditionalButtonsRenderer;
	additionalButtons?: AdditionalButtonsRenderer;
}

class fieldLookupMixins extends BaseField<LookupFieldProps, LookupFieldState> {
	componentDidUpdate() {
		if (!this.state.filters) {
			this.setState({ filters: this.generateDefaultFiltersByProps(this.props) });
		}
	}

	getLinkerFieldName() {
		return this.props.field.fieldName + 'Linker';
	}

	generateDefaultFiltersByProps(props: LookupFieldProps) {
		const ret = Object.assign({}, props.filters) as KeyedMap<number | 'new'>;

		const parentId =
			(props.wrapper.props.form!.props.initialData as RecordData).id ||
			(props.wrapper.props.form!.filters as KeyedMap<number>)[props.field.fieldName] ||
			'new';

		if (props.field.fieldType === FIELD_TYPE.LOOKUP_1_TO_N) {
			ret[props.field.fieldName + 'Linker'] = parentId;
		} /* else {
			ret[props.field.fieldName] = parentId;
		} */

		return ret;
	}

	setLookupFilter(filtersObjOrName: string | GetRecordsFilter, val?: any) {
		if (typeof filtersObjOrName === 'string') {
			if ((this.state.filters as KeyedMap<any>)[filtersObjOrName] !== val) {
				(this.state.filters as KeyedMap<any>)[filtersObjOrName] = val;
				this.forceUpdate();
			}
		} else {
			if (assignFilters(filtersObjOrName, this.state.filters as KeyedMap<any>)) {
				this.forceUpdate();
			}
		}
	}
}

export { AdditionalButtonsRenderer, fieldLookupMixins };
