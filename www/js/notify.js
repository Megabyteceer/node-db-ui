var instance;

var style = {
	position:'fixed',
	right:0,
	bottom:30,
	width:350,
	zIndex:12
}



var blockStyle = {
	background:'#765',
	border:'1px solid #a98',
	color:'#fed',
	borderRadius:5,
	padding:12,
	margin: 3,
	cursor:'pointer'
}

var stack = [];
var idCounter = 0;

export default class Notify extends React.Component {
	componentDidMount(){
		instance = this;
	}

	static add(content) {
		instance.add(content);
	}

	add(content) {
		var id = idCounter++;
		if (content) {
			stack.push({content:content, id:id});
		}
		setTimeout(() => {
			this.hideById(id);
		}.bind(this), 10000);
		this.forceUpdate();
	}

	hideById(id) {
		stack = stack.filter((i) => {
			return i.id !== id;
		});
		this.forceUpdate();
	}

	render() {
		if (stack.length > 0) {
			return ReactDOM.div({style:style},
				stack.map((m) => {
					return ReactDOM.div({key:m.id, style:blockStyle, className:'fade-in', onClick:() => {
								this.hideById(m.id);
							}},
							m.content.split('\n').map((l,i) => {
								return ReactDOM.div({key:i}, l)
							})
					);
				})
			);
		} else {
			return ReactDOM.span();
		}
	}
}
