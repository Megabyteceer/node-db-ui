import type { FormFilters, NodeDesc, RecId, RecordData, RecordsData, VIEW_MASK } from '../bs-utils';
import type { AdditionalButtonsRenderer } from '../fields/field-lookup-mixins';
import type { FieldWrap } from '../fields/field-wrap';
import { goBack, L, showPrompt, updateHashLocation } from '../utils';

import { Component, type ComponentChildren, type ComponentProps, type ComponentType } from 'preact';
import { assert } from '../assert';
import type { LookupOneToManyFiled } from '../fields/field-15-one-to-many';
import type { List } from './list';

interface FormProps extends ComponentProps<ComponentType<any>> {
	initialData?: RecordData | RecordsData;
	list?: List;
	parentForm?: LookupOneToManyFiled;
	filters?: FormFilters;
	node: NodeDesc;
	isRootForm?: boolean;
	nodeId: RecId;
	recId?: RecId;
	noPreviewButton?: boolean;
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
	overrideOrderData?: number;
}

interface FormState {
	data?: RecordData | RecordsData;
	node: NodeDesc;
	preventCreateButton?: boolean;
	footerHidden?: boolean;
	header?: string;
	hideControls?: boolean;
}

class BaseForm<T extends FormProps = FormProps, T2 extends FormState = FormState> extends Component<T, T2> {

	nodeId: RecId;
	/** id of current edited/shown record. 'new' - if record is not saved yet. */
	recId?: RecId | 'new';
	/** true if form is editable or read only */
	editable?: boolean;

	/** *List* - uses *filters* as filters values for records fetch request;
	 * *FullForm* - uses *filters* as initialData and current tab store;  */
	filters: FormFilters;

	fieldsRefs: { [key: string]: FieldWrap };
	/** set content of form header */
	header: string | preact.Component;

	isDataModified: boolean;

	constructor(props: T) {
		super(props);
		this.nodeId = this.props.nodeId || this.props.node!.id;
		this.recId = (this.props.initialData && this.props.initialData.hasOwnProperty('id')) ? (this.props.initialData as RecordData).id : this.props.recId;
		this.filters = Object.assign({}, this.props.filters);
		this.editable = this.props.editable;

		(this as any).state = {};
		this.fieldsRefs = {};
		this.cancelClick = this.cancelClick.bind(this);
		this.header = '';
		this.isDataModified = false;
	}

	componentWillReceiveProps(newProps: FormProps) {
		assert(((this.recId || 'new') === ((newProps.initialData ? (newProps.initialData as RecordData)?.id : newProps.recId) || 'new')) && (this.nodeId === (newProps.nodeId || newProps.node.id)), 'Form should be recreated, and not receive new props. Add \'key\' to parent element contains nodeId and recId.');
	}

	callOnTabShowEvent(_tabNameToShow: string) {
		/** virtual */
	}

	isSubForm() {
		return !!this.props.parentForm;
	}

	forceBouncingTimeout() {
	}

	async cancelClick() {
		this.forceBouncingTimeout();
		if (this.isDataModified) {
			const answer = await showPrompt(L('FORM_IS_MODIFIED'), L('LEAVE_WITHOUT_SAVING'), L('KEEP_EDITING'));
			if (!answer) {
				return;
			}
		}
		goBack();
	}

	setFormFilter(name: string, val: string) {
		if (!this.filters) {
			this.filters = {};
		}
		if ((this.filters as KeyedMap<string>)[name] !== val) {
			(this.filters as KeyedMap<string>)[name] = val;
			this.forceUpdate();
			updateHashLocation(true);
			return true;
		}
	}

	render(): ComponentChildren {
		return 'base form has no default render';
	}
}
export { BaseForm, FormProps, FormState };
