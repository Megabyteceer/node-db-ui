

import { Component } from "react";
import { R } from "./r";
import { isLitePage, renderIcon } from "./utils";

class LoadingIndicator extends Component<any, any> {
	static instance: LoadingIndicator;

	constructor(props) {
		super(props);
		this.state = { showCount: 0 };
		LoadingIndicator.instance = this;
	}

	hide() {
		this.setState({ showCount: Math.max(0, this.state.showCount - 1) });
	}

	show() {

		if(isLitePage()) return;
		//@ts-ignore
		this.state.showCount++;
		if(this.state.showCount === 1) {
			this.forceUpdate();
		}
	}

	render() {
		let active = this.state.showCount > 0;

		return R.div({ className: active ? 'back-drop' : null },
			R.div({ className: active ? "loading-spinner-container" : "loading-spinner-container-inactive" },
				active ? R.div({ className: "loading-spinner" },
					renderIcon('cog fa-spin')
				) : undefined
			)
		);

	}
}
/** @type LoadingIndicator */
LoadingIndicator.instance = null;

export { LoadingIndicator };