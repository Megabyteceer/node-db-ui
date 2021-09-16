import React, { Component } from "react";
import { R } from "./r";
import { FormFull } from "./forms/form-full";
import { List } from "./forms/list";
import { Filters, getNode, getNodeData, isLitePage, isPresentListRenderer, L, myAlert, onOneFormShowed, renderIcon, updateHashLocation } from "./utils";
import { RecId, RecordData } from "./bs-utils";
import { BaseForm } from "./forms/base-form";
import ReactDOM from 'react-dom';
import { Notify } from "./notify";

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

let allForms: FormEntry[] = [];

class Stage extends Component<any, any> {

	static allForms: FormEntry[];

	static get currentForm(): BaseForm | null {
		const e = Stage.currentFormEntry;
		return e && e.form;
	}

	static get currentFormEntry(): FormEntry {
		return allForms[allForms.length - 1]
	};

	static get rootForm(): BaseForm {
		return allForms[0] && allForms[0].form;
	}

	static refreshForm() {
		if(Stage.currentForm) {
			Stage.showForm(
				Stage.currentForm.nodeId,
				Stage.currentForm.recId,
				Stage.currentForm.filters,
				Stage.currentForm.editable
			);
		}
	}

	static goBackIfModal() {
		if(allForms.length > 1) {
			let e = allForms.pop();
			allForms[allForms.length - 1].container.classList.remove('blocked-layer');
			const formContainer = e.formContainer;
			e.formContainer = null;

			formContainer.style.transform = 'scale(0.01)';
			e.container.style.backgroundColor = '#00112200'
			setTimeout(() => {
				ReactDOM.render(React.createElement(React.Fragment), formContainer);
				formContainer.remove();
				if(formContainer !== e.container) {
					e.container.remove();
				}
			}, 300);
			if(allForms.length === 1) { // enable scrolling
				document.body.style.overflowY = '';
				document.body.style.paddingRight = '';
				document.body.style.boxSizing = '';
			}
			updateHashLocation();
			return true;
		}
	}

	/** @param newRecordData null - if record was deleted. */
	static dataDidModifed(newRecordData: RecordData | null) {
		if(Stage.currentFormEntry.onModified) {
			Stage.currentFormEntry.onModified(newRecordData);
		}
	}

	static async showForm(nodeId: RecId, recId?: RecId | 'new', filters: Filters = {}, editable?: boolean, modal?: boolean, onModified?: (dataToSend: RecordData) => void, noAnimation = false) {
		if(!allForms.length || modal) {
			if(allForms.find(formEntry => formEntry.form.nodeId === nodeId && Boolean(recId) === Boolean(formEntry.form.recId))) { //prevent opening two forms of the same type
				Notify.add(L("TOO_MATCH_FORMS"));
				return;
			}
			addFormEntry(noAnimation);
		} else {
			if(Stage.currentForm) {
				const formParameters = Stage.currentForm;
				formParameters.nodeId = nodeId;
				formParameters.recId = recId;
				formParameters.filters = filters;
				formParameters.editable = editable;
			}
		}

		const formEntry = Stage.currentFormEntry;

		const isRootForm = allForms.length === 1;
		formEntry.onModified = onModified;

		let data;
		if(recId !== 'new') {
			if(typeof recId === 'number') {
				data = await getNodeData(nodeId, recId, undefined, editable, false, isPresentListRenderer(nodeId));
			} else {
				data = await getNodeData(nodeId, undefined, filters, editable, false, isPresentListRenderer(nodeId));
			}
		}
		let node = await getNode(nodeId);

		if(!formEntry.formContainer) { // popup is hidden already
			return;
		}

		const ref = (form: BaseForm) => {
			if(form) {
				formEntry.form = form;
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
			React.createElement('div', { key: node.id + '_' + recId, className: isRootForm ? undefined : 'form-modal-container' },
				React.createElement(formType, { ref, node, recId, isRootForm, initialData: data || {}, filters, editable })
			),
			formEntry.formContainer
		);

		if(isRootForm && Stage.rootForm) {
			const formParameters = Stage.rootForm;
			if(formParameters.nodeId && ((formParameters.nodeId !== nodeId) || (formParameters.recId !== recId))) {
				window.scrollTo(0, 0);
			}
		}
		onOneFormShowed();
		updateHashLocation();
	}

	constructor(props) {
		super(props);
	}

	render() {
		return R.div({ id: 'stage' });
	}
}

Stage.allForms = allForms;

function addFormEntry(noAnimation = false) {
	const isRoot = allForms.length === 0;
	let container = document.createElement('div');
	container.className = isRoot ? 'form-layer' : 'form-layer form-layer-modal';
	let formContainer;

	if(!isRoot) {
		formContainer = document.createElement('div');
		container.appendChild(formContainer);
		allForms[allForms.length - 1].container.classList.add('blocked-layer');
		container.style.backgroundColor = '#00112200'
		formContainer.className = 'form-layer-modal';
		container.style.transition = 'background-color 0.3s';
		formContainer.style.transition = 'transform 0.3s';
		formContainer.style.transitionTimingFunction = 'ease-in-out';
		if(!noAnimation) {
			formContainer.style.transformOrigin = mouseX + 'px ' + mouseY + 'px';
			formContainer.style.transform = 'scale(0.01)';
			setTimeout(() => {
				formContainer.style.transform = 'scale(1)';
				container.style.backgroundColor = '#00112280'
			}, 10);
		} else {
			formContainer.style.transform = 'scale(1)';
			container.style.backgroundColor = '#00112280'
		}
	} else {
		formContainer = container;
	}
	document.querySelector('#stage').appendChild(container);
	let entry: FormEntry = {
		container,
		formContainer
	}
	if(allForms.length === 1) { // disable scrolling
		if(document.body.scrollHeight > document.body.clientHeight) {
			document.body.style.paddingRight = '10px';
			document.body.style.boxSizing = 'border-box';
		}
		document.body.style.overflowY = 'hidden';
	}
	allForms.push(entry);
}

export { Stage, FormLoaderCog }