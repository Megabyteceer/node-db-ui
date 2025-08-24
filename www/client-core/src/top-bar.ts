import React, { Component } from 'react';
import { R } from "./r";
import { User } from "./user";

class TopBar extends Component<any, any> {
	render() {
		return R.div({ className: 'top-bar' },
			R.a({
				className: 'clickable top-bar-logo',
				href: '/'
			},
				R.img({ src: 'images/logo.png' })),
			//search,
			R.div({ className: "top-bar-right-area" },
				React.createElement(User)
			)
		);
	}
}

export { TopBar };

