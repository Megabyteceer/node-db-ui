

import {isLitePage, renderIcon} from "./utils.js";


var backDropStyle = {
	position: 'fixed',
	top: 0,
	bottom: 0,
	background: "#00102000",
	right: 0,
	left: 0,
	zIndex: 15,
	cursor: "wait"
};

export default class LoadingIndicator extends React.Component {

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
		if(this.state.showCount > 0) {
			return ReactDOM.div({style: backDropStyle},
				ReactDOM.div({style: {margin: 'auto', position: 'relative', border: '2px solid #fff', borderTop: 0, height: '40px', width: '90px', transition: '0.3s', overflow: 'hidden', background: '#999', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px'}},
					ReactDOM.div({style: {position: 'absolute', width: '90px', textAlign: 'center', color: '#fff', fontSize: '170%', bottom: '3px'}},
						renderIcon('cog fa-spin')
					)
				)
			);
		} else {
			return ReactDOM.div();
		}
	}
}