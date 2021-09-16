import React, { Component } from "react";
import { BoolNum, Filters, NodeDesc, RecId, RecordData, throwError } from "../bs-utils";
import { LookpuOneToManyFiled } from "../fields/field-15-one-to-many";
import { AdditionalButtonsRenderer } from "../fields/field-lookup-mixins";
import type { FieldWrap } from "../fields/field-wrap";
import { LeftBar } from "../left-bar";
import { goBack, updateHashLocation } from "../utils";

import type { List } from "./list";

interface FormProps {
	initialData?: RecordData;
	list?: List;
	onCancel?: () => void;
	parentForm?: LookpuOneToManyFiled;
	filters?: Filters;
	node: NodeDesc;
	isRootForm?: boolean;
	nodeId: RecId;
	recId: RecId;
	isLookup?: boolean;
	editable?: boolean;
	isCompact?: boolean;
	inlineEditable?: boolean;
	hideControlls?: boolean;
	disableDrafting?: boolean;
	preventDeleteButton?: boolean;
	additionalButtons?: AdditionalButtonsRenderer;

	/** sets data for "order" filed. Used for ordered 1toM lookup lists */
	overrideOrderData: number;
}

interface FormState {
	data?: RecordData;
	node: NodeDesc;
	preventCreateButton: boolean;
	footerHidden: boolean;
	header?: string;
	hideControlls?: boolean;
}

class BaseForm<T extends FormProps = FormProps, T2 extends FormState = FormState> extends Component<T, T2> {
	nodeId: RecId;
	/** id of current edited/shown record. 'new' - if record is not saved yet.*/
	recId: RecId | 'new';
	/** true if form is editable or read only */
	editable: boolean;
	filters: Filters;
	fieldsRefs: { [key: string]: FieldWrap };
	/** set content of form header */
	header: string | React.Component;
	hiddenFields: { [key: string]: BoolNum };

	constructor(props: FormProps) {
		super(props as T);
		this.nodeId = this.props.nodeId || this.props.node.id;
		this.recId = this.props.initialData ? this.props.initialData.id : this.props.recId;
		this.filters = this.props.filters;
		this.editable = this.props.editable;

		//@ts-ignore
		this.state = {};
		this.filters = Object.assign({}, this.props.filters);
		this.fieldsRefs = {};
		this.cancelClick = this.cancelClick.bind(this);
		this.header = '';
		updateHashLocation();
	}

	UNSAFE_componentWillReceiveProps(newProps) {
		throwError("Form should be recreated, and not receive new props. Add 'key' to parent element contains nodeId and recId.");
	}

	callOnTabShowEvent(tabNameToShow) {

	}

	refreshData() {

	}

	changeFilter(name: string, v?: any, refresh?: boolean) {
		if(name === 'tab') {
			this.callOnTabShowEvent(v);
		}

		var p = this.filters[name];

		if((p !== 0) && (v !== 0)) {
			if(!p && !v) return;
		}

		if(p !== v) {

			if(typeof (v) === 'undefined') {
				delete (this.filters[name]);
				delete (this.filters[name]);
			} else {
				this.filters[name] = v;
				this.filters[name] = v;
			}
			if(refresh) {
				this.refreshData();
			}
			return true;
		}
		return false;
	}

	isSubForm() {
		if(this.props.parentForm) {
			return true;
		}
		return false;
	}

	cancelClick() {
		//TODO: check if data is modified and ask if user is sure to exit
		if(this.props.onCancel) {
			this.props.onCancel();
			return;
		}
		goBack();
	}

	setFormFilter(name, val) {
		if(!this.filters) {
			this.filters = {};
		}
		if(this.filters[name] !== val) {
			this.filters[name] = val;
			this.forceUpdate();
			if(name === 'tab' && this.props.isRootForm) {
				LeftBar.instance.refreshLeftBarActive();
			}
			updateHashLocation();
			return true;
		}
	}
}
export { BaseForm, FormProps, FormState };
