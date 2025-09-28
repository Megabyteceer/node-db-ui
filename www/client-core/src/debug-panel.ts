import { Component } from 'preact';
import type { DebugInfo } from '../../../core/mysql-connection';
import { Notify } from './notify';
import { R } from './r';
import { iAdmin } from './user';
import { debugError, getData, isLitePage, L, renderIcon, showPrompt, sp, strip_tags } from './utils';

let currentId = 10;
const debugInfo = [] as DebugInfo[];

/// #if DEBUG
/*
/// #endif
throw new Error("debug-panel imported in release build.");
// */

interface DebugPanelProps {

}

class DebugPanel extends Component<DebugPanelProps, {
	expanded?: boolean;
}> {
	static instance?: DebugPanel;

	constructor(props: DebugPanelProps) {
		super(props);
		this.state = { expanded: false };
		DebugPanel.instance = this;
		this.clear = this.clear.bind(this);
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
	}

	show() {
		if (debugInfo.length > 0) {
			this.setState({ expanded: true });
		}
	}

	hide() {
		this.setState({ expanded: false });
	}

	clear() {
		currentId = 10;
		debugInfo.length = 0;
		this.hide();
	}

	addEntry(entry: DebugInfo | string, expand?: boolean, url?: string) {

		if (typeof (entry) !== 'object') {
			entry = { message: entry + '' };
		}
		if (url) {
			entry.request = url;
		}

		entry.id = currentId++;
		debugInfo.unshift(entry);
		while (debugInfo.length > 100) {
			debugInfo.pop();
		}
		if (expand) {
			this.show();
		}
		this.forceUpdate();
	}

	async dumpDbClick() {
		const ret = await getData('admin/dumpDb');
		if (ret?.error) {
			debugError(ret.error);
			Notify.add('error');
		} else if (ret) {
			Notify.add('dumped');
		} else {
			Notify.add('no changes');
		}
	}

	async recoveryDbClick() {
		await showPrompt('Are you sure? Current database will be lost');
		const ret = await getData('admin/recoveryDb');
		if (ret?.error) {
			debugError(ret.error);
			Notify.add('error');
		} else if (ret) {
			Notify.add('done');
			location.reload();
		}
	}

	async deployClick(ev: MouseEvent) {
		sp(ev);
		alert('TODO');

		/*
		let ret = await getData('admin/getDeployPackage');

		if(await showPrompt(L('DEPLOY_TO', ENV.DEPLOY_TO))) {
			let testResult = await getData('/test');
			if(testResult === 'ok') {
				let deployData = await getData('/deploy/api/deploy', { commitMessage: 'no message' });
				let data = await getData('/test', { remote: true });
				if(data === 'ok') {
					myAlert(R.span(renderIcon('thumbs-up'), 'Changes applied to ',
						R.a({ href: ENV.DEPLOY_TO, target: '_blank', onClick: (ev) => { ev.stopPropagation(); } },
							ENV.DEPLOY_TO
						),
						R.br(), JSON.stringify(deployData)), true);
				} else {
					myAlert(R.div(null, R.h2(null, L('TESTS_ERROR')), data));
				}
			} else {
				myAlert(R.div(null, R.h2(null, L('TESTS_ERROR')), testResult));
			}
		} */
	}

	render() {
		let body;

		let deployBtn;
		let recoveryBtn;
		let dumpBtn;
		const clearBtn = R.a({ className: 'clickable admin-control', onClick: this.clear },
			renderIcon('trash')
		);
		if (iAdmin()) {
			/* deployBtn = R.a({ className: 'clickable admin-control', title: L('DEPLOY'), onClick: this.deployClick },
				renderIcon('upload')
			); */

			dumpBtn = R.a({ className: 'clickable admin-control', title: 'Backup Database', onClick: this.dumpDbClick },
				renderIcon('download')
			);
			recoveryBtn = R.a({ className: 'clickable admin-control', title: 'Recovery Database', onClick: this.recoveryDbClick },
				renderIcon('repeat')
			);
		}

		if (debugInfo.length === 0) {
			body = R.span();
		} else {
			if (this.state.expanded) {

				const items = debugInfo.map((i) => {

					let entryBody;

					if (i.hasOwnProperty('SQLs')) {
						entryBody = i.SQLs?.map((SQL, key) => {
							return R.div({ key: key },

								R.div({ className: 'debug-panel-header' },
									SQL.SQL
								),
								R.div({ className: 'debug-panel-text' }, 'time (ms): ' + (SQL.timeElapsed_ms || -99999).toFixed(4)),
								SQL.stack.map((i, key) => {
									return R.p({ key: key, className: 'debug-panel-entry' }, i);
								})
							);
						});
					} else {
						entryBody = '';
					}

					return R.div({ className: 'debug-panel-item', key: i.id },
						R.span({ className: 'debug-panel-request-header' }, i.request + ': '),

						R.b({ className: 'debug-panel-message' }, R.div({ dangerouslySetInnerHTML: { __html: strip_tags(i.message || '') } })),
						R.div({ className: 'debug-panel-time' }, 'time elapsed (ms): ' + (i.timeElapsed_ms || -9999).toFixed(4)),
						R.hr(),
						entryBody
					);
				});

				body = R.div({ className: 'admin-control' },
					R.div({ className: 'debug-panel-background', onClick: this.hide }),
					R.div({ className: 'debug-panel-panel' },
						R.a({ className: 'clickable admin-control', title: L('CLEAR_DEBUG'), onClick: this.clear },
							renderIcon('trash')
						),
						R.div({ className: 'debug-panel-scroll' },
							items
						)
					)
				);
			} else {
				if (isLitePage()) {
					body = R.span();
				} else {
					body = R.div({ className: 'admin-control debug-panel-panel' },
						deployBtn,
						dumpBtn,
						recoveryBtn,
						clearBtn,
						R.br(),
						R.span({ className: 'debug-panel-sql-btn admin-control clickable', onClick: this.show },
							'requests ' + debugInfo.length,
							R.br(),
							'SQL ' + debugInfo.reduce((pc, i) => {
								if (i.hasOwnProperty('SQLs')) {
									pc += i.SQLs!.length;
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

DebugPanel.instance = undefined;

export { DebugPanel };
