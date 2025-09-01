/// #if DEBUG
import { Component, h, type ComponentChild } from 'preact';
import { FieldAdmin } from '../admin/field-admin';
/// #endif

import type { FieldDesc } from '../bs-utils';
import { R } from '../r';
import type { FormFull } from './form-full';

class FormTab extends Component<{
	visible: boolean;
	highlightFrame: boolean;
	field: FieldDesc;
	fields: ComponentChild
	form?:FormFull;
}, {
	visible: boolean;
}> {

	constructor(props) {
		super(props);
		this.state = { visible: this.props.visible };
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ visible: nextProps.visible });
	}

	show(_val) {
		if (!this.state.visible) {
			this.setState({ visible: true });
		}
	}

	hide(_val) {
		if (this.state.visible) {
			this.setState({ visible: false });
		}
	}

	render() {
		let className = 'form-tab';
		if (!this.state.visible) {
			className += ' hidden';
		}
		if (this.props.highlightFrame) {
			className += ' form-tab-highlight';
		}

		return R.div({ className },
			/// #if DEBUG
			(this.props.highlightFrame ? h(FieldAdmin, { field: this.props.field, form: this.props.form }) : ''),
			/// #endif
			this.props.fields);
	}
}

export { FormTab };

