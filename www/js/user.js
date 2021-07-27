

import moment from "./lib/moment/dist/moment.js";
import {clearForm, getData, goToPageByHash, L, loactionToHash, loadJS, renderIcon, sp} from "./utils.js";
import Select from "./components/select.js";
import admin from "./admin/admin-utils.js";
import {ENV} from "./main-frame.js";

var curentUserData;

function setUserOrg(orgId) {
	if(curentUserData.orgId !== orgId) {
		getData('api/setCurrentOrg', {orgId}).then(() => {
			User.instance.refreshUser();
		});
	}
}

function iAdmin() {
	return isUserHaveRole(ADMIN_ROLE_ID);
}

var style = {
	marginRight: 10
}

var selectStyle = {
	position: 'relative',
	width: '100%',
	height: 32,
	padding: '2px 8px',
	color: window.constants.TEXT_COLOR,
	background: '#fff',
	border: '1px solid #aaa',
	borderRadius: '3px',
	cursor: 'pointer'
}

var isFirstCall = true;

export default class User extends React.Component {

	componentDidMount() {
		User.instance = this;
		this.refreshUser();
	}

	refreshUser() {
		getData('api/getMe').then((data) => {
			data.lang.code = data.lang.code || 'en';
			moment.locale(data.lang.code);
			import('/locales/' + data.lang.code + '/lang.js').then(() => {
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
		});
	}

	changeOrg(value) {
		clearForm();
		setTimeout(() => {
			setUserOrg(value);
			showForm(14);
		}, 10);
	}

	toggleMultilang() {
		getData('api/toggleMultilang').then(() => {
			window.location.reload();
		});

	}

	render() {

		var body;

		if(this.state) {

			var iconName = '';
			var mlbs = {display: 'inline-block', marginRight: 12, borderRadius: 4, border: '1px solid ' + window.constants.BRAND_COLOR_DARK, color: window.constants.BRAND_COLOR_LIGHT, padding: '3px 10px'};
			if(this.state.hasOwnProperty('langs')) {
				mlbs.color = '#ffbf8c';
				iconName = 'check-';
			};

			var multilangBtn;
			if(ENV.ENABLE_MULTILANG) {
				multilangBtn = ReactDOM.div({className: 'clickable clickable-neg', style: mlbs, onClick: this.toggleMultilang},
					renderIcon(iconName + 'square-o'), L('MULTILANG')
				);
			}

			var org;
			if(this.state.orgs && Object.keys(this.state.orgs).length > 1 && this.state.orgs[this.state.orgId]) {
				var options = [];

				for(var k in this.state.orgs) {
					var name = this.state.orgs[k];
					options.push({value: k, name});
				};

				org = React.createElement(Select, {options, style: selectStyle, isCompact: true, defaultValue: this.state.orgId, onChange: this.changeOrg});
			} else {
				org = this.state.org;
			}

			var btn1, btn2;
			if(this.state.id === 2) {
				btn2 = ReactDOM.a({style: {borderRadius: '5px', display: 'inline-block', padding: '2px 10px'}, href: 'login', title: L('LOGIN'), className: 'clickable clickable-neg'},
					renderIcon('sign-in fa-2x')
				)
			} else {
				btn1 = ReactDOM.a({style: {borderRadius: '5px', display: 'inline-block', padding: '2px 10px', marginLeft: '20px', width: '50px'}, href: loactionToHash(5, this.state.id, undefined, true), title: L('USER_PROFILE'), className: 'clickable clickable-neg'},
					renderIcon('user fa-2x')
				);
				btn2 = ReactDOM.a({style: {borderRadius: '5px', display: 'inline-block', padding: '2px 10px'}, href: 'login', title: L('LOGOUT'), className: 'clickable clickable-neg'},
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

User.sessionToken = "dev-admin-session-token";

export {iAdmin};