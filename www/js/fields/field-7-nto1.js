import {R} from "js/entry.js";
import FormFull from "../forms/form-full.js";
import List from "../forms/list.js";
import {backupCreationData, getBackupData, getNode, getNodeData, idToImgURL, L, renderIcon, scrollToVisible, sp} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldLookupMixins from "./field-lookup-mixins.js";

registerFieldClass(FIELD_7_Nto1, class EnumField extends fieldLookupMixins {

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
		if(nextProps.editIt) { //edit item in extended n2m list
			if(!this.state.expanded) {
				this.setState({
					expanded: true
				});
			}
			this.toggleCreateDialogue(nextProps.editIt);
		}

		if(this.props.filters) {
			if(!this.state.filters) {
				this.state.filters = {};
			}
			for(var k in this.props.filters) {
				if(this.props.filters.hasOwnProperty(k)) {
					this.state.filters[k] = this.props.filters[k];
				}
			}
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
				expanded: !this.state.expanded,
				dataToEdit: undefined,
				creationOpened: false
			});
		}
	}

	valueChoosed(recordData, isNewCreated, noToggleList) {
		if(recordData) {
			if(!noToggleList) {

				this.toggleList();
			}
			if(!this.state.value || (this.state.value.id !== recordData.id) || (this.state.value.name !== recordData.name) || (this.state.value.icon !== recordData[this.props.field.icon])) {
				var newVal = {
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
			this.setState({
				creationOpened: false
			});
		}
	}

	toggleCreateDialogue(itemIdToEdit, defaultCreationData, backupPrefix) {

		if(defaultCreationData) {
			var curBackup = getBackupData(this.props.field.nodeRef, backupPrefix);
			backupCreationData(this.props.field.nodeRef, Object.assign(curBackup, defaultCreationData), backupPrefix);
		}
		this.clearLeaveTimeout();
		let isOpened = this.state.creationOpened;
		this.setState({
			creationOpened: !isOpened,
			backupPrefix: backupPrefix,
			dataToEdit: undefined,
			itemIdToEdit: itemIdToEdit
		});
		if(isOpened) {
			this.setState({
				expanded: this.isEnterCreateThroughList
			});
		}
		if(typeof itemIdToEdit !== 'undefined') {
			this.isEnterCreateThroughList = this.state.expanded;
			getNodeData(this.props.field.nodeRef, itemIdToEdit, undefined, true).then((data) => {
				getNode(this.props.field.nodeRef).then((node) => {
					this.saveNodeDataAndFilters(node);
					this.setState({
						dataToEdit: data,
						itemIdToEdit: undefined
					});
				});
			});
		} else {
			this.setState({
				dataToEdit: {}
			});
		}
	}

	onMouseLeave() {
		if(this.state.expanded && !this.state.creationOpened) {
			this.leaveTimout = setTimeout(() => {this.toggleList();}, 400);
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
		this.state.value = val;
		this.forceUpdate();
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
		}
		if(this.props.isEdit) {
			var list;
			var clearBtn;
			if(this.state.expanded) {
				if(this.state.creationOpened) {
					if(this.state.itemIdToEdit) {
						list = R.div({
							className: 'field-lookup-loading-icon-container'
						},
							renderIcon('cog fa-spin fa-2x')
						);
					} else {
						list = React.createElement(FormFull, {
							preventDeleteButton: true,
							node: this.savedNode,
							nodeId: field.nodeRef,
							backupPrefix: this.state.backupPrefix,
							initialData: this.state.dataToEdit || {},
							isCompact: true,
							parentForm: this,
							isLookup: true,
							filters: this.savedFilters || this.state.filters,
							editable: true
						});
					}
				} else {
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
						this.valueChoosed({
							id: 0,
							name: ''
						}, false, true);
						if(this.state.expanded) {
							this.toggleList();
						}
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
				}, this.props.noBorder ? L('+ADD') : L('SELECT'))
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
					R.span({className: 'field-lookup-right-block'},
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