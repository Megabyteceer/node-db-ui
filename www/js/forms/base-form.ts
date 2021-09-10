import { Component } from "react";
import { BoolNum, Filters, NodeDesc, RecId, RecordData } from "../bs-utils";
import { Lookup1toNField } from "../fields/field-15-12n";
import { AdditionalButtonsRenderer } from "../fields/field-lookup-mixins";
import { FieldWrap } from "../fields/field-wrap";
import { LeftBar } from "../left-bar";
import { goBack, updateHashLocation } from "../utils";

/// #if EDITOR
import { List } from "./list";
/// #endif

interface FormProps {
	initialData?: RecordData;
	list?: List;
	onCancel?: () => void;
	parentForm?: Lookup1toNField;
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

interface FormParameters {
	nodeId: RecId,
	recId: RecId | 'new',
	editable: boolean,
	filters: Filters
}

class BaseForm<T extends FormProps = FormProps, T2 extends FormState = FormState> extends Component<T, T2> {

	formParameters: FormParameters;
	filters: Filters;
	fieldsRefs: { [key: string]: FieldWrap };
	header: string;
	onCancelCallback: () => void | null;
	hiddenFields: { [key: string]: BoolNum };

	constructor(props: FormProps) {
		super(props as T);
		this.formParameters = {
			nodeId: this.props.nodeId || this.props.node.id,
			recId: this.props.recId,
			filters: this.props.filters,
			editable: this.props.editable
		};
		//@ts-ignore
		this.state = {};
		this.filters = Object.assign({}, this.props.filters);
		this.fieldsRefs = {};
		this.cancelClick = this.cancelClick.bind(this);
		this.header = '';
		this.onCancelCallback = null;
		this.updateHashLocation();
	}

	UNSAFE_componentWillReceiveProps(newProps) {
		this.filters = $.extend({}, newProps.filters);
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
				delete (this.formParameters.filters[name]);
				delete (this.filters[name]);
			} else {
				this.formParameters.filters[name] = v;
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
		if(this.props.onCancel) {
			this.props.onCancel();
			return;
		}
		if(this.onCancelCallback) {
			this.onCancelCallback();
		}
		if(this.isSubForm()) {
			this.props.parentForm.toggleCreateDialogue();
		} else {
			goBack();
		}
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
			return true;
		}
	}

	updateHashLocation() {
		if(this.props.isRootForm) {
			updateHashLocation();
		}
	}
}
export { BaseForm, FormProps, FormState };
