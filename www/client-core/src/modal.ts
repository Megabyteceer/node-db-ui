import { Component, type ComponentChild } from 'preact';
import { LeftBar } from './left-bar';
import { R } from './r';
import { debugError, sp } from './utils';

let modalStack = [] as {
	content: ComponentChild; noDiscardByBackdrop: boolean; id: number;
}[];
let idCounter = 0;

interface ModalProps {

}

class Modal extends Component<ModalProps,
	{
	// state
	}> {

	static instance: Modal;

	constructor(props: ModalProps) {
		super(props);
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
	}

	componentDidMount() {
		Modal.instance = this;
	}

	show(content: ComponentChild, noDiscardByBackdrop = false) {
		if (document.activeElement) {
			(document.activeElement as HTMLInputElement).blur();
		}
		idCounter++;
		if (content) {
			modalStack.push({ content: content, noDiscardByBackdrop: noDiscardByBackdrop, id: idCounter });
		}
		this.forceUpdate();
		LeftBar.refreshLeftBarActive();
		return idCounter;
	}

	isShowed() {
		return modalStack.length > 0;
	}

	hide(idToHide?: number) {
		if (typeof (idToHide) !== 'number') {
			/// #if DEBUG
			if (modalStack.length < 1) {
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
		LeftBar.refreshLeftBarActive();
	}

	render() {
		if (modalStack.length > 0) {
			return R.div(null,
				modalStack.map((m) => {
					let className = 'fade-in modal-backdrop';
					if (!m.noDiscardByBackdrop) {
						className += ' pointer';
					}
					return R.div({
						key: m.id, className, onClick: () => {
							if (!m.noDiscardByBackdrop) {
								this.hide();
							}
						}
					},
					R.div({ className: 'modal', onClick: sp },
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

export { Modal };
