export default class FormTab extends React.Component {
	
	constructor (props) {
		super(props);
		this.state ={visible: this.props.visible};
	}

	componentDidUpdate() {
		this.state.visible = this.props.visible;
	}

	show(val) {
		if(!this.state.visible){
			this.setState({visible:true});
		}
	}

	hide(val) {
		if(this.state.visible){
			this.setState({visible:false});
		}
	}

	render() {
		return ReactDOM.div({style:{display:this.state.visible?'block':'none', marginBottom:(this.props.highlightFrame?'10px':0), border:(this.props.highlightFrame?'2px solid #944':0)}},
		(this.props.highlightFrame?React.createElement(FieldAdmin, {field:this.props.field, form:this.props.form, x:13}):''),
		this.props.fields);
	}
}
