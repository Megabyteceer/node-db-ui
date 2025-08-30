import type React from 'react';
import { Component } from 'react';
import type { BoolNum, GetRecordsFilter, NodeDesc, RecId, RecordData, RecordsData, VIEW_MASK } from '../bs-utils';
import type { LookupOneToManyFiled } from '../fields/field-15-one-to-many';
import type { AdditionalButtonsRenderer } from '../fields/field-lookup-mixins';
import type { FieldWrap } from '../fields/field-wrap';
import { goBack, L, showPrompt, updateHashLocation } from '../utils';

import { assert } from '../assert';
import type { List } from './list';

interface FormProps {
	initialData?: RecordData;
	list?: List;
	parentForm?: LookupOneToManyFiled;
	filters?: GetRecordsFilter;
	node: NodeDesc;
	isRootForm?: boolean;
	nodeId: RecId;
	recId: RecId;
	isLookup?: boolean;
	viewMask?: VIEW_MASK;
	editable?: boolean;
	isCompact?: boolean;
	inlineEditable?: boolean;
	hideControls?: boolean;
	disableDrafting?: boolean;
	preventDeleteButton?: boolean;
	additionalButtons?: AdditionalButtonsRenderer;

	/** sets data for "order" filed. Used for ordered 1toM lookup lists */
	overrideOrderData: number;
}

interface FormState {
	data?: RecordData | RecordsData;
	node: NodeDesc;
	preventCreateButton: boolean;
	footerHidden: boolean;
	header?: string;
	hideControls?: boolean;
}

class BaseForm<T extends FormProps = FormProps, T2 extends FormState = FormState> extends Component<T, T2> {
	nodeId: RecId;
	/** id of current edited/shown record. 'new' - if record is not saved yet.*/
	recId: RecId | 'new';
	/** true if form is editable or read only */
	editable: boolean;

	/** *List* - uses *filters* as filters values for records fetch request;
	 * *FullForm* - uses *filters* as initialData and current tab store;  */
	filters: GetRecordsFilter;

	fieldsRefs: { [key: string]: FieldWrap };
	/** set content of form header */
	header: string | React.ReactElement;
	hiddenFields: { [key: string]: BoolNum };

	isDataModified: boolean;

	constructor(props: FormProps) {
		super(props as T);
		this.nodeId = this.props.nodeId || this.props.node.id;
		this.recId = (this.props.initialData && this.props.initialData.hasOwnProperty('id')) ? this.props.initialData.id : this.props.recId;
		this.filters = Object.assign({}, this.props.filters);
		this.editable = this.props.editable;

		//@ts-ignore
		this.state = {};
		this.fieldsRefs = {};
		this.cancelClick = this.cancelClick.bind(this);
		this.header = '';
		this.isDataModified = false;
	}

	UNSAFE_componentWillReceiveProps(newProps) {
		assert(((this.recId || 'new') === ((newProps.initialData ? newProps.initialData.id : newProps.recId) || 'new')) && (this.nodeId === (newProps.nodeId || newProps.node.id)), 'Form should be recreated, and not receive new props. Add \'key\' to parent element contains nodeId and recId.');
	}

	callOnTabShowEvent(tabNameToShow) {

	}

	isSubForm() {
		if (this.props.parentForm) {
			return true;
		}
		return false;
	}

	forceBouncingTimeout() {
	}

	async cancelClick() {
		this.forceBouncingTimeout();
		if (this.isDataModified) {
			const answer = await showPrompt(L('FORM_IS_MODIFIED'), L('LEAVE_WITHOUT_SAVING'));
			if (!answer) {
				return;
			}
		}
		goBack();
	}

	setFormFilter(name, val) {
		if (!this.filters) {
			this.filters = {};
		}
		if (this.filters[name] !== val) {
			this.filters[name] = val;
			this.forceUpdate();
			updateHashLocation(true);
			return true;
		}
	}
}
export { BaseForm, FormProps, FormState };

