import User from "./user.js";

export default class TopBar extends Component {
	render() {
		return R.div({className: 'clearfix top-bar'},
			R.a({
				className: 'clickable clickable-neg top-bar-logo',
				href: '/'
			},
				R.img({src: 'images/logo.png'})),
			//search,
			R.div({className: "top-bar-right-area"},
				React.createElement(User)
			)
		);
	}
}
