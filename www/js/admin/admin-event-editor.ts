import { getData, L } from "../utils";

function admin_editSource(handler, node, field) {
	var nodeId, fieldId;
	if(field) {
		fieldId = field.id;
	}
	nodeId = node.id;
	let data = {
		handler,
		nodeId,
		fieldId
	}
	getData('admin/editEventHandler', this.getPostData(data));
}

export {
	admin_editSource
};