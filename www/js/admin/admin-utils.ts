import ReactDOM from "react-dom";
import React from "react";
import { FieldDesc, FIELD_17_TAB } from "../bs-utils";
import { R } from "../r";
import { Select } from "../components/select";
import { consoleDir, getNode, getNodeData, isLitePage, renderIcon, submitRecord } from "../utils";
import { MainFrame } from "../main-frame";

function debugInfoGetter() {
	consoleDir(this);
}

var styleEl = document.createElement('style');
var styleSheet;
document.head.appendChild(styleEl);
styleSheet = styleEl.sheet;
var adminOn;
document.addEventListener('load', () => {
	adminOn = !isLitePage();
	$('body').append('<span class="admin-tools-enable-btn"><span>Admin tools </span><input type="checkbox" checked="' + adminOn + '" id="admin-disable" class="admin-tools-enable-check" title="hide/show admin controls"/></span>');
	$('#admin-disable').on('click', admin.toggleAdminUI);

	admin.toggleAdminUI();
});

let iconsList;

class admin {
	static async moveField(fIndex, form, node, direction = 0) {
		var fieldIndex;
		var j = 0;
		var fields = node.fields.filter((f, i) => {
			if(i === fIndex) {
				fieldIndex = j;
			}
			if(form.isVisibleField(f) && !f.lang) {
				j++;
				return true;
			}
			return false;
		});
		if(typeof fieldIndex !== 'undefined') {
			var field = fields[fieldIndex];
			var group1: FieldDesc[] = [];
			var group2: FieldDesc[] = [];
			var f;
			var i;

			if(field.fieldType === FIELD_17_TAB) {
				if(field.maxlen === 0) { //two tabs exchanging

					i = fieldIndex;
					group1.push(fields[i]);
					i++;
					while(i < fields.length && i >= 0) {
						f = fields[i];

						if(f.fieldType === FIELD_17_TAB && f.maxlen === 0) {
							break;
						}
						group1.push(f);
						i++;
					}

					if(direction < 0) {
						if(fieldIndex > 0) {
							i = fieldIndex - 1;
							while(i > 0) {
								var f = fields[i];
								if(f.fieldType === FIELD_17_TAB && f.maxlen === 0) {
									break;
								}
								i--;
							}
							while(i < fieldIndex) {
								group2.push(fields[i]);
								i++;
							}
						}
					} else {
						if(i < fields.length) {
							group2.push(fields[i]);
							i++;
							while(i < fields.length) {
								var f = fields[i];
								if(f.fieldType === FIELD_17_TAB && f.maxlen === 0) {
									break;
								}
								group2.push(f);
								i++;
							}
						}
					}

				} else { //compact area exchange

					group1.push(fields[fieldIndex]);
					i = fieldIndex + 1;
					while(fields[i].isCompactNested) {
						group1.push(fields[i]);
						i++;
					}
					if(direction < 0) {
						i = fieldIndex - 1;
						while(fields[i].isCompactNested) {
							i--;
						}
						while(i < fieldIndex) {
							group2.push(fields[i]);
							i++;
						}
					} else {
						group2.push(fields[i]);
						i++;
						while(fields[i].isCompactNested) {
							group2.push(fields[i]);
							i++;
						}
					}
				}

			} else { //field and field exchange;

				group1.push(fields[fieldIndex]);
				i = fieldIndex + direction;
				if((i < fields.length) && (i >= 0)) {
					group2.push(fields[i]);
				}
			}

			if(group2.length === 0) {
				return;
			}

			let field1 = await getNodeData(6, group1[0].id);
			let field2 = await getNodeData(6, group2[0].id);

			var prior = Math.min(field1.prior, field2.prior);
			if(direction < 0) {
				group1 = group1.concat(group2);
			} else {
				group1 = group2.concat(group1);
			}
			for(let f of group1) {
				f.prior = prior;
				prior++;
			}
			await Promise.all(group1.map((f) => {
				return submitRecord(6, { prior: f.prior }, f.id);
			}));
			await getNode(node.id, true);
			window.crudJs.Stage.refreshForm();
		}
	}

	static async exchangeNodes(node1, node2) {
		if(node1 && node2) {
			await Promise.all([submitRecord(4, {
				prior: node1.prior
			}, node2.id).then(() => {
				console.log(1);
			}),
			submitRecord(4, {
				prior: node2.prior
			}, node1.id).then(() => {
				console.log(2);
			})]);
			MainFrame.instance.reloadOptions();
		}
	}

	static debug(obj) {
		debugInfoGetter.call(obj);
	}

	static toggleAdminUI() {
		if(adminOn) {
			styleSheet.insertRule('.admin-controll{display:none;}', 0);
		} else {
			if(styleSheet.rules.length) {
				styleSheet.removeRule(0);
			}
		}
		$('#admin-disable').prop('checked', !adminOn);
		adminOn = !adminOn;
	}
}

function initIconsList() {
	iconsList = [];
	let ruleList = Array.from(document.styleSheets).filter((r) => {
		return r.href && (r.href.indexOf('font-awesome') >= 0);
	});
	for(let style of ruleList) {
		for(let rule of Array.from(style.cssRules)) {
			let s = rule.cssText.split('.fa-');
			let allNames = s.filter(s => s.indexOf('::before') > 0).map(s => s.substr(0, s.indexOf('::before')));
			if(allNames.length) {
				let iconName = allNames[0];
				iconsList.push({
					name: R.span(null, renderIcon(iconName), allNames.join(', ')),
					value: iconName
				});
			}
		}
	}
}

/** @param {FormFull} form */
function makeIconSelectionField(form, fieldName) {

	if(!iconsList) {
		initIconsList();
	}
	const $iconInput = $('.field-container-id-' + form.getField(fieldName).props.field.id + ' input');
	$iconInput.css({
		display: 'none'
	});
	$iconInput.after('<span id="icons-selector"></span>');

	setTimeout(() =>
		ReactDOM.render(
			React.createElement(Select, {
				isCompact: form.props.isCompact,
				defaultValue: form.fieldValue(fieldName),
				readOnly: form.props.fieldDisabled,
				onChange: (value) => {
					form.setFieldValue(fieldName, value);
				},
				options: iconsList
			}),
			document.getElementById('icons-selector')
		),
		10);
}

export { makeIconSelectionField, admin };