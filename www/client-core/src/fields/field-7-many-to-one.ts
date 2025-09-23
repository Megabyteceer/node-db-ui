import { h, type ComponentChild } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import type { LookupValue, LookupValueIconic, RecordData } from '../bs-utils';
import { IMAGE_THUMBNAIL_PREFIX, VIEW_MASK } from '../bs-utils';
import Form, { type FormProps } from '../form';
import { R } from '../r';
import { idToImgURL, L, registerFieldClass, renderIcon, sp } from '../utils';
import BaseLookupField, { type BaseLookupFieldProps } from './base-lookup-field';
import type LookupManyToManyFiled from './field-14-many-to-many';

export default class LookupManyToOneFiled extends BaseLookupField {
	isEnterCreateThroughList = false;

	declare currentValue: LookupValueIconic;

	constructor(props: BaseLookupFieldProps) {
		super(props);

		this.toggleList = this.toggleList.bind(this);
		this.valueSelected = this.valueSelected.bind(this);
		this.toggleCreateDialogue = this.toggleCreateDialogue.bind(this);
		this.setValue = this.setValue.bind(this);

		this.handleClickOutside = this.handleClickOutside.bind(this);
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside, true);
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside, true);
	}

	handleClickOutside(event: MouseEvent) {
		const domNode = this.base;
		if (!domNode || !domNode.contains(event.target as HTMLDivElement)) {
			this.collapseList();
		}
	}

	valueSelected(recordData?: RecordData, _isNewCreated?: boolean, noToggleList?: boolean) {
		if (recordData) {
			if (!noToggleList) {
				this.toggleList();
			}
			if (
				!this.currentValue ||
				this.currentValue.id !== recordData.id ||
				this.currentValue.name !== recordData.name ||
				this.currentValue.icon !== (recordData as any as KeyedMap<string>)[this.props.fieldDesc.lookupIcon]
			) {
				const newVal: any = {
					id: recordData.id,
					name: recordData.name
				};
				if (this.props.fieldDesc.lookupIcon) {
					newVal.icon = (recordData as any as KeyedMap<string>)[this.props.fieldDesc.lookupIcon];
				}
				this.setValue(newVal);
				if (this.props.isN2M) {
					(this.parent as LookupManyToManyFiled).onSubItemSelect(newVal, this);
				} else {
					this.valueListener(newVal);
				}
			}
		}
	}

	static encodeValue(val: LookupValue) {
		if (val) {
			return { id: val.id };
		}
		return val;
	}

	setValue(value?: RecordData) {
		this.currentValue = value as any;

	}

	renderField(): ComponentChild {
		return R.span(null, this.renderLookupIcon(this.currentValue), (this.currentValue as LookupValue)?.name);
	}

	renderLookupIcon(value: LookupValueIconic) {
		if (value) {
			if (this.props.fieldDesc.lookupIcon && value.icon) {
				return R.img({
					className: 'field-lookup-icon-pic',
					src: idToImgURL(value.icon, this.props.fieldDesc.lookupIcon) + IMAGE_THUMBNAIL_PREFIX
				});
			} else {
				return R.div({
					className: 'field-lookup-icon-pic field-lookup-icon-pic-empty'
				});
			}
		}
	}

	renderFieldEditable() {

		const field = this.props.fieldDesc;
		const value = this.currentValue;

		let list;
		let clearBtn;
		if (this.state.expanded) {
			list = h(Form, {
				nodeId: field.nodeRef!.id,
				isLookup: true,
				isCompact: true,
				hideControls: true,
				viewMask: VIEW_MASK.DROPDOWN_LIST,
				parentForm: this.parentForm,
				parent: this,
				filters: this.fieldFilters
			} as FormProps);
		}

		if (list) {
			list = R.div(
				{
					className: 'field-lookup-drop-list'
				},
				list
			);
		}

		if (!this.required && !this.props.isN2M && value?.id) {
			clearBtn = R.div(
				{
					title: L('CLEAR'),
					className: 'clickable clear-btn',
					onClick: (e) => {
						sp(e);
						this.clearValue();
					}
				},
				renderIcon('times')
			);
		}

		let valLabel;
		if (value?.name) {
			valLabel = R.span(null, value.name);
		} else {
			valLabel = R.span(
				{
					className: 'field-lookup-value-label'
				},
				this.props.isN2M ? L('+ADD') : L('SELECT')
			);
		}

		return R.div(
			{
				className: 'field-lookup-wrapper'
			},
			R.div(
				{
					className: this.props.fieldDisabled
						? 'field-lookup-chooser not-clickable disabled'
						: 'field-lookup-chooser clickable',
					title: this.props.isCompact ? field.name : L('SELECT'),
					onClick: this.toggleList
				},
				R.span(
					{
						className: 'field-lookup-value'
					},
					this.renderLookupIcon(value),
					valLabel
				),
				R.span(
					{ className: 'field-lookup-right-block' },
					R.span(
						{
							className: 'field-lookup-caret'
						},
						renderIcon('caret-down')
					),
					clearBtn
				)
			),
			list
		);

	}
}
registerFieldClass(FIELD_TYPE.LOOKUP, LookupManyToOneFiled);
