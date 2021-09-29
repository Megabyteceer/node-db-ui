import { R } from "../r";
import { renderItemsButtons } from "../forms/form-list-item";
import { idToImgURL, registerListRenderer, renderIcon } from "../utils";
import { List } from "../forms/list";


registerListRenderer(5, function (this: List) {

	var node = this.state.node;
	var data = this.state.data;

	return data.items.map((item) => {

		var imgUrl = idToImgURL(item.avatar, 'avatar');
		var phone;
		if(item.phone) {
			phone = R.div({ className: 'user-item-info' }, renderIcon('phone'), ' ' + item.public_phone)
		}
		var email;
		if(item.email) {
			email = R.div({ className: 'user-item-info' }, renderIcon('envelope'), ' ',
				R.a({ href: 'mailto:' + item.public_email },
					item.email
				)
			)
		}

		return R.div({ key: item.id, className: 'user-item user-item-id-' + item.id },
			R.img({ src: imgUrl, className: 'user-item-image' }),
			R.div({ className: 'user-item-block' },
				R.h5(null, item.name),
				R.div({ className: 'user-item-text' }, item.company)
			),
			R.div({ className: 'user-item-block user-item-block-small' },
				phone,
				email
			),
			R.div({ className: 'user-item-controls' },
				renderItemsButtons(node, item, this.refreshData)
			)
		);
	});

});

