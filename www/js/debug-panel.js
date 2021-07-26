import {ENV} from "./main-frame.js";
import {iAdmin} from "./user.js";
import {getData, isLitePage, L, myAlert, myPromt, renderIcon, sp, strip_tags} from "./utils.js";

var adminPanelStyle = {
	position: 'fixed',
	top: '130px',
	right: 0,
	background: '#a44',
	border: '2px solid #fff',
	borderTopLeftRadius: '10px',
	borderBottomLeftRadius: '10px',
	borderRight: 0,
	padding: '10px',
	color: '#fff',
	zIndex: 15,
	fontSize: '75%',
	maxWidth: '70vw'
}

var itemStyle = {

	background: '#ffd',
	margin: '8px',
	color: '#887',
	padding: '14px',
	borderRadius: '6px'

}

var backdropStyle = {
	cursor: 'pointer',
	background: 'rgba(0,0,0,0.6)',
	position: 'fixed',
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	zIndex: 14
}

var currentId = 10;
var debugInfo = [];

class NotImplemented extends React.Component {
	render() {
		return ReactDOM.span({style: {color: '#c30', marginTop: '8px'}}, L('NOT_IMPLEMENTED'));
	}
}

export default class DebugPanel extends React.Component {

	constructor(props) {
		super(props);
		this.state = {expanded: false};
		DebugPanel.instance = this;
		this.clear = this.clear.bind(this);
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
	}

	show() {
		if(debugInfo.length > 0) {
			this.setState({expanded: true});
		}
	}

	hide() {
		this.setState({expanded: false});
	}

	clear() {
		currentId = 10;
		debugInfo.length = 0;
		this.hide();
	}

	addEntry(entry, expand, url) {

		if(typeof (entry) === 'string') {
			entry = {message: entry}
		}
		if(url) {
			entry.request = url;
		}

		entry.id = currentId++;
		debugInfo.unshift(entry);
		while(debugInfo.length > 100) {
			debugInfo.pop();
		}
		if(expand) {
			this.show();
		}
		this.forceUpdate();
	}

	async deployClick(ev) {
		sp(ev);
		if(await myPromt(L('DEPLOY_TO', ENV.DEPLOY_TO))) {
			let testResult = await getData('test_uyas87dq8qwdqw/test');
			if(testResult === 'ok') {
				let deployData = await getData('/deploy/api/deploy', {commitmessage: 'no message'});
				let data = await getData('test_uyas87dq8qwdqw/test', {remote: true});
				if(data === 'ok') {
					myAlert(ReactDOM.span(renderIcon('thumbs-up'), 'Changes aplied to ',
						ReactDOM.a({href: ENV.DEPLOY_TO, target: '_blank', onClick: (ev) => {ev.stopPropagation();}},
							ENV.DEPLOY_TO
						),
						ReactDOM.br(), JSON.stringify(deployData)), true);
				}
			} else {
				myAlert(ReactDOM.div(null, ReactDOM.h2(null, L('TESTS_ERROR')), data));
			}
		}
	}

	render() {
		var body;

		var deployBtn;
		var cacheClearBtn;
		if(iAdmin()) {
			deployBtn = ReactDOM.a({className: 'clickable admin-controll', title: L('DEPLOY'), onClick: this.deployClick, style: {float: 'right'}},
				renderIcon('upload')
			);
			cacheClearBtn = ReactDOM.a({
				className: 'clickable admin-controll', title: L('CLEAR_CACHE'), onClick: (ev) => {
					sp(ev);
					getData('admin/cache_info', {clear: 1, json: 1}).then(() => {location.reload();});
				}, style: {float: 'right'}
			},
				renderIcon('refresh')
			)
		}

		if(debugInfo.length === 0) {
			body = ReactDOM.span();
		} else {
			if(this.state.expanded) {

				var items = debugInfo.map((i, iKey) => {

					var entryBody;


					if(i.hasOwnProperty('SQLs')) {

						entryBody = i.SQLs.map((SQL, key) => {

							return ReactDOM.div({key: key},

								ReactDOM.div({style: {fontSize: '140%', margin: '6px'}},
									ReactDOM.a({
										className: 'clickable', onClick: () => {
											i.SQLs.splice(key, 1);
											this.forceUpdate();

										}
									}, renderIcon('trash')),

									SQL.SQL
								),
								ReactDOM.div({style: {fontWeight: 'bold', color: (SQL.timeElapsed_ms > 14) ? '#550' : '#070'}}, 'time (ms): ' + (SQL.timeElapsed_ms || -99999).toFixed(4)),
								SQL.stack.map((i, key) => {
									return ReactDOM.p({key: key, style: {marginLeft: '40px'}}, i);
								})


							)

						})

					} else {
						entryBody = '';
					}

					var stackBody;
					if(i.hasOwnProperty('stack')) {
						stackBody = i.stack.map((i, key) => {
							return ReactDOM.p({key: key, style: {marginLeft: '40px'}}, i);
						});
					} else {
						stackBody = '';
					}

					return ReactDOM.div({style: itemStyle, key: i.id},

						ReactDOM.a({
							className: 'clickable', onClick: () => {
								debugInfo.splice(iKey, 1);
								this.forceUpdate();
							}
						}, renderIcon('trash')),
						ReactDOM.span({style: {fontSize: '160%', color: '#445'}}, i.request + ': '),

						ReactDOM.b({style: {fontSize: '160%', color: '#a00'}}, ReactDOM.div({dangerouslySetInnerHTML: {__html: strip_tags(i.message)}})),
						ReactDOM.div({style: {fontSize: '140%', color: '#040'}}, 'time elapsed (ms): ' + (i.timeElapsed_ms || -9999).toFixed(4)),
						stackBody,
						ReactDOM.hr(),
						entryBody
					)

				});

				body = ReactDOM.div(null,

					ReactDOM.div({style: backdropStyle, onClick: this.hide}),

					ReactDOM.div({style: adminPanelStyle},


						ReactDOM.a({className: 'clickable admin-controll', title: L('CLEAR_DEBUG'), onClick: this.clear, style: {float: 'right'}},
							renderIcon('trash')
						),



						ReactDOM.div({style: {overflowY: 'auto', maxHeight: '90vh'}},
							items
						)

					)
				)

			} else {
				if(isLitePage()) {
					body = ReactDOM.span();
				} else {
					body = ReactDOM.div({style: adminPanelStyle, className: 'clickable admin-controll', onClick: this.show},
						ReactDOM.a({className: 'clickable', onClick: this.clear, style: {float: 'right'}},
							renderIcon('trash')
						),
						deployBtn,
						cacheClearBtn,
						ReactDOM.br(),
						'requests ' + debugInfo.length,
						ReactDOM.br(),
						'SQL ' + debugInfo.reduce((pc, i) => {
							if(i.hasOwnProperty('SQLs')) {
								pc += i.SQLs.length;
							}
							return pc;
						}, 0)

					);
				}
			}
		}

		return body;

	}
}
