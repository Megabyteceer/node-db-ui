

import FormFull from "./forms/form-full.js";
import List from "./forms/list.js";
import LeftBar from "./left-bar.js";
import {consoleLog, isLitePage, loadJS, myAlert, renderIcon} from "./utils.js";

class FormLoaderCog extends Component {
	render() {
		return R.div({style: {paddingTop: '50px', textAlign: 'center', color: '#ccc'}},
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

class Stage extends Component {

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
			setTimeout(() => {
				this.setState({node, data: data, recId: recId, filters: filters, editable: editable});
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
					return React.createElement(window[this.state.customClass], this.state.props);
				}
			} else {
				if(!this.state.node.staticLink) {
					if(typeof (this.state.recId) !== 'undefined') {
						body = React.createElement(FormFull, {node: this.state.node, initialData: this.state.data, filters: this.filters || {}, editable: this.state.editable});
					} else {
						body = React.createElement(List, {node: this.state.node, initialData: this.state.data, filters: this.filters || {}});
					}
				} else {
					if(this.state.node.staticLink === 'reactClass') {
						if(typeof window[this.state.node.tableName] === 'undefined') {
							myAlert('Unknown react class: ' + this.state.node.tableName);
						} else {
							body = React.createElement(window[this.state.node.tableName], {node: this.state.node, recId: this.state.recId, filters: this.filters || {}});
						}
					} else {
						location.href = this.state.node.staticLink;
					}
				}
			}

		} else {
			//body = React.createElement(FormLoaderCog);
		}

		return R.div({style: isLitePage() ? liteStyle : style},
			body
		);
	}
}
/** @type Stage */
Stage.instance = null;

export {Stage, FormLoaderCog}