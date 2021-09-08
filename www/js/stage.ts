

import React, { Component } from "react";
import { R } from "./r";
import { FormFull } from "./forms/form-full";
import { List } from "./forms/list";
import { Filters, getNode, getNodeData, isLitePage, isPresentListRenderer, renderIcon } from "./utils";
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

	static closeTopForm() {
		forms.pop();
	}

	static dataDidModifed() {
		if(Stage.currentFormEntry.onModified) {
			Stage.currentFormEntry.onModified();
		}
	}

	static async showForm(nodeId: RecId, recId?: RecId | 'new', filters: Filters = {}, editable?: boolean, modal?: boolean, onModified?: () => void) {
		if(!Stage.rootForm || modal) {
			addFormEntry();
		}
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
			if(!Stage.rootForm) {
				Stage.rootForm = form as FormFull;
			}
			Stage.currentForm = form;
			Stage.currentFormEntry.form = form;
		};
		let formType = typeof recId === 'number' ? FormFull : List;
		ReactDOM.render(
			React.createElement(formType, { ref, node, initialData: data, filters, editable }),
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
	container.className = 'form-layer';
	document.querySelector('#stage').appendChild(container);
	let entry = {
		container
	}
	forms.push(entry);
	Stage.currentFormEntry = entry;
}

export { Stage, FormLoaderCog }