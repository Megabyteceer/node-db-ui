import { Component, h, render, type ComponentType } from 'preact';

import { NODE_TYPE } from '../../../types/generated';
import { globals } from '../../../types/globals';
import { assert, throwError } from './assert';
import { normalizeEnumName, type FormFilters, type RecId, type RecordData } from './bs-utils';
import { NEW_RECORD } from './consts';
import Form, { type FormProps } from './form';
import { LeftBar } from './left-bar';
import { R } from './r';
import { getNode, getNodeIfPresentOnClient, getRecordClient, getRecordsClient, isPresentListRenderer, myAlert, onOneFormShowed, renderIcon, updateHashLocation } from './utils';

let mouseX: number;
let mouseY: number;

window.document.addEventListener(
	'pointerdown',
	(ev) => {
		mouseX = ev.clientX;
		mouseY = ev.clientY;
	},
	true
);

class FormLoaderCog extends Component {
	render() {
		return R.div({ className: 'fade-in loading-icon' }, renderIcon('cog fa-spin fa-5x'));
	}
}

interface FormEntry {
	form?: Form;
	formContainer?: HTMLDivElement;
	container: HTMLDivElement;
	onModified?: (dataToSend?: RecordData) => void;
}

const allForms: FormEntry[] = [];

class Stage extends Component<{}, {}> {
	static allForms: FormEntry[];

	static get currentForm(): Form | undefined {
		const e = Stage.currentFormEntry;
		return e && e.form;
	}

	static get currentFormEntry(): FormEntry {
		return allForms[allForms.length - 1];
	}

	static get rootForm(): Form | undefined {
		return allForms[0]?.form;
	}

	static destroyForm() {
		render(R.fragment(), Stage.currentFormEntry.container);
	}

	static refreshForm() {
		if (Stage.currentForm) {
			Stage.showForm(
				Stage.currentForm!.nodeId,
				Stage.currentForm!.recId,
				Stage.currentForm!.formFilters,
				Stage.currentForm!.props.editable
			);
		}
	}

	static goBackIfModal() {
		if (allForms.length > 1) {
			const e = allForms.pop()!;
			allForms[allForms.length - 1].container.classList.remove('blocked-layer');
			const formContainer = e.formContainer!;
			e.formContainer = undefined;

			formContainer.style.transform = 'scale(0.01)';
			e.container.style.backgroundColor = '#00112200';
			setTimeout(() => {
				render(R.fragment(), formContainer);
				formContainer.remove();
				if (formContainer !== e.container) {
					e.container.remove();
				}
			}, 300);
			if (allForms.length === 1) {
				// enable scrolling
				document.body.style.overflowY = '';
				document.body.style.paddingRight = '';
				document.body.style.boxSizing = '';
			}
			updateHashLocation();
			LeftBar.refreshLeftBarActive();
			return true;
		}
	}

	static dataDidModified(newRecordData?: RecordData) {
		if (Stage.currentFormEntry.onModified) {
			Stage.currentFormEntry.onModified(newRecordData);
		}
	}

	static async showForm(
		nodeId: RecId,
		recId?: RecId | typeof NEW_RECORD,
		filters: FormFilters = {},
		editable?: boolean,
		modal?: boolean,
		onModified?: (dataToSend?: RecordData) => void,
		noAnimation = false
	) {

		assert(!isNaN(nodeId), 'Invalid NODE_ID');

		if (this.currentForm?.isAsyncInProgress()) {
			await this.currentForm.waitForAsyncFinish();
		}

		if (!allForms.length || modal) {
			addFormEntry(noAnimation);
		}

		const formEntry = Stage.currentFormEntry;

		const isRootForm = allForms.length === 1;
		formEntry.onModified = onModified;

		let data;
		let isList = false;
		let node = getNodeIfPresentOnClient(nodeId);
		if (!node || node.nodeType === NODE_TYPE.DOCUMENT) {
			if (recId !== NEW_RECORD) {
				if (typeof recId === 'number') {
					data = await getRecordClient(nodeId, recId as RecId, undefined, editable, false, isPresentListRenderer(nodeId));
				} else {
					isList = true;
					data = await getRecordsClient(nodeId, undefined, filters, editable, false, isPresentListRenderer(nodeId));
				}
			}
		}
		if (!node) {
			node = await getNode(nodeId);
		}

		if (!formEntry.formContainer || !node) {
			// popup is hidden already
			return;
		}

		const ref = (form: Form) => {
			if (form) {
				formEntry.form = form;
			}
		};

		if (!node.storeForms) {
			// cant render forms without storage as a list. Submit form only
			if (!recId) {
				recId = NEW_RECORD;
			}
			editable = true;
		}

		let formType!: (ComponentType<any>) | 'div';
		switch (node.nodeType) {
		case NODE_TYPE.DOCUMENT:
		case NODE_TYPE.SECTION:
			formType = Form;
			break;
		case NODE_TYPE.REACT_CLASS:
			if (typeof globals.customClasses[node.tableName!] === 'undefined') {
				myAlert('Unknown react class: ' + node.tableName);
				formType = 'div';
			} else {
				formType = globals.customClasses[node.tableName!];
			}
			break;
		case NODE_TYPE.STATIC_LINK:
			location.href = node.staticLink!;
			break;
		default:
			throwError('Unknown nodeType ' + node.nodeType);
		}

		let className =
			'form-container-node-' +
			normalizeEnumName(node.tableName!).toLowerCase().replaceAll('_', '-') +
			(isRootForm ? ' form-root-container' : ' form-modal-container');
		if (node.cssClass) {
			className += ' ' + node.cssClass;
		}

		render(
			h(
				'div',
				{ key: node.id + '_' + recId, className },
				h(formType, {
					ref,
					nodeId: node.id,
					recId,
					isRootForm,
					formData: isList ? undefined : data,
					listData: isList ? data : undefined,
					filters,
					parentForm: undefined as any,
					editable
				} as FormProps)
			),
			formEntry.formContainer
		);

		if (isRootForm && Stage.rootForm) {
			const rootForm = Stage.rootForm;
			if (
				rootForm.nodeId &&
				(rootForm.nodeId !== nodeId || rootForm.recId !== recId)
			) {
				window.scrollTo(0, 0);
			}
		}
		onOneFormShowed();
		updateHashLocation();
	}

	constructor(props: {}) {
		super(props);
	}

	render() {
		return R.div({ id: 'stage' });
	}
}

Stage.allForms = allForms;

function addFormEntry(noAnimation = false) {
	const isRoot = allForms.length === 0;
	const container = document.createElement('div');
	container.className = isRoot ? 'form-layer' : 'form-layer form-layer-modal';
	let formContainer: HTMLDivElement;

	if (!isRoot) {
		formContainer = document.createElement('div');
		container.appendChild(formContainer);
		allForms[allForms.length - 1].container.classList.add('blocked-layer');
		container.style.backgroundColor = '#00112200';
		formContainer.className = 'form-layer-modal';
		container.style.transition = 'background-color 0.3s';
		formContainer.style.transition = 'transform 0.3s';
		formContainer.style.transitionTimingFunction = 'ease-in-out';
		if (!noAnimation) {
			formContainer.style.transformOrigin = mouseX + 'px ' + mouseY + 'px';
			formContainer.style.transform = 'scale(0.01)';
			setTimeout(() => {
				formContainer.style.transform = 'scale(1)';
				container.style.backgroundColor = '#00112280';
			}, 10);
		} else {
			formContainer.style.transform = 'scale(1)';
			container.style.backgroundColor = '#00112280';
		}
	} else {
		formContainer = container;
	}
	(document.querySelector('#stage') as HTMLDivElement).appendChild(container);
	const entry: FormEntry = {
		container,
		formContainer
	};
	if (allForms.length === 1) {
		// disable scrolling
		if (document.body.scrollHeight > document.body.clientHeight) {
			document.body.style.paddingRight = '10px';
			document.body.style.boxSizing = 'border-box';
		}
		document.body.style.overflowY = 'hidden';
	}
	allForms.push(entry);
	LeftBar.refreshLeftBarActive();
}

export { FormLoaderCog, Stage };
