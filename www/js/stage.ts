﻿

import React, { Component } from "react";
import { R } from "./r";
import { FormFull } from "./forms/form-full";
import { List } from "./forms/list";
import { Filters, getNode, getNodeData, isLitePage, isPresentListRenderer, myAlert, onOneFormShowed, renderIcon } from "./utils";
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
			Stage.currentForm.nodeId,
			Stage.currentForm.recId,
			Stage.currentForm.filters,
			Stage.currentForm.editable
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
			React.createElement('div', { className: isRootForm ? undefined : 'form-modal-container' },
				React.createElement(formType, { ref, node, recId, isRootForm, initialData: data || {}, filters, editable })
			),
			Stage.currentFormEntry.container
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
	let container = document.createElement('div');
	container.className = forms.length === 0 ? 'form-layer' : 'form-layer form-layer-modal';
	document.querySelector('#stage').appendChild(container);
	let entry = {
		container
	}
	forms.push(entry);
	Stage.currentFormEntry = entry;
}
type Stg = typeof Stage;

declare global {
	interface Window {
		Stage: Stg;
	}
}

window.Stage = Stage;

export { Stage, FormLoaderCog }