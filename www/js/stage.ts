

import React, { Component } from "react";
import { R } from "./r";
import { FormFull } from "./forms/form-full";
import { List } from "./forms/list";
import { Filters, getNode, getNodeData, isLitePage, isPresentListRenderer, myAlert, renderIcon } from "./utils";
import { RecId } from "./bs-utils";
import { BaseForm } from "./forms/base-form";
import ReactDOM from 'react-dom';

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

let stage: Stage;

interface FormEntry {
	form?: BaseForm;
	container: HTMLDivElement;
	onModified?: () => void;
}

let forms: FormEntry[] = [];

class Stage extends Component<any, any> {

	static rootForm: FormFull;
	static currentForm: BaseForm;
	static currentFormEntry: FormEntry;

	static refreshForm() {
		Stage.showForm(
			Stage.currentForm.formParameters.nodeId,
			Stage.currentForm.formParameters.recId,
			Stage.currentForm.formParameters.filters,
			Stage.currentForm.formParameters.editable
		);
	}

	static goBackIfModal() {
		if(forms.length > 1) {
			let e = forms.pop();
			ReactDOM.render(React.createElement(React.Fragment), e.container);
			e.container.remove();
			Stage.currentFormEntry = forms[forms.length - 1];
			Stage.currentForm = Stage.currentFormEntry.form;
			return true;
		}
	}

	static dataDidModifed() {
		if(Stage.currentFormEntry.onModified) {
			Stage.currentFormEntry.onModified();
		}
	}

	static async showForm(nodeId: RecId, recId?: RecId | 'new', filters: Filters = {}, editable?: boolean, modal?: boolean, onModified?: () => void) {
		if(!forms.length || modal) {
			addFormEntry();
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
			if(typeof window[node.tableName] === 'undefined') {
				myAlert('Unknown react class: ' + node.tableName);
				formType = 'div';
			} else {
				formType = window[node.tableName];
			}
		} else {
			location.href = node.staticLink;
		}

		ReactDOM.render(
			R.div({ className: isRootForm ? undefined : 'form-modal-container' },
				React.createElement(formType, { ref, node, recId, isRootForm, initialData: data || {}, filters, editable })
			),
			Stage.currentFormEntry.container
		);
	}

	constructor(props) {
		super(props);
		stage = this;
	}

	render() {
		return R.div({ id: 'stage' });
	}
}

function addFormEntry() {
	let container = document.createElement('div');
	container.className = forms.length === 0 ? 'form-layer' : 'form-layer form-layer-modal';
	document.querySelector('#stage').appendChild(container);
	let entry = {
		container
	}
	forms.push(entry);
	Stage.currentFormEntry = entry;
}

//@ts-ignore
window.Stage = Stage;

export { Stage, FormLoaderCog }