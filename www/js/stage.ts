import React, { Component } from "react";
import { R } from "./r";
import { FormFull } from "./forms/form-full";
import { List } from "./forms/list";
import { Filters, getNode, getNodeData, isLitePage, isPresentListRenderer, myAlert, onOneFormShowed, renderIcon } from "./utils";
import { RecId, RecordData } from "./bs-utils";
import { BaseForm } from "./forms/base-form";
import ReactDOM from 'react-dom';

let mouseX: number;
let mouseY: number;

window.document.addEventListener('pointerdown', (ev) => {
	mouseX = ev.clientX;
	mouseY = ev.clientY;
}, true);

class FormLoaderCog extends Component<any, any> {
	render() {
		return R.div({ className: "fade-in loading-icon" },
			renderIcon('cog fa-spin fa-5x')
		);
	}
}

document.addEventListener('load', () => {
	if(isLitePage()) {
		document.body.classList.add('lite-ui');
	}
});

interface FormEntry {
	form?: BaseForm;
	formContainer: HTMLDivElement;
	container: HTMLDivElement;
	onModified?: (dataToSend: RecordData | null) => void;
}

let forms: FormEntry[] = [];

class Stage extends Component<any, any> {

	static rootForm: FormFull;
	static currentForm: BaseForm;
	static currentFormEntry: FormEntry;

	static refreshForm() {
		Stage.showForm(
			Stage.currentForm.nodeId,
			Stage.currentForm.recId,
			Stage.currentForm.filters,
			Stage.currentForm.editable
		);
	}

	static goBackIfModal() {
		if(forms.length > 1) {
			let e = forms.pop();
			forms[forms.length - 1].container.classList.remove('blocked-layer');
			const formContainer = e.formContainer;
			formContainer.style.transform = 'scale(0.01)';
			e.container.style.backgroundColor = '#00112200'
			setTimeout(() => {
				ReactDOM.render(React.createElement(React.Fragment), formContainer);
				formContainer.remove();
				if(formContainer !== e.container) {
					e.container.remove();
				}
			}, 300);
			Stage.currentFormEntry = forms[forms.length - 1];
			Stage.currentForm = Stage.currentFormEntry.form;
			if(forms.length === 1) { // enable scrolling
				document.body.style.overflowY = '';
				document.body.style.paddingRight = '';
				document.body.style.boxSizing = '';
			}
			return true;
		}
	}

	/** null - deleted.*/
	static dataDidModifed(newRecordData: RecordData | null) {
		if(Stage.currentFormEntry.onModified) {
			Stage.currentFormEntry.onModified(newRecordData);
		}
	}

	static async showForm(nodeId: RecId, recId?: RecId | 'new', filters: Filters = {}, editable?: boolean, modal?: boolean, onModified?: (dataToSend: RecordData) => void) {

		if(!forms.length || modal) {
			addFormEntry();
		} else {
			if(Stage.currentForm) {
				const formParameters = Stage.currentForm;
				formParameters.nodeId = nodeId;
				formParameters.recId = recId;
				formParameters.filters = filters;
				formParameters.editable = editable;
			}
		}
		const isRootForm = forms.length === 1;
		Stage.currentFormEntry.onModified = onModified;
		let data;
		if(recId !== 'new') {
			if(typeof recId === 'number') {
				data = await getNodeData(nodeId, recId, undefined, editable, false, isPresentListRenderer(nodeId));
			} else {
				data = await getNodeData(nodeId, undefined, filters, editable, false, isPresentListRenderer(nodeId));
			}
		}
		let node = await getNode(nodeId);
		const ref = (form: BaseForm) => {
			if(form) {
				if(isRootForm) {
					Stage.rootForm = form as FormFull;
				}
				Stage.currentForm = form;
				Stage.currentFormEntry.form = form;
			}
		};
		let formType;
		if(!node.staticLink) {
			formType = (recId || (recId === 0)) ? FormFull : List;
		} else if(node.staticLink === 'reactClass') {
			if(typeof window.crudJs.customClasses[node.tableName] === 'undefined') {
				myAlert('Unknown react class: ' + node.tableName);
				formType = 'div';
			} else {
				formType = window.crudJs.customClasses[node.tableName];
			}
		} else {
			location.href = node.staticLink;
		}
		ReactDOM.render(
			React.createElement('div', { className: isRootForm ? undefined : 'form-modal-container' },
				React.createElement(formType, { ref, node, recId, isRootForm, initialData: data || {}, filters, editable })
			),
			Stage.currentFormEntry.formContainer
		);
		if(isRootForm && Stage.rootForm) {
			const formParameters = Stage.rootForm;
			if(formParameters.nodeId && ((formParameters.nodeId !== nodeId) || (formParameters.recId !== recId))) {
				window.scrollTo(0, 0);
			}
		}
		onOneFormShowed();
	}

	constructor(props) {
		super(props);
	}

	render() {
		return R.div({ id: 'stage' });
	}
}

function addFormEntry() {
	const isRoot = forms.length === 0;
	let container = document.createElement('div');
	container.className = isRoot ? 'form-layer' : 'form-layer form-layer-modal';
	let formContainer;
	if(!isRoot) {
		forms[forms.length - 1].container.classList.add('blocked-layer');
		container.style.transition = 'background-color 0.3s';
		container.style.backgroundColor = '#00112200'
		formContainer = document.createElement('div');
		formContainer.className = 'form-layer-modal';
		container.appendChild(formContainer);
		formContainer.style.transformOrigin = mouseX + 'px ' + mouseY + 'px';
		formContainer.style.transform = 'scale(0.01)';
		formContainer.style.transition = 'transform 0.3s';
		formContainer.style.transitionTimingFunction = 'ease-in-out';
		setTimeout(() => {
			formContainer.style.transform = 'scale(1)';
			container.style.backgroundColor = '#00112280'
		}, 10);
	} else {
		formContainer = container;
	}
	document.querySelector('#stage').appendChild(container);
	let entry: FormEntry = {
		container,
		formContainer
	}
	if(forms.length === 1) { // disable scrolling
		if(document.body.scrollHeight > document.body.clientHeight) {
			document.body.style.paddingRight = '10px';
			document.body.style.boxSizing = 'border-box';
		}
		document.body.style.overflowY = 'hidden';
	}
	forms.push(entry);
	Stage.currentFormEntry = entry;
}

export { Stage, FormLoaderCog }