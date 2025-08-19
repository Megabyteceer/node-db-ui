import React, { Component } from "react";
import { R } from "./r";
import { FormFull } from "./forms/form-full";
import { List } from "./forms/list";
import { Filters, getNode, getNodeData, getNodeIfPresentOnClient, isLitePage, isPresentListRenderer, L, myAlert, onOneFormShowed, renderIcon, updateHashLocation } from "./utils";
import { assert, NODE_TYPE, RecId, RecordData, throwError } from "./bs-utils";
import { BaseForm } from "./forms/base-form";
import ReactDOM from 'react-dom';
import { LeftBar } from "./left-bar";

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

	static destroyForm() {
		ReactDOM.render(React.createElement(React.Fragment), Stage.currentFormEntry.container);
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
			e.container.style.backgroundColor = '#00112200';
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
			LeftBar.refreshLeftBarActive();
			return true;
		}
	}

	/** @param newRecordData null - if record was deleted. */
	static dataDidModified(newRecordData: RecordData | null) {
		if(Stage.currentFormEntry.onModified) {
			Stage.currentFormEntry.onModified(newRecordData);
		}
	}

	static async showForm(nodeId: RecId, recId?: RecId | 'new', filters: Filters = {}, editable?: boolean, modal?: boolean, onModified?: (dataToSend: RecordData) => void, noAnimation = false) {
		if(!allForms.length || modal) {
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
		let node = getNodeIfPresentOnClient(nodeId);
		if(!node || node.node_type === NODE_TYPE.DOCUMENT) {
			if(recId !== 'new') {
				if(typeof recId === 'number') {
					data = await getNodeData(nodeId, recId, undefined, editable, false, isPresentListRenderer(nodeId));
				} else {
					data = await getNodeData(nodeId, undefined, filters, editable, false, isPresentListRenderer(nodeId));
				}
			}
		}
		if(!node) {
			node = await getNode(nodeId);
		}

		if(!formEntry.formContainer || !node) { // popup is hidden already
			return;
		}

		const ref = (form: BaseForm) => {
			if(form) {
				formEntry.form = form;
			}
		};

		if(!node.store_forms) { // cant render forms without storage as a list. Submit form only
			if(!recId) {
				recId = 'new';
			}
			editable = true;
		}

		let formType;
		switch(node.node_type) {
			case NODE_TYPE.DOCUMENT:
			case NODE_TYPE.SECTION:
				if(recId || (recId === 0) || recId === 'new') {
					formType = FormFull;
				} else {
					formType = List;
					assert(!modal, "List could not be show at modal level.");
				}
				break;
			case NODE_TYPE.REACT_CLASS:
				if(typeof window.crudJs.customClasses[node.table_name] === 'undefined') {
					myAlert('Unknown react class: ' + node.table_name);
					formType = 'div';
				} else {
					formType = window.crudJs.customClasses[node.table_name];
				}
				break;
			case NODE_TYPE.STATIC_LINK:
				location.href = node.static_link;
				break;
			default:
				throwError('Unknown nodeType ' + node.node_type);
		}

		let className = 'form-container-node-' + nodeId +
			(isRootForm ? ' form-root-container' : ' form-modal-container');
		if(node.css_class) {
			className += ' ' + node.css_class;
		}

		ReactDOM.render(
			React.createElement('div', { key: node.id + '_' + recId, className },
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
	LeftBar.refreshLeftBarActive();
}

export { Stage, FormLoaderCog }