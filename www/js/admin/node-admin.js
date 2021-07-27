import {formsEventsOnLoad, formsEventsOnSave} from "../events/forms_events.js";
import {getNode, getNodeData, keepInWindow, L, loactionToHash, renderIcon, sp} from "../utils.js";
import {admin_editSource} from "./admin-event-editor.js";
import admin from "./admin-utils.js";
import FieldAdmin from "./field-admin.js";

var showedNodeId;

export default class NodeAdmin extends React.Component {
	constructor(props) {
		super(props);

		if(this.props.form) {
			this.state = {
				show: this.props.form.props.node && (showedNodeId === this.props.form.props.node.id)
			};
		} else {
			this.state = {
				show: showedNodeId === this.props.menuItem.id
			};
		}
		this.show = this.show.bind(this);
		this.hide = this.hide.bind(this);
		this.toggleLock = this.toggleLock.bind(this);
		this.toggleAllFields = this.toggleAllFields.bind(this);
	}

	componentDidMount() {
		if(this.props.form && !this.props.form.props.node) {
			getNode(this.props.form.props.nodeId).then((node) => {
				this.node = node;
				this.forceUpdate();
			});
		}
	}

	componentWillUnmount() {
		showedNodeId = -1
	}

	show() {
		if(this.timeout) {
			clearTimeout(this.timeout);
			delete (this.timeout);
		}
		if(!this.state.show) {

			this.setState({
				show: true
			});
		}
	}

	hide() {
		if(this.state.show) {
			this.setState({
				show: false
			});
		}
	}

	toggleAllFields() {
		this.setState({
			allFieldsVisible: !this.state.allFieldsVisible
		});
	}

	toggleLock() {
		this.setState({
			locked: !this.state.locked
		});
	}

	render() {
		var node;
		var form;
		var item;

		if(this.props.form) {
			node = this.props.form.props.node || this.node;
			form = this.props.form;

		} else {
			node = {};
			item = this.props.menuItem; //left-bar-item
		}

		var nodeId = node && (node.id || item.id);

		var borderOnSave;
		var borderOnLoad;
		if(formsEventsOnSave.hasOwnProperty(nodeId)) {
			borderOnSave = "2px solid #00840088";
		}
		if(formsEventsOnLoad.hasOwnProperty(nodeId)) {
			borderOnLoad = "2px solid #00840088";
		}


		var body;

		var bodyVisible = this.state.show || this.state.locked;

		if(bodyVisible) {

			var buttons;
			var allFields;
			if(!item) {
				if(this.state.allFieldsVisible) {
					allFields = [];
					for(let f of node.fields) {
						if(f.lang) return undefined;

						allFields.push(ReactDOM.span({
							key: f.id + 'a',
							className: 'admin-form-header'
						}, React.createElement(FieldAdmin, {
							field: f,
							form: form,
							x: 370,
							zIndex: 10
						}))),
							allFields.push(ReactDOM.div({
								key: f.id,
								className: "admin-form-all-fields"
							},
								ReactDOM.div({
									className: "admin-form-all-fields-name"
								}, f.fieldName + '; (' + f.id + ')'),
								renderIcon((f.show & 1) ? 'eye' : 'eye-slash halfvisible'),
								renderIcon((f.show & 2) ? 'eye' : 'eye-slash halfvisible'),
								renderIcon((f.show & 16) ? 'eye' : 'eye-slash halfvisible'),
								renderIcon((f.show & 4) ? 'eye' : 'eye-slash halfvisible'),
								renderIcon((f.show & 8) ? 'eye' : 'eye-slash halfvisible'),

								renderIcon((f.forSearch) ? 'search-plus' : 'search halfvisible')

							))
					}
				}

				buttons = ReactDOM.span(null,
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						onClick: () => {
							this.toggleAllFields();
						},
						title: "Show full list of fields document contains."
					},
						'all fields ', renderIcon('caret-down')
					),
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						style: {border: borderOnLoad},
						onClick: () => {
							admin_editSource('onload', node, undefined, form);
						},
						title: "Edit client side script which execute on form open."
					},
						'onLoad...'
					),
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						style: {border: borderOnSave},
						onClick: () => {
							admin_editSource('onsave', node, undefined, form);
						},
						title: "Edit client side script which execute on form save."
					},
						'onSave...'
					),
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						title: L('FLD_ADD'),
						onClick: () => {
							admin.popup(loactionToHash(6, 'new', {
								node_fields_linker: {
									id: node.id,
									name: node.singleName
								}
							}, true), 900, true);
						}
					},
						renderIcon('plus')
					),
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						title: L('FLD_SHOW_ALL'),
						onClick: () => {
							if(form) {
								form.showAllDebug = !form.showAllDebug;
								form.forceUpdate();
							}
						}
					},
						renderIcon('eye')
					),
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						title: L('ADD_RATING_FLD'),
						onClick: () => {
							// TODO: implement ratings creation process

						}
					},
						renderIcon('plus'),
						renderIcon('bar-chart')
					)
				)

			} else {
				buttons = ReactDOM.span(null,
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						title: L('ADD_NODE'),
						onClick: () => {
							createNodeForMenuItem(item);
						}
					},
						renderIcon('plus')
					),
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						onClick: () => {
							getNodeData(4, undefined, {
								_nodesID: item.parent
							}).then((data) => {
								for(var k in data.items) {
									if(data.items[k].id === item.id) {
										admin.exchangeNodes(data.items[parseInt(k)], data.items[parseInt(k) + 1]);
									}
								}
							});
						},
						title: "Move node down"
					},
						renderIcon('arrow-down')
					),
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						onClick: () => {
							getNodeData(4, undefined, {
								_nodesID: item.parent
							}).then((data) => {
								for(var k in data.items) {
									if(data.items[k].id === item.id) {
										admin.exchangeNodes(data.items[parseInt(k)], data.items[parseInt(k) - 1]);
									}
								}
							});
						},
						title: "Move node up"
					},
						renderIcon('arrow-up')
					)
				)
			}

			body = ReactDOM.div({
				ref: keepInWindow,
				className: "admin-form-body",
				onClick: () => {
					clearTimeout(this.timeout);
					delete (this.timeout);
					showedNodeId = nodeId;

				},
				onMouseLeave: () => {
					this.hide()
				}
			},
				L('NODE_SETTINGS'),
				ReactDOM.b({className: "admin-form-header"},
					node.tableName
				),
				ReactDOM.span(null,
					'; (' + (node.matchName || item.name) + '); id: ' + nodeId
				),
				ReactDOM.div({
					className: "admin-form-content"
				},
					buttons,
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						title: L('EDIT_NODE'),
						onClick: () => {
							admin.popup(loactionToHash(4, nodeId, undefined, true), 900, true);

						}
					},
						renderIcon('wrench')
					),
					ReactDOM.button({
						className: 'clickable toolbtn admin-form-btn',
						title: L('EDIT_ACCESS'),
						onClick: () => {
							admin.popup(loactionToHash(1, nodeId, undefined, true), 1100);
						}
					},
						renderIcon('user')
					),
					ReactDOM.button({
						onClick: () => {
							admin.debug(form || node);
						},
						className: 'clickable toolbtn admin-form-btn',
						title: 'log node to console'
					},
						renderIcon('info')
					),
					ReactDOM.span({
						className: 'clickable admin-form-lock-btn',
						onClick: this.toggleLock
					},
						renderIcon(this.state.locked ? 'lock' : 'unlock')
					)
				),
				allFields
			);
		}

		return ReactDOM.div({
			ref: keepInWindow,
			className: 'admin-controll admin-form-wrap' + (bodyVisible ? 'admin-form-wrap-visible' : ''),
			onClick: sp
		},
			ReactDOM.span({
				style: {border: borderOnLoad || borderOnSave},
				className: 'halfvisible admin-form-open-btn',
				onMouseEnter: this.show
			},
				renderIcon('wrench')
			),
			body
		)
	}
}

function createNodeForMenuItem(item) {
	getNodeData(4, item.isDoc ? item.parent : item.id).then((data) => {
		admin.popup(loactionToHash(4, 'new', {
			prior: data.prior,
			_nodesID: {
				id: data.id,
				name: data.name
			}
		}, true), 900, true);
	});
}

export {createNodeForMenuItem};