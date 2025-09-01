

import { h, type Component } from 'preact';
import { FIELD_TYPE } from '../../../../types/generated';
import { globals } from '../../../../types/globals';
import type { RecId } from '../bs-utils';
import { R } from '../r';
import { getClassForField, L, n2mValuesEqual, registerFieldClass, renderIcon, sp, UID } from '../utils';
import { fieldLookupMixins } from './field-lookup-mixins';

let keyCounter = 0;
let dragItem;
let dragList: LookupManyToManyFiled;
let dragListenersInitialized;

const refs = [] as Component[];

class LookupManyToManyFiled extends fieldLookupMixins {
	excludeIDs: RecId[];

	constructor(props) {
		super(props);
		// @ts-ignore
		this.state.filters = this.generateDefaultFiltersByProps(this.props);
	}

	setValue(val) {
		if (!val) {
			val = [];
		}
		if (!n2mValuesEqual(val, this.state.value)) {
			this.setState({ value: val });
		}
	}

	extendEditor() {
		this.setState({ extendedEditor: true });
	}

	valueListener(newVal, _withBounceDelay, sender) {
		if (sender.props.isNew) {
			this.state.value.splice(sender.props.pos, 0, newVal);
			this.forceUpdate();
			this.props.wrapper.valueListener(this.state.value, false, this);
		} else {
			if (this.state.value[sender.props.pos].id !== newVal.id) {
				this.state.value[sender.props.pos] = newVal;
				this.forceUpdate();
				this.props.wrapper.valueListener(this.state.value, false, this);
			}
		}
	}

	dragStart(item) {
		if (!dragListenersInitialized) {
			window.document.addEventListener('mouseup', () => {
				if (dragItem) {
					dragItem = undefined;
					dragList.forceUpdate();
					dragList = undefined;
				}
			});
			window.document.addEventListener('mousemove', (event) => {
				if (dragList) {
					const y = event.clientY;
					if (y < 100) {
						document.body.scrollTop -= 10;
					}
					if (y > document.body.offsetHeight - 100) {
						document.body.scrollTop += 10;
					}
					let closestD = 1000000;
					let closestItem = undefined;

					dragList.state.value.some((i) => {
						const el = refs[UID(i)].base as HTMLDivElement;

						const bounds = el.getBoundingClientRect();
						const elementY = (bounds.top + bounds.bottom) / 2;

						const d = Math.abs(y - elementY);
						if (d < closestD) {
							closestD = d;
							closestItem = i;
						}
					});
					if (closestItem !== dragItem) {
						const toPos = dragList.state.value.indexOf(closestItem);
						const curPos = dragList.state.value.indexOf(dragItem);
						dragList.state.value.splice(curPos, 1);
						dragList.state.value.splice(toPos, 0, dragItem);
						dragList.forceUpdate();
					}
				}
			});
			dragListenersInitialized = true;
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
		const isDrag = dragItem === value;
		let buttons;
		let isNew = '';
		if (!value) {
			isNew = 'n';
		}
		let additionalButtonsN2M;
		const additionalButtonsN2MRenderer =
			this.state.additionalButtonsN2MRenderer || this.props.additionalButtonsN2MRenderer;
		if (additionalButtonsN2MRenderer) {
			additionalButtonsN2M = additionalButtonsN2MRenderer(field, value, i, this);
		}

		if (isEdit) {
			if (value) {
				let reorderButton;
				if (this.state.extendedEditor) {
					reorderButton = R.button(
						{
							title: L('FRAG_TO_REORDER'),
							className: isDrag
								? 'tool-btn drag draggable default-btn'
								: 'tool-btn drag default-btn',
							onMouseDown: (e) => {
								sp(e);
								this.dragStart(value);
							},
						},
						renderIcon('reorder')
					);
				}

				buttons = R.span(
					{ className: 'field-lookup-right-block' },
					additionalButtonsN2M,
					R.button(
						{
							title: L('EDIT'),
							className: 'clickable tool-btn edit-btn',
							onClick: () => {
								const recId = this.props.form.recId;
								const filters = {
									[this.getLinkerFieldName()]: { id: recId },
								};
								globals.Stage.showForm(
									this.props.field.nodeRef.id,
									recId,
									filters,
									true,
									true,
									(newData: object) => {
										if (!newData) {
											//deleted
											this.deleteItemByIndex(i);
										} else {
											for (const fName in value) {
												if (newData.hasOwnProperty(fName)) {
													value[fName] = newData[fName];
												}
											}
										}
										this.forceUpdate();
									}
								);
							},
						},
						renderIcon('pencil')
					),
					R.button(
						{
							title: L('LIST_REMOVE'),
							className: 'clickable tool-btn danger-btn',
							onClick: () => {
								this.deleteItemByIndex(i);
							},
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
						ref: value
							? (ref) => {
								refs[UID(value)] = ref;
							  }
							: undefined,
						className,
					},

					h(getClassForField(FIELD_TYPE.LOOKUP), {
						field,
						preventCreateButton: this.state.preventCreateButton,
						pos: i,
						isEdit,
						isN2M: true,
						filters: this.state.filters,
						ref: (ref) => {
							if (ref) {
								// @ts-ignore
								ref.setLookupFilter({
									excludeIDs: this.excludeIDs || this.state.filters.excludeIDs,
								});
							}
						},
						isNew: isNew,
						wrapper: this,
						initialValue: value,
						isCompact: this.props.isCompact,
						fieldDisabled: this.props.fieldDisabled,
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
		if (!this.state.value) {
			//@ts-ignore
			this.state.value = [];
		}
		const value = this.state.value;
		const field = this.props.field;

		let excludeIDs =
			this.state.filters &&
			(this.state.filters.excludeIDs ? this.state.filters.excludeIDs.slice() : undefined);

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

export { LookupManyToManyFiled };

