/// #if DEBUG
import { Component, h, type ComponentChild } from 'preact';
import { FieldAdmin } from '../admin/field-admin';
/// #endif

import type { FieldDesc } from '../bs-utils';
import { R } from '../r';
import type { FormFull__olf } from './form-full';

interface FormTabProps {
	visible: boolean;
	highlightFrame?: boolean;
	field: FieldDesc;
	fields: ComponentChild;
	form?: FormFull__olf;
};

class FormTab__olf extends Component<FormTabProps, {
	body: ComponentChild;
	isTabActive: boolean;
}> {

	constructor(props: FormTabProps) {
		super(props);
		this.state = { visible: this.props.visible };
	}

	componentWillReceiveProps(nextProps: any) {
		this.setState({ visible: nextProps.visible });
	}

	acti(_val: any) {
		if (!this.state.visible) {
			this.setState({ visible: true });
		}
	}

	hide(_val: any) {
		if (this.state.visible) {
			this.setState({ visible: false });
		}
	}

	render() {
		let className = 'form-tab';
		if (!this.state.visible) {
			className += ' hidden';
		}
		return R.div({ className },
			/// #if DEBUG
			(this.props.highlightFrame ? h(FieldAdmin, { field: this.props.field, form: this.props.form }) : ''),
			/// #endif
			this.props.fields);
	}
}

export { FormTab__olf };
