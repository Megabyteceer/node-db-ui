import {Component} from "react";
import {goBack} from "../utils.js";


export default class BaseForm extends Component {

	constructor(props) {
		super(props);
		this.state = {};
		this.filters = Object.assign({}, this.props.filters);
		this.fieldsRefs = {};
		this.cancelClick = this.cancelClick.bind(this);
		this.header = '';
	}

	UNSAFE_componentWillReceiveProps(newProps) {
		this.filters = $.extend({}, newProps.filters);
	}

	changeFilter(name, v, refresh) {
		if(name === 'tab') {
			this.callOnTabShowEvent(v);
		}

		var p = this.filters[name];

		if((p !== 0) && (v !== 0)) {
			if(!p && !v) return;
		}

		if(p !== v) {

			if(typeof (v) === 'undefined') {
				if(!this.isSlave()) {
					delete (currentFormParameters.filters[name]);
				}
				delete (this.filters[name]);
			} else {
				if(!this.isSlave()) {
					currentFormParameters.filters[name] = v;
				}
				this.filters[name] = v;
			}
			if(refresh) {
				this.refreshData();
			}
			return true;
		}
		return false;
	}

	isSlave() {
		if(this.props.parentForm) {
			return true;
		}
		return false;
	}

	cancelClick() {
		if(this.props.onCancel) {
			this.props.onCancel();
			return;
		}
		if(this.onCancelCallback) {
			this.onCancelCallback();
		}
		if(this.isSlave()) {
			this.props.parentForm.toggleCreateDialogue();
		} else {
			goBack();
		}
	}
}