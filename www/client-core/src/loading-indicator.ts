import { Component } from 'preact';
import { R } from './r';
import { isLitePage, renderIcon } from './utils';

class LoadingIndicator extends Component<{
	// props
},
{
	// state
	showCount: number;
}> {
	static instance: LoadingIndicator;

	constructor(props) {
		super(props);
		this.state = { showCount: 0 };
		LoadingIndicator.instance = this;
	}

	hide() {
		if (isLitePage()) return;
		this.setState({ showCount: this.state.showCount - 1 });
	}

	show() {
		if (isLitePage()) return;

		this.setState({ showCount: this.state.showCount + 1 });
	}

	render() {
		const active = this.state.showCount > 0;

		return R.div({ className: active ? 'loader-back-drop' : null },
			R.div({ className: active ? 'loading-spinner-container' : 'loading-spinner-container loading-spinner-container-inactive' },
				active ? R.div({ className: 'loading-spinner' },
					renderIcon('cog fa-spin')
				) : undefined
			)
		);
	}
}
/** @type LoadingIndicator */
LoadingIndicator.instance = null;

export { LoadingIndicator };
