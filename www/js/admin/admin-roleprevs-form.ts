import { PRIVILEGES_CREATE, PRIVILEGES_DELETE, PRIVILEGES_EDIT_OWN, PRIVILEGES_PUBLISH, PRIVILEGES_VIEW_OWN, RecordData } from "../bs-utils";
import { R } from "../r";
import React, { Component } from "react";
import { BaseForm } from "../forms/base-form";
import { FormLoaderCog } from "../stage";
import { iAdmin } from "../user";
import { getData, getNode, L, myPromt, renderIcon, submitData } from "../utils";
import { NodeAdmin } from "./node-admin";

function check() {
	return R.span({
		className: "admin-role-privileges-check"
	}, renderIcon('check'));
}

class PrevsEditor extends Component<any, any> {
	render() {
		var body;
		var item = this.props.item;

		var mask = (Math.pow(2, this.props.bitsCount) - 1) * this.props.baseBit;

		var curVal = (item.privileges & mask);

		var title;

		if(curVal === 0) {
			body = R.span({
				className: "admin-role-privileges-disabled"
			}, renderIcon('ban'));
			title = L('ADM_NA');
		} else if(this.props.bitsCount === 1) {
			body = R.span({
				className: "admin-role-privileges-enabled"
			}, check());
			title = L('ADM_A');
		} else {
			switch(curVal / this.props.baseBit) {
				case 1:
					body = R.span({
						className: "admin-role-privileges-enabled"
					}, check());
					title = L('ADM_A_OWN');
					break;
				case 2:
				case 3:
					body = R.span({
						className: "admin-role-privileges-enabled"
					}, R.span({
						className: "admin-role-privileges-size2"
					}, check(), check()));
					title = L('ADM_A_ORG');
					break;
				case 4:
				case 5:
				case 6:
				case 7:
					body = R.span({
						className: "admin-role-privileges-enabled"
					}, R.span({
						className: "admin-role-privileges-size3"
					}, check(), check(), check()));
					title = L('ADM_A_FULL');
					break;
				default:
					body = 'props: ' + (curVal / this.props.baseBit);
					break;
			}
		}

		return R.td({
			className: 'clickable admin-role-privileges-cell',
			title: title,
			onClick: () => {
				curVal *= 2;
				curVal += this.props.baseBit;
				if((curVal & mask) !== curVal) {
					curVal = 0;
				}
				item.privileges = ((item.privileges & (65535 ^ mask)) | curVal);
				this.forceUpdate();
			}
		},
			body
		)

	}
}

class AdminRoleprevsForm extends BaseForm {

	initData: RecordData;

	constructor(props) {
		super(props);
		this.saveClick = this.saveClick.bind(this);
	}

	async componentDidMount() {
		let node = await getNode(this.props.recId);

		let data = await getData('admin/nodePrevs', {
			nodeId: this.props.recId
		});

		for(let i of data.privileges) {
			if(!i.privileges) {
				i.privileges = 0;
			}
		}

		this.initData = Object.assign({}, data.privileges);
		this.setState({
			node,
			data
		});
	}

	async saveClick() {
		if(JSON.stringify(this.initData) !== JSON.stringify(this.state.data.privileges)) {
			var submit = (toChild?: boolean) => {
				this.state.data.nodeId = this.props.recId;
				this.state.data.toChild = toChild;
				submitData('admin/nodePrevs', this.state.data).then(() => {
					this.cancelClick();
				});
			};

			if(this.state.data.isDocument) {
				submit();
			} else {
				submit(!await myPromt(L('APPLY_CHILD'), L('TO_THIS'), L('TO_ALL'), 'check', 'check'));
			}
		} else {
			this.cancelClick();
		}
	}

	render() {
		if(this.state && this.state.data) {

			var data = this.state.data;
			var node = this.state.node;

			var lines = data.privileges.map((i) => {
				return R.tr({
					key: i.id,
					className: "admin-role-privileges-line"
				},
					R.td({
						className: "admin-role-privileges-line-header"
					}, i.name),
					React.createElement(PrevsEditor, {
						bitsCount: 3,
						baseBit: PRIVILEGES_VIEW_OWN,
						item: i
					}),
					React.createElement(PrevsEditor, {
						bitsCount: 1,
						baseBit: PRIVILEGES_CREATE,
						item: i
					}),
					React.createElement(PrevsEditor, {
						bitsCount: 3,
						baseBit: PRIVILEGES_EDIT_OWN,
						item: i
					}),
					React.createElement(PrevsEditor, {
						bitsCount: 1,
						baseBit: PRIVILEGES_DELETE,
						item: i
					}),
					node.draftable ? React.createElement(PrevsEditor, {
						bitsCount: 1,
						baseBit: PRIVILEGES_PUBLISH,
						item: i
					}) : undefined
				)
			});

			var body = R.div({
				className: "admin-role-privileges-block"
			},
				R.h3(null,
					R.span({
						className: "admin-role-privileges-header"
					}, L('ADM_NODE_ACCESS')),
					node.matchName
				),

				R.table({
					className: "admin-role-privileges-table"
				},
					R.thead({
						className: "admin-role-privileges-row-header"
					},
						R.tr({
							className: "admin-role-privileges-line"
						},
							R.th(),
							R.th(null, L('VIEW')),
							R.th(null, L('CREATE')),
							R.th(null, L('EDIT')),
							R.th(null, L('DELETE')),
							node.draftable ? R.th(null, L('PUBLISH')) : undefined
						)
					),
					R.tbody(null,
						lines
					)
				)
			);

			var saveButton = R.button({
				className: 'clickable success-button',
				onClick: this.saveClick
			}, this.isSubForm() ? renderIcon('check') : renderIcon('floppy-o'), this.isSubForm() ? '' : L('SAVE'));

			var nodeAdmin;
			if(iAdmin()) {
				nodeAdmin = React.createElement(NodeAdmin, {
					form: this,
					x: 320,
					y: -40
				});
			}

			var closeButton = R.button({
				className: 'clickable default-button',
				onClick: this.cancelClick
			}, renderIcon('times'), this.isSubForm() ? '' : L('CANCEL'));

			return R.div({ className: "admin-role-privileges-body" },
				nodeAdmin,
				body,

				R.div(null,
					saveButton,
					closeButton
				)
			)
		} else {
			return React.createElement(FormLoaderCog);
		}
	}
}

export { AdminRoleprevsForm };