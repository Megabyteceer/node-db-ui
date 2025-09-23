import { Component } from 'preact';
import { R } from './r';
import { renderIcon } from './utils';

interface LoadingIndicatorProps {
}

class LoadingIndicator extends Component<LoadingIndicatorProps,
	{
	// state
		showCount: number;
	}> {
	static instance?: LoadingIndicator;

	constructor(props: LoadingIndicatorProps) {
		super(props);
		this.state = { showCount: 0 };
		LoadingIndicator.instance = this;
	}

	hide() {
		this.setState({ showCount: this.state.showCount - 1 });
	}

	show() {
		this.setState({ showCount: this.state.showCount + 1 });
	}

	render() {
		const active = this.state.showCount > 0;

		return R.div({ className: active ? 'loader-back-drop' : undefined },
			R.div({ className: active ? 'loading-spinner-container' : 'loading-spinner-container loading-spinner-container-inactive' },
				active ? R.div({ className: 'loading-spinner' },
					renderIcon('cog fa-spin')
				) : undefined
			)
		);
	}
}
LoadingIndicator.instance = undefined;

export { LoadingIndicator };
