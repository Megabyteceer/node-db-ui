import { FIELD_TYPE } from '../bs-utils';
import { R } from '../r';
import { User } from '../user';
import { L, registerFieldClass, renderIcon } from '../utils';
import { BaseField } from './base-field';

let idCounter = 0;

const listeners = {};
window.addEventListener('message', (e) => {
	const data = e.data;
	if (listeners.hasOwnProperty(data.id)) {
		listeners[data.id](data);
	}
});

registerFieldClass(
	FIELD_TYPE.RICH_EDITOR,
	class RichEditorField extends BaseField {
		constructor(props) {
			super(props);
			this.iframeId = idCounter++;
		}
		resolveValueAwaiting: () => void;
		viewportRef: HTMLIFrameElement;
		iframeId: number;
		summerNoteIsInitialized: boolean;

		getSummerNote(): Window {
			return this.viewportRef.contentWindow as Window;
		}

		componentDidMount() {
			if (this.props.isEdit) {
				const field = this.props.field;
				const w = Math.floor(field.maxLength / 10000);
				const h = field.maxLength % 10000;
				const options = {
					width: w,
					height: h,
					lang: User.currentUserData.lang.code,
				};

				listeners[this.iframeId] = (data) => {
					if (!this.summerNoteIsInitialized) {
						this.summerNoteIsInitialized = true;
						this.forceUpdate();
					}

					const s = this.getSummerNote();
					if (data.hasOwnProperty('value')) {
						this.setValue(data.value, false);
						this.props.wrapper.valueListener(this.state.value, true, this);
						if (this.resolveValueAwaiting) {
							this.resolveValueAwaiting();
							this.resolveValueAwaiting = null;
						}
					} else {
						s.postMessage({ options: options, value: this.state.value }, '*');
					}
				};
			}
		}

		componentWillUnmount() {
			delete listeners[this.iframeId];
		}

		async getMessageIfInvalid(): Promise<string | false | true> {
			if (this.state.value) {
				const val = this.state.value;
				if (val.length > 4000000) {
					return L('RICH_ED_SIZE', this.props.field.name);
				}
			}
			return false;
		}

		setValue(val, sendToEditor?: boolean) {
			const element = window.document.createElement('div');
			element.innerHTML = val;
			if (!element.innerText) {
				val = '';
			}
			if (this.state.value !== val) {
				if (sendToEditor !== false) {
					const s = this.getSummerNote();
					s.postMessage({ value: val }, '*');
				}
				///@ts-ignore
				this.state.value = val;
			}
		}

		async beforeSave() {
			return new Promise((resolve) => {
				const s = this.getSummerNote();
				this.resolveValueAwaiting = resolve as () => void;
				s.postMessage({ onSaveRichEditor: true }, '*');
			});
		}

		render() {
			if (this.props.isEdit) {
				const field = this.props.field;

				const w = Math.floor(field.maxLength / 10000) + 230;
				const h = (field.maxLength % 10000) + 30;

				const style = { width: w, height: h + 100 };
				let cog;
				if (!this.summerNoteIsInitialized) {
					cog = R.div(null, renderIcon('cog fa-spin'));
				}

				return R.div(
					null,
					cog,
					R.iframe({
						ref: (r) => {
							this.viewportRef = r;
						},
						allowFullScreen: true,
						sandbox: 'allow-scripts allow-forms allow-same-origin',
						style,
						src: './src/rich-editor/index.html?iframeId=' + this.iframeId,
					})
				);
			} else {
				return R.div({ dangerouslySetInnerHTML: { __html: this.props.initialValue } });
			}
		}
	}
);
