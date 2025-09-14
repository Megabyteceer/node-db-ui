import { h } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import type { LookupValue, RecId, RecordData } from '../bs-utils';
import { IMAGE_THUMBNAIL_PREFIX } from '../bs-utils';
import { List__olf } from '../forms/list';
import { R } from '../r';
import { getNode, idToImgURL, L, registerFieldClass, renderIcon, scrollToVisible, sp } from '../utils';
import { fieldLookupMixins, type LookupFieldProps } from './field-lookup-mixins';

class LookupManyToOneFiled extends fieldLookupMixins {
	isEnterCreateThroughList = false;
	node?: NodeDesc;

	constructor(props: LookupFieldProps) {
		super(props);

		let val = props.initialValue;
		if (typeof val === 'string') {
			val = {
				id: val,
				name: 'selected'
			};
			this.props.wrapper.valueListener(val, false, this);
		}
		this.state = {
			filters: this.generateDefaultFiltersByProps(this.props),
			value: val
		};
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

	componentWillReceiveProps(_nextProps: LookupFieldProps) {
		if (this.props.filters) {
			if (!this.state.filters) {
				this.setState({ filters: {} });
			}
			Object.assign(this.state.filters!, this.props.filters);
		}
	}

	toggleList() {
		if (!this.props.fieldDisabled || this.state.expanded) {
			this.setState({
				expanded: !this.state.expanded
			});
		}
	}

	valueSelected(recordData?: RecordData, _isNewCreated?: boolean, noToggleList?: boolean) {
		if (recordData) {
			if (!noToggleList) {
				this.toggleList();
			}
			if (
				!this.state.value ||
				this.state.value.id !== recordData.id ||
				this.state.value.name !== recordData.name ||
				this.state.value.icon !== (recordData as any as KeyedMap<string>)[this.props.field.lookupIcon]
			) {
				const newVal: any = {
					id: recordData.id,
					name: recordData.name
				};
				if (this.props.field.lookupIcon) {
					newVal.icon = (recordData as any as KeyedMap<string>)[this.props.field.lookupIcon];
				}
				this.setValue(newVal);
				this.props.wrapper.valueListener(newVal, false, this);
			}
		}
	}

	collapseList() {
		if (this.state.expanded) {
			this.toggleList();
		}
	}

	toggleCreateDialogue(recIdToEdit?: RecId | 'new') {
		this.collapseList();
		const filters = this.props.form
			? {
				[this.getLinkerFieldName()]: { id: this.props.form.recId }
			}
			: undefined;
		globals.Stage.showForm(
			this.props.field.nodeRef!.id,
			recIdToEdit,
			filters,
			true,
			true,
			(newData: RecordData | null) => {
				const value = this.state.value;
				if (recIdToEdit === value.id) {
					if (!newData) {
						this.clearValue();
					} else {
						this.setValue(newData);
					}
					scrollToVisible(this);
				} else if (recIdToEdit === 'new' && newData) {
					this.valueSelected(newData, true, true);
					scrollToVisible(this);
				}
			}
		);
	}

	static encodeValue(val: LookupValue) {
		if (val) {
			return { id: val.id };
		}
		return val;
	}

	setValue(value: RecordData | null) {
		this.setState({ value });
	}

	clearValue() {
		this.valueSelected(
			{
				id: 0,
				name: ''
			},
			false,
			true
		);
		this.collapseList();
	}

	render() {

		if (!this.node) {
			getNode(this.props.field.nodeRef!.id).then((nodeDesc) => {
				this.node = nodeDesc;
				this.forceUpdate();
			});
			return renderIcon('cog fa-spin');
		}

		const field = this.props.field;
		const value = this.state.value;
		let iconPic;
		if (value) {
			if (field.lookupIcon && !this.props.hideIcon && value.icon) {
				iconPic = R.img({
					className: 'field-lookup-icon-pic',
					src: idToImgURL(value.icon, field.lookupIcon) + IMAGE_THUMBNAIL_PREFIX
				});
			} else {
				iconPic = R.div({
					className: 'field-lookup-icon-pic field-lookup-icon-pic-empty'
				});
			}
		}
		if (this.props.isEdit) {
			let list;
			let clearBtn;
			if (this.state.expanded) {
				list = h(List__olf, {
					preventCreateButton: this.state.preventCreateButton || this.props.preventCreateButton,
					node: this.node,
					nodeId: field.nodeRef!.id,
					isLookup: true,
					parentForm: this,
					filters: this.state.filters
				});
			}

			if (list) {
				list = R.div(
					{
						className: 'field-lookup-drop-list'
					},
					list
				);
			}

			if (!this.isRequired() && !this.props.isN2M && value?.id) {
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
						iconPic,
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
		} else {
			return R.span(null, iconPic, value && value.name);
		}
	}
}
registerFieldClass(
	FIELD_TYPE.LOOKUP,
	LookupManyToOneFiled
);

export type { LookupManyToOneFiled };
