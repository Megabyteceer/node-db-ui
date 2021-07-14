

import constants from "./custom/consts.js";
import FormFull from "./forms/form-full.js";
import List from "./forms/list.js";
import LeftBar from "./left-bar.js";
import {consoleLog, isLitePage, myAlert, renderIcon} from "./utils.js";

var defaultButtonStyle = {
	background: '#ddd',
	color: '#666',
	fontSize: '90%',
	fontWeight: 'bold',
	padding: '10px 30px',
	border: 0
}
var dangerButtonStyle = {
	background: constants.DELETE_COLOR,
	color: '#fee',
	fontSize: '90%',
	fontWeight: 'bold',
	padding: '10px 30px',
	border: 0
}
var successButtonStyle = {
	background: constants.EDIT_COLOR,
	color: '#efe',
	fontSize: '90%',
	fontWeight: 'bold',
	padding: '10px 30px',
	border: 0
}

class FormLoaderCog extends React.Component {
	render() {
		return ReactDOM.div({style: {paddingTop: '50px', textAlign: 'center', color: '#ccc'}},
			renderIcon('cog fa-spin fa-5x')
		);
	}
}

var style = {
	paddingTop: '10px',
	//minHeight:'600px',
	margin: '0 20px',
	//maxWidth:'1124px'
};
var liteStyle = {
	margin: 30
};

class Stage extends React.Component {

	componentDidMount() {
		Stage.instance = this;
	}

	setCustomClass(className, props) {
		this.setState({customClass: className, props: props});
	}

	_setFormData(node, data, recId, filters, editable) {
		consoleLog('set form data');
		if(typeof (node) !== 'undefined') {
			this.state = null;
			this.setState({node: node, data: data, recId: recId, filters: filters, editable: editable});
		} else {
			this.state = null;
			this.forceUpdate()
		}
	}

	setFormFilter(name, val) {
		if(!this.state.filters) {
			this.state.filters = {};
		}
		if(this.state.filters[name] !== val) {
			this.state.filters[name] = val;
			this.forceUpdate();
			if(name === 'tab') {
				LeftBar.instance.refreshLeftBarActive();
			}
		}
	}

	loadCustomClass() {
		loadJS('js/custom/' + this.state.customClass.toLowerCase() + '.js', () => {
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
					return React.createElement(window[this.state.customClass], this.state.props);
				}
			} else {
				if(!this.state.node.staticLink) {
					if(typeof (this.state.recId) !== 'undefined') {
						body = React.createElement(FormFull, {node: this.state.node, initialData: this.state.data, filters: this.state.filters || {}, editable: this.state.editable});
					} else {
						body = React.createElement(List, {node: this.state.node, initialData: this.state.data, filters: this.state.filters || {}});
					}
				} else {
					if(this.state.node.staticLink === 'reactClass') {
						if(typeof window[this.state.node.tableName] === 'undefined') {
							myAlert('Unknown react class: ' + this.state.node.tableName);
						} else {
							body = React.createElement(window[this.state.node.tableName], {node: this.state.node, recId: this.state.recId, filters: this.state.filters || {}});
						}
					} else {
						location.href = this.state.node.staticLink;
					}
				}
			}

		} else {
			//body = React.createElement(FormLoaderCog);
		}

		return ReactDOM.div({style: isLitePage() ? liteStyle : style},
			body
		);
	}
}

export {Stage, FormLoaderCog, defaultButtonStyle, dangerButtonStyle, successButtonStyle}