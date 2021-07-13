

import constants from "./custom/consts.js";
import User from "./user.js";
import {isLitePage} from "./utils.js";

var style = {
	width: '100%',
	color: '#fff',
	background: constants.BRAND_COLOR,
	fontSize: '120%',
	textAlign: 'center',
	zIndex: 8
}


export default class TopBar extends React.Component {
	render() {
		//var search;
		if(isLitePage()) {
			style.display = 'none';
		} else {
			//search = React.createElement(Search);
		}


		return ReactDOM.div({className: 'clearfix', style: style},
			ReactDOM.a({
				className: 'clickable clickable-top',
				href: '/',
				style: {padding: '8px 10px', float: 'left', display: 'block'}
			},
				ReactDOM.img({src: 'images/logo.png', style: {}})),
			//search,
			ReactDOM.div({style: {float: 'right', marginTop: 15, marginBottom: 15}},
				React.createElement(User)
			)
		);
	}
}
