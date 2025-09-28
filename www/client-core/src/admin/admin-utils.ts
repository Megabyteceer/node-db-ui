import { h } from 'preact';
import type { FieldDesc } from '../bs-utils';
import { Select, type SelectItem } from '../components/select';
import { FIELD_TYPE, NODE_ID, type IFieldsRecord, type INodesRecord } from '../types/generated';
import { globals } from '../types/globals';

import type Form from '../form';
import { MainFrame } from '../main-frame';
import { R } from '../r';
import { consoleDir, getItem, getNode, getRecordClient, isLitePage, renderIcon, setItem, submitRecord } from '../utils';

/// #if DEBUG
/*
/// #endif
throw new Error("admin-utils imported in release build.");
// */

const styleEl = document.createElement('style') as HTMLStyleElement;
document.head.appendChild(styleEl);
const styleSheet = styleEl.sheet!;
let adminOn = false;
let showAll = false;

/// #if DEBUG

setTimeout(() => {
	adminOn = !isLitePage();
	window.document.body.insertAdjacentHTML(
		'beforeend',
		'<span class="admin-tools-enable-btn"><span>Admin tools </span><input type="checkbox" ' +
		(adminOn ? 'checked' : '') +
		' id="admin-disable" class="admin-tools-enable-check" title="hide/show admin controls"/>' +
		'<span>Show all </span><input type="checkbox" ' +
		(showAll ? 'checked' : '') +
		' id="admin-show-all" class="admin-tools-enable-check"/></span>'
	);
	(window.document.querySelector('#admin-disable') as HTMLDivElement).addEventListener('click', admin.toggleAdminUI);
	(window.document.querySelector('#admin-show-all') as HTMLDivElement).addEventListener('click', admin.toggleShowAll);
	if (getItem('__admin-ui-enables', true)) {
		admin.toggleAdminUI();
	}
	if (getItem('__admin-show-all', false)) {
		admin.toggleShowAll();
	}
}, 100);
/// #endif
let iconsList: SelectItem[];

class admin {
	static async moveField(fIndex: number, form: Form, node: NodeDesc, direction = 0) {
		let fieldIndex;
		let j = 0;
		const fields = node.fields!.filter((f, i) => {
			if (i === fIndex) {
				fieldIndex = j;
			}
			if (form.isFieldVisibleByFormViewMask(f) && !f.lang) {
				j++;
				return true;
			}
			return false;
		});
		if (typeof fieldIndex !== 'undefined') {
			const field = fields[fieldIndex];
			let group1: FieldDesc[] = [];
			const group2: FieldDesc[] = [];
			let f;
			let i;

			if (field.fieldType === FIELD_TYPE.TAB) {
				// two tabs exchanging
				i = fieldIndex;
				group1.push(fields[i]);
				i++;
				while (i < fields.length && i >= 0) {
					f = fields[i];

					if (f.fieldType === FIELD_TYPE.TAB && f.maxLength === 0) {
						break;
					}
					group1.push(f);
					i++;
				}

				if (direction < 0) {
					if (fieldIndex > 0) {
						i = fieldIndex - 1;
						while (i > 0) {
							const f = fields[i];
							if (f.fieldType === FIELD_TYPE.TAB && f.maxLength === 0) {
								break;
							}
							i--;
						}
						while (i < fieldIndex) {
							group2.push(fields[i]);
							i++;
						}
					}
				} else {
					if (i < fields.length) {
						group2.push(fields[i]);
						i++;
						while (i < fields.length) {
							const f = fields[i];
							if (f.fieldType === FIELD_TYPE.TAB && f.maxLength === 0) {
								break;
							}
							group2.push(f);
							i++;
						}
					}
				}
			} else {
				// field and field exchange;

				group1.push(fields[fieldIndex]);
				i = fieldIndex + direction;
				if (i < fields.length && i >= 0) {
					group2.push(fields[i]);
				}
			}

			if (group2.length === 0) {
				return;
			}

			const field1 = await getRecordClient(NODE_ID.FIELDS, group1[0].id);
			const field2 = await getRecordClient(NODE_ID.FIELDS, group2[0].id);

			let prior = Math.min(field1.prior, field2.prior);
			if (direction < 0) {
				group1 = group1.concat(group2);
			} else {
				group1 = group2.concat(group1);
			}
			for (const f of group1) {
				f.prior = prior;
				prior++;
			}

			await Promise.all(
				group1.map((f) => {
					return submitRecord(NODE_ID.FIELDS, { prior: f.prior } as IFieldsRecord, f.id);
				})
			);
			await getNode(node.id, true);
		}
	}

	static async exchangeNodes(node1: INodesRecord, node2: INodesRecord) {
		if (node1 && node2) {
			await Promise.all([
				submitRecord(
					NODE_ID.NODES,
					{
						prior: node1.prior
					} as INodesRecord,
					node2.id!
				).then(() => {
					console.log(1);
				}),
				submitRecord(
					NODE_ID.NODES,
					{
						prior: node2.prior
					} as INodesRecord,
					node1.id!
				).then(() => {
					console.log(2);
				})
			]);
			MainFrame.instance!.reloadOptions();
		}
	}

	static debugDir(obj: any) {
		consoleDir(obj);
	}

	static toggleShowAll() {
		Array.from(document.getElementsByTagName('style')).some((element: HTMLStyleElement) => {
			if (element.sheet) {
				return Array.from(element.sheet.cssRules).some((rule: CSSRule, i) => {
					if ((rule as any).selectorText === '.hidden') {
						element.sheet!.deleteRule(i);
					}
				});
			}
		});
		if (showAll) {
			(document.getElementsByTagName('style')[0] as HTMLStyleElement).sheet?.insertRule('.hidden{display:none !important;}', 0);
		} else {
			(document.getElementsByTagName('style')[0] as HTMLStyleElement).sheet?.insertRule('.hidden{outline: 1px solid #f00 !important;}', 0);

		}
		showAll = !showAll;
		setItem('__admin-show-all', showAll);
		(window.document.querySelector('#admin-show-all') as HTMLInputElement).checked = showAll;
	}

	static toggleAdminUI() {
		if (adminOn) {
			styleSheet.insertRule('.admin-control{display:none !important;}', 0);
		} else {
			if (styleSheet.rules.length) {
				styleSheet.removeRule(0);
			}
		}
		setItem('__admin-ui-enables', adminOn);
		(window.document.querySelector('#admin-disable') as HTMLInputElement).checked = !adminOn;
		adminOn = !adminOn;
	}
}

function initIconsList() {
	iconsList = [];
	const ruleList = Array.from(document.styleSheets);
	for (const style of ruleList) {
		const rules = Array.from(style.cssRules);

		if (rules.find((r: CSSRule) => (r as unknown as { selectorText: string }).selectorText === '.fa')) {
			for (const rule of rules) {
				const s = rule.cssText.split('.fa-');
				const allNames = s
					.filter(s => s.indexOf('::before') > 0)
					.map(s => s.substr(0, s.indexOf('::before')));
				if (allNames.length) {
					const iconName = allNames[0];
					iconsList.push({
						search: allNames.join(', '),
						name: R.span(null, renderIcon(iconName), allNames.join(', ')),
						value: iconName
					});
				}
			}
		}
	}
}

function makeIconSelectionField(form: Form, fieldName: string) {
	if (!iconsList) {
		initIconsList();
	}

	const input = form.getField(fieldName).getDomElement().querySelector('input') as HTMLInputElement;
	input.style.display = 'none';
	form.renderToField(
		fieldName,
		'icons-selector',
		h(Select, {
			isCompact: form.props.isCompact,
			defaultValue: form.getFieldValue(fieldName),
			readOnly: form.isFieldDisabled(fieldName),
			onInput: (value) => {
				form.setFieldValue(fieldName, value);
			},
			options: iconsList
		})
	);
}

function makeReactClassSelectionField(form: Form, fieldName: string) {
	const options = Object.keys(globals.customClasses).map((k) => {
		return { name: k, value: k };
	});
	const input = form.getField(fieldName).getDomElement().querySelector('input') as HTMLInputElement;
	input.style.display = 'none';
	form.renderToField(
		fieldName,
		'classes-selector',
		h(Select, {
			isCompact: form.props.isCompact,
			defaultValue: form.getFieldValue(fieldName),
			readOnly: form.isFieldDisabled(fieldName),
			onInput: (value) => {
				form.setFieldValue(fieldName, value);
			},
			options
		})
	);
}

function removeReactClassSelectionField(form: Form, fieldName: string) {
	const input = form.getField(fieldName).getDomElement().querySelector('input') as HTMLInputElement;
	input.style.display = '';
	form.renderToField(fieldName, 'classes-selector', null);
}

export function onSystemRecordsModified() {
	setTimeout(() => location.reload(), 10);
}

export {
	admin,
	makeIconSelectionField,
	makeReactClassSelectionField,
	removeReactClassSelectionField
};
