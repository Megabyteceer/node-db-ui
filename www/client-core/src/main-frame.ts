
/// #if DEBUG
import { DebugPanel } from './debug-panel';
/// #endif

import { Component, h } from 'preact';
import type { ITreeAndOptions, TreeItem } from '../../../core/describe-node';
import type { ENV_TYPE } from '../../../core/ENV';
import { LeftBar } from './left-bar';
import { LoadingIndicator } from './loading-indicator';
import { Modal } from './modal';
import { Notify } from './notify';
import { R } from './r';
import { Stage } from './stage';
import { TopBar } from './top-bar';
import { User } from './user';
import { getData, goToPageByHash, onNewUser } from './utils';

const ROOT_NODE_ID = 2;
const ENV = {} as ENV_TYPE;
let isFirstCall = true;

let nodesTree: TreeItem[];
let rootItem: TreeItem;

class MainFrame extends Component<{
	//props
},
{
	//state
}> {
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

		const data = await getData('api/getOptions') as ITreeAndOptions;

		nodesTree = data.nodesTree;
		const items = {};
		Object.assign(ENV, data.options);

		for (const treeItem of nodesTree) {
			items[treeItem.id] = treeItem;
			if (treeItem.id === ROOT_NODE_ID) {
				rootItem = treeItem;
			}
		}

		for (const treeItem of nodesTree) {
			if (items.hasOwnProperty(treeItem.parent)) {
				const parentItem = items[treeItem.parent];
				if (!parentItem.hasOwnProperty('children')) {
					parentItem.children = [];
				}
				parentItem.children.push(treeItem);
			}
		}
		this.forceUpdate();
		if (isFirstCall) {
			isFirstCall = false;
			goToPageByHash();
		}
	}

	render() {
		return R.div(null,
			h(TopBar, null),
			R.div({ className: 'main-frame' },
				nodesTree ? h(LeftBar, { menuItems: rootItem.children }) : undefined,
				R.div({ className: 'stage-container' },
					h(Stage, null)
				)
			),
			R.div({ className: 'footer' }, ENV.APP_TITLE),
			h(Modal, null),
			h(Notify, null),
			/// #if DEBUG
			h(DebugPanel, null),
			/// #endif
			h(LoadingIndicator, null)

		);
	}
}
/** @type MainFrame */
MainFrame.instance = null;

export { ENV, MainFrame };

