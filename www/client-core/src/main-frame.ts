import React, { Component } from "react";
/// #if DEBUG
import { DebugPanel } from "./debug-panel";
/// #endif

import { R } from "./r";
import { LeftBar } from "./left-bar";
import { LoadingIndicator } from "./loading-indicator";
import { Modal } from "./modal";
import { Notify } from "./notify";
import { Stage } from "./stage";
import { TopBar } from "./top-bar";
import { getData, goToPageByHash, onNewUser } from "./utils";
import { User } from "./user";
import type { ENV_TYPE } from '../../../core/ENV';


const ROOT_NODE_ID = 2;
const ENV = {} as ENV_TYPE;
var isFirstCall = true;

type NodeTreRec = any;
let nodesTree: NodeTreRec[];
let rootItem: NodeTreRec;

class MainFrame extends Component<any, any> {
	static instance: MainFrame;

	constructor(props) {
		super(props);
		MainFrame.instance = this;
	}

	componentDidMount() {
		User.refreshUser();
	}

	async reloadOptions() {
		onNewUser();

		let data = await getData('api/getOptions');

		nodesTree = data.nodesTree;
		var items = {};
		Object.assign(ENV, data.options);

		nodesTree.some((i) => {
			items[i.id] = i;
			if(i.id === ROOT_NODE_ID) {
				rootItem = i;
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
		if(isFirstCall) {
			isFirstCall = false;
			goToPageByHash();
		}
	}

	render() {
		return R.div(null,
			React.createElement(TopBar),
			R.div({ className: "main-frame" },
				nodesTree ? React.createElement(LeftBar, { menuItems: rootItem.children }) : undefined,
				R.div({ className: "stage-container" },
					React.createElement(Stage)
				)
			),
			R.div({ className: "footer" }, ENV.APP_TITLE),
			React.createElement(Modal),
			React.createElement(Notify),
			/// #if DEBUG
			React.createElement(DebugPanel),
			/// #endif
			React.createElement(LoadingIndicator)

		);
	}
}
/** @type MainFrame */
MainFrame.instance = null;

export { ENV, MainFrame };
