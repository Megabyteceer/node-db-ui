import { getData, L } from "../utils";

function admin_editSource(handler, node, field, args = '') {
	var nodeId, fieldId;
	if(field) {
		fieldId = field.id;
	}
	nodeId = node.id;
	let data = {
		handler,
		nodeId,
		fieldId,
		args
	}
	getData('admin/editEventHandler', data);
}

export {
	admin_editSource
};