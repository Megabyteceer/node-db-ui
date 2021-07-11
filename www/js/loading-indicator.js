

import {isLitePage, renderIcon} from "./utils.js";


var style = {
	pointerEvents:'none',
	position:'fixed',
	top:'-2px',
	right:0,
	left:0,
	zIndex:15
};

export default class LoadingIndicator extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {showCount:0};
		LoadingIndicator.instance = this;
	}

	hide() {
		this.setState({showCount:Math.max(0, this.state.showCount-1)});
	}

	show(){
		
		if (isLitePage()) return;
		this.state.showCount++;
		if(this.state.showCount === 1){
			this.forceUpdate();
		}
	}

	render() {
		var height = (this.state.showCount > 0)?'40px':0;
		
		return ReactDOM.div({style:style},
			ReactDOM.div({style:{margin:'auto', border:'2px solid #fff', borderTop:0,  height:height, width:'90px', transition:'0.3s', overflow:'hidden', background:'#999', borderBottomLeftRadius:'4px', borderBottomRightRadius:'4px'}},
				ReactDOM.div({style:{position:'absolute', width:'90px' ,textAlign:'center',color:'#fff', fontSize:'170%', marginBottom:'9px',  bottom:0}},
					renderIcon('cog fa-spin')
				)
			)
		);
	}
}