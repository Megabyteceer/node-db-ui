import {L, renderIcon} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

var idCounter = 0;

var listeners = {};
window.addEventListener('message', (e) => {
	var data = e.data;
	if(listeners.hasOwnProperty(data.id)) {
		listeners[data.id](data);
	}
});

registerFieldClass(FIELD_19_RICHEDITOR, class RichEditorField extends fieldMixins {

	getSummernote() {
		return this.viewportRef.contentWindow;
	}

	componentDidMount() {
		if(this.props.isEdit) {
			this.iframeId = idCounter++;
			var field = this.props.field;
			var w = Math.floor(field.maxlen / 10000);
			var h = field.maxlen % 10000;
			var options = {
				width: w,
				height: h,
				lang: 'ru-RU'
			};

			listeners[this.iframeId] = (data) => {

				if(!this.summerNoteIsInited) {
					this.summerNoteIsInited = true;
					this.forceUpdate();
				}

				var s = this.getSummernote();
				if(data.hasOwnProperty('value')) {
					this.setValue(data.value, false);
					this.props.wrapper.valueListener(this.state.value, true, this);
				} else {
					s.postMessage({options: options, value: this.state.value}, '*');
				}
				if(this.onSaveCallback) {
					this.onSaveCallback(data.value);
					delete this.onSaveCallback;
				}
			};
		}
	}

	componentWillUnmount() {
		delete (listeners[this.iframeId]);
		if(this.interval) {
			clearInterval(this.interval);
			delete (this.interval);
		}
	}

	async getMessageIfInvalid() {
		if(this.state.value) {
			var val = this.state.value;
			if(val.length > 4000000) {
				return L('RICH_ED_SIZE', this.props.field.name);
			}
		}
		return (false);
	}

	setValue(val, sendToEditor) {
		if($('<div>' + val + '</div>').text() === '') {
			val = '';
		}
		if(this.state.value !== val) {
			if(sendToEditor !== false) {
				var s = this.getSummernote();
				s.postMessage({value: val}, '*');
			}
			this.state.value = val;
		}
	}

	async beforeSave() {
		return new Promise((resolve) => {
			var s = this.getSummernote();
			this.onSaveCallback = resolve;
			s.postMessage({onSave: true}, '*');
		});
	}

	render() {
		if(this.props.isEdit) {
			var field = this.props.field;

			var w = Math.floor(field.maxlen / 10000) + 230;
			var h = (field.maxlen % 10000) + 30;

			var style = {width: w, height: h + 100};
			var cog;
			if(!this.summerNoteIsInited) {
				cog = ReactDOM.div(null, renderIcon('cog fa-spin'));
			}

			return ReactDOM.div(null, cog, ReactDOM.iframe({ref: (r) => {this.viewportRef = r;}, allowFullScreen: true, sandbox: 'allow-scripts allow-forms allow-same-origin', style, src: 'rich-editor/index.html?iframeId=' + this.iframeId}));
		} else {
			return ReactDOM.div({dangerouslySetInnerHTML: {__html: this.props.initialValue}});
		}
	}
});
