import {R} from "js/entry.js";
import {getClassForField, L, n2mValuesEqual, renderIcon, sp, UID} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldLookupMixins from "./field-lookup-mixins.js";

var keyCounter = 0;
var dragItem;
var dragList;
var dragListenersInited;

var refs = [];

registerFieldClass(FIELD_14_NtoM, class LookupNtoMField extends fieldLookupMixins {

	constructor(props) {
		super(props);
		this.state.filters = this.generateDefaultFiltersByProps(this.props);
	}

	setValue(val) {
		if(!val) {
			val = [];
		}
		if(!n2mValuesEqual(val, this.state.value)) {
			this.setState({value: val});
		}
	}

	extendEditor() {
		this.setState({extendedEditor: true});
	}

	valueListener(newVal, withBounceDelay, sender) {
		if(sender.props.isNew) {
			this.state.value.splice(sender.props.pos, 0, newVal);
			this.forceUpdate();
			this.props.wrapper.valueListener(this.state.value, false, this);
		} else {
			if(this.state.value[sender.props.pos].id !== newVal.id) {
				this.state.value[sender.props.pos] = newVal;
				this.forceUpdate();
				this.props.wrapper.valueListener(this.state.value, false, this);
			}
		}
	}

	dragStart(item) {
		if(!dragListenersInited) {
			$(document).on('mouseup', () => {
				if(dragItem) {
					dragItem = undefined;
					dragList.forceUpdate();
					dragList = undefined;
				}
			});
			$(document).on('mousemove', (event) => {
				if(dragList) {
					dragItem;
					var y = event.clientY;
					if(y < 100) {
						document.body.scrollTop -= 10;
					}
					if(y > (document.body.offsetHeight - 100)) {
						document.body.scrollTop += 10;
					}
					var closestD = 1000000;
					var closestItem = undefined;

					dragList.state.value.some((i) => {
						var el = ReactDOM.findDOMNode(refs[UID(i)]);
						// @ts-ignore
						var ey = el.getBoundingClientRect();
						ey = (ey.top + ey.bottom) / 2;

						var d = Math.abs(y - ey);
						if(d < closestD) {
							closestD = d;
							closestItem = i;
						}
					});
					if(closestItem !== dragItem) {

						var toPos = dragList.state.value.indexOf(closestItem);
						var curPos = dragList.state.value.indexOf(dragItem);
						dragList.state.value.splice(curPos, 1);
						dragList.state.value.splice(toPos, 0, dragItem);
						dragList.forceUpdate();
					}
				}
			});
			dragListenersInited = true;
		}
		dragList = this;
		dragItem = item;
		this.forceUpdate();
	}

	deleteItemByIndex(i) {
		this.state.value.splice(i, 1);
		this.props.wrapper.valueListener(this.state.value, false, this);
		this.forceUpdate();
	}

	renderItem(field, value, i, isEdit) {

		var isDrag = (dragItem === value);
		var buttons;
		var isNew = '';
		if(!value) {
			isNew = 'n';
		}
		var additionalButtonsN2M = this.state.additionalButtonsN2M || this.props.additionalButtonsN2M;
		if(additionalButtonsN2M) {
			additionalButtonsN2M = additionalButtonsN2M(field, value, i, this);
		}

		if(isEdit) {
			if(value) {
				let reorderButton;
				if(this.state.extendedEditor) {
					reorderButton = R.button({
						title: L('FRAG_TO_REORDER'),
						className: isDrag ? 'toolbtn drag draggable default-btn' : 'toolbtn drag default-btn', onMouseDown: (e) => {
							sp(e);
							this.dragStart(value);
						}
					}, renderIcon('reorder'));
				}

				buttons = R.span({className: 'field-lookup-right-block'},
					additionalButtonsN2M,
					R.button({
						title: L('EDIT'),
						className: 'clickable toolbtn edit-btn', onClick: () => {
							this.uidToEdit = UID(this.state.value[i]);
							this.forceUpdate();
						}
					},
						renderIcon('pencil')
					),
					R.button({
						title: L('LIST_REMOVE'),
						className: 'clickable toolbtn danger-btn', onClick: () => {
							this.deleteItemByIndex(i);
						}
					},
						renderIcon('times')
					),
					reorderButton
				)
			}

			if(isEdit || value) {
				var editIt = value && this.uidToEdit === UID(value);
				if(editIt) {
					delete (this.uidToEdit);
					editIt = value.id;
				}
				var key;
				if(value) {
					key = UID(value);
				} else {
					key = 'emp' + keyCounter;
					keyCounter++;
				}
				var body = R.div({key: key, ref: value ? (ref) => {refs[UID(value)] = ref;} : undefined, className: isDrag ? 'lookup-n2m-item lookup-n2m-item-drag' : 'lookup-n2m-item'},

					React.createElement(getClassForField(FIELD_7_Nto1), {
						field, preventCreateButton: this.state.preventCreateButton, editIt, pos: i, isEdit, isN2M: true, filters: this.state.filters, ref: (ref) => {
							if(ref) {
								ref.setLookupFilter({'exludeIDs': this.exludeIDs || this.state.filters.exludeIDs});
							}
						}, isNew: isNew, wrapper: this, initialValue: value, isCompact: this.props.isCompact, fieldDisabled: this.props.fieldDisabled
					}),
					buttons
				);
				return body;
			} else {
				return undefined;
			}
		}
	}

	render() {
		if(!this.state.value) {
			this.state.value = [];
		}
		var value = this.state.value;
		var field = this.props.field;

		var exludeIDs = this.state.filters.exludeIDs ? this.state.filters.exludeIDs.slice() : undefined;

		for(let v of value) {
			if(v && v.id) {
				if(!exludeIDs) {
					exludeIDs = [];
				}
				exludeIDs.push(v.id);
			}
		}

		this.exludeIDs = exludeIDs;

		var lines = [];
		value.forEach((value, i) => {
			lines.push(this.renderItem(field, value, i, this.props.isEdit));
		});

		lines.push(this.renderItem(field, null, lines.length, this.props.isEdit));

		return R.div(null,
			lines
		);

	}
});