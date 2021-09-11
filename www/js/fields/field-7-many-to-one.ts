import { FIELD_7_Nto1, RecId, RecordData } from "../bs-utils";
import { R } from "../r";
import React from "react";
import { List } from "../forms/list";
import { idToImgURL, L, renderIcon, scrollToVisible, sp } from "../utils";
import { registerFieldClass } from "../utils";
import { fieldLookupMixins } from "./field-lookup-mixins";

registerFieldClass(FIELD_7_Nto1, class LookpuManyToOneFiled extends fieldLookupMixins {
	isEnterCreateThroughList: boolean;
	private leaveTimout: NodeJS.Timeout;

	constructor(props) {
		super(props);

		var val = props.initialValue;
		if(typeof val === 'string') {
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
		this.clearLeaveTimeout = this.clearLeaveTimeout.bind(this);
		this.onMouseLeave = this.onMouseLeave.bind(this);
		this.toggleList = this.toggleList.bind(this);
		this.valueChoosed = this.valueChoosed.bind(this);
		this.toggleCreateDialogue = this.toggleCreateDialogue.bind(this);
		this.setValue = this.setValue.bind(this);
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		if(this.props.filters) {
			if(!this.state.filters) {
				//@ts-ignore
				this.state.filters = {};
			}
			Object.assign(this.state.filters, this.props.filters);
		}
	}

	componentWillUnmount() {
		this.clearLeaveTimeout();
	}

	toggleList() {
		if(!this.props.fieldDisabled || this.state.expanded) {
			if(this.state.expanded) {
				scrollToVisible(this, true);
			}
			this.setState({
				expanded: !this.state.expanded
			});
		}
	}

	valueChoosed(recordData: RecordData, isNewCreated?: boolean, noToggleList?: boolean) {
		if(recordData) {
			if(!noToggleList) {

				this.toggleList();
			}
			if(!this.state.value || (this.state.value.id !== recordData.id) || (this.state.value.name !== recordData.name) || (this.state.value.icon !== recordData[this.props.field.icon])) {
				var newVal: any = {
					id: recordData.id,
					name: recordData.name
				};
				if(this.props.field.icon) {
					newVal.icon = recordData[this.props.field.icon];
				}
				this.setValue(newVal);
				this.props.wrapper.valueListener(newVal, false, this);

				if(isNewCreated) {
					this.saveNodeDataAndFilters(this.savedNode);
				}
			}
		} else {
			this.saveNodeDataAndFilters(this.savedNode, undefined, this.savedFilters);
		}
	}

	collapseList() {
		if(this.state.expanded) {
			this.toggleList();
		}
	}

	toggleCreateDialogue(recIdToEdit?: RecId | 'new') {
		this.collapseList();
		const filters = {
			[this.getLinkerFieldName()]: { id: this.props.form.recId }
		};
		window.crudJs.Stage.showForm(this.props.field.nodeRef, recIdToEdit, filters, true, true, (newData: RecordData) => {
			const value = this.state.value;
			if(recIdToEdit === value.id) {
				this.savedData = null;
				if(!newData) {
					this.clearValue();
				} else {
					this.setValue(newData);
				}
				scrollToVisible(this);
			} else if(recIdToEdit === 'new' && newData) {
				this.valueChoosed(newData, true, true);
				scrollToVisible(this);
			}
		});
	}

	onMouseLeave() {
		if(this.state.expanded) {
			this.leaveTimout = setTimeout(() => { this.toggleList(); }, 400);
		}
	}

	clearLeaveTimeout() {
		if(this.leaveTimout) {
			clearTimeout(this.leaveTimout);
			delete (this.leaveTimout);
		}
	}

	static encodeValue(val) {

		if(val && val.hasOwnProperty('id')) {
			return val.id;
		} else {
			return val;
		}
	}

	setValue(val) {
		//@ts-ignore
		this.state.value = val;
		this.forceUpdate();
	}

	clearValue() {
		this.valueChoosed({
			id: 0,
			name: ''
		}, false, true);
		this.collapseList();
	}

	render() {

		var field = this.props.field;
		var value = this.state.value;
		var iconPic;
		if(field.icon && value && (!this.props.hideIcon) && value.icon) {
			iconPic = R.img({
				className: 'field-lookup-icon-pic',
				src: idToImgURL(value.icon, field.icon)
			});
		} else {
			iconPic = R.div({
				className: 'field-lookup-icon-pic field-lookup-icon-pic-empty'
			});

		}
		if(this.props.isEdit) {
			var list;
			var clearBtn;
			if(this.state.expanded) {

				list = React.createElement(List, {
					node: this.savedNode,
					preventCreateButton: this.state.preventCreateButton || this.props.preventCreateButton,
					initialData: this.savedData,
					nodeId: field.nodeRef,
					isLookup: true,
					parentForm: this,
					filters: this.savedFilters || this.state.filters
				})

			}

			if(list) {
				list = R.div({
					className: 'field-lookup-drop-list',
					ref: (ref) => {
						scrollToVisible(ref, true);
					}
				},
					list
				);
			}

			if(!field.requirement && !this.props.isN2M) {
				clearBtn = R.div({
					title: L('CLEAR'),
					className: 'clickable clear-btn',
					onClick: (e) => {
						sp(e);
						this.clearValue();
					}
				},
					renderIcon('times')
				)
			} else {
			}

			var valLabel;
			if(value && value.name) {
				valLabel = R.span(null, value.name);
			} else {
				valLabel = R.span({
					className: 'field-lookup-value-label'
				}, this.props.isN2M ? L('+ADD') : L('SELECT'))
			}

			return R.div({
				className: 'field-lookup-wrapper',
				onMouseLeave: this.onMouseLeave,
				onMouseEnter: this.clearLeaveTimeout
			},
				R.div({
					className: this.props.fieldDisabled ? 'field-lookup-chooser unclickable disabled' : 'field-lookup-chooser clickable',
					title: this.props.isCompact ? field.name : L('SELECT'),
					onClick: this.toggleList
				},
					R.span({
						className: 'field-lookup-value'
					},
						iconPic,
						valLabel
					),
					R.span({ className: 'field-lookup-right-block' },
						R.span({
							className: 'field-lookup-caret'
						},
							renderIcon('caret-down')
						),
						clearBtn
					)
				),
				list
			)
		} else {
			return R.span(null,
				iconPic, value.name
			)
		}

	}
});