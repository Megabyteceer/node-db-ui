import React, { Component } from 'react';
import type { NodeDesc, RecordData } from '../bs-utils';
import { NODE_TYPE, PRIVILEGES_MASK } from '../bs-utils';
import { BaseForm } from '../forms/base-form';
import { R } from '../r';
import { FormLoaderCog } from '../stage';
import { iAdmin } from '../user';
import { getData, getNode, L, renderIcon, showPrompt, submitData } from '../utils';
import { NodeAdmin } from './admin-control';

/// #if DEBUG
/*
/// #endif
throw new Error("admin-role-privileges-form imported in release build.");
//*/

function check() {
	return R.span(
		{
			className: 'admin-role-privileges-check',
		},
		renderIcon('check')
	);
}

class PrivilegesEditor extends Component<any, any> {
	render() {
		let body;
		const item = this.props.item;

		const mask = (Math.pow(2, this.props.bitsCount) - 1) * this.props.baseBit;

		let curVal = item.privileges & mask;

		let title;

		if (curVal === 0) {
			body = R.span(
				{
					className: 'admin-role-privileges-disabled',
				},
				renderIcon('ban')
			);
			title = L('ADM_NA');
		} else if (this.props.bitsCount === 1) {
			body = R.span(
				{
					className: 'admin-role-privileges-enabled',
				},
				check()
			);
			title = L('ADM_A');
		} else {
			switch (curVal / this.props.baseBit) {
			case 1:
				body = R.span(
					{
						className: 'admin-role-privileges-enabled',
					},
					check()
				);
				title = L('ADM_A_OWN');
				break;
			case 2:
			case 3:
				body = R.span(
					{
						className: 'admin-role-privileges-enabled',
					},
					R.span(
						{
							className: 'admin-role-privileges-size2',
						},
						check(),
						check()
					)
				);
				title = L('ADM_A_ORG');
				break;
			case 4:
			case 5:
			case 6:
			case 7:
				body = R.span(
					{
						className: 'admin-role-privileges-enabled',
					},
					R.span(
						{
							className: 'admin-role-privileges-size3',
						},
						check(),
						check(),
						check()
					)
				);
				title = L('ADM_A_FULL');
				break;
			default:
				body = 'props: ' + curVal / this.props.baseBit;
				break;
			}
		}

		return R.td(
			{
				className: 'clickable admin-role-privileges-cell',
				title: title,
				onClick: () => {
					curVal *= 2;
					curVal += this.props.baseBit;
					if ((curVal & mask) !== curVal) {
						curVal = 0;
					}
					item.privileges = (item.privileges & (65535 ^ mask)) | curVal;
					this.forceUpdate();
				},
			},
			body
		);
	}
}

class AdminRolePrivilegesForm extends BaseForm {
	initData: RecordData;

	constructor(props) {
		super(props);
		this.saveClick = this.saveClick.bind(this);
	}

	async componentDidMount() {
		const node = await getNode(this.props.recId);

		const data = await getData('admin/nodePrivileges', {
			nodeId: this.props.recId,
		});

		for (const i of data.privileges) {
			if (!i.privileges) {
				i.privileges = 0;
			}
		}

		this.initData = Object.assign({}, data.privileges);
		this.setState({
			node,
			data,
		});
	}

	async saveClick() {
		if (JSON.stringify(this.initData) !== JSON.stringify((this.state.data as NodeDesc).privileges)) {
			const submit = (toChild?: boolean) => {
				//@ts-ignore
				this.state.data.nodeId = this.props.recId;
				//@ts-ignore
				this.state.data.toChild = toChild;
				submitData('admin/nodePrivileges', this.state.data).then(() => {
					this.cancelClick();
				});
			};

			if ((this.state.data as NodeDesc).nodeType === NODE_TYPE.DOCUMENT) {
				submit();
			} else {
				submit(!(await showPrompt(L('APPLY_CHILD'), L('TO_THIS'), L('TO_ALL'), 'check', 'check')));
			}
		} else {
			this.cancelClick();
		}
	}

	render() {
		if (this.state && this.state.data) {
			const data = this.state.data as NodeDesc;
			const node = this.state.node;

			const lines = data.privileges.map((i) => {
				return R.tr(
					{
						key: i.id,
						className: 'admin-role-privileges-line',
					},
					R.td(
						{
							className: 'admin-role-privileges-line-header',
						},
						i.name
					),
					React.createElement(PrivilegesEditor, {
						bitsCount: 3,
						baseBit: PRIVILEGES_MASK.VIEW_OWN,
						item: i,
					}),
					React.createElement(PrivilegesEditor, {
						bitsCount: 1,
						baseBit: PRIVILEGES_MASK.CREATE,
						item: i,
					}),
					React.createElement(PrivilegesEditor, {
						bitsCount: 3,
						baseBit: PRIVILEGES_MASK.EDIT_OWN,
						item: i,
					}),
					React.createElement(PrivilegesEditor, {
						bitsCount: 1,
						baseBit: PRIVILEGES_MASK.DELETE,
						item: i,
					}),
					node.draftable
						? React.createElement(PrivilegesEditor, {
							bitsCount: 1,
							baseBit: PRIVILEGES_MASK.PUBLISH,
							item: i,
						  })
						: undefined
				);
			});

			const body = R.div(
				{
					className: 'admin-role-privileges-block',
				},
				R.h3(
					null,
					R.span(
						{
							className: 'admin-role-privileges-header',
						},
						L('ADM_NODE_ACCESS')
					),
					node.matchName
				),

				R.table(
					{
						className: 'admin-role-privileges-table',
					},
					R.thead(
						{
							className: 'admin-role-privileges-row-header',
						},
						R.tr(
							{
								className: 'admin-role-privileges-line',
							},
							R.th(),
							R.th(null, L('VIEW')),
							R.th(null, L('CREATE')),
							R.th(null, L('EDIT')),
							R.th(null, L('DELETE')),
							node.draftable ? R.th(null, L('PUBLISH')) : undefined
						)
					),
					R.tbody(null, lines)
				)
			);

			const saveButton = R.button(
				{
					className: 'clickable success-button',
					onClick: this.saveClick,
				},
				this.isSubForm() ? renderIcon('check') : renderIcon('floppy-o'),
				this.isSubForm() ? '' : L('SAVE')
			);

			/// #if DEBUG
			let nodeAdmin;
			if (iAdmin()) {
				nodeAdmin = React.createElement(NodeAdmin, {
					form: this,
					x: 320,
					y: -40,
				});
			}
			/// #endif

			const closeButton = R.button(
				{
					className: 'clickable default-button',
					onClick: this.cancelClick,
				},
				renderIcon('times'),
				this.isSubForm() ? '' : L('CANCEL')
			);

			return R.div(
				{ className: 'admin-role-privileges-body' },
				/// #if DEBUG
				nodeAdmin,
				/// #endif
				body,

				R.div(null, saveButton, closeButton)
			);
		} else {
			return React.createElement(FormLoaderCog);
		}
	}
}

export { AdminRolePrivilegesForm };

