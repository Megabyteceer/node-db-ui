import { getData } from '../utils';
/// #if DEBUG
/*
/// #endif
throw new Error("admin-event-editor imported in release build.");
// */
function admin_editSource(handler: string, node: NodeDesc, field?: FieldDesc, args = '') {
	let nodeId, fieldId;
	if (field) {
		fieldId = field.id;
	}
	nodeId = node.id;
	const data = {
		handler,
		nodeId,
		fieldId,
		args
	};
	getData('admin/editEventHandler', data);
}

export {
	admin_editSource
};
