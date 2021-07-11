import DebugPanel from "./debug-panel.js";
import LeftBar from "./left-bar.js";
import LoadingIndicator from "./loading-indicator.js";
import Modal from "./modal.js";
import Notify from "./notify.js";
import {Stage} from "./stage.js";
import TopBar from "./top-bar.js";

var style = {
	width:'100%'
}

var subStyle= {
	//minHeight:'600px',
	background:'#fff'
}

var footerStyle={
	color:'#ccc',
	padding:'50px',
	fontSize:'80%',
	textAlign:'center'
	//,marginBottom:500
}

class MainFrame extends React.Component {
	render() {
		var debug = React.createElement(DebugPanel);
		return ReactDOM.div({style:style},
			React.createElement(TopBar),
			ReactDOM.div({style:subStyle},
				ReactDOM.table({style:{width:'100%'}},
					ReactDOM.tbody(null,
						ReactDOM.tr(null,
							React.createElement(LeftBar),
							ReactDOM.td({style:{verticalAlign:'top'}},
								React.createElement(Stage)
							)
						)
					)
				)
			),
			ReactDOM.div({style:footerStyle}, appTitle),
			React.createElement(Modal),
			React.createElement(Notify),
			debug,
			React.createElement(LoadingIndicator)
			
		);
	}
}

export default MainFrame;
