/// #if DEBUG
import { FieldAdmin } from "../admin/field-admin";
/// #endif
import React, { Component } from "react";
import { R } from "../r";

class FormTab extends Component<any, any> {

	constructor(props) {
		super(props);
		this.state = { visible: this.props.visible };
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.setState({ visible: nextProps.visible });
	}

	show(val) {
		if(!this.state.visible) {
			this.setState({ visible: true });
		}
	}

	hide(val) {
		if(this.state.visible) {
			this.setState({ visible: false });
		}
	}

	render() {
		let className = 'form-tab';
		if(!this.state.visible) {
			className += ' hidden';
		}
		if(this.props.highlightFrame) {
			className += ' form-tab-highlight';
		}

		return R.div({ className },
			/// #if DEBUG
			(this.props.highlightFrame ? React.createElement(FieldAdmin, { field: this.props.field, form: this.props.form }) : ''),
			/// #endif
			this.props.fields);
	}
}

export { FormTab };

