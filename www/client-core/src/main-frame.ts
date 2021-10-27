

import React, { Component } from "react";
import { DebugPanel } from "./debug-panel";
import { R } from "./r";
import { LeftBar } from "./left-bar";
import { LoadingIndicator } from "./loading-indicator";
import { Modal } from "./modal";
import { Notify } from "./notify";
import { Stage } from "./stage";
import { TopBar } from "./top-bar";
import { getData, goToPageByHash, onNewUser } from "./utils";
import { User } from "./user";

const ENV: any = {};
var isFirstCall = true;

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

		const nodesTree = data.nodesTree;
		var items = {};
		Object.assign(ENV, data.options);
		ENV.nodesTree = nodesTree;

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
		if(isFirstCall) {
			isFirstCall = false;
			goToPageByHash();
		}
	}

	render() {
		var debug = React.createElement(DebugPanel);
		return R.div(null,
			React.createElement(TopBar),
			R.table({ className: "root-table" },
				R.tbody(null,
					R.tr(null,
						ENV.nodesTree ? React.createElement(LeftBar, { menuItems: ENV.rootItem.children }) : undefined,
						R.td({ className: "stage-container" },
							React.createElement(Stage)
						)
					)
				)
			),
			R.div({ className: "footer" }, ENV.APP_TITLE),
			React.createElement(Modal),
			React.createElement(Notify),
			debug,
			React.createElement(LoadingIndicator)

		);
	}
}
/** @type MainFrame */
MainFrame.instance = null;

export { ENV, MainFrame };
