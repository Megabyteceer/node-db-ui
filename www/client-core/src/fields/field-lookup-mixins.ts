import type { Component } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import type { GetRecordsFilter, NodeDesc, RecordData } from '../bs-utils';
import type { FormListItem } from '../forms/form-list-item';
import { assignFilters } from '../utils';
import type { FieldProps, FieldState } from './base-field';
import { BaseField } from './base-field';
import type { LookupManyToManyFiled } from './field-14-many-to-many';

type AdditionalButtonsRenderer = (
	node: NodeDesc,
	data: RecordData,
	refreshFunction?: () => void,
	formItem?: FormListItem | LookupManyToManyFiled
) => Component[];

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

interface LookupFieldProps extends FieldProps {
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

	generateDefaultFiltersByProps(props) {
		const ret = Object.assign({}, props.filters);

		const parentId =
			props.wrapper.props.form.props.initialData.id ||
			props.wrapper.props.form.filters[props.field.fieldName] ||
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
			if (this.state.filters[filtersObjOrName] !== val) {
				this.state.filters[filtersObjOrName] = val;
				this.forceUpdate();
			}
		} else {
			if (assignFilters(filtersObjOrName, this.state.filters)) {
				this.forceUpdate();
			}
		}
	}
}

export { AdditionalButtonsRenderer, fieldLookupMixins };
