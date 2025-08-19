import { assert, FIELD_TYPE, FilterDesc, PRIVILEGES_MASK, RecId, RecordData, RecordsData, throwError, VIEW_MASK } from "../www/client-core/src/bs-utils";
import { UserSession } from './auth';
import { ADMIN_USER_SESSION, filtersById, getNodeDesc, getNodeEventHandler, ServerSideEventHandlersNames } from './describe-node';
import { mysqlExec } from "./mysql-connection";

const isASCII = (str) => {
	return /^[\x00-\x7F]*$/.test(str);
}

const EMPTY_FILTERS = {};

const EMPTY_RATING = { all: 0 };
/*
* @param filterFields	array with [field_name: string]=>value filters. Only numeric fields is support
*									special fields:
										['p'] = 5; - page of records to retrieve; * - retrieve all
										['n'] = 5; - number of records per page;
										['excludeIDs'] = [3,5,64,5,45]; - exclude records with these IDs;
										['onlyIDs'] = '3,5,64,5,45'; - filter by IDs;
										['o'] = field_name for order;
										['r'] = reverse order;
										['filterId'] = filter's id to be applied on result;
*/
async function getRecords(nodeId: RecId, viewMask: VIEW_MASK, recId: RecId, userSession?: UserSession): Promise<RecordData>;
async function getRecords(nodeId: RecId, viewMask: VIEW_MASK, recId: null | RecId[], userSession?: UserSession, filterFields?: any, search?: string): Promise<RecordsData>;
async function getRecords(nodeId: RecId, viewMask: VIEW_MASK, recId: null | RecId | RecId[] = null, userSession: UserSession = ADMIN_USER_SESSION, filterFields: any = EMPTY_FILTERS, search?: string): Promise<RecordData | RecordsData> {

	let node = getNodeDesc(nodeId, userSession);

	if(!node.store_forms) {
		return null;
	}

	let singleSelectionById = (typeof recId === 'number');

	let selQ = ['SELECT '];

	let table_name = node.table_name;
	let tables = table_name;


	//=========================================================
	//===== fields list =======================================
	//=========================================================
	for(let f of node.fields) {
		if(f.store_in_db && (f.show & viewMask)) {

			const field_type = f.field_type;
			const field_name = f.field_name;
			const select_field_name = f.select_field_name;


			if(field_type === FIELD_TYPE.RATING) {
				selQ.push(table_name, '.rates_1,', table_name, '.rates_2,', table_name, '.rates_3,', table_name, '.rates_4,', table_name, '.rates_5,(SELECT rate FROM ', table_name, '_rates WHERE _recID=', table_name, '.id AND _users_id=', userSession.id as unknown as string, ' LIMIT 1) AS rates_y');
			} else if(field_type === FIELD_TYPE.LOOKUP_NtoM) {//n2m
				let tblTmpName = 't' + f.id;
				if(f.lookup_icon) {
					selQ.push("(SELECT GROUP_CONCAT(CONCAT(", tblTmpName, ".id,'␞', ", tblTmpName, ".name,'␞',", f.lookup_icon, ") SEPARATOR '␞') AS v FROM ", select_field_name, " AS ", tblTmpName, ", ", field_name, " WHERE ", field_name, ".", select_field_name, "Id=", tblTmpName, ".id AND ", field_name, ".", table_name, "Id=", table_name, ".id ORDER BY ", field_name, ".id) AS \"", field_name, "\"");
				} else {
					selQ.push("(SELECT GROUP_CONCAT(CONCAT(", tblTmpName, ".id,'␞', ", tblTmpName, ".name) SEPARATOR '␞') AS v FROM ", select_field_name, " AS ", tblTmpName, ", ", field_name, " WHERE ", field_name, ".", select_field_name, "Id=", tblTmpName, ".id AND ", field_name, ".", table_name, "Id=", table_name, ".id ORDER BY ", field_name, ".id) AS \"", field_name, "\"");
				}
			} else if(field_type === FIELD_TYPE.LOOKUP) {//n21
				if(f.lookup_icon) {
					selQ.push("(SELECT CONCAT(id,'␞',name,'␞',", f.lookup_icon, ") FROM ", select_field_name, " AS t", field_name, " WHERE ", table_name, ".", field_name, "=t", field_name, ".id LIMIT 1) AS \"", field_name, "\"");
				} else {
					selQ.push("(SELECT CONCAT(id,'␞',name) FROM ", select_field_name + " AS t", field_name, " WHERE ", table_name, ".", field_name, "=t", field_name, ".id LIMIT 1) AS \"", field_name, "\"");
				}
			} else if(select_field_name) {
				selQ.push('(', select_field_name.replaceAll('@userId', userSession.id.toString()), ')AS \"', field_name, '\"');
			} else if((viewMask === VIEW_MASK.LIST || viewMask === VIEW_MASK.CUSTOM_LIST) && (field_type === FIELD_TYPE.TEXT || field_type === FIELD_TYPE.RICH_EDITOR) && f.max_length > 500) {
				selQ.push('SUBSTRING(', table_name, '.', field_name, ',1,500) AS \"', field_name, '\"');
			} else {
				selQ.push(table_name, '.', field_name);
			}
			selQ.push(', ');
		}
	}

	selQ.push(table_name, '.id');

	selQ.push(',', table_name, '._organization_id AS creator_org,', table_name, '._users_id AS creator_user');
	if(node.draftable) {
		selQ.push(',', table_name, '.status');
	}


	//=========================================================
	//===== filters ===========================================
	//=========================================================

	const filterId = filterFields.filterId;
	let filter: FilterDesc;

	if(node.filters) {
		/// #if DEBUG
		const availableFilters = Object.keys(node.filters).join();
		assert(!filterId || node.filters[filterId],
			"Unknown filterId " + filterId + ' for node ' + node.table_name +
			(availableFilters ? ('. Available values is: ' + availableFilters) : ' node has no filters.'));
		/// #endif
		if(filterId && node.filters[filterId]) { //user selected filter
			filter = filtersById.get(filterId);
		} else if(node.default_filter_id) {
			filter = filtersById.get(node.default_filter_id);
		}
	}

	let hiPriorityFilter;
	let wheres;
	let ordering;

	if(singleSelectionById) {
		wheres = [" AND ", table_name, ".id=", recId];
		ordering = [' LIMIT 1'];
	} else {

		if(Array.isArray(recId)) {
			wheres = [" AND ", table_name, ".id IN (", recId.join(), ")"];
		} else {
			wheres = [''];
		}

		//search ----------------------------

		let searchWHERE;
		let sortFieldName;
		let field_name;

		const isAsciiSearch = search && isASCII(search);

		if(filterFields.o) {
			sortFieldName = filterFields.o;
		}

		for(let f of node.fields) {
			field_name = f.field_name;

			if(field_name === sortFieldName) {
				if(!f.for_search) {
					sortFieldName = undefined;
					/// #if DEBUG
					throwError("Tried to sort by un-indexed field: " + field_name);
					/// #endif
				}
			}


			if(search && f.for_search) {
				if(isAsciiSearch || f.field_type === FIELD_TYPE.TEXT) {
					if(!searchWHERE) {
						searchWHERE = [];
					} else {
						searchWHERE.push(' OR ');
					}
					searchWHERE.push(table_name, '.', field_name, " LIKE '%", search, "%' ");
				}
			}

			if(filterFields.hasOwnProperty(field_name)) {
				if(f.for_search) {
					const fltVal = filterFields[field_name];
					if(f.field_type === FIELD_TYPE.TEXT) {
						wheres.push(" AND(LOWER(\"", table_name, "\".\"", field_name, "\")=LOWER('", fltVal, '\'))');
					} else {
						wheres.push(" AND(\"", table_name, "\".\"", field_name, "\"=", fltVal, ')');
					}
				} else {
					throwError("Attempt to filter records by un-indexed field " + field_name);
				}
			}
		}


		if(searchWHERE) {
			wheres.push(" AND (");
			wheres.push.apply(wheres, searchWHERE);
			wheres.push(") ");
		}



		if(filterFields.excludeIDs) {
			assert(filterFields.excludeIDs.length > 0, "Empty array for 'excludeIDs' received.");
			wheres.push('AND(', table_name, '.id NOT IN (', filterFields.excludeIDs.join(), '))');
		}
		if(filterFields.onlyIDs) {
			wheres.push('AND(', table_name, '.id IN (', filterFields.onlyIDs, '))');
		}

		if(filter) {
			let fw = filter['filter'];
			if(fw) {
				if(fw.indexOf('@') >= 0) {
					fw = fw.replaceAll('@userId', userSession.id);
					fw = fw.replaceAll('@orgId', userSession.orgId);
					if(fw.indexOf('@') >= 0) {
						for(let k in filterFields) {
							fw.replaceAll('@' + k, filterFields[k]);
						}
					}
				}
				if(filter.hi_priority) {
					hiPriorityFilter = ['(', fw, ')AND '];
				} else {
					wheres.push(' AND (', fw, ')');
				}
			}

			if(filter.view) {
				tables = filter.view;
			}

			if(filter.fields) {
				selQ.push(', ', filter.fields);
			}
		}

		ordering = [' ORDER BY ', table_name, '.\"', sortFieldName || node.sortFieldName, '\"'];
		if(Boolean(filterFields.r) !== Boolean(node.reverse)) {
			ordering.push(' DESC');
		}
		let rec_per_page;
		if(filterFields.n) {
			rec_per_page = filterFields.n;
		} else {
			rec_per_page = node.rec_per_page;
		}

		if(filterFields.p) {
			if(filterFields.p !== '*') {
				assert(typeof (filterFields.p) === 'number', 'filterFields.p expected as a number');
				ordering.push("OFFSET ", filterFields.p * rec_per_page, " LIMIT ", rec_per_page);
			}
		} else {
			ordering.push(" LIMIT ", rec_per_page);
		}
	}

	const wheresBegin = [' FROM ', tables, ' WHERE '];
	if(hiPriorityFilter) {
		wheresBegin.push.apply(wheresBegin, hiPriorityFilter);
	}


	let privileges = node.privileges;
	if(userSession) {

		if((privileges & (PRIVILEGES_MASK.EDIT_OWN | PRIVILEGES_MASK.EDIT_ORG | PRIVILEGES_MASK.EDIT_ALL | PRIVILEGES_MASK.PUBLISH)) !== 0) {
			wheresBegin.push("(", table_name, ".status > 0)");
		} else {
			wheresBegin.push("(", table_name, ".status = 1)");
		}

		if((privileges & PRIVILEGES_MASK.VIEW_ALL) || (filter && filter.hi_priority)) {

		} else if((privileges & PRIVILEGES_MASK.VIEW_ORG) && (userSession.orgId !== 0)) {
			wheresBegin.push(" AND (", table_name, "._organization_id=", userSession.orgId as unknown as string, ')');
		} else if(privileges & PRIVILEGES_MASK.VIEW_OWN) {
			wheresBegin.push(" AND (", table_name, "._users_id=", userSession.id as unknown as string, ')');
		} else {
			throwError('Access denied 3.');
		}
	} else {
		wheresBegin.push('1');
	}

	selQ.push.apply(selQ, wheresBegin);
	selQ.push.apply(selQ, wheres);
	selQ.push.apply(selQ, ordering);

	let items: RecordData[] = await mysqlExec(selQ.join('')) as RecordData[];

	for(let pag of items) {

		if(viewMask) {
			if(privileges & PRIVILEGES_MASK.EDIT_ALL) {
				pag.isE = 1;
			} else if((privileges & PRIVILEGES_MASK.EDIT_ORG) && (userSession.orgId !== 0) && (pag.creatorORG === userSession.orgId)) {
				pag.isE = 1;
			} else if((privileges & PRIVILEGES_MASK.EDIT_OWN) && (pag.creatorUSER === userSession.id)) {
				pag.isE = 1;
			}

			if(pag.isE) {
				if(privileges & PRIVILEGES_MASK.DELETE) {
					pag.isD = 1;
				}
				if(node.draftable && (privileges & PRIVILEGES_MASK.PUBLISH)) {
					pag.isP = 1;
				}
			} else {
				if(viewMask & 1) {
					throwError('Access to view editable fields denied.');
				}
			}

			for(let f of node.fields) {
				if(f.store_in_db && (f.show & viewMask)) {
					const field_type = f.field_type;
					const field_name = f.field_name;
					if(field_type === FIELD_TYPE.LOOKUP_NtoM || field_type === FIELD_TYPE.LOOKUP_1toN) { //n2m,12n
						if(pag[field_name]) {
							let a = pag[field_name].split('␞');
							let val = [];
							let i = 1;
							let l = a.length;
							while(i < l) {
								if(f.lookup_icon) {
									val.push({ id: parseInt(a[i - 1]), name: a[i], icon: a[i + 1] });
									i += 3;
								} else {
									val.push({ id: parseInt(a[i - 1]), name: a[i] });
									i += 2;
								}
							}
							pag[field_name] = val;
						}
					} else if(field_type === FIELD_TYPE.LOOKUP) { //n21
						if(pag[field_name]) {
							let a = pag[field_name].split('␞');
							if(f.lookup_icon) {
								pag[field_name] = { id: parseInt(a[0]), name: a[1], icon: a[2] };
							} else {
								pag[field_name] = { id: parseInt(a[0]), name: a[1] };
							}
						} else {
							pag[field_name] = { id: 0, name: 'deleted record.' };
						}
					} else if(field_type === FIELD_TYPE.RATING) {
						let r1 = pag.rates_1;
						let r2 = pag.rates_2;
						let r3 = pag.rates_3;
						let r4 = pag.rates_4;
						let r5 = pag.rates_5;

						let all = (r1 + r2 + r3 + r4 + r5);
						if(all) {
							pag[field_name] = {
								all,
								rate: ((r1 + (r2 * 2) + (r3 * 3) + (r4 * 4) + (r5 * 5)) / all),
								your: pag.rates_y
							};
						} else {
							pag[field_name] = EMPTY_RATING;
						}
						delete pag.rates_1;
						delete pag.rates_2;
						delete pag.rates_3;
						delete pag.rates_4;
						delete pag.rates_5;
						delete pag.rates_y;
					}
				}
			}
		}
	}

	if(!singleSelectionById) {
		const countQ = ['SELECT COUNT(*)'];
		countQ.push.apply(countQ, wheresBegin);
		countQ.push.apply(countQ, wheres);
		let total = await mysqlExec(countQ.join(''));
		return { items, total: parseInt(total[0].count) };
	} else {
		if(items.length) {
			return items[0];
		} else {
			/// #if DEBUG
			throwError("Record not found. nodeId:" + nodeId + ", viewMask: " + viewMask + ", recId: " + recId);
			/// #endif
			throwError('Record not found.');
		}
	}
}

async function deleteRecord(nodeId, recId, userSession = ADMIN_USER_SESSION) {
	const node = getNodeDesc(nodeId, userSession);

	const recordData = await getRecords(nodeId, 4, recId, userSession);
	if(!recordData.isD) {
		throwError('Deletion access is denied');
	}

	await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.beforeDelete, recordData, userSession);

	await mysqlExec("UPDATE " + node.table_name + " SET status=0 WHERE id=" + recId + " LIMIT 1");

	await getNodeEventHandler(nodeId, ServerSideEventHandlersNames.afterDelete, recordData, userSession);

	return 1;
}

export { deleteRecord, getRecords };
