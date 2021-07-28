import {debugError, sp} from "./utils.js";

var style = {
	marginTop: '90px',
	display: 'inline-block',
	cursor: 'default',
	maxHeight: '80%',
	overflowY: 'auto',
	overflowX: 'hidden',
}



var backdropStyle = {
	textAlign: 'center',
	background: 'rgba(0,0,0,0.35)',
	position: 'fixed',
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	zIndex: 9
}

var modalStack = [];
var idCounter = 0;

export default class Modal extends Component {
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
			document.activeElement.blur();
		}
		idCounter++;
		if(content) {
			modalStack.push({content: content, noDiscardByBackdrop: noDiscardByBackdrop, id: idCounter});
		}
		this.forceUpdate();
		return idCounter;
	}

	isShowed() {
		return modalStack.length > 0;
	}

	hide(idTohide) {
		if(typeof (idTohide) !== 'number') {
			/// #if DEBUG
			if(modalStack.length < 1) {
				debugError('tried to hide modal while no modal showed');
			}
			/// #endif
			modalStack.pop();
		} else {
			modalStack = modalStack.filter((m) => {
				return m.id !== idTohide;
			});
		}
		this.forceUpdate();
	}

	render() {
		if(modalStack.length > 0) {
			return R.div(null,
				modalStack.map((m) => {

					var bs = Object.assign({cursor: m.noDiscardByBackdrop ? 'default' : 'pointer'}, backdropStyle);

					return R.div({
						key: m.id, style: bs, className: 'fade-in', onClick: () => {
							if(!m.noDiscardByBackdrop) {
								this.hide();
							}
						}
					},
						R.div({style: style, onClick: sp},
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