import {ENV} from "./main-frame.js";
import {iAdmin} from "./user.js";
import {getData, isLitePage, L, myAlert, myPromt, renderIcon, sp, strip_tags} from "./utils.js";

var currentId = 10;
var debugInfo = [];

export default class DebugPanel extends Component {

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
					myAlert(R.span(renderIcon('thumbs-up'), 'Changes aplied to ',
						R.a({href: ENV.DEPLOY_TO, target: '_blank', onClick: (ev) => {ev.stopPropagation();}},
							ENV.DEPLOY_TO
						),
						R.br(), JSON.stringify(deployData)), true);
				} else {
					myAlert(R.div(null, R.h2(null, L('TESTS_ERROR')), data));
				}
			} else {
				myAlert(R.div(null, R.h2(null, L('TESTS_ERROR')), testResult));
			}
		}
	}

	render() {
		var body;

		var deployBtn;
		var cacheClearBtn;
		let clearBtn = R.a({className: 'clickable admin-controll', onClick: this.clear},
			renderIcon('trash')
		)
		if(iAdmin()) {
			deployBtn = R.a({className: 'clickable admin-controll', title: L('DEPLOY'), onClick: this.deployClick},
				renderIcon('upload')
			);
			cacheClearBtn = R.a({
				className: 'clickable admin-controll', title: L('CLEAR_CACHE'), onClick: (ev) => {
					sp(ev);
					getData('admin/cache_info', {clear: 1, json: 1}).then(() => {location.reload();});
				}
			},
				renderIcon('refresh')
			)
		}

		if(debugInfo.length === 0) {
			body = R.span();
		} else {
			if(this.state.expanded) {

				var items = debugInfo.map((i, iKey) => {

					var entryBody;


					if(i.hasOwnProperty('SQLs')) {
						entryBody = i.SQLs.map((SQL, key) => {
							return R.div({key: key},

								R.div({className: 'debug-panel-header'},
									SQL.SQL
								),
								R.div({className: 'debug-panel-text'}, 'time (ms): ' + (SQL.timeElapsed_ms || -99999).toFixed(4)),
								SQL.stack.map((i, key) => {
									return R.p({key: key, className: 'debug-panel-entry'}, i);
								})
							)
						})
					} else {
						entryBody = '';
					}

					var stackBody;
					if(i.hasOwnProperty('stack')) {
						stackBody = i.stack.map((i, key) => {
							return R.p({key: key, className: 'debug-panel-entry'}, i);
						});
					} else {
						stackBody = '';
					}

					return R.div({className: "debug-panel-item", key: i.id},
						R.span({className: "debug-panel-request-header"}, i.request + ': '),

						R.b({className: "debug-panel-message"}, R.div({dangerouslySetInnerHTML: {__html: strip_tags(i.message)}})),
						R.div({className: "debug-panel-time"}, 'time elapsed (ms): ' + (i.timeElapsed_ms || -9999).toFixed(4)),
						stackBody,
						R.hr(),
						entryBody
					)
				});

				body = R.div({className: "admin-controll"},
					R.div({className: "debug-panel-background", onClick: this.hide}),
					R.div({className: "debug-panel-panel"},
						R.a({className: 'clickable admin-controll', title: L('CLEAR_DEBUG'), onClick: this.clear},
							renderIcon('trash')
						),
						R.div({className: "debug-panel-scroll"},
							items
						)
					)
				)
			} else {
				if(isLitePage()) {
					body = R.span();
				} else {
					body = R.div({className: "admin-controll debug-panel-panel"},
						cacheClearBtn,
						deployBtn,
						clearBtn,
						R.br(),
						R.span({className: 'debug-panel-sql-btn admin-controll clickable', onClick: this.show},
							'requests ' + debugInfo.length,
							R.br(),
							'SQL ' + debugInfo.reduce((pc, i) => {
								if(i.hasOwnProperty('SQLs')) {
									pc += i.SQLs.length;
								}
								return pc;
							}, 0)
						)

					);
				}
			}
		}

		return body;

	}
}
/** @type DebugPanel */
DebugPanel.instance = null;
