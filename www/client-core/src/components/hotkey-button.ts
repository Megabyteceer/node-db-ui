import { Component } from 'preact';
import { R } from '../r';
import { sp } from '../utils';

const allHotKeyedButtons = [] as HotkeyButton[];
window.addEventListener('keydown', (ev) => {
	for (const b of allHotKeyedButtons) {
		if (b.onKeyDown(ev)) { // call only first button with this hotkey
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
function isHotkeyBlockedOnInput(btn: HotkeyButton) {
	return btn.props.hotkey && hotkeysBlockedWhenInputFocused.hasOwnProperty(btn.props.hotkey);
}

interface HotkeyButtonProps {
	hotkey: number;
	disabled?: boolean;
	className?: string;
	title?: string;
	label?: any;
	onClick: (ev: MouseEvent | KeyboardEvent) => void;
}

const isEventFocusOnInputElement = (ev: KeyboardEvent) => {
	const tag = (ev.target as HTMLInputElement)?.tagName?.toLowerCase();
	return (((tag === 'input') && (ev.target as HTMLInputElement).type !== 'checkbox')) || tag === 'textarea' || tag === 'select';
};

const isUIBlockedByModal = (_element: HTMLDivElement) => {
	const rect = _element.getBoundingClientRect();
	const element = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
	return _element !== element;
};

class HotkeyButton extends Component<HotkeyButtonProps> {

	onKeyDown(e: KeyboardEvent) {
		if (!this.props.hotkey) {
			return;
		}
		const needCtrl = this.props.hotkey > 1000;

		if (
			this.props.disabled ||
			((this.props.hotkey === 1067) && window.getSelection()?.toString()) ||
			(isEventFocusOnInputElement(e) && (isHotkeyBlockedOnInput(this))) ||
			isUIBlockedByModal(this.base as HTMLDivElement)
		) {
			return;
		}

		if ((e.keyCode === (this.props.hotkey % 1000)) && (needCtrl === e.ctrlKey)) {
			this.onClick(e);
			sp(e);
			return true;
		}
	}

	constructor(props: HotkeyButtonProps) {
		super(props);
		this.state = {};
		this.onClick = this.onClick.bind(this);
	}

	componentWillReceiveProps(props: HotkeyButtonProps) {
		if (this.props.hotkey !== props.hotkey) {
			if (!props.hotkey && this.props.hotkey) {
				this.unregisterHotkey();
			} else if (props.hotkey && !this.props.hotkey) {
				this.registerHotkey();
			}
		}
	}

	componentDidMount() {
		if (this.props.hotkey) {
			this.registerHotkey();
		}
	}

	registerHotkey() {
		allHotKeyedButtons.unshift(this);
	}

	unregisterHotkey() {
		if (this.props.hotkey) {
			const i = allHotKeyedButtons.indexOf(this);
			if (i >= 0) {
				allHotKeyedButtons.splice(i, 1);
			}
		}
	}

	componentWillUnmount() {
		this.unregisterHotkey();
	}

	onClick(ev: MouseEvent | KeyboardEvent) {
		if ((ev.type === 'keydown') || ((ev as MouseEvent).button === 0)) {
			if (this.props.disabled) return;
			this.props.onClick(ev);
			(ev.target as HTMLDivElement).blur();
		}
		sp(ev);
	}

	render() {
		return R.button({
			disabled: this.props.disabled,
			className: (this.props.disabled ? 'not-clickable ' : 'clickable ') + this.props.className,
			onClick: this.onClick,
			title: this.props.title
		}, this.props.label);
	}
}

export { HotkeyButton };
