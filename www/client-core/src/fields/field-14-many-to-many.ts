import { h } from 'preact';
import type { LookupValue, LookupValueIconic, RecordData } from '../bs-utils';
import { R } from '../r';
import { FIELD_TYPE } from '../types/generated';
import { globals } from '../types/globals';
import { L, n2mValuesEqual, registerFieldClass, renderIcon, sp, UID } from '../utils';
import BaseLookupField, { type BaseLookupFieldProps } from './base-lookup-field';
import LookupManyToOneFiled from './field-7-many-to-one';

let keyCounter = 0;
let dragItem: LookupValue | undefined;
/* let dragList: LookupManyToManyFiled | undefined;
let dragListenersInitialized = false; */

export default class LookupManyToManyFiled extends BaseLookupField {

	declare currentValue: LookupValueIconic[];

	extendedEditor = false;

	setValue(val: LookupValue[]) {
		if (!val) {
			val = [];
		}
		if (!n2mValuesEqual(val, this.currentValue)) {
			this.currentValue = val;
		}
	}

	extendEditor() {
		this.extendedEditor = true;
		this.forceUpdate();
	}

	onSubItemSelect(newVal: LookupValueIconic, sender: LookupManyToOneFiled) {
		if (sender?.props.isNew) {
			this.currentValue.splice(sender.props.pos!, 0, newVal);
			this.forceUpdate();
			this.valueListener(this.currentValue);
		} else {
			if (this.currentValue[sender.props.pos!].id !== newVal.id) {
				this.currentValue[sender.props.pos!] = newVal;
				this.forceUpdate();
				this.valueListener(this.currentValue);
			}
		}
	}

	dragStart(_item: LookupValue) {
		/*
		if (!dragListenersInitialized) {
			window.document.addEventListener('mouseup', () => {
				if (dragItem) {
					dragItem = undefined;
					dragList!.forceUpdate();
					dragList = undefined;
				}
			});
			window.document.addEventListener('mousemove', (event) => {
				if (dragList) {
					debugger;
					const y = event.clientY;
					if (y < 100) {
						document.body.scrollTop -= 10;
					}
					if (y > document.body.offsetHeight - 100) {
						document.body.scrollTop += 10;
					}
					let closestD = 1000000;
					let closestItem = undefined as FormNode | undefined;

					this.children.some((i) => {
						const el = i.getDomElement();
						const bounds = el.getBoundingClientRect();
						const elementY = (bounds.top + bounds.bottom) / 2;

						const d = Math.abs(y - elementY);
						if (d < closestD) {
							closestD = d;
							closestItem = i;
						}
					});
					if (closestItem !== dragItem) {
						const toPos = dragList.currentValue.indexOf(closestItem);
						const curPos = dragList.currentValue.indexOf(dragItem);
						dragList.currentValue.splice(curPos, 1);
						dragList.currentValue.splice(toPos, 0, dragItem);
						dragList.forceUpdate();
					}
				}
			});
			dragListenersInitialized = true;
		}
		dragList = this;
		dragItem = item;
		this.forceUpdate(); */
	}

	deleteItemByIndex(i: number) {
		this.currentValue.splice(i, 1);
		this.valueListener(this.currentValue);
		this.forceUpdate();
	}

	renderItem(field: FieldDesc, value: LookupValue | null, i: number, isEdit = false) {
		const isDrag = dragItem === value;
		let buttons;
		let isNew = !value;

		if (isEdit) {
			if (value) {
				let reorderButton;
				if (this.extendedEditor) {
					reorderButton = R.button(
						{
							title: L('FRAG_TO_REORDER'),
							className: isDrag
								? 'tool-btn drag draggable default-btn'
								: 'tool-btn drag default-btn',
							onMouseDown: (e: MouseEvent) => {
								sp(e);
								this.dragStart(value);
							}
						},
						renderIcon('reorder')
					);
				}

				buttons = R.span(
					{ className: 'field-lookup-right-block' },
					R.button(
						{
							title: L('EDIT'),
							className: 'clickable tool-btn edit-btn',
							onClick: () => {
								const recId = this.props.parentForm.recId;
								const filters = {
									[this.getLinkerFieldName()]: { id: recId }
								};
								globals.Stage.showForm(
									this.props.fieldDesc.nodeRef!.id,
									recId,
									filters,
									true,
									true,
									(newData?: RecordData) => {
										if (!newData) {
											// deleted
											this.deleteItemByIndex(i);
										} else {
											for (const fName in value) {
												if (newData.hasOwnProperty(fName)) {
													(value as KeyedMap<any>)[fName] = (newData as KeyedMap<any>)[fName];
												}
											}
										}
										this.forceUpdate();
									}
								);
							}
						},
						renderIcon('pencil')
					),
					R.button(
						{
							title: L('LIST_REMOVE'),
							className: 'clickable tool-btn danger-btn',
							onClick: () => {
								this.deleteItemByIndex(i);
							}
						},
						renderIcon('times')
					),
					reorderButton
				);
			}

			if (isEdit || value) {
				let key;
				if (value) {
					key = UID(value);
				} else {
					key = 'emp' + keyCounter;
					keyCounter++;
				}

				let className = 'lookup-n2m-item';
				if (value) {
					className += ' lookup-n2m-item-rec-' + value.id;
				}
				if (isDrag) {
					className += ' lookup-n2m-item-drag';
				}

				const body = R.div(
					{
						key: key,
						className
					},

					h(LookupManyToOneFiled, {
						hideControls: this.props.hideControls || this.state.hideControls,
						parentForm: this.parentForm,
						fieldDesc: field,
						pos: i,
						isEdit,
						isN2M: true,
						filters: this.fieldFilters,
						excludeIDs: this.excludeIDs,
						isNew: isNew,
						parent: this,
						initialValue: value,
						isCompact: true,
						fieldDisabled: this.props.fieldDisabled
					} as BaseLookupFieldProps),
					buttons
				);
				return body;
			} else {
				return undefined;
			}
		}
	}

	renderFieldEditable() {
		if (!this.currentValue) {
			this.currentValue = [];
			return R.fragment();
		}
		const value = this.currentValue as LookupValue[];
		const field = this.props.fieldDesc;

		let excludeIDs = this.excludeIDs?.slice();

		for (const v of value) {
			if (v && v.id) {
				if (!excludeIDs) {
					excludeIDs = [];
				}
				excludeIDs.push(v.id);
			}
		}

		this.excludeIDs = excludeIDs;

		const lines = [];
		value.forEach((value, i) => {
			lines.push(this.renderItem(field, value, i, this.props.isEdit));
		});

		lines.push(this.renderItem(field, null, lines.length, this.props.isEdit));

		return R.div(null, lines);
	}
}

registerFieldClass(FIELD_TYPE.LOOKUP_N_TO_M, LookupManyToManyFiled);
