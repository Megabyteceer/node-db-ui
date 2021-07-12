import {L, renderIcon} from "../utils.js";
import {registerFieldClass} from "../utils.js";
import fieldMixins from "./field-mixins.js";

var idCounter = 0;

var listeners = {};
window.addEventListener('message', function(e){
	var data = e.data;
	if (listeners.hasOwnProperty(data.id)) {
		listeners[data.id](data);
	}
});

registerFieldClass(FIELD_19_RICHEDITOR, class TextField extends fieldMixins {

	getSummernote() {
		return this.refs.viewport.contentWindow;
	}

	componentDidMount() {
		this.iframeId = idCounter++;
		var field = this.props.field;
		var w = Math.floor(field.maxlen/1000);
		var h = field.maxlen%1000;
		var s = this.getSummernote();
		var options = {
			width:w,
			height:h,
			toolbar: [
				['misc', ['style','bold', 'italic', 'underline', 'fontname','fontsize','color','help','ul', 'ol', 'paragraph','picture','link','table','hr','fullscreen','codeview']]

			],
			lang:'ru-RU'
		};

		listeners[this.iframeId] = function(data) {

			if (!this.summerNoteIsInited) {
				this.summerNoteIsInited = true;
				this.forceUpdate();
			}

			var s = this.getSummernote();
			if (data.hasOwnProperty('value')) {
				this.setValue(data.value, false);
				this.props.wrapper.valueListener(this.state.value, true, this);
			} else {
				s.postMessage({options:options, value:this.state.value},'*');
			}
		}.bind(this);
	}

	componentWillUnmount() {
		delete(listeners[this.iframeId]);
		if (this.interval) {
			clearInterval(this.interval);
			delete(this.interval);
		}
	}

	getMessageIfInvalid(callback) {
		if (this.state.value) {
			var val = this.state.value;
			if (val.length > 4000000) {
				callback(L('RICH_ED_SIZE', this.props.field.name));
			}
		}
		callback(false);
	}

	setValue(val, sendToEditor) {
		if ($('<div>'+val+'</div>').text() === '') {
			val = '';
		}
		if (this.state.value !== val) {
			if (sendToEditor!==false) {
				var s = this.getSummernote();
				s.postMessage({value:val}, '*');
			}
			this.state.value = val;
		}
	}

	render() {
		var field = this.props.field;

		var w = Math.floor(field.maxlen/1000)+230;
		var h = (field.maxlen%1000)+30;
		
		var style = {width:w, height:h+100};
		var cog;
		if (!this.summerNoteIsInited) {
			cog = ReactDOM.div(null, renderIcon('cog fa-spin'));
		}

		return ReactDOM.div(null, cog, ReactDOM.iframe({ref:'viewport', sandbox:'allow-scripts allow-forms', style:style, src:'rich-editor/index.html?iframeId='+this.iframeId}));
	}
});
