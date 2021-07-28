

import User from "./user.js";
import {isLitePage} from "./utils.js";

var style = {
	width: '100%',
	color: '#fff',
	background: window.constants.BRAND_COLOR,
	fontSize: '120%',
	textAlign: 'center',
	zIndex: 8
}


export default class TopBar extends Component {
	render() {
		//var search;
		if(isLitePage()) {
			style.display = 'none';
		} else {
			//search = React.createElement(Search);
		}


		return R.div({className: 'clearfix', style: style},
			R.a({
				className: 'clickable clickable-neg',
				href: '/',
				style: {padding: '8px 10px', float: 'left', display: 'block'}
			},
				R.img({src: 'images/logo.png', style: {}})),
			//search,
			R.div({style: {float: 'right', marginTop: 15, marginBottom: 15}},
				React.createElement(User)
			)
		);
	}
}
