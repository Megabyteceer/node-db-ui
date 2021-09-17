import React from "react";

import { getData, goToPageByHash, idToImgURL, isAdmin, L, renderIcon } from "./utils";
import { Select } from "./components/select";
import { admin } from "./admin/admin-utils";
import { ENV } from "./main-frame";
import moment from "moment";
import { Component } from "react";
import { R } from "./r";
import { UserSession } from "./bs-utils";

function setUserOrg(orgId) {
	if(User.currentUserData.orgId !== orgId) {
		getData('api/setCurrentOrg', { orgId }).then(() => {
			User.instance.refreshUser();
		});
	}
}

function iAdmin() {
	return User.currentUserData && isAdmin();
}

var isFirstCall = true;

class User extends Component<any, any> {
	static sessionToken: string;
	static instance: User;
	static currentUserData: UserSession;

	componentDidMount() {
		User.instance = this;
		this.refreshUser();
	}

	refreshUser() {
		getData('api/getMe').then((data) => {
			data.lang.code = data.lang.code || 'en';
			moment.locale(data.lang.code);
			import('/locales/' + data.lang.code + '/lang').then(() => {
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

		if(this.state) {

			var iconName = '';
			let className = 'clickable top-bar-user-multilingual'
			if(this.state.hasOwnProperty('langs')) {
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
			if(this.state.organizations && Object.keys(this.state.organizations).length > 1 && this.state.organizations[this.state.orgId]) {
				var options = [];

				for(var k in this.state.organizations) {
					var name = this.state.organizations[k];
					options.push({ value: k, name });
				};

				org = React.createElement(Select, { options, className: "top-bar-user-org-select", isCompact: true, defaultValue: this.state.orgId, onChange: this.changeOrg });
			} else {
				org = this.state.org;
			}

			var btn1, btn2;
			if(this.state.id === 2) {
				btn2 = R.a({ href: 'login', title: L('LOGIN'), className: 'clickable top-bar-user-btn' },
					renderIcon('sign-in fa-2x')
				)
			} else {
				let imgUrl = idToImgURL(this.state.avatar, 'avatar');
				// TODO go to edit in showForm modal level
				btn1 = R.a({
					onClick: () => {
						window.crudJs.Stage.showForm(5, this.state.id, undefined, true, true);
					}, title: L('USER_PROFILE'), className: 'clickable top-bar-user-btn'
				},
					R.img({ className: 'user-avatar', src: imgUrl })
				);
				btn2 = R.a({ href: 'login', title: L('LOGOUT'), className: 'clickable top-bar-user-btn' },
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

/// #if DEBUG
User.sessionToken = "dev-admin-session-token";
/// #endif

export { iAdmin, User };
