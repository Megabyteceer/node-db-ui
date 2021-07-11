import {renderIcon} from "../utils.js";

(function() {
	
	var style = {
		position:'relative',
		border:'1px solid #ccc',
		borderRadius:4,
		marginBottom:18,
		marginLeft:10,
		padding:10
	}
	
	var textStyle = {
		fontSize:'90%',
		color:'#999',
		marginTop: 10
	}
	var infoStyle = {
		fontSize:'90%',
		color:'#47f',
		marginTop: 10
	}
	
	
	registerListRenderer(5, function(){
		
		var node = this.state.node;
		var data = this.state.data;
		var filters = this.filters;
		
		return data.items.map(function(item){
			
			var imgUrl = idToImgURL(item.avatar, 'avatar');
			var phone;
			if(item.phone){
				phone = ReactDOM.div({style:infoStyle},renderIcon('phone'), ' '+item.public_phone)
			}
			var email;
			if(item.email){
				email = ReactDOM.div({style:infoStyle},renderIcon('envelope'), ' ',
					ReactDOM.a({href:'mailto:'+item.public_email},
						item.email
					)
				)
			}
			
			return ReactDOM.div({key:item.id, style:style},
				ReactDOM.img({src:imgUrl, style:{height:80, width:'auto', borderRadius: '50%'}}),
				ReactDOM.div({style:{display:'inline-block', verticalAlign:'middle', marginLeft:20, width:'40%'}},
					ReactDOM.h5(null, item.name),
					ReactDOM.div({style:textStyle},item.company)
				),
				ReactDOM.div({style:{display:'inline-block', verticalAlign:'bottom', marginLeft:20, width:'27%'}},
					phone,
					email
				),
				ReactDOM.div({style:{position:'absolute', top:10, right:10}},
					renderItemsButtons(node, item, this.refreshData)
				)
			);
		}.bind(this));
		
	});

})();
	