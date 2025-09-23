import type { EditSourceRequest } from '../../../../core/admin/admin';
import { getEventsHandlers, getEventsHandlersField, type CLIENT_SIDE_FORM_EVENTS, type SERVER_SIDE_FORM_EVENTS, type SourceMappedEventHandler } from '../events-handle';
import { Modal } from '../modal';
import { R } from '../r';
import { getData } from '../utils';
/// #if DEBUG
/*
/// #endif
throw new Error("admin-event-editor imported in release build.");
// */
async function admin_editSource(eventName: SERVER_SIDE_FORM_EVENTS | CLIENT_SIDE_FORM_EVENTS, node: NodeDesc, field?: FieldDesc) {

	let nodeId = node.id;
	const fieldId = field?.id;

	const data = {
		eventName,
		nodeId,
		fieldId,
		fileName: undefined as any
	} as EditSourceRequest;

	const handlers = node.__serverSideHandlers?.[eventName] || (field ? getEventsHandlersField(node.tableName!, field.fieldName, field.fieldType) : getEventsHandlers(node.tableName!, eventName as SERVER_SIDE_FORM_EVENTS));
	if (handlers) {
		if (handlers.length > 1) {
			Modal.instance.show(handlers.map((f) => {
				const fileName = (f as any as SourceMappedEventHandler).__sourceFile;
				return R.button({
					onClick: () => {
						data.fileName = fileName;
						getData('admin/editEventHandler', data);
					}
				}, fileName);
			}));

			return;
		} else {
			data.fileName = (handlers[0] as SourceMappedEventHandler).__sourceFile;
		}
	}

	getData('admin/editEventHandler', data);
}

export {
	admin_editSource
};
