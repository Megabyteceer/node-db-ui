import FieldAdmin from "../admin/field-admin.js";

export default class FormTab extends Component {

	constructor(props) {
		super(props);
		this.state = {visible: this.props.visible};
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.state.visible = nextProps.visible;
	}

	show(val) {
		if(!this.state.visible) {
			this.setState({visible: true});
		}
	}

	hide(val) {
		if(this.state.visible) {
			this.setState({visible: false});
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

		return R.div({className},
			(this.props.highlightFrame ? React.createElement(FieldAdmin, {field: this.props.field, form: this.props.form, x: 13}) : ''),
			this.props.fields);
	}
}
