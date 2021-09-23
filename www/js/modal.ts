import { Component } from "react";
import { R } from "./r";
import { debugError, sp } from "./utils";

var modalStack = [];
var idCounter = 0;

class Modal extends Component<any, any> {
	static instance: Modal;

	constructor(props) {
		super(props);
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
	}

	componentDidMount() {
		Modal.instance = this;
	}

	show(content, noDiscardByBackdrop) {
		if(document.activeElement) {
			// @ts-ignore
			document.activeElement.blur();
		}
		idCounter++;
		if(content) {
			modalStack.push({ content: content, noDiscardByBackdrop: noDiscardByBackdrop, id: idCounter });
		}
		this.forceUpdate();
		return idCounter;
	}

	isShowed() {
		return modalStack.length > 0;
	}

	hide(idToHide?) {
		if(typeof (idToHide) !== 'number') {
			/// #if DEBUG
			if(modalStack.length < 1) {
				debugError('tried to hide modal while no modal showed');
			}
			/// #endif
			modalStack.pop();
		} else {
			modalStack = modalStack.filter((m) => {
				return m.id !== idToHide;
			});
		}
		this.forceUpdate();
	}

	render() {
		if(modalStack.length > 0) {
			return R.div(null,
				modalStack.map((m) => {
					let className = 'fade-in modal-backdrop';
					if(!m.noDiscardByBackdrop) {
						className += " pointer";
					}
					return R.div({
						key: m.id, className, onClick: () => {
							if(!m.noDiscardByBackdrop) {
								this.hide();
							}
						}
					},
						R.div({ className: "modal", onClick: sp },
							m.content
						)
					);
				})
			);
		} else {
			return R.span();
		}
	}
}

/* @type = {Modal}*/// #if DEBUG
Modal.instance = null;

export { Modal };