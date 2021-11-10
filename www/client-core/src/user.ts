import React from "react";

import { getData, LITE_UI_PREFIX, idToImgURL, isAdmin, L, renderIcon, setItem } from "./utils";
import { Select } from "./components/select";
import { ENV, MainFrame } from "./main-frame";
import moment from "moment";
import { Component } from "react";
import { R } from "./r";
import { NODE_ID, UserSession } from "./bs-utils";

function setUserOrg(orgId) {
	if(User.currentUserData.orgId !== orgId) {
		getData('api/setCurrentOrg', { orgId }).then(() => {
			User.refreshUser();
		});
	}
}

function iAdmin() {
	return User.currentUserData && isAdmin();
}

class User extends Component<any, any> {

	static instance: User;
	static currentUserData: UserSession;

	componentDidMount() {
		User.instance = this;
	}

	static async requireUserData(): Promise<UserSession> {
		let ret = await getData('api/getMe');
		User.currentUserData = ret;
		return ret;
	}

	static async refreshUser() {
		var data = await User.requireUserData();
		data.lang.code = data.lang.code || 'en';
		moment.locale(data.lang.code);
		Promise.all([
			import(`./locales/${data.lang.code}/lang.ts`),
			import(`/src/locales/${data.lang.code}/lang.ts`)
		]).then(() => {
			if(User.instance) {
				User.instance.forceUpdate();
			}
			User.setUserData(data);
		})
		return data;
	}

	static setUserData(data: UserSession) {
		User.currentUserData = data;
		setItem('cud-js-session-token', data.sessionToken);
		MainFrame.instance.reloadOptions();
	}

	changeOrg(value) {
		setTimeout(() => {
			setUserOrg(value);
			//Stage.showForm(14, undefined, undefined, undefined, true);
		}, 10);
	}

	toggleMultilingual() {
		getData('api/toggleMultilingual').then(() => {
			window.location.reload();
		});
	}

	static getLoginURL(isLiteUI = false) {
		return '/' + (isLiteUI ? LITE_UI_PREFIX : '') + '#n/' + NODE_ID.LOGIN + '/r/new/e';
	}

	render() {

		var body;

		const userData = User.currentUserData;

		if(userData) {

			var iconName = '';
			let className = 'clickable top-bar-user-multilingual'
			if(userData.hasOwnProperty('langs')) {
				className += ' top-bar-user-multilingual-active';
				iconName = 'check-';
			};

			var multilingualBtn;
			if(ENV.ENABLE_MULTILINGUAL) {
				multilingualBtn = R.div({ className, onClick: this.toggleMultilingual },
					renderIcon(iconName + 'square-o'), L('MULTILINGUAL')
				);
			}

			var org;
			if(userData.organizations && Object.keys(userData.organizations).length > 1 && userData.organizations[userData.orgId]) {
				var options = [];

				for(var k in userData.organizations) {
					var name = userData.organizations[k];
					options.push({ value: k, name });
				};

				org = React.createElement(Select, { options, className: "top-bar-user-org-select", isCompact: true, defaultValue: userData.orgId, onChange: this.changeOrg });
			}

			var btn1, btn2;

			const loginURL = User.getLoginURL();

			if(userData.id === 2) {
				btn2 = R.a({ href: loginURL, title: L('LOGIN'), className: 'clickable top-bar-user-btn' },
					renderIcon('sign-in fa-2x')
				)
			} else {
				let imgUrl = idToImgURL(userData.avatar, 'avatar');
				btn1 = R.a({
					onClick: () => {
						window.crudJs.Stage.showForm(NODE_ID.USERS, userData.id, undefined, true, true);
					}, title: L('USER_PROFILE'), className: 'clickable top-bar-user-btn'
				},
					R.img({ className: 'user-avatar', src: imgUrl })
				);
				btn2 = R.a({
					title: L('LOGOUT'), className: 'clickable top-bar-user-btn', onClick: async () => {
						let guestUserSession = await getData('api/logout');
						User.setUserData(guestUserSession);
						document.location.href = loginURL;
					}
				},
					renderIcon('sign-out fa-2x')
				);
			}

			body = R.span(null,
				multilingualBtn,
				org,
				btn1, btn2
			)
		} else {
			body = renderIcon('cog fa-spin');
		}

		return R.div({ className: "top-bar-user-container" },
			body
		)
	}
}
/** @type User */
User.instance = null;
User.currentUserData = null;

export { iAdmin, User };
