import {formsEventsOnLoad, formsEventsOnSave} from "../events/forms_events.js";
import {getNode, getNodeData, L, renderIcon, sp} from "../utils.js";

var showedNodeId;

class NodeAdmin extends React.Component {
	constructor(props) {
		super(props);

		if(this.props.form) {
			if(!this.props.form.props.node) {
				var waitingCallback;
				getNode(this.props.form.props.nodeId, (node) => {
					this.node = node;
					if(waitingCallback) {
						this.forceUpdate();
					}
				});
				waitingCallback = true;
				this.state = {};
			}
			this.state = {
				show: showedNodeId === this.props.form.props.node.id
			};
		} else {
			this.state = {
				show: showedNodeId === this.props.menuItem.id
			};
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

		var nodeId = (node.id || item.id);

		var borderOnSave;
		var borderOnLoad;
		if(formsEventsOnSave.hasOwnProperty(nodeId)) {
			borderOnSave = "2px solid #040";
		}
		if(formsEventsOnLoad.hasOwnProperty(nodeId)) {
			borderOnLoad = "2px solid #040";
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
							style: {
								fontSize: '130%'
							}
						}, React.createElement(FieldAdmin, {
							field: f,
							form: form,
							x: 370,
							zIndex: 10
						}))),
							allFields.push(ReactDOM.div({
								key: f.id,
								style: {
									textAlign: 'right',
									transform: 'scale(1.2)',
									width: '340px',
									marginTop: '3px'
								}
							},
								ReactDOM.div({
									style: {
										display: 'inline-block',
										width: '180px'
									}
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
						className: 'clickable toolbtn',
						style: {
							background: '#944',
							color: '#fcc',
							paddingLeft: '6px',
							paddingRight: '6px'
						},
						onClick: () => {
							this.toggleAllFields();
						}
					},
						'all fields ', renderIcon('caret-down')
					),
					ReactDOM.button({
						className: 'clickable toolbtn',
						style: {
							border: borderOnLoad,
							background: '#944',
							color: '#fcc',
							paddingLeft: '6px',
							paddingRight: '6px'
						},
						onClick: () => {

							admin_editSource('onload', node);

						}
					},
						'onLoad...'
					),
					ReactDOM.button({
						className: 'clickable toolbtn',
						style: {
							border: borderOnSave,
							background: '#944',
							color: '#fcc',
							paddingLeft: '6px',
							paddingRight: '6px'
						},
						onClick: () => {
							admin_editSource('onsave', node);
						}
					},
						'onSave...'
					),
					ReactDOM.button({
						className: 'clickable toolbtn',
						title: L('FLD_ADD'),
						style: {
							background: '#944',
							color: '#fcc'
						},
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
						className: 'clickable toolbtn',
						title: L('FLD_SHOW_ALL'),
						style: {
							background: '#944',
							color: '#fcc'
						},
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
						className: 'clickable toolbtn',
						title: L('ADD_RATING_FLD'),
						style: {
							background: '#944',
							color: '#fcc'
						},
						onClick: () => {


						}
					},
						renderIcon('plus'),
						renderIcon('bar-chart')
					)
				)

			} else {
				buttons = ReactDOM.span(null,
					ReactDOM.button({
						className: 'clickable toolbtn',
						title: L('ADD_NODE'),
						style: {
							background: '#944',
							color: '#fcc'
						},
						onClick: () => {

							getNodeData(4, item.parent, (data) => {
								admin.popup(loactionToHash(4, 'new', {
									prior: data.prior,
									_nodesID: {
										id: data.id,
										name: data.name
									}
								}, true), 900, true);
							});

						}
					},
						renderIcon('plus')
					),
					ReactDOM.button({
						className: 'clickable toolbtn',
						style: {
							background: '#944',
							color: '#fcc'
						},
						onClick: () => {
							getNodeData(4, undefined, (data) => {
								var closestNode;
								for(var k in data.items) {
									if(data.items[k].id === item.id) {
										admin.exchangeNodes(data.items[parseInt(k)], data.items[parseInt(k) + 1]);
									}
								}
							}, {
								_nodesID: item.parent
							});
						}
					},
						renderIcon('arrow-down')
					),
					ReactDOM.button({
						className: 'clickable toolbtn',
						style: {
							background: '#944',
							color: '#fcc'
						},
						onClick: () => {
							getNodeData(4, undefined, (data) => {
								var closestNode;
								for(var k in data.items) {
									if(data.items[k].id === item.id) {
										admin.exchangeNodes(data.items[parseInt(k)], data.items[parseInt(k) - 1]);
									}
								}
							}, {
								_nodesID: item.parent
							});
						}
					},
						renderIcon('arrow-up')
					)
				)
			}

			body = ReactDOM.div({
				ref: keepInWindow,
				style: {
					position: 'absolute',
					zIndex: 4,
					fontSize: '70%',
					display: 'inline-block',
					verticalAlign: 'top',
					marginTop: '-5px',
					marginLeft: -240,
					color: '#800',
					padding: '10px',
					borderRadius: '5px',
					background: '#fee',
					border: '1px solid #ebb'
				},
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
				ReactDOM.b({
					style: {
						fontSize: '130%'
					}
				},
					node.tableName || item.name
				),
				ReactDOM.span(null,
					'; (' + (node ? node.matchName : item.name) + '); id: ' + nodeId
				),
				ReactDOM.div({
					style: {
						marginTop: '5px',
						whiteSpace: 'nowrap',
						textAlign: 'center'
					}
				},
					buttons,
					ReactDOM.button({
						className: 'clickable toolbtn',
						title: L('EDIT_NODE'),
						style: {
							background: '#944',
							color: '#fcc'
						},
						onClick: () => {
							admin.popup(loactionToHash(4, nodeId, undefined, true), 900, true);

						}
					},
						renderIcon('wrench')
					),
					ReactDOM.button({
						className: 'clickable toolbtn',
						title: L('EDIT_ACCESS'),
						style: {
							background: '#944',
							color: '#fcc'
						},
						onClick: () => {
							admin.popup(loactionToHash(1, nodeId, undefined, true), 1100);
						}
					},
						renderIcon('user')
					),
					ReactDOM.span({
						style: {
							position: 'absolute',
							right: 5,
							top: 5
						},
						className: 'clickable',
						onClick: this.toggleLock
					},
						renderIcon(this.state.locked ? 'lock' : 'unlock')

					)
				),
				allFields,
				ReactDOM.button({
					onClick: () => {
						admin.debug(form || node);
					},
					className: 'clickable toolbtn',
					style: {
						background: '#944',
						color: '#fcc'
					},
					title: 'log node to console'
				},
					renderIcon('info')
				)
			);
		}



		return ReactDOM.div({
			ref: keepInWindow,
			className: 'admin-controll',
			style: {
				position: 'absolute',
				zIndex: bodyVisible ? 4 : 3,
				transform: 'translate(' + this.props.x + 'px, ' + this.props.y + 'px)'
			},
			onClick: sp
		},
			ReactDOM.span({
				style: {
					border: borderOnLoad || borderOnSave,
					display: 'inline-block',
					position: 'absolute',
					zIndex: 2,
					verticalAlign: 'top',
					padding: '6px',
					background: '#944',
					borderRadius: '5px',
					color: '#fdd'
				},
				className: 'halfvisible',
				onMouseEnter: this.show
			},
				renderIcon('wrench')
			),
			body
		)

	}
}