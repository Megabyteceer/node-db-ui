import ReactDOM from "react-dom";
import {R} from "js/entry.js";
import {Component} from "react";
import Modal from "../modal.js";
import {getData, L, myAlert, renderIcon, submitData} from "../utils.js";

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
];

const keysToTip = {
	'.': true,
	'"': true,
	'(': true,
	"'": true

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

	// @ts-ignore
	let jsList = CodeMirror.hint.javascript.call(form, cm);
	if(jsList && jsList.list) {
		list = list.concat(jsList.list);
	}
	return {
		from: CodeMirror.Pos(cur.line, from),
		to: CodeMirror.Pos(cur.line, to),
		list
	};
}
let CodeMirror;

class AdminEventEditor extends Component {

	constructor(props) {
		super(props);
		this.getTextareaRef = this.getTextareaRef.bind(this);
		this.saveClick = this.saveClick.bind(this);
		if(!CodeMirror) {
			import("codemirror").then((module) => {
				CodeMirror = module.CodeMirror;
				this.forceUpdate();
			});
		}
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
			// @ts-ignore
			this.editor = CodeMirror.fromTextArea(ta, {
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
						let doc = instance.getDoc();
						if(!doc.somethingSelected()) {

							var c = doc.getCursor();
							var text = instance.lineInfo(c.line).text;

							doc.setCursor({
								line: c.line,
								ch: text.length
							});

							instance.replaceSelection('\r\n' + text);
							doc.setCursor({
								line: c.line + 1,
								ch: c.ch
							});
						} else {
							var selections = doc.listSelections();
							var text = doc.getSelection();
							instance.replaceSelection(text + text);
							doc.setSelections(selections);
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
				let k = event.key.toLowerCase();
				if((k.length === 1) && ((k === " " && event.ctrlKey) || (k >= 'a' && k <= 'z') || keysToTip[k])) {
					// @ts-ignore
					CodeMirror.commands.autocomplete(editor, null, {
						completeSingle: false
					});
				}
			});

		}
	}

	render() {
		if(!this.state || !CodeMirror) {
			return R.div();
		}

		var fields = this.props.node.fields.map((f, i) => {

			var extName;
			if(f.name) {
				extName = ' (' + f.name + ')';
			}

			return R.div({
				key: i
			},
				((f.fieldType === FIELD_17_TAB) ? R.hr({
					className: 'halfvisible'
				}) : ''),
				R.b(null, f.fieldName),
				extName
			);

		});

		const functionName = this.props.node.tableName + (this.props.field ? '_' + this.props.field.fieldName + '_' : '_') + this.props.handler;

		return R.div({
			className: "left"
		},
			R.h4(null, this.props.title),
			R.div({
				className: 'admin-events-editor-body'
			},
				R.span({className: 'monospace'}, (this.props.handler === 'onsave' ? 'async ' : ''), 'function ', R.b(null, functionName), '() {'),
				R.textarea({
					ref: this.getTextareaRef,
					className: "admin-events-editor-textarea",
					defaultValue: this.state.src
				}),
				R.span({className: 'monospace'}, '}')
			),
			R.div({
				className: 'centralize'
			},
				R.button({
					className: 'clickable default-button',
					onClick: Modal.instance.hide
				}, renderIcon('times'), L('CANCEL')),
				R.button({
					className: 'clickable success-button',
					onClick: this.saveClick
				}, renderIcon('floppy-o'), L('SAVE'))

			),
			R.hr(),
			R.h4(null, L('ADM_VARS')),
			R.b(null, 'this.rec_creation'), L('ADM_HLP_1'),
			R.br(),
			R.b(null, 'this.rec_update'), L('ADM_HLP_2'),
			R.br(),
			R.b(null, 'this.rec_ID'), L('ADM_HLP_3'),
			R.br(),
			R.b(null, 'this.prev_value'), L('ADM_HLP_4'),
			R.br(),
			R.b(null, 'this.linkedCreationParams'), L('ADM_HLP_5'),
			R.br(),
			R.b(null, 'this.linkedFilter'), L('ADM_HLP_6'),
			R.br(),
			R.b(null, 'this.isUserEdit'), L('ADM_HLP_7'),
			R.hr(),
			R.h4(null, L('ADM_FUNCTIONS')),
			R.p(null,
				'this.fieldValue(fn); this.isFieldEmpty(fn); this.setFieldValue(fn,val); this.isFieldVisible(fn); this.focusField(fn); this.setFieldLabel(fn,val);',
				R.br(),
				'this.hideField(fn); this.showField(fn); this.disableField(fn); this.enableField(fn); this.fieldAlert(fn, text, isSucess); ',
				R.br(),
				'this.addLookupFilters(fn, filtersObject), this.hideFooter(), this.showFooter(), this.saveForm()'
			),
			R.hr(),
			R.h4(null, L('ADM_FIELDS')),
			fields
		)
	}
}

export {
	admin_editSource
};