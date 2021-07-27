import DebugPanel from "./debug-panel.js";
import LeftBar from "./left-bar.js";
import LoadingIndicator from "./loading-indicator.js";
import Modal from "./modal.js";
import Notify from "./notify.js";
import {Stage} from "./stage.js";
import TopBar from "./top-bar.js";
import {getData} from "./utils.js";

const ENV = {};

class MainFrame extends React.Component {

	constructor(props) {
		super(props);
		MainFrame.instance = this;
		this.reloadOptions();
	}

	async reloadOptions() {
		let data = await getData('api/getOptions');

		const nodesTree = data.nodesTree;
		var items = {};
		Object.assign(ENV, data.options);
		ENV.nodesTree = nodesTree;

		/// #if DEBUG
		if(!ENV.DEBUG) {throw "DEBUG directives nad not cutted of in PRODUCTION mode"};
		/// #endif


		nodesTree.some((i) => {
			items[i.id] = i;
			if(i.id === 2) {
				ENV.rootItem = i;
			}
		});

		for(var k in nodesTree) {
			var i = nodesTree[k];
			if(items.hasOwnProperty(i.parent)) {
				var parent = items[i.parent];
				if(!parent.hasOwnProperty('children')) {
					parent.children = [];
				}
				parent.children.push(i);
			}
		}
		this.forceUpdate();
	}

	render() {
		var debug = React.createElement(DebugPanel);
		if(!ENV.nodesTree) {
			return ReactDOM.div(null, debug);
		}
		return ReactDOM.div(null,
			React.createElement(TopBar),
			ReactDOM.table({className: "root-table"},
				ReactDOM.tbody(null,
					ReactDOM.tr(null,
						React.createElement(LeftBar, {staticItems: ENV.rootItem.children}),
						ReactDOM.td({className: "stage-container"},
							React.createElement(Stage)
						)
					)
				)
			),
			ReactDOM.div({className: "footer"}, ENV.APP_TITLE),
			React.createElement(Modal),
			React.createElement(Notify),
			debug,
			React.createElement(LoadingIndicator)

		);
	}
}

export default MainFrame;
export {ENV};
