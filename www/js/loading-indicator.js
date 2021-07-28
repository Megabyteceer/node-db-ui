

import {isLitePage, renderIcon} from "./utils.js";

export default class LoadingIndicator extends Component {

	constructor(props) {
		super(props);
		this.state = {showCount: 0};
		LoadingIndicator.instance = this;
	}

	hide() {
		this.setState({showCount: Math.max(0, this.state.showCount - 1)});
	}

	show() {

		if(isLitePage()) return;
		this.state.showCount++;
		if(this.state.showCount === 1) {
			this.forceUpdate();
		}
	}

	render() {
		let active = this.state.showCount > 0;

		return R.div({className: active ? 'back-drop' : null},
			R.div({className: active ? "loading-spinner-container" : "loading-spinner-container-inactive"},
				active ? R.div({className: "loading-spinner"},
					renderIcon('cog fa-spin')
				) : undefined
			)
		);

	}
}