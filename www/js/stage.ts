

import React, { Component } from "react";
import { R } from "./r";
import { FormFull } from "./forms/form-full";
import { List } from "./forms/list";
import { LeftBar } from "./left-bar";
import { consoleLog, Filters, isLitePage, loadJS, myAlert, renderIcon } from "./utils";
import { NodeDesc, RecId, RecordData } from "./bs-utils.js";

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

class Stage extends Component<any, any> {

	static instance: Stage;
	filters: Filters;

	componentDidMount() {
		Stage.instance = this;
	}

	setCustomClass(className, props) {
		this.setState({ customClass: className, props: props });
	}

	_setFormData(node?: NodeDesc, data?: RecordData, recId?: RecId, filters?: Filters, editable?: boolean) {
		consoleLog('set form data');
		if(typeof (node) !== 'undefined') {
			this.state = null;
			setTimeout(() => {
				this.filters = filters;
				this.setState({ node, data, recId, editable });
			});
		} else {
			this.state = null;
			this.forceUpdate()
		}
	}

	setFormFilter(name, val) {
		if(!this.filters) {
			this.filters = {};
		}
		if(this.filters[name] !== val) {
			this.filters[name] = val;
			this.forceUpdate();
			if(name === 'tab') {
				LeftBar.instance.refreshLeftBarActive();
			}
			return true;
		}
	}

	loadCustomClass() {
		loadJS('js/custom/' + this.state.customClass.toLowerCase() + '.js').then(() => {
			this.forceUpdate();
		});
	}

	render() {
		var body;
		if(this.state) {

			if(this.state.customClass) {
				if(!window[this.state.customClass]) {
					setTimeout(() => {
						this.loadCustomClass();
					}, 1);
				} else {
					//TODO custom class form
					debugger;
					//return React.createElement(window[this.state.customClass], this.state.props);
				}
			} else {
				if(!this.state.node.staticLink) {
					if(typeof (this.state.recId) !== 'undefined') {
						body = React.createElement(FormFull, { node: this.state.node, initialData: this.state.data, filters: this.filters || {}, editable: this.state.editable });
					} else {
						body = React.createElement(List, { node: this.state.node, initialData: this.state.data, filters: this.filters || {} });
					}
				} else {
					if(this.state.node.staticLink === 'reactClass') {
						if(typeof window[this.state.node.tableName] === 'undefined') {
							myAlert('Unknown react class: ' + this.state.node.tableName);
						} else {
							//TODO custom class form
							debugger;
							//body = React.createElement(window[this.state.node.tableName], {node: this.state.node, recId: this.state.recId, filters: this.filters || {}});
						}
					} else {
						location.href = this.state.node.staticLink;
					}
				}
			}

		} else {
			body = React.createElement(FormLoaderCog);
		}

		return R.div({ className: 'stage' },
			body
		);
	}
}
/** @type Stage */
Stage.instance = null;

export { Stage, FormLoaderCog }