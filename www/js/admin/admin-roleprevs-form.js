import BaseForm from "../forms/form-mixins.js";
import {FormLoaderCog} from "../stage.js";
import {iAdmin} from "../user.js";
import {getData, getNode, L, myPromt, renderIcon, submitData} from "../utils.js";
import NodeAdmin from "./node-admin.js";

function check() {
	return ReactDOM.span({
		className: "admin-role-prevs-check"
	}, renderIcon('check'));
}

class PrevsEditor extends React.Component {
	render() {
		var body;
		var item = this.props.item;

		var mask = (Math.pow(2, this.props.bitsCount) - 1) * this.props.baseBit;

		var curVal = (item.prevs & mask);

		var title;

		if(curVal === 0) {
			body = ReactDOM.span({
				className: "admin-role-prevs-disabled"
			}, renderIcon('ban'));
			title = L('ADM_NA');
		} else if(this.props.bitsCount === 1) {
			body = ReactDOM.span({
				className: "admin-role-prevs-enabled"
			}, check());
			title = L('ADM_A');
		} else {
			switch(curVal / this.props.baseBit) {
				case 1:
					body = ReactDOM.span({
						className: "admin-role-prevs-enabled"
					}, check());
					title = L('ADM_A_OWN');
					break;
				case 2:
				case 3:
					body = ReactDOM.span({
						className: "admin-role-prevs-enabled"
					}, ReactDOM.span({
						className: "admin-role-prevs-size2"
					}, check(), check()));
					title = L('ADM_A_ORG');
					break;
				case 4:
				case 5:
				case 6:
				case 7:
					body = ReactDOM.span({
						className: "admin-role-prevs-enabled"
					}, ReactDOM.span({
						className: "admin-role-prevs-size3"
					}, check(), check(), check()));
					title = L('ADM_A_FULL');
					break;
				default:
					body = 'props: ' + (curVal / this.props.baseBit);
					break;
			}
		}

		return ReactDOM.td({
			className: 'clickable admin-role-prevs-cell',
			title: title,
			onClick: () => {
				curVal *= 2;
				curVal += this.props.baseBit;
				if((curVal & mask) !== curVal) {
					curVal = 0;
				}
				item.prevs = ((item.prevs & (65535 ^ mask)) | curVal);
				this.forceUpdate();
			}
		},
			body
		)

	}
}

export default class AdminRoleprevsForm extends BaseForm {

	constructor(props) {
		super(props);
		this.saveClick = this.saveClick.bind(this);
	}

	componentDidMount(props, state) {
		this.onShow();
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		super.UNSAFE_componentWillReceiveProps(newProps);
		this.onShow();
	}

	async onShow() {
		let node = await getNode(this.props.recId);

		let data = await getData('admin/nodePrevs', {
			nodeId: this.props.recId
		});

		for(let i of data.prevs) {
			if(!i.prevs) {
				i.prevs = 0;
			}
		}

		this.initData = Object.assign({}, data.prevs);
		this.setState({
			node,
			data
		});
	}

	async saveClick() {
		if(JSON.stringify(this.initData) !== JSON.stringify(this.state.data.prevs)) {
			var submit = (toChild) => {
				this.state.data.nodeId = this.props.recId;
				this.state.data.toChild = this.props.toChild;
				submitData('admin/nodePrevs', this.state.data).then(() => {
					this.cancelClick();
				});
			};

			if(this.state.data.isDoc) {
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

			var lines = data.prevs.map((i) => {
				return ReactDOM.tr({
					key: i.id,
					className: "admin-role-prevs-line"
				},
					ReactDOM.td({
						className: "admin-role-prevs-line-header"
					}, i.name),
					React.createElement(PrevsEditor, {
						bitsCount: 3,
						baseBit: PREVS_VIEW_OWN,
						item: i
					}),
					React.createElement(PrevsEditor, {
						bitsCount: 1,
						baseBit: PREVS_CREATE,
						item: i
					}),
					React.createElement(PrevsEditor, {
						bitsCount: 3,
						baseBit: PREVS_EDIT_OWN,
						item: i
					}),
					React.createElement(PrevsEditor, {
						bitsCount: 1,
						baseBit: PREVS_DELETE,
						item: i
					}),
					node.draftable ? React.createElement(PrevsEditor, {
						bitsCount: 1,
						baseBit: PREVS_PUBLISH,
						item: i
					}) : undefined
				)
			});

			var body = ReactDOM.div({
				className: "admin-role-prevs-block"
			},
				ReactDOM.h3(null,
					ReactDOM.span({
						className: "admin-role-prevs-header"
					}, L('ADM_NODE_ACCESS')),
					node.matchName
				),

				ReactDOM.table({
					className: "admin-role-prevs-table"
				},
					ReactDOM.thead({
						className: "admin-role-prevs-row-header"
					},
						ReactDOM.tr({
							className: "admin-role-prevs-line"
						},
							ReactDOM.th(),
							ReactDOM.th(null, L('VIEW')),
							ReactDOM.th(null, L('CREATE')),
							ReactDOM.th(null, L('EDIT')),
							ReactDOM.th(null, L('DELETE')),
							node.draftable ? ReactDOM.th(null, L('PUBLISH')) : undefined
						)
					),
					ReactDOM.tbody(null,
						lines
					)
				)
			);

			var saveButton = ReactDOM.button({
				className: 'clickable success-button',
				onClick: this.saveClick
			}, this.isSlave() ? renderIcon('check') : renderIcon('floppy-o'), this.isSlave() ? '' : L('SAVE'));

			var nodeAdmin;
			if(iAdmin()) {
				nodeAdmin = React.createElement(NodeAdmin, {
					form: this,
					x: 320,
					y: -40
				});
			}

			var closeButton = ReactDOM.button({
				className: 'clickable default-button',
				onClick: this.cancelClick
			}, renderIcon('times'), this.isSlave() ? '' : L('CANCEL'));

			return ReactDOM.div({className: "admin-role-prevs-body"},
				nodeAdmin,
				body,

				ReactDOM.div(null,
					saveButton,
					closeButton
				)
			)
		} else {
			return React.createElement(FormLoaderCog);
		}
	}
}