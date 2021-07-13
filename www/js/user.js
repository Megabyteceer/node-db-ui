

import moment from "./lib/moment/dist/moment.js";
import constants from "./custom/consts.js";
import {getData, goToPageByHash, L, loactionToHash, loadJS, renderIcon, sp} from "./utils.js";

var curentUserData;

function setUserOrg(orgId) {
	if(curentUserData.orgId !== orgId) {
		getData('api/setCurrentOrg.php', {orgId}, () => {
			User.instance.refreshUser();
		});
	}
}

function iAdmin() {
	return isUserHaveRole(ADMIN_ROLE_ID) && (typeof (admin) !== 'undefined');
}

var style = {
	marginRight: 10
}

var selectStyle = {
	position: 'relative',
	width: '100%',
	height: 32,
	padding: '2px 8px',
	color: constants.TEXT_COLOR,
	background: '#fff',
	border: '1px solid #aaa',
	borderRadius: '3px',
	cursor: 'pointer'
}
var optionStyle = {
	padding: '5px',
	cursor: 'pointer'
}

function editProfileClick(e) {
	sp(e);
}

var isFirstCall = true;

export default class User extends React.Component {

	componentDidMount() {
		User.instance = this;
		this.refreshUser();
	}

	refreshUser() {
		getData('api/getMe.php', undefined, (data) => {
			data.lang.code = data.lang.code || 'en';
			moment.locale(data.lang.code);
			loadJS('/locales/' + data.lang.code + '/lang.js', () => {
				this.setState(data);

				window.curentUserData = data;
				if(iAdmin()) {
					admin.toggleAdminUI();
				}
				if(isFirstCall) {
					isFirstCall = false;
					goToPageByHash();
				}
			})
		})
	}

	changeOrg(value) {
		clearForm();
		setTimeout(() => {
			setUserOrg(value);
			showForm(14);
		}, 10);
	}

	toggleMultilang() {
		getData('api/toggleMultilang.php', undefined, () => {
			window.location.reload();
		});

	}

	render() {

		var body;

		if(this.state) {

			var iconName = '';
			var mlbs = {display: 'inline-block', marginRight: 12, borderRadius: 4, border: '1px solid ' + constants.BRAND_COLOR_DARK, color: constants.BRAND_COLOR_LIGHT, padding: '3px 10px'};
			if(this.state.hasOwnProperty('langs')) {
				mlbs.color = '#ffbf8c';
				iconName = 'check-';
			};

			var multilangBtn;
			if(ENABLE_MULTILANG) {
				multilangBtn = ReactDOM.div({className: 'clickable clickable-top', style: mlbs, onClick: this.toggleMultilang},
					renderIcon(iconName + 'square-o'), L('MULTILANG')
				);
			}

			var org;
			if(this.state.orgs && Object.keys(this.state.orgs).length > 1 && this.state.orgs[this.state.orgId]) {
				var options = [];

				for(var k in this.state.orgs) {
					var o = this.state.orgs[k];
					options.push(ReactDOM.option({value: k, key: k, style: optionStyle}, o));
				};

				org = React.createElement(Select, {options: this.state.orgs, style: selectStyle, isCompact: true, defaultValue: this.state.orgId, onChange: this.changeOrg});
			} else {
				org = this.state.org;
			}

			var btn1, btn2;
			if(this.state.id === 2) {
				btn2 = ReactDOM.a({style: {borderRadius: '5px', display: 'inline-block', padding: '2px 10px'}, href: 'login.php', title: L('LOGIN'), className: 'clickable clickable-top'},
					renderIcon('sign-in fa-2x')
				)
			} else {
				btn1 = ReactDOM.a({style: {borderRadius: '5px', display: 'inline-block', padding: '2px 10px', marginLeft: '20px', width: '50px'}, href: loactionToHash(5, this.state.id, undefined, true), title: L('USER_PROFILE'), className: 'clickable clickable-top'},
					renderIcon('user fa-2x')
				);
				btn2 = ReactDOM.a({style: {borderRadius: '5px', display: 'inline-block', padding: '2px 10px'}, href: 'login.php', title: L('LOGOUT'), className: 'clickable clickable-top'},
					renderIcon('sign-out fa-2x')
				);
			}

			body = ReactDOM.span(null,
				multilangBtn,
				org,
				btn1, btn2
			)
		} else {
			body = renderIcon('cog fa-spin');
		}

		return ReactDOM.div({style: style},
			body
		)
	}
}

User.sessionToken = "dev-user-session-token";

export {iAdmin};