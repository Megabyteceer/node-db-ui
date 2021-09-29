import React from "react";
import { FIELD_TYPE_LOOKUP_1toN_15, NodeDesc, RecId, RecordData, RecordsData } from "../bs-utils";
import { FormListItem } from "../forms/form-list-item";
import { assignFilters, Filters } from "../utils";
import { LookupManyToManyFiled } from "./field-14-many-to-many";
import { BaseField, FieldProps, FieldState } from "./base-field";

type AdditionalButtonsRenderer = (node: NodeDesc, data: RecordData, refreshFunction?: () => void, formItem?: FormListItem | LookupManyToManyFiled, editButtonFilters?: Filters) => React.Component[];

interface LookupFieldState extends FieldState {
	filters?: Filters;
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
	filters?: Filters;
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
		if(!this.state.filters) {
			this.setState({ filters: this.generateDefaultFiltersByProps(this.props) });
		}
	}

	getLinkerFieldName() {
		return this.props.field.fieldName + '_linker';
	}

	generateDefaultFiltersByProps(props) {
		var ret = Object.assign({}, props.filters);

		var parentId = props.wrapper.props.form.props.initialData.id || props.wrapper.props.form.filters[props.field.fieldName] || 'new';

		if(props.field.fieldType === FIELD_TYPE_LOOKUP_1toN_15) {
			ret[props.field.fieldName + '_linker'] = parentId;
		}/* else {
			ret[props.field.fieldName] = parentId;
		}*/

		return ret;
	}

	setLookupFilter(filtersObjOrName: string | Filters, val?: any) {
		if(typeof filtersObjOrName === 'string') {
			if(this.state.filters[filtersObjOrName] !== val) {
				this.state.filters[filtersObjOrName] = val;
				this.forceUpdate();
			}
		} else {
			if(assignFilters(filtersObjOrName, this.state.filters)) {
				this.forceUpdate();
			}
		}
	}
}

export { fieldLookupMixins, AdditionalButtonsRenderer };