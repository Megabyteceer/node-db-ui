import React from "react";

import { getData, getItem, goToPageByHash, idToImgURL, isAdmin, L, renderIcon, setItem } from "./utils";
import { Select } from "./components/select";
import { ENV, MainFrame } from "./main-frame";
import moment from "moment";
import { Component } from "react";
import { R } from "./r";
import { NODE_ID_LOGIN, UserSession } from "./bs-utils";
import { Stage } from "./stage";

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

let isFirstCall = true;

class User extends Component<any, any> {
	static sessionToken: string;
	static instance: User;
	static currentUserData: UserSession;

	componentDidMount() {
		User.instance = this;
	}

	static refreshUser() {
		getData('api/getMe').then((data) => {
			data.lang.code = data.lang.code || 'en';
			moment.locale(data.lang.code);
			import('/locales/' + data.lang.code + '/lang').then(() => {
				if(User.instance) {
					User.instance.forceUpdate();
				}
				User.setUserData(data);
				MainFrame.instance.reloadOptions();
			})
		});
	}

	static setUserData(data: UserSession) {
		User.currentUserData = data;
		User.sessionToken = data.sessionToken;
		setItem('cud-js-session-token', User.sessionToken);
		MainFrame.instance.reloadOptions();
		if(isFirstCall) {
			isFirstCall = false;
			goToPageByHash();
		}

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

			const loginURL = '#n/' + NODE_ID_LOGIN + '/r/new/e';

			if(userData.id === 2) {
				btn2 = R.a({ href: loginURL, title: L('LOGIN'), className: 'clickable top-bar-user-btn' },
					renderIcon('sign-in fa-2x')
				)
			} else {
				let imgUrl = idToImgURL(userData.avatar, 'avatar');
				// TODO go to edit in showForm modal level
				btn1 = R.a({
					onClick: () => {
						window.crudJs.Stage.showForm(5, userData.id, undefined, true);
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
User.sessionToken = getItem('cud-js-session-token');

export { iAdmin, User };
