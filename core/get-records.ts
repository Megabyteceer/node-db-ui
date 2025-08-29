/// <reference types="../types/generated" />

import { assert, ESCAPE_BEGIN, ESCAPE_END, throwError } from '../www/client-core/src/assert';
import type { FilterDesc, RecId, RecordData, RecordsData } from '../www/client-core/src/bs-utils';
import { FIELD_TYPE, PRIVILEGES_MASK, VIEW_MASK } from '../www/client-core/src/bs-utils';
import type { UserSession } from './auth';
import { ADMIN_USER_SESSION, filtersById, getNodeDesc, getNodeEventHandler, ServerSideEventHandlersNames } from './describe-node';
import { A, D, escapeString, mysqlExec, NUM_0, NUM_1 } from './mysql-connection';

const isASCII = (str) => {
	return /^[\x00-\x7F]*$/.test(str);
};

const GROUP_SPLITTER = '␞';
const GROUP_SPLITTER_ESCAPED = escapeString(GROUP_SPLITTER);

const EMPTY_FILTERS = {};

const FILTERS_LIMIT_SQL_PART = '",' + NUM_1 + ',' + D(500) + ') AS "';
const LOOKUP_LIMIT_SQL_PART = '".id LIMIT ' + NUM_1 + ') AS "';
const STATUS_FILTER_SQL_PART_ANY = '".status > ' + NUM_0 + ')';
const STATUS_FILTER_SQL_PART_PUBLISHED = '".status = ' + NUM_1 + ')';
const ORDERING_SQL_PART = ' LIMIT ' + NUM_1;

/*
* @param filterFields	array with [fieldName: string]=>value filters. Only numeric fields is support
*									special fields:
										['p'] = 5; - page of records to retrieve; * - retrieve all
										['n'] = 5; - number of records per page;
										['excludeIDs'] = [3,5,64,5,45]; - exclude records with these IDs;
										['onlyIDs'] = '3,5,64,5,45'; - filter by IDs;
										['o'] = 1; fieldId;
										['r'] = 1; reverse order;
										['filterId'] = 1; filter's id to be applied on result;
*/
async function getRecords(nodeId: RecId, viewMask: VIEW_MASK, recId: RecId, userSession?: UserSession): Promise<RecordData>;
async function getRecords(nodeId: RecId, viewMask: VIEW_MASK, recId: null | RecId[], userSession?: UserSession, filterFields?: any, search?: string): Promise<RecordsData>;
async function getRecords(
	nodeId: RecId,
	viewMask: VIEW_MASK,
	recId: null | RecId | RecId[] = null,
	userSession: UserSession = ADMIN_USER_SESSION,
	filterFields: any = EMPTY_FILTERS,
	search?: string
): Promise<RecordData | RecordsData> {
	const node = getNodeDesc(nodeId, userSession);

	if (!node.storeForms) {
		return null;
	}

	const singleSelectionById = typeof recId === 'number';

	const selQ = ['SELECT '];

	const tableName = node.tableName;
	let tables = tableName;

	//=========================================================
	//===== fields list =======================================
	//=========================================================
	for (const f of node.fields) {
		if (f.storeInDb && f.show & viewMask) {
			const fieldType = f.fieldType;
			const fieldName = f.fieldName;
			const selectFieldName = f.selectFieldName;

			if (fieldType === FIELD_TYPE.LOOKUP_NtoM) {
				//n2m
				const tblTmpName = '"t' + f.id + '"';
				if (f.lookupIcon) {
					selQ.push(
						'ARRAY(SELECT ',
						tblTmpName,
						'.id || ',
						GROUP_SPLITTER_ESCAPED,
						' || ',
						tblTmpName,
						'.name || ',
						GROUP_SPLITTER_ESCAPED,
						' || ',
						tblTmpName,
						'."',
						f.lookupIcon,
						'" AS v FROM "',
						selectFieldName,
						'" AS ',
						tblTmpName,
						', "',
						fieldName,
						'" WHERE "',
						fieldName,
						'"."',
						selectFieldName,
						'Id"=',
						tblTmpName,
						'.id AND ',
						fieldName,
						'."',
						tableName,
						'Id"="',
						tableName,
						'".id ORDER BY "',
						fieldName,
						'".id) AS "',
						fieldName,
						'"'
					);
				} else {
					selQ.push(
						'ARRAY(SELECT ',
						tblTmpName,
						'.id || ',
						GROUP_SPLITTER_ESCAPED,
						' ||  ',
						tblTmpName,
						'.name AS v FROM "',
						selectFieldName,
						'" AS ',
						tblTmpName,
						', "',
						fieldName,
						'" WHERE "',
						fieldName,
						'"."',
						selectFieldName,
						'Id"=',
						tblTmpName,
						'.id AND "',
						fieldName,
						'"."',
						tableName,
						'Id"=',
						tableName,
						'.id ORDER BY "',
						fieldName,
						'".id) AS "',
						fieldName,
						'"'
					);
				}
			} else if (fieldType === FIELD_TYPE.LOOKUP) {
				//n21
				if (f.lookupIcon) {
					selQ.push(
						'(SELECT CONCAT(id,',
						GROUP_SPLITTER_ESCAPED,
						',name,',
						GROUP_SPLITTER_ESCAPED,
						',"',
						f.lookupIcon,
						'") FROM "',
						selectFieldName,
						'" AS "t',
						fieldName,
						'" WHERE "',
						tableName,
						'"."',
						fieldName,
						'"="t',
						fieldName,
						LOOKUP_LIMIT_SQL_PART,
						fieldName,
						'"'
					);
				} else {
					selQ.push(
						'(SELECT CONCAT(id,',
						GROUP_SPLITTER_ESCAPED,
						',name) FROM "',
						selectFieldName + '" AS "t',
						fieldName,
						'" WHERE "',
						tableName,
						'"."',
						fieldName,
						'"="t',
						fieldName,
						LOOKUP_LIMIT_SQL_PART,
						fieldName,
						'"'
					);
				}
			} else if (selectFieldName) {
				//@ts-ignore
				selQ.push('(', ESCAPE_BEGIN, selectFieldName.replaceAll('@userId', userSession.id.toString()), ESCAPE_END, ')AS "', fieldName, '"');
			} else if ((viewMask === VIEW_MASK.LIST || viewMask === VIEW_MASK.CUSTOM_LIST) && (fieldType === FIELD_TYPE.TEXT || fieldType === FIELD_TYPE.RICH_EDITOR) && f.maxLength > 500) {
				selQ.push('SUBSTRING("', tableName, '"."', fieldName, FILTERS_LIMIT_SQL_PART, fieldName, '"');
			} else {
				selQ.push('"', tableName, '"."', fieldName, '"');
			}
			selQ.push(', ');
		}
	}

	selQ.push('"', tableName, '".id');

	selQ.push(',"', tableName, '"."_organizationId" AS creator_org,"', tableName, '"."_usersId" AS creator_user');
	if (node.draftable) {
		selQ.push(',"', tableName, '".status');
	}

	//=========================================================
	//===== filters ===========================================
	//=========================================================

	const filterId = filterFields.filterId;
	let filter: FilterDesc;

	if (node.filters) {
		/// #if DEBUG
		const availableFilters = Object.keys(node.filters).join();
		assert(
			!filterId || node.filters[filterId],
			'Unknown filterId ' + filterId + ' for node ' + node.tableName + (availableFilters ? '. Available values is: ' + availableFilters : ' node has no filters.')
		);
		/// #endif
		if (filterId && node.filters[filterId]) {
			//user selected filter
			filter = filtersById.get(filterId);
		} else if (node.defaultFilterId) {
			filter = filtersById.get(node.defaultFilterId);
		}
	}

	let hiPriorityFilter;
	let wheres;
	let ordering;

	if (singleSelectionById) {
		wheres = [' AND "', tableName, '".id=', D(recId as number)];
		ordering = [ORDERING_SQL_PART];
	} else {
		if (Array.isArray(recId)) {
			wheres = [' AND "', tableName, '".id IN (', A(recId), ')'];
		} else {
			wheres = [''];
		}

		//search ----------------------------

		let searchWHERE;
		let sortFieldName: string | undefined;
		let fieldName;

		const isAsciiSearch = search && isASCII(search);

		for (const f of node.fields) {
			fieldName = f.fieldName;

			if (f.id === filterFields.o) {
				if (f.forSearch) {
					sortFieldName = fieldName;
				} else {
					/// #if DEBUG
					throwError('Tried to sort by un-indexed field: ' + fieldName);
					/// #endif
				}
			}

			if (search && f.forSearch) {
				if (isAsciiSearch || f.fieldType === FIELD_TYPE.TEXT) {
					if (!searchWHERE) {
						searchWHERE = [];
					} else {
						searchWHERE.push(' OR ');
					}
					searchWHERE.push('"', tableName, '"."', fieldName, '" LIKE ', escapeString('%' + search + '%'), ' ');
				}
			}

			if (filterFields.hasOwnProperty(fieldName)) {
				if (f.forSearch) {
					const fltVal = filterFields[fieldName];
					if (f.fieldType === FIELD_TYPE.TEXT) {
						wheres.push(' AND(LOWER("', tableName, '"."', fieldName, '")=LOWER(', escapeString(fltVal), '))');
					} else {
						wheres.push(' AND("', tableName, '"."', fieldName, '"=', D(fltVal), ')');
					}
				} else {
					throwError('Attempt to filter records by un-indexed field ' + fieldName);
				}
			}
		}

		if (searchWHERE) {
			wheres.push(' AND (');
			wheres.push(...searchWHERE);
			wheres.push(') ');
		}

		if (filterFields.excludeIDs) {
			assert(filterFields.excludeIDs.length > 0, "Empty array for 'excludeIDs' received.");
			wheres.push('AND("', tableName, '".id NOT IN (', A(filterFields.excludeIDs), '))');
		}
		if (filterFields.onlyIDs) {
			wheres.push('AND("', tableName, '".id IN (', A(filterFields.onlyIDs), '))');
		}

		if (filter) {
			let fw = filter['filter'];
			if (fw) {
				if (fw.indexOf('@') >= 0) {
					fw = fw.replaceAll('@userId', userSession.id);
					fw = fw.replaceAll('@orgId', userSession.orgId);
					if (fw.indexOf('@') >= 0) {
						for (const k in filterFields) {
							fw.replaceAll('@' + k, D(filterFields[k]));
						}
					}
				}
				if (filter.hiPriority) {
					hiPriorityFilter = ['(', fw, ')AND '];
				} else {
					wheres.push(' AND (', ESCAPE_BEGIN, fw, ESCAPE_END, ')');
				}
			}

			if (filter.view) {
				tables = filter.view;
			}

			if (filter.fields) {
				selQ.push(', ', filter.fields);
			}
		}

		ordering = [' ORDER BY "', tableName, '"."', sortFieldName || node.sortFieldName, '"'];
		if (Boolean(filterFields.r) !== Boolean(node.reverse)) {
			ordering.push(' DESC');
		}
		let recPerPage;
		if (filterFields.n) {
			recPerPage = filterFields.n;
		} else {
			recPerPage = node.recPerPage;
		}

		if (filterFields.p) {
			if (filterFields.p !== '*') {
				assert(typeof filterFields.p === 'number', 'filterFields.p expected as a number');
				ordering.push('OFFSET ', D(filterFields.p * recPerPage), ' LIMIT ', D(recPerPage));
			}
		} else {
			ordering.push(' LIMIT ', D(recPerPage));
		}
	}

	const wheresBegin = [' FROM "', tables, '" WHERE '];
	if (hiPriorityFilter) {
		wheresBegin.push(...hiPriorityFilter);
	}

	const privileges = node.privileges;
	if (userSession) {
		if ((privileges & (PRIVILEGES_MASK.EDIT_OWN | PRIVILEGES_MASK.EDIT_ORG | PRIVILEGES_MASK.EDIT_ALL | PRIVILEGES_MASK.PUBLISH)) !== 0) {
			wheresBegin.push('("', tableName, STATUS_FILTER_SQL_PART_ANY);
		} else {
			wheresBegin.push('("', tableName, STATUS_FILTER_SQL_PART_PUBLISHED);
		}

		if (privileges & PRIVILEGES_MASK.VIEW_ALL || (filter && filter.hiPriority)) {
			/* empty */
		} else if (privileges & PRIVILEGES_MASK.VIEW_ORG && userSession.orgId !== 0) {
			wheresBegin.push(' AND ("', tableName, '"."_organizationId"=', D(userSession.orgId), ')');
		} else if (privileges & PRIVILEGES_MASK.VIEW_OWN) {
			wheresBegin.push(' AND ("', tableName, '"."_usersId"=', D(userSession.id), ')');
		} else {
			throwError('Access denied 3.');
		}
	} else {
		wheresBegin.push(NUM_1);
	}

	selQ.push(...wheresBegin);
	selQ.push(...wheres);
	selQ.push(...ordering);

	const items: RecordData[] = (await mysqlExec(selQ.join(''))) as RecordData[];

	for (const pag of items) {
		if (viewMask) {
			if (privileges & PRIVILEGES_MASK.EDIT_ALL) {
				pag.isE = 1;
			} else if (privileges & PRIVILEGES_MASK.EDIT_ORG && userSession.orgId !== 0 && pag.creatorORG === userSession.orgId) {
				pag.isE = 1;
			} else if (privileges & PRIVILEGES_MASK.EDIT_OWN && pag.creatorUSER === userSession.id) {
				pag.isE = 1;
			}

			if (pag.isE) {
				if (privileges & PRIVILEGES_MASK.DELETE) {
					pag.isD = 1;
				}
				if (node.draftable && privileges & PRIVILEGES_MASK.PUBLISH) {
					pag.isP = 1;
				}
			} else {
				if (viewMask & 1) {
					throwError('Access to view editable fields denied.');
				}
			}

			for (const f of node.fields) {
				if (f.storeInDb && f.show & viewMask) {
					const fieldType = f.fieldType;
					const fieldName = f.fieldName;
					if (fieldType === FIELD_TYPE.LOOKUP_NtoM || fieldType === FIELD_TYPE.LOOKUP_1toN) {
						//n2m,12n
						if (pag[fieldName]) {
							pag[fieldName] = pag[fieldName].map((src: string) => {
								const a = src.split(GROUP_SPLITTER);
								return {
									id: parseInt(a[0]),
									name: a[1],
									icon: a[2]
								};
							});
						}
					} else if (fieldType === FIELD_TYPE.LOOKUP) {
						//n21
						if (pag[fieldName]) {
							const a = pag[fieldName].split(GROUP_SPLITTER);
							if (f.lookupIcon) {
								pag[fieldName] = {
									id: parseInt(a[0]),
									name: a[1],
									icon: a[2]
								};
							} else {
								pag[fieldName] = {
									id: parseInt(a[0]),
									name: a[1]
								};
							}
						} else {
							pag[fieldName] = { id: 0, name: 'deleted record.' };
						}
					}
				}
			}
		}
	}

	if (!singleSelectionById) {
		const countQ = ['SELECT COUNT(*)'];
		countQ.push(...wheresBegin);
		countQ.push(...wheres);
		const total = await mysqlExec(countQ.join(''));
		return { items, total: parseInt(total[0].count) };
	} else {
		if (items.length) {
			return items[0];
		} else {
			/// #if DEBUG
			throwError('Record not found. nodeId:' + nodeId + ', viewMask: ' + viewMask + ', recId: ' + recId);
			/// #endif
			throwError('Record not found.');
		}
	}
}

const DELETE_RECORD_SQL_PART = '" SET status=' + NUM_0 + ' WHERE id=';
async function deleteRecord(nodeId, recId, userSession = ADMIN_USER_SESSION) {
	const node = getNodeDesc(nodeId, userSession);

	const recordData = await getRecords(nodeId, 4, recId, userSession);
	if (!recordData.isD) {
		throwError('Deletion access is denied');
	}

	await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.beforeDelete, recordData, userSession);

	await mysqlExec('UPDATE "' + node.tableName + DELETE_RECORD_SQL_PART + D(recId));

	await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.afterDelete, recordData, userSession);

	return 1;
}

export { deleteRecord, getRecords };
