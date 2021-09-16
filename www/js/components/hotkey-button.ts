import React from "react";
import ReactDOM from "react-dom";
import { R } from "../r";
import { sp } from "../utils";

const allHotKeyedButtons = [];
window.addEventListener("keydown", (ev) => {
	for(let b of allHotKeyedButtons) {
		if(b.onKeyDown(ev)) { //call only first button with this hotkey
			return;
		}
	}
});

const hotkeysBlockedWhenInputFocused = {
	8: true,
	13: true,
	37: true,
	38: true,
	39: true,
	40: true,
	46: true,
	90: true,
	188: true,
	190: true,
	1067: true,
	1088: true,
	1086: true
};
function isHotkeyBlockedOnInput(btn) {
	return btn.props.hotkey && hotkeysBlockedWhenInputFocused.hasOwnProperty(btn.props.hotkey);
}

interface HotkeyButtonProps {
	hotkey: number,
	disabled?: boolean
	className?: string,
	title?: string,
	label?: any,
	onClick: (ev) => void
}

const isEventFocusOnInputElement = (ev) => {
	let tag = ev.target.tagName.toLowerCase();
	return (((tag === 'input') && (ev.target.type !== 'checkbox')) || tag === 'textarea' || tag === 'select');
};

const isUIBlockedByModal = (element) => {

}

class HotkeyButton extends React.Component<HotkeyButtonProps> {

	onKeyDown(e) {
		if(!this.props.hotkey) {
			return;
		}
		let needCtrl = this.props.hotkey > 1000;

		if(
			this.props.disabled ||
			((this.props.hotkey === 1067) && window.getSelection().toString()) ||
			(isEventFocusOnInputElement(e) && (isHotkeyBlockedOnInput(this))) ||
			isUIBlockedByModal(ReactDOM.findDOMNode(this))
		) {
			return;
		}

		if((e.keyCode === (this.props.hotkey % 1000)) && (needCtrl === e.ctrlKey)) {
			this.onClick(e);
			sp(e);
			return true;
		}
	}

	constructor(props) {
		super(props);
		this.state = {};
		this.onClick = this.onClick.bind(this);
	}

	UNSAFE_componentWillReceiveProps(props) {
		if(this.props.hotkey !== props.hotkey) {
			if(!props.hotkey && this.props.hotkey) {
				this.unregisterHotkey();
			} else if(props.hotkey && !this.props.hotkey) {
				this.registerHotkey();
			}
		}
	}

	componentDidMount() {
		if(this.props.hotkey) {
			this.registerHotkey();
		}
	}

	registerHotkey() {
		allHotKeyedButtons.unshift(this);
	}

	unregisterHotkey() {
		if(this.props.hotkey) {
			let i = allHotKeyedButtons.indexOf(this);
			if(i >= 0) {
				allHotKeyedButtons.splice(i, 1);
			}
		}
	}

	componentWillUnmount() {
		this.unregisterHotkey();
	}

	onClick(ev) {
		if((ev.type === 'keydown') || (ev.button === 0)) {
			if(this.props.disabled) return;
			this.props.onClick(ev);
			ev.target.blur();
		}
		sp(ev);
	}

	render() {
		return R.button({
			disabled: this.props.disabled,
			className: (this.props.disabled ? 'not-clickable ' : 'clickable ') + this.props.className,
			onClick: this.onClick,
			title: this.props.title,
		}, this.props.label);
	}
}

export { HotkeyButton };