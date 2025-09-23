import { Component, h } from 'preact';
import type { NodePrivileges, NodePrivilegesRequest, NodePrivilegesRes } from '../../../../core/admin/admin';
import { NODE_TYPE } from '../../../../types/generated';
import { PRIVILEGES_MASK } from '../bs-utils';
import Form, { type FormProps, type FormState } from '../form';
import { R } from '../r';
import { FormLoaderCog } from '../stage';
import { iAdmin } from '../user';
import { getData, getNodeIfPresentOnClient, L, renderIcon, showPrompt, submitData } from '../utils';
import { NodeAdmin } from './admin-control';

/// #if DEBUG
/*
/// #endif
throw new Error("admin-role-privileges-form imported in release build.");
// */

function check() {
	return R.span(
		{
			className: 'admin-role-privileges-check'
		},
		renderIcon('check')
	);
}

interface IHavePrivileges {
	privileges: PRIVILEGES_MASK;
}

interface PrivilegesEditorProps {
	bitsCount: 1 | 3;
	baseBit: number;
	item: IHavePrivileges;
}

class PrivilegesEditor extends Component<PrivilegesEditorProps> {
	render() {
		let body;
		const item = this.props.item;

		const mask = (Math.pow(2, this.props.bitsCount) - 1) * this.props.baseBit;

		let curVal = item.privileges & mask;

		let title;

		if (curVal === 0) {
			body = R.span(
				{
					className: 'admin-role-privileges-disabled'
				},
				renderIcon('ban')
			);
			title = L('ADM_NA');
		} else if (this.props.bitsCount === 1) {
			body = R.span(
				{
					className: 'admin-role-privileges-enabled'
				},
				check()
			);
			title = L('ADM_A');
		} else {
			switch (curVal / this.props.baseBit) {
			case 1:
				body = R.span(
					{
						className: 'admin-role-privileges-enabled'
					},
					check()
				);
				title = L('ADM_A_OWN');
				break;
			case 2:
			case 3:
				body = R.span(
					{
						className: 'admin-role-privileges-enabled'
					},
					R.span(
						{
							className: 'admin-role-privileges-size2'
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
						className: 'admin-role-privileges-enabled'
					},
					R.span(
						{
							className: 'admin-role-privileges-size3'
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
				}
			},
			body
		);
	}
}

interface AdminRolePrivilegesFormProps extends FormProps {
	privilegesData: NodePrivilegesRes;
}

interface AdminRolePrivilegesFormState extends FormState {
	privilegesData: NodePrivilegesRes;
}

class AdminRolePrivilegesForm extends Form<string, AdminRolePrivilegesFormProps, AdminRolePrivilegesFormState> {
	initData!: NodePrivileges[];

	constructor(props: FormProps) {
		super(props);
		this.savePrivilegesClick = this.savePrivilegesClick.bind(this);
	}

	async componentDidMount() {

		const privilegesData: NodePrivilegesRes = await getData('admin/nodePrivileges', {
			nodeId: this.nodeId
		});

		for (const i of privilegesData.privileges) {
			if (!i.privileges) {
				i.privileges = PRIVILEGES_MASK.NONE;
			}
		}

		this.initData = privilegesData.privileges;
		this.setState({
			privilegesData
		});
	}

	async savePrivilegesClick() {
		if (JSON.stringify(this.initData) !== JSON.stringify(this.state.privilegesData.privileges)) {
			const submit = (toChild?: boolean) => {
				const data = {} as NodePrivilegesRequest;

				data.nodeId = this.nodeId;
				data.toChild = toChild;
				data.privileges = this.state.privilegesData.privileges;

				submitData('admin/nodePrivileges', data).then(() => {
					this.cancelClick();
				});
			};

			if (getNodeIfPresentOnClient(this.props.nodeId)!.nodeType === NODE_TYPE.DOCUMENT) {
				submit();
			} else {
				submit(!(await showPrompt(L('APPLY_CHILD'), L('TO_THIS'), L('TO_ALL'), 'check', 'check')));
			}
		} else {
			this.cancelClick();
		}
	}

	render() {
		if (this.state && this.state.privilegesData) {
			const data = this.state.privilegesData;
			const node = getNodeIfPresentOnClient(this.props.nodeId)!;

			const lines = data.privileges.map((i) => { // TODO: data type is from admin/nodePrivileges url
				return R.tr(
					{
						key: i.id,
						className: 'admin-role-privileges-line'
					},
					R.td(
						{
							className: 'admin-role-privileges-line-header'
						},
						i.name
					),
					h(PrivilegesEditor, {
						bitsCount: 3,
						baseBit: PRIVILEGES_MASK.VIEW_OWN,
						item: i
					}),
					h(PrivilegesEditor, {
						bitsCount: 1,
						baseBit: PRIVILEGES_MASK.CREATE,
						item: i
					}),
					h(PrivilegesEditor, {
						bitsCount: 3,
						baseBit: PRIVILEGES_MASK.EDIT_OWN,
						item: i
					}),
					h(PrivilegesEditor, {
						bitsCount: 1,
						baseBit: PRIVILEGES_MASK.DELETE,
						item: i
					}),
					node.draftable
						? h(PrivilegesEditor, {
							bitsCount: 1,
							baseBit: PRIVILEGES_MASK.PUBLISH,
							item: i
						})
						: undefined
				);
			});

			const body = R.div(
				{
					className: 'admin-role-privileges-block'
				},
				R.h3(
					null,
					R.span(
						{
							className: 'admin-role-privileges-header'
						},
						L('ADM_NODE_ACCESS')
					),
					node.matchName
				),

				R.table(
					{
						className: 'admin-role-privileges-table'
					},
					R.thead(
						{
							className: 'admin-role-privileges-row-header'
						},
						R.tr(
							{
								className: 'admin-role-privileges-line'
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
					onClick: this.savePrivilegesClick
				},
				this.props.isCompact ? renderIcon('check') : renderIcon('floppy-o'),
				this.props.isCompact ? '' : L('SAVE')
			);

			/// #if DEBUG
			let nodeAdmin;
			if (iAdmin()) {
				nodeAdmin = h(NodeAdmin, {
					form: this
				});
			}
			/// #endif

			const closeButton = R.button(
				{
					className: 'clickable default-button',
					onClick: this.cancelClick
				},
				renderIcon('times'),
				this.props.isCompact ? '' : L('CANCEL')
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
			return h(FormLoaderCog, null);
		}
	}
}

export { AdminRolePrivilegesForm };
