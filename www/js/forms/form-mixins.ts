import { Component } from "react";
import { BoolNum, Filters, NodeDesc, RecId, RecordData } from "../bs-utils.js";
import { Lookup1toNField } from "../fields/field-15-12n.js";
import { AdditionalButtonsRenderer } from "../fields/field-lookup-mixins.js";
import { FieldWrap } from "../fields/field-wrap.js";
import { currentFormParameters, goBack } from "../utils";
import { List } from "./list";

interface FormProps {
	initialData?: RecordData;
	list?: List;
	onCancel?: () => void;
	parentForm?: Lookup1toNField;
	filters?: Filters;
	node: NodeDesc;
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

	filters: Filters;
	fieldsRefs: { [key: string]: FieldWrap };
	header: string;
	onCancelCallback: () => void | null;
	hiddenFields: { [key: string]: BoolNum };

	constructor(props) {
		super(props);
		//@ts-ignore
		this.state = {};
		this.filters = Object.assign({}, this.props.filters);
		this.fieldsRefs = {};
		this.cancelClick = this.cancelClick.bind(this);
		this.header = '';
		this.onCancelCallback = null;
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
				if(!this.isSubForm()) {
					delete (currentFormParameters.filters[name]);
				}
				delete (this.filters[name]);
			} else {
				if(!this.isSubForm()) {
					currentFormParameters.filters[name] = v;
				}
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
}
export { BaseForm, FormProps, FormState };
