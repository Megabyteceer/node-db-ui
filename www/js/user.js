import React from "react";

import {clearForm, getData, goToPageByHash, idToImgURL, L, loactionToHash, renderIcon, showForm} from "./utils.js";
import Select from "./components/select.js";
import admin from "./admin/admin-utils.js";
import {ENV} from "./main-frame.js";
import moment from "moment";
import {Component} from "react";
import R from "./r.js";
import {ADMIN_ROLE_ID, isUserHaveRole} from "./bs-utils";


function setUserOrg(orgId) {
	if(User.currentUserData.orgId !== orgId) {
		getData('api/setCurrentOrg', {orgId}).then(() => {
			User.instance.refreshUser();
		});
	}
}

function iAdmin() {
	return User.currentUserData && isUserHaveRole(ADMIN_ROLE_ID, User.currentUserData);
}

var isFirstCall = true;

export default class User extends Component {

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

				User.currentUserData = data;
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
			let className = 'clickable top-bar-user-multilang'
			if(this.state.hasOwnProperty('langs')) {
				className += ' top-bar-user-multilang-active';
				iconName = 'check-';
			};

			var multilangBtn;
			if(ENV.ENABLE_MULTILANG) {
				multilangBtn = R.div({className, onClick: this.toggleMultilang},
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

				org = React.createElement(Select, {options, className: "top-bar-user-org-select", isCompact: true, defaultValue: this.state.orgId, onChange: this.changeOrg});
			} else {
				org = this.state.org;
			}

			var btn1, btn2;
			if(this.state.id === 2) {
				btn2 = R.a({href: 'login', title: L('LOGIN'), className: 'clickable top-bar-user-btn'},
					renderIcon('sign-in fa-2x')
				)
			} else {
				let imgUrl = idToImgURL(this.state.avatar, 'avatar');
				btn1 = R.a({href: loactionToHash(5, this.state.id, undefined, true), title: L('USER_PROFILE'), className: 'clickable top-bar-user-btn'},
					R.img({className: 'user-avatar', src: imgUrl})
				);
				btn2 = R.a({href: 'login', title: L('LOGOUT'), className: 'clickable top-bar-user-btn'},
					renderIcon('sign-out fa-2x')
				);
			}

			body = R.span(null,
				multilangBtn,
				org,
				btn1, btn2
			)
		} else {
			body = renderIcon('cog fa-spin');
		}

		return R.div({className: "top-bar-user-container"},
			body
		)
	}
}
/** @type User */
User.instance = null;

User.currentUserData = null;

/// #if DEBUG
User.sessionToken = "dev-admin-session-token";
/// #endif

export {iAdmin};