import {idToImgURL, renderIcon} from "../utils.js";

(() => {

	var style = {
		position: 'relative',
		border: '1px solid #ccc',
		borderRadius: 4,
		marginBottom: 18,
		marginLeft: 10,
		padding: 10
	}

	var textStyle = {
		fontSize: '90%',
		color: '#999',
		marginTop: 10
	}
	var infoStyle = {
		fontSize: '90%',
		color: '#47f',
		marginTop: 10
	}


	registerListRenderer(5, () => {

		var node = this.state.node;
		var data = this.state.data;

		return data.items.map((item) => {

			var imgUrl = idToImgURL(item.avatar, 'avatar');
			var phone;
			if(item.phone) {
				phone = R.div({style: infoStyle}, renderIcon('phone'), ' ' + item.public_phone)
			}
			var email;
			if(item.email) {
				email = R.div({style: infoStyle}, renderIcon('envelope'), ' ',
					R.a({href: 'mailto:' + item.public_email},
						item.email
					)
				)
			}

			return R.div({key: item.id, style: style},
				R.img({src: imgUrl, style: {height: 80, width: 'auto', borderRadius: '50%'}}),
				R.div({style: {display: 'inline-block', verticalAlign: 'middle', marginLeft: 20, width: '40%'}},
					R.h5(null, item.name),
					R.div({style: textStyle}, item.company)
				),
				R.div({style: {display: 'inline-block', verticalAlign: 'bottom', marginLeft: 20, width: '27%'}},
					phone,
					email
				),
				R.div({style: {position: 'absolute', top: 10, right: 10}},
					renderItemsButtons(node, item, this.refreshData)
				)
			);
		});

	});

})();
