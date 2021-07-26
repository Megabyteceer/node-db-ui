import Modal from "../modal.js";
import {getData, L, myAlert, renderIcon, submitData} from "../utils.js";
import {defaultButtonStyle, successButtonStyle} from "../stage.js";

var node;

function admin_editSource(handler, node_, field, form) {

	node = node_;

	var title, type, id;

	if(handler === 'onchange') {
		title = L('ADM_ONCHANGEEVENT', field.fieldName) + ' (' + field.name + '):';
		type = 'field';
		id = field.id;
	} else {
		title = L('', (handler === 'onload') ? 'onLoad' : 'onSave') + ' "' + node.tableName + '" (' + node.singleName + '):';
		type = 'node';
		id = node.id;
	}

	myAlert(React.createElement(AdminEventEditor, {
		type,
		title,
		handler,
		itemId: id,
		node,
		field,
		form
	}), false, false, true);
}

var ExcludedIntelliSenseTriggerKeys = {
	"9": "tab",
	"13": "enter",
	"16": "shift",
	"17": "ctrl",
	"18": "alt",
	"19": "pause",
	"20": "capslock",
	"27": "escape",
	"33": "pageup",
	"34": "pagedown",
	"35": "end",
	"36": "home",
	"37": "left",
	"38": "up",
	"39": "right",
	"40": "down",
	"45": "insert",
	"46": "delete",
	"91": "left window key",
	"92": "right window key",
	"93": "select",
	"107": "add",
	"109": "subtract",
	"111": "divide",
	"112": "f1",
	"113": "f2",
	"114": "f3",
	"115": "f4",
	"116": "f5",
	"117": "f6",
	"118": "f7",
	"119": "f8",
	"120": "f9",
	"121": "f10",
	"122": "f11",
	"123": "f12",
	"144": "numlock",
	"145": "scrolllock",
	"186": "semicolon"
}

var tipProps = [
	'rec_creation',
	'rec_update',
	'onSaveCallback',
	'onCancelCallback',
	'rec_ID',
	'isUserEdit',
	'prev_value',
	'fieldValue(',
	'isFieldEmpty(',
	'setFieldValue(',
	'focusField(',
	'setFieldLabel(',
	'hideField(',
	'showField(',
	'isFieldVisible(',
	'disableField(',
	'enableField(',
	'fieldAlert(',
	'addLookupFilters(',
	'hideFooter(',
	'showFooter(',
	'saveForm('
]


var style = {
	marginTop: '20px',
	display: 'inline-block',
	cursor: 'default'
}


function javascriptHint(cm, form) {

	var cur = cm.getCursor();
	var token = cm.getTokenAt(cur);

	var list = [];
	var flt;
	var from = token.start;
	var to = token.end;
	if(token.string.charAt(0) === '"' || token.string.charAt(0) === "'") {
		flt = token.string.replace("'", '').replace('"', '');

		list = node.fields.map((f) => {
			return '"' + f.fieldName + '"';
		});

	} else {

		if(token.string === '.') {
			if(cm.getTokenAt({ch: cur.ch - 2, line: cur.line}).string === 'this') {
				flt = '';
				from = to;
			}
		} else if(token.type = 'property') {
			if(cm.getTokenAt({ch: token.start - 2, line: cur.line}).string === 'this') {
				flt = token.string;
			}
		}
		if(typeof flt !== 'undefined') {
			list = tipProps;
		}
	}

	if(list && flt) {
		flt = flt.toLowerCase();
		list = list.filter((s) => {
			return s.toLowerCase().indexOf(flt) >= 0;
		});
	}

	let jsList = window.CodeMirror.hint.javascript.call(form, cm);
	if(jsList && jsList.list) {
		list = list.concat(jsList.list);
	}
	return {
		from: window.CodeMirror.Pos(cur.line, from),
		to: window.CodeMirror.Pos(cur.line, to),
		list
	};
}

class AdminEventEditor extends React.Component {

	constructor(props) {
		super(props);
		this.getTextareaRef = this.getTextareaRef.bind(this);
		this.saveClick = this.saveClick.bind(this);
	}

	getPostData() {
		return {
			type: this.props.type,
			handler: this.props.handler,
			itemId: this.props.itemId
		}
	}

	componentDidMount() {

		getData('admin/getEventHandler', this.getPostData()).then((data) => {
			this.setState({
				src: data
			});
		});
	}

	async saveClick() {
		this.editor.save();
		if(this.state.src !== this.textareaRef.value) {
			let src = this.textareaRef.value;
			try {
				let compiledSrc = eval('"use strict";"function" + function Wrapper() {\n' + src + '\n}.name');
				if(compiledSrc !== 'functionWrapper') {
					myAlert("Invalid javascript detected.");
				}
				let data = this.getPostData();
				data.__UNSAFE_UNESCAPED = {src};
				await submitData('admin/getEventHandler', data).then(() => {
					window.location.reload();
				});
			} catch(er) {
				myAlert(er.message);
				console.dir(er);
			}
		} else {
			Modal.instance.hide();
		}
	}

	getTextareaRef(ref) {
		if(ref) {
			var ta = ReactDOM.findDOMNode(ref);
			this.textareaRef = ref;
			this.editor = window.CodeMirror.fromTextArea(ta, {
				mode: {name: "javascript", globalVars: true},
				matchBrackets: true,
				autofocus: true,
				lineNumbers: true,
				styleActiveLine: true,
				hintOptions: {
					hint: (cm) => {
						return javascriptHint(cm, this.props.form);
					}
				},
				extraKeys: {
					"Ctrl-Space": "autocomplete",
					"Ctrl-D": (instance) => {

						if(!instance.doc.somethingSelected()) {

							var c = instance.doc.getCursor();
							var text = instance.lineInfo(c.line).text;

							instance.doc.setCursor({
								line: c.line,
								ch: text.length
							});

							instance.replaceSelection('\r\n' + text);
							instance.doc.setCursor({
								line: c.line + 1,
								ch: c.ch
							});
						} else {
							var selections = instance.doc.listSelections();
							var text = instance.doc.getSelection();
							instance.replaceSelection(text + text);
							instance.doc.setSelections(selections);
						}
						return false;
					},
					"Ctrl-S": (instance) => {
						this.saveClick();
						return false;
					},

					"Esc": Modal.instance.hide
				}
			});
			this.editor.setSize('900px', '500px');
			this.editor.on("keyup", (editor, event) => {
				if((!event.ctrlKey || event.keyCode === 32) && !ExcludedIntelliSenseTriggerKeys[(event.keyCode || event.which).toString()]) {
					window.CodeMirror.commands.autocomplete(editor, null, {
						completeSingle: false
					});
				}
			});

		}
	}

	render() {
		var src = '';
		if(!this.state) {
			return ReactDOM.div();
		}

		var fields = this.props.node.fields.map((f, i) => {

			var extName;
			if(f.name) {
				extName = ' (' + f.name + ')';
			}

			return ReactDOM.div({
				key: i
			},
				((f.fieldType === FIELD_17_TAB) ? ReactDOM.hr({
					className: 'halfvisible'
				}) : ''),
				ReactDOM.b(null, f.fieldName),
				extName
			);

		});

		const functionName = this.props.node.tableName + (this.props.field ? '_' + this.props.field.fieldName + '_' : '_') + this.props.handler;

		return ReactDOM.div({
			style: {
				textAlign: 'left'
			}
		},
			ReactDOM.h4(null, this.props.title),
			ReactDOM.div({
				style: {
					margin: '30px'
				}
			},
				ReactDOM.span({style: {fontFamily: 'monospace'}}, 'function ', ReactDOM.span({style: {fontWeight: 'bold'}}, functionName), '() {'),
				ReactDOM.textarea({
					ref: this.getTextareaRef,
					style: {
						minWidth: '1000px',
						minHeight: '4	00px'
					},
					defaultValue: this.state.src
				}),
				ReactDOM.span({style: {fontFamily: 'monospace'}}, '}')
			),
			ReactDOM.div({
				style: {
					textAlign: 'center'
				}
			},
				ReactDOM.button({
					className: 'clickable',
					style: defaultButtonStyle,
					onClick: Modal.instance.hide
				}, renderIcon('times'), L('CANCEL')),
				ReactDOM.button({
					className: 'clickable',
					style: successButtonStyle,
					onClick: this.saveClick
				}, renderIcon('floppy-o'), L('SAVE'))

			),
			ReactDOM.hr(),
			ReactDOM.h4(null, L('ADM_VARS')),
			ReactDOM.b(null, 'this.rec_creation'), L('ADM_HLP_1'),
			ReactDOM.br(),
			ReactDOM.b(null, 'this.rec_update'), L('ADM_HLP_2'),
			ReactDOM.br(),
			ReactDOM.b(null, 'this.rec_ID'), L('ADM_HLP_3'),
			ReactDOM.br(),
			ReactDOM.b(null, 'this.prev_value'), L('ADM_HLP_4'),
			ReactDOM.br(),
			ReactDOM.b(null, 'this.linkedCreationParams'), L('ADM_HLP_5'),
			ReactDOM.br(),
			ReactDOM.b(null, 'this.linkedFilter'), L('ADM_HLP_6'),
			ReactDOM.br(),
			ReactDOM.b(null, 'this.isUserEdit'), L('ADM_HLP_7'),
			ReactDOM.hr(),
			ReactDOM.h4(null, L('ADM_FUNCTIONS')),
			ReactDOM.p(null,
				'this.fieldValue(fn); this.isFieldEmpty(fn); this.setFieldValue(fn,val); this.isFieldVisible(fn); this.focusField(fn); this.setFieldLabel(fn,val);',
				ReactDOM.br(),
				'this.hideField(fn); this.showField(fn); this.disableField(fn); this.enableField(fn); this.fieldAlert(fn, text, isSucess); ',
				ReactDOM.br(),
				'this.addLookupFilters(fn, filtersObject), this.hideFooter(), this.showFooter(), this.saveForm()'
			),
			ReactDOM.hr(),
			ReactDOM.h4(null, L('ADM_FIELDS')),
			fields
		)
	}
}

export {
	admin_editSource
};