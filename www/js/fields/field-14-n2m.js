import constants from "../custom/consts.js";
import {getClassForField, L, n2mValuesEqual, renderIcon, sp, UID} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldLookupMixins from "./field-lookup-mixins.js";

var keyCounter = 0;
var dragItem;
var dragList;
var dragListenersInited;

var refs = [];

registerFieldClass(FIELD_14_NtoM, class TextField extends fieldLookupMixins {

	constructor(props) {
		super(props);
		this.state = {filters: this.generateDefaultFiltersByProps(this.props)};
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

	isDividerItem(v, field) {
		return this.state.extendedEditor && v && (v[field.icon] === '111111');
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
		if(this.beforeRemoveChecking) {
			this.beforeRemoveChecking(() => {
				this.state.value.splice(i, 1);
				this.forceUpdate();

			}, this.state.value[i], this);
		} else {
			this.state.value.splice(i, 1);
			this.forceUpdate();
		}
	}

	renderItem(field, v, i, isEdit) {

		var isDrag = (dragItem === v);
		var buttons;
		var isNew = '';
		if(!v) {
			isNew = 'n';
		}
		var additionalButtonsN2M = this.state.additionalButtonsN2M || this.props.additionalButtonsN2M;
		if(additionalButtonsN2M) {
			additionalButtonsN2M = additionalButtonsN2M(field, v, i, this);
		}

		if(isEdit) {
			if(this.state.extendedEditor) {
				if(v) {

					buttons = ReactDOM.div({style: {width: '30%', display: 'inline-block', verticalAlign: 'middle', textAlign: 'right'}},
						additionalButtonsN2M,
						/*ReactDOM.button({style:{background: constants.EDIT_COLOR, color:'#fff'}, title:L('MOVE_UP'), className:'clickable toolbtn', onClick:() => {
								
								if (i > 0) {
									var t = this.state.value[i];
									this.state.value[i] = this.state.value[i-1];
									this.state.value[i-1] = t;
									this.forceUpdate();
								}
							}},
							renderIcon('arrow-up')
						),
						ReactDOM.button({style:{background: constants.EDIT_COLOR, color:'#fff'}, title:L('MOVE_DOWN'), className:'clickable toolbtn', onClick:() => {
								if(i < (this.state.value.length-1)){
									var t = this.state.value[i];
									this.state.value[i] = this.state.value[i+1];
									this.state.value[i+1] = t;
									this.forceUpdate();
								}
								
							}},
							renderIcon('arrow-down')
						),*/
						ReactDOM.button({
							style: {background: constants.EDIT_COLOR, color: '#fff'}, title: L('EDIT'), className: 'clickable clickable-edit toolbtn', onClick: () => {
								this.uidToEdit = UID(this.state.value[i]);
								this.forceUpdate();
							}
						},
							renderIcon('pencil')
						),
						ReactDOM.button({
							style: {background: constants.DELETE_COLOR, color: '#fff'}, title: L('LIST_REMOVE'), className: 'clickable clickable-del toolbtn', onClick: () => {
								this.deleteItemByIndex(i);

							}
						},
							renderIcon('times')
						),
						ReactDOM.div({
							style: {color: '#bbb', fontSize: '140%', verticalAlign: 'middle', display: 'inline-block'}, className: isDrag ? 'drag' : 'draggable', onMouseDown: (e) => {
								sp(e);
								this.dragStart(v);
							}
						}, renderIcon('reorder'))
					)
				} else {
					/*buttons = ReactDOM.div({style:{width:'20%', display:'inline-block', fontSize:'50%', verticalAlign:'middle', textAlign:'left'}, className:'halfvisible'},
						ReactDOM.button({style:{background:'#0a7', color:'#fff'}, title:L('ADD_DIVIDER'), className:'clickable toolbtn', onClick:() => {
								this.state.value.splice(i,0,{id:0, name:L('NEW_GROUP')});
								this.forceUpdate();
							}},
							renderIcon('plus'), L('DIVIDER')
						)
					)*/
				}
			} else if(v) {
				buttons = ReactDOM.div({style: {width: '30%', display: 'inline-block', fontSize: '60%', verticalAlign: 'middle', textAlign: 'left'}, className: 'halfvisible'},
					additionalButtonsN2M,
					ReactDOM.button({
						style: {background: constants.EDIT_COLOR, color: '#fff'}, title: L('EDIT'), className: 'clickable clickable-edit toolbtn', onClick: () => {
							this.uidToEdit = UID(this.state.value[i]);
							this.forceUpdate();
						}
					},
						renderIcon('pencil')
					),
					ReactDOM.button({
						style: {background: constants.DELETE_COLOR, color: '#fff'}, title: L('LIST_REMOVE'), className: 'clickable clickable-del toolbtn', onClick: () => {
							this.deleteItemByIndex(i);
						}
					},
						renderIcon('times')
					)
				)
			}
		}

		if(isEdit || v) {

			var editIt = v && this.uidToEdit === UID(v);
			if(editIt) {
				delete (this.uidToEdit);
				editIt = v.id;
			}

			var borderBottom;

			var key;
			if(v) {
				key = UID(v);

				if(!this.isDividerItem(v, field)) {
					borderBottom = '1px solid #ccc';
				}
			} else {
				key = 'emp' + keyCounter;
				keyCounter++;
			}

			var body = ReactDOM.div({key: key, ref: v ? (ref) => {refs[UID(v)] = ref;} : undefined, style: {padding: '2px 20px', borderBottom: borderBottom, outline: isDrag ? '3px solid #0d5' : undefined}},
				ReactDOM.div({style: {width: '70%', display: 'inline-block'}},
					React.createElement(getClassForField(FIELD_7_Nto1), {
						field: field, preventCreateButton: this.state.preventCreateButton, editIt: editIt, hideIcon: this.isDividerItem(v, field), pos: i, isEdit, isN2M: true, filters: this.state.filters, noBorder: true, ref: (ref) => {
							if(ref) {
								ref.setLookupFilter({'exludeIDs': this.exludeIDs || this.state.filters.exludeIDs});
							}
						}, isNew: isNew, wrapper: this, initialValue: v, isCompact: this.props.isCompact, fieldDisabled: this.props.fieldDisabled
					})
				),
				buttons
			);

			if(this.isDividerItem(v, field)) {
				return ReactDOM.div({key: key, noBorder: true, style: {background: '#eee', fontWeight: 'bold', padding: '5px', marginTop: (i === 0) ? 0 : '40px'}},
					body
				)
			} else {
				return body;
			}
		} else {
			return undefined;
		}
	}

	render() {
		if(!this.state.value) {
			this.state.value = [];
		}
		var value = this.state.value;
		var field = this.props.field;

		var exludeIDs = [];

		if(this.state.filters.exludeIDs) {
			for(let id of this.state.filters.exludeIDs.split(',')) {
				if(id) {
					exludeIDs.push(id);
				}
			}
		}

		for(let v of value) {
			if(v && v.id) {
				exludeIDs.push(v.id);
			}
		}

		this.exludeIDs = exludeIDs.length ? exludeIDs.join(',') : undefined;

		var lines = [];
		value.forEach((v, i) => {
			if(i !== 0 && this.isDividerItem(v, field)) {
				lines.push(this.renderItem(field, null, i, this.props.isEdit));
			}
			lines.push(this.renderItem(field, v, i, this.props.isEdit));
		});

		lines.push(this.renderItem(field, null, lines.length, this.props.isEdit));

		return ReactDOM.div(null,
			//ReactDOM.h3({key:'header', style:{marginBottom:15}}, field.name),
			lines
		);

	}
});