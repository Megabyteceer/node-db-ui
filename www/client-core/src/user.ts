import '../../../node_modules/@types/gapi.auth2/index.d.ts';
import '../../../node_modules/@types/gapi/index.d.ts';

import moment from 'moment';

import { Component, h } from 'preact';
import type { RecId, UserSession } from './bs-utils';
import { USER_ID } from './bs-utils';
import { Select, type SelectProps } from './components/select';
import { LITE_UI_PREFIX } from './consts';
import { LoadingIndicator } from './loading-indicator';
import { ENV, MainFrame } from './main-frame';
import { R } from './r';
import { NODE_ID } from './types/generated.js';
import { globals } from './types/globals.js';
import { attachGoogleLoginAPI, getData, getItem, idToImgURL, isAdmin, L, removeItem, renderIcon, setItem } from './utils';

function setUserOrg(orgId: RecId) {
	if (User.currentUserData!.orgId !== orgId) {
		getData('api/setCurrentOrg', { orgId }).then(() => {
			User.refreshUser();
		});
	}
}

function iAdmin() {
	return User.currentUserData && isAdmin();
}

class User extends Component<{}, {}> {

	static instance?: User;
	static currentUserData?: UserSession;
	static additionalUserDataRenderer?: () => preact.Component;

	componentDidMount() {
		User.instance = this;
	}

	static async refreshUser() {
		const data = await getData('api/getMe');
		data.lang.code = data.lang.code || 'en';
		moment.locale(data.lang.code);
		await Promise.all([

			import(`./locales/${data.lang.code}/lang.ts`),
			import(`../../src/locales/${data.lang.code}/lang.ts`)
		]);
		User.setUserData(data);
		if (User.instance) {
			User.instance.forceUpdate();
		}
		return data;
	}

	static setUserData(data: UserSession) {
		User.currentUserData = data;
		setItem('cud-js-session-token', data.sessionToken);

		if (data.id !== USER_ID.GUEST) {
			const gotoAfterLogin = getItem('go-to-after-login');
			removeItem('go-to-after-login');
			if (gotoAfterLogin && (gotoAfterLogin !== location.href)) {
				location.href = gotoAfterLogin;
				return;
			}
		}
		if (MainFrame.instance) {
			MainFrame.instance.reloadOptions();
		}
	}

	changeOrg(value: RecId) {
		setTimeout(() => {
			setUserOrg(value);
			// Stage.showForm(14, undefined, undefined, undefined, true);
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

		let body;

		const userData = User.currentUserData;

		if (userData) {

			let iconName = '';
			let className = 'clickable top-bar-user-multilingual';
			if (userData.hasOwnProperty('langs')) {
				className += ' top-bar-user-multilingual-active';
				iconName = 'check-';
			};

			let multilingualBtn;
			if (ENV.ENABLE_MULTILINGUAL) {
				multilingualBtn = R.span({ key: '1', className, onClick: this.toggleMultilingual },
					renderIcon(iconName + 'square-o'), L('MULTILINGUAL')
				);
			}

			let org;
			if (userData.organizations && Object.keys(userData.organizations).length > 1 && userData.organizations[userData.orgId]) {
				const options = [];

				for (const k in userData.organizations) {
					const name = userData.organizations[k];
					options.push({ value: k, name });
				};

				org = h(Select, { key: '2', options, className: 'top-bar-user-org-select', isCompact: true, defaultValue: userData.orgId, onInput: this.changeOrg } as SelectProps);
			}

			let btn1, btn2;

			const loginURL = User.getLoginURL();

			if (userData.id === USER_ID.GUEST) {
				btn2 = R.a({ key: 'b2', href: loginURL, title: L('LOGIN'), className: 'clickable top-bar-user-btn' },
					renderIcon('sign-in fa-2x')
				);
			} else {
				const imgUrl = idToImgURL(userData.avatar, 'avatar');
				btn1 = R.a({
					key: 'b1',
					onClick: () => {
						globals.Stage.showForm(NODE_ID.USERS, userData.id, undefined, true, true);
					}, title: L('USER_PROFILE'), className: 'clickable top-bar-user-btn'
				},
				R.img({ className: 'user-avatar', src: imgUrl })
				);
				btn2 = R.a({
					key: 'b2',
					title: L('LOGOUT'), className: 'clickable top-bar-user-btn', onClick: async () => {
						LoadingIndicator.instance!.show();
						removeItem('go-to-after-login');
						await attachGoogleLoginAPI();

						if (window.gapi && window.gapi.auth2) {

							const auth2 = window.gapi.auth2.getAuthInstance();
							await auth2.signOut();
						}
						LoadingIndicator.instance!.hide();
						const guestUserSession = await getData('api/logout');
						User.setUserData(guestUserSession);
						document.location.href = loginURL;
					}
				},
				renderIcon('sign-out fa-2x')
				);
			}

			body = [
				multilingualBtn,
				org,
				btn1, btn2
			];
		} else {
			body = renderIcon('cog fa-spin');
		}

		return R.div({ className: 'top-bar-user-container' },
			(User.additionalUserDataRenderer && User.currentUserData) ? User.additionalUserDataRenderer() : undefined,
			body
		);
	}
}

User.instance = undefined;
User.currentUserData = undefined;

export { iAdmin, User };
