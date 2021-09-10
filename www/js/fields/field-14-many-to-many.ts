import ReactDOM from "react-dom";
import React from "react";

import { FIELD_14_NtoM, FIELD_7_Nto1, RecId } from "../bs-utils";
import { R } from "../r";
import { getClassForField, L, n2mValuesEqual, renderIcon, sp, UID } from "../utils";
import { registerFieldClass } from "../utils";
import { fieldLookupMixins } from "./field-lookup-mixins";

var keyCounter = 0;
var dragItem;
var dragList;
var dragListenersInited;

var refs = [];

class LookpuManyToManyFiled extends fieldLookupMixins {
	uidToEdit: number;
	excludeIDs: RecId[];

	constructor(props) {
		super(props);
		// @ts-ignore
		this.state.filters = this.generateDefaultFiltersByProps(this.props);
	}

	setValue(val) {
		if(!val) {
			val = [];
		}
		if(!n2mValuesEqual(val, this.state.value)) {
			this.setState({ value: val });
		}
	}

	extendEditor() {
		this.setState({ extendedEditor: true });
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
						var el = ReactDOM.findDOMNode(refs[UID(i)]) as HTMLDivElement;

						var bounds = el.getBoundingClientRect();
						let elementY = (bounds.top + bounds.bottom) / 2;

						var d = Math.abs(y - elementY);
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
		var additionalButtonsN2M;
		var additionalButtonsN2MRenderer = this.state.additionalButtonsN2MRenderer || this.props.additionalButtonsN2MRenderer;
		if(additionalButtonsN2MRenderer) {
			additionalButtonsN2M = additionalButtonsN2MRenderer(field, value, i, this);
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

				buttons = R.span({ className: 'field-lookup-right-block' },
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

				let className = 'lookup-n2m-item'
				if(value) {
					className += ' lookup-n2m-item-rec-' + value.id;
				}
				if(isDrag) {
					className += ' lookup-n2m-item-drag';
				}

				var body = R.div({ key: key, ref: value ? (ref) => { refs[UID(value)] = ref; } : undefined, className },

					React.createElement(getClassForField(FIELD_7_Nto1), {
						field, preventCreateButton: this.state.preventCreateButton, editIt, pos: i, isEdit, isN2M: true, filters: this.state.filters, ref: (ref) => {
							if(ref) {
								// @ts-ignore
								ref.setLookupFilter({ 'excludeIDs': this.excludeIDs || this.state.filters.excludeIDs });
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
			//@ts-ignore
			this.state.value = [];
		}
		var value = this.state.value;
		var field = this.props.field;

		var excludeIDs = this.state.filters && (this.state.filters.excludeIDs ? this.state.filters.excludeIDs.slice() : undefined);

		for(let v of value) {
			if(v && v.id) {
				if(!excludeIDs) {
					excludeIDs = [];
				}
				excludeIDs.push(v.id);
			}
		}

		this.excludeIDs = excludeIDs;

		var lines = [];
		value.forEach((value, i) => {
			lines.push(this.renderItem(field, value, i, this.props.isEdit));
		});

		lines.push(this.renderItem(field, null, lines.length, this.props.isEdit));

		return R.div(null,
			lines
		);

	}
}

registerFieldClass(FIELD_14_NtoM, LookpuManyToManyFiled);

export { LookpuManyToManyFiled };