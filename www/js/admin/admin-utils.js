import LeftBar from "../left-bar.js";
import MainFrame from "../main-frame.js";
import {consoleDir, getNode, getNodeData, isLitePage, popup, submitRecord} from "../utils.js";

const admin = {};

admin.moveField = (fIndex, form, node, direction) => {
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

	var field = fields[fieldIndex];
	var group1 = [];
	var group2 = [];
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
					while(i >= 0) {
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
		if(i < fields.length && i >= 0) {
			group2.push(fields[i]);
		}
	}

	if(group2.length === 0) {
		debugError('tried to move field to out of form.');
		return;
	}

	getNodeData(6, group1[0].id, (field1) => {
		getNodeData(6, group2[0].id, (field2) => {
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

			var callsCount = group1.length;

			for(let f of group1) {
				submitRecord(6, {
					prior: f.prior
				}, f.id, () => {
					callsCount--;
					if(callsCount === 0) {
						getNode(node.id, () => {
							refreshForm();
						}, true);
					}
				})
			}
		});
	});
}

admin.exchangeNodes = (node1, node2) => {
	if(node1 && node2) {
		submitRecord(4, {
			prior: node1.prior
		}, node2.id, () => {
			submitRecord(4, {
				prior: node2.prior
			}, node1.id, () => {
				MainFrame.instance.reloadOptions();
			})
		});
	}
}

admin.popup = popup;

function debugInfoGetter() {
	consoleDir(this);
}
admin.debug = (obj) => {
	debugInfoGetter.call(obj);
}





var styleEl = document.createElement('style');
var styleSheet;
// Append style element to head
document.head.appendChild(styleEl);
// Grab style sheet
styleSheet = styleEl.sheet;

var adminOn = !isLitePage();

admin.toggleAdminUI = () => {
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

$('body').append('<span style="position:fixed; width:200px; pointer-events: none; top:0;right:25%; color:#fcc;"><span>Admin tools </span><input type="checkbox" checked="' + adminOn + '" id="admin-disable" style="margin:2px; width:50px; vertical-align:middle; cursor:pointer;  pointer-events: all;" title="hide/show admin controls"/></span>');
$('#admin-disable').on('click', admin.toggleAdminUI);

admin.toggleAdminUI();

export default admin;