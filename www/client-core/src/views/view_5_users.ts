import { NODE_ID } from "../bs-utils";
import { renderItemsButtons } from "../forms/form-list-item";
import type { List } from "../forms/list";
import { R } from "../r";
import { idToImgURL, registerListRenderer, renderIcon } from "../utils";
import "./view_5_users.css";

const RENDERED_FIELDS = {
	avatar: true,
	name: true,
	company: true,
	email: true,
	creator_org: true,
	creator_user: true,
};

registerListRenderer(NODE_ID.USERS, function (this: List): React.ReactNode {

	const node = this.state.node;
	const data = this.state.data;

	return data.items.map((item) => {

		const imgUrl = idToImgURL(item.avatar, 'avatar');
		let phone;
		if(item.phone) {
			phone = R.div({ className: 'user-item-info' }, renderIcon('phone'), ' ' + item.public_phone)
		}
		let email;
		if(item.email) {
			email = R.div({ className: 'user-item-info' }, renderIcon('envelope'), ' ',
				R.a({ href: 'mailto:' + item.email },
					item.email
				)
			)
		}
		const additionalFields = [];
		const keys = Object.keys(item);
		for(const key of keys) {
			if(key.length > 3 && !RENDERED_FIELDS[key] && item[key]) {
				additionalFields.push(R.div({ key, className: 'user-item-info user-item-info-' + key },
					node.fieldsByName[key].name, ': ', item[key]
				));
			}
		}

		return R.div({ key: item.id, className: 'user-item user-item-id-' + item.id },
			R.img({ src: imgUrl, className: 'user-item-image' }),
			R.div({ className: 'user-item-block' },
				R.h5(null, item.name),
				R.div({ className: 'user-item-text' }, item.company)
			),
			R.div({ className: 'user-item-block user-item-block-small' },
				phone,
				email,
				additionalFields
			),
			R.div({ className: 'user-item-controls' },
				renderItemsButtons(node, item, this.refreshData)
			)
		);
	});

});


