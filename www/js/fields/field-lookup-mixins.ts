import React from "react";
import { FIELD_15_1toN, NodeDesc, RecId, RecordData, RecordsData } from "../bs-utils";
import { FormItem } from "../forms/form-item";
import { Filters } from "../utils";
import { LookpuManyToManyFiled } from "./field-14-many-to-many";
import { BaseField, FieldProps, FieldState } from "./base-field";

type AdditionalButtonsRenderer = (node: NodeDesc, data: RecordData, refreshFunction?: () => void, formItem?: FormItem | LookpuManyToManyFiled, editButtonFilters?: Filters) => React.Component[];

interface LookupFieldState extends FieldState {
	filters?: Filters;
	expanded?: boolean;
	preventCreateButton?: boolean;
	extendedEditor?: boolean;
	inlineEditing?: boolean;
	noPreviewButton?: boolean;
	disableDrafting?: boolean;
	hideControlls?: boolean;
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

		if(props.field.fieldType === FIELD_15_1toN) {
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
			var leastOneUpdated;
			var keys = Object.keys(filtersObjOrName);
			for(var i = keys.length; i > 0;) {
				i--;
				var name = keys[i];
				var value = filtersObjOrName[name];
				if(this.state.filters[name] !== value) {
					this.state.filters[name] = value;
					leastOneUpdated = true;
				}
			}
			if(leastOneUpdated) {
				this.forceUpdate();
			}
		}
	}
}

export { fieldLookupMixins, AdditionalButtonsRenderer };