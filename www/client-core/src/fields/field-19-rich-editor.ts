import { FIELD_TYPE } from '../../../../types/generated';
import BaseField, { type BaseFieldProps } from '../base-field';
import { R } from '../r';
import { User } from '../user';
import { L, registerFieldClass, renderIcon } from '../utils';

let idCounter = 0;

const listeners = {} as KeyedMap<(val: any) => void>;
window.addEventListener('message', (e) => {
	const data = e.data;
	if (listeners.hasOwnProperty(data.id)) {
		listeners[data.id](data);
	}
});

class RichEditorField extends BaseField {
	constructor(props: BaseFieldProps) {
		super(props);
		this.iframeId = idCounter++;
	}

	resolveValueAwaiting?: () => void;
	viewportRef!: HTMLIFrameElement;
	iframeId: number;
	summerNoteIsInitialized = false;

	getSummerNote(): Window {
		return this.viewportRef.contentWindow as Window;
	}

	componentDidMount() {
		if (this.props.isEdit) {
			const field = this.props.fieldDesc;
			const w = Math.floor(field.maxLength! / 10000);
			const h = field.maxLength! % 10000;
			const options = {
				width: w,
				height: h,
				lang: User.currentUserData!.lang.code
			};

			listeners[this.iframeId] = (data) => {
				if (!this.summerNoteIsInitialized) {
					this.summerNoteIsInitialized = true;
					this.forceUpdate();
				}

				const s = this.getSummerNote();
				if (data.hasOwnProperty('value')) {
					this.setValue(data.value, false);
					this.valueListener(this.currentValue);
					if (this.resolveValueAwaiting) {
						this.resolveValueAwaiting();
						this.resolveValueAwaiting = undefined;
					}
				} else {
					s.postMessage({ options: options, value: this.currentValue }, '*');
				}
			};
		}
	}

	componentWillUnmount() {
		delete listeners[this.iframeId];
	}

	async getMessageIfInvalid(): Promise<string | undefined> {
		if (this.currentValue) {
			const val = this.currentValue;
			if (val.length > 4000000) {
				return L('RICH_ED_SIZE', this.props.fieldDesc.name);
			}
		}
	}

	setValue(val: string, sendToEditor?: boolean) {
		const element = window.document.createElement('div');
		element.innerHTML = val;
		if (!element.innerText) {
			val = '';
		}
		if (this.currentValue !== val) {
			if (sendToEditor !== false) {
				const s = this.getSummerNote();
				s.postMessage({ value: val }, '*');
			}
			this.currentValue = val;
			this.forceUpdate();
		}
	}

	async beforeSave(): Promise<void> {
		await new Promise((resolve) => {
			const s = this.getSummerNote();
			this.resolveValueAwaiting = resolve as () => void;
			s.postMessage({ onSaveRichEditor: true }, '*');
		});
		return super.beforeSave();
	}

	renderFieldEditable() {
		if (this.props.isEdit) {
			const field = this.props.fieldDesc;

			const w = Math.floor(field.maxLength! / 10000) + 230;
			const h = (field.maxLength! % 10000) + 30;

			const style = { width: w, height: h + 100 };
			let cog;
			if (!this.summerNoteIsInitialized) {
				cog = R.div(null, renderIcon('cog fa-spin'));
			}

			return R.div(
				null,
				cog,
				R.iframe({
					ref: (r: HTMLIFrameElement) => {
						this.viewportRef = r;
					},
					allowFullScreen: true,
					sandbox: 'allow-scripts allow-forms allow-same-origin',
					style,
					src: './src/rich-editor/index.html?iframeId=' + this.iframeId
				})
			);
		} else {
			return R.div({ dangerouslySetInnerHTML: { __html: this.props.initialValue } });
		}
	}
}

registerFieldClass(FIELD_TYPE.HTML_EDITOR, RichEditorField);
