import { globals } from '../www/client-core/src/types/globals';

export const getNodeByTableName = (name: string) => {
	return globals.nodesByTableName?.get(name);
};