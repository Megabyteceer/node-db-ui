import { globals } from '../types/globals';

export const getNodeByTableName = (name: string) => {
	return globals.nodesByTableName?.get(name);
};