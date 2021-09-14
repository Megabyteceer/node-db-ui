import { getNodeDesc, getNodeEventHandler, ADMIN_USER_SESSION, ServerSideEventHadlersNames } from './desc-node';
import { mysqlExec, mysqlRowsResult } from "./mysql-connection";
import { ViewMask, throwError, assert, FIELD_16_RATING, FIELD_14_NtoM, FIELD_7_Nto1, FIELD_1_TEXT, PRIVILEGES_PUBLISH, PRIVILEGES_EDIT_ALL, PRIVILEGES_EDIT_ORG, PRIVILEGES_EDIT_OWN, PRIVILEGES_VIEW_ALL, PRIVILEGES_VIEW_ORG, PRIVILEGES_VIEW_OWN, PRIVILEGES_DELETE, FIELD_15_1toN, FIELD_19_RICH_EDITOR, RecordData, RecordsData, RecId } from "../www/js/bs-utils";
import { UserSession } from './auth';

const isASCII = (str) => {
	return /^[\x00-\x7F]*$/.test(str);
}

const EMPTY_FILTERS = {};

const EMPTY_RATING = { all: 0 };
/*
* @param filterFields	array with fieldname=>value filters. Only numeric fields is support
*									special fields:
										['p'] = 5; - page of records to retrieve; * - retrieve all
										['n'] = 5; - number of records per page;
										['excludeIDs'] = [3,5,64,5,45]; - exclude records with these IDs;
										['onlyIDs'] = '3,5,64,5,45'; - filter by IDs;
										['o'] = fieldName for order;
										['r'] = reverse order;
										['filterId'] = filter's id to be applied on result;
*/
async function getRecords(nodeId: RecId, viewMask: ViewMask, recId: RecId, userSession: UserSession): Promise<RecordData>;
async function getRecords(nodeId: RecId, viewMask: ViewMask, recId: null | RecId[], userSession: UserSession, filterFields?: any, search?: string): Promise<RecordsData>;
async function getRecords(nodeId: RecId, viewMask: ViewMask, recId: null | RecId | number[], userSession: UserSession = ADMIN_USER_SESSION, filterFields: any = EMPTY_FILTERS, search?: string): Promise<RecordData | RecordsData> {

	let node = getNodeDesc(nodeId, userSession);

	if(!node.isDoc) {
		throwError("nodeId " + nodeId + " is not a document.");
	}

	if(node.staticLink) {
		return null;
	}

	let singleSelectionById = (typeof recId === 'number');

	let selQ = ['SELECT '];

	let tableName = node.tableName;
	let tables = tableName;


	//=========================================================
	//===== fields list =======================================
	//=========================================================
	for(let f of node.fields) {
		if(!f.noStore && (f.show & viewMask)) {

			const fieldType = f.fieldType;
			const fieldName = f.fieldName;
			const selectFieldName = f.selectFieldName;


			if(fieldType === FIELD_16_RATING) {
				selQ.push(tableName, '.rates_1,', tableName, '.rates_2,', tableName, '.rates_3,', tableName, '.rates_4,', tableName, '.rates_5,(SELECT rate FROM ', tableName, '_rates WHERE _recID=', tableName, '.id AND _usersID=', userSession.id as unknown as string, ' LIMIT 1) AS rates_y');
			} else if(fieldType === FIELD_14_NtoM) {//n2m
				let tblTmpName = 't' + f.id;
				if(f.icon) {
					selQ.push("(SELECT GROUP_CONCAT(CONCAT(", tblTmpName, ".id,'␞', ", tblTmpName, ".name,'␞',", f.icon, ") SEPARATOR '␞') AS v FROM ", selectFieldName, " AS ", tblTmpName, ", ", fieldName, " WHERE ", fieldName, ".", selectFieldName, "id=", tblTmpName, ".id AND ", fieldName, ".", tableName, "id=", tableName, ".id ORDER BY ", fieldName, ".id) AS `", fieldName, "`");
				} else {
					selQ.push("(SELECT GROUP_CONCAT(CONCAT(", tblTmpName, ".id,'␞', ", tblTmpName, ".name) SEPARATOR '␞') AS v FROM ", selectFieldName, " AS ", tblTmpName, ", ", fieldName, " WHERE ", fieldName, ".", selectFieldName, "id=", tblTmpName, ".id AND ", fieldName, ".", tableName, "id=", tableName, ".id ORDER BY ", fieldName, ".id) AS `", fieldName, "`");
				}
			} else if(fieldType === FIELD_7_Nto1) {//n21
				if(f.icon) {
					selQ.push("(SELECT CONCAT(id,'␞',name,'␞',", f.icon, ") FROM ", selectFieldName, " AS t", fieldName, " WHERE ", tableName, ".", fieldName, "=t", fieldName, ".id LIMIT 1) AS `", fieldName, "`");
				} else {
					selQ.push("(SELECT CONCAT(id,'␞',name) FROM ", selectFieldName + " AS t", fieldName, " WHERE ", tableName, ".", fieldName, "=t", fieldName, ".id LIMIT 1) AS `", fieldName, "`");
				}
			} else if(selectFieldName) {
				selQ.push('(', selectFieldName.replaceAll('@userid', userSession.id.toString()), ')AS `', fieldName, '`');
			} else if((viewMask === 2 || viewMask === 16) && (fieldType === FIELD_1_TEXT || fieldType === FIELD_19_RICH_EDITOR) && f.maxLength > 500) {
				selQ.push('SUBSTRING(', tableName, '.', fieldName, ',1,500) AS `', fieldName, '`');
			} else {
				selQ.push(tableName, '.', fieldName);
			}
			selQ.push(', ');
		}
	}

	selQ.push(tableName, '.id');

	selQ.push(',', tableName, '._organID AS creatorORG,', tableName, '._usersID AS creatorUSER');
	if(node.draftable) {
		selQ.push(',', tableName, '.status');
	}


	//=========================================================
	//===== filters ===========================================
	//=========================================================

	let hiPriorityFilter;
	let wheres;
	let ordering;

	if(singleSelectionById) {
		wheres = [" AND ", tableName, ".id=", recId];
		ordering = [' LIMIT 1'];
	} else {

		if(Array.isArray(recId)) {
			wheres = [" AND ", tableName, ".id IN (", recId.join(), ")"];
		} else {
			wheres = [''];
		}

		//search ----------------------------

		let searchWHERE;
		let sortFieldName;
		let fieldName;

		const isAsciiSearch = search && isASCII(search);

		if(filterFields.o) {
			sortFieldName = filterFields.o;
		}

		for(let f of node.fields) {
			fieldName = f.fieldName;

			if(fieldName === sortFieldName) {
				if(!f.forSearch) {
					sortFieldName = undefined;
					/// #if DEBUG
					throwError("Tried to sort by unindexed field: " + fieldName);
					/// #endif
				}
			}


			if(search && f.forSearch) {
				if(isAsciiSearch || f.fieldType === FIELD_1_TEXT) {
					if(!searchWHERE) {
						searchWHERE = [];
					} else {
						searchWHERE.push(' OR ');
					}
					searchWHERE.push(tableName, '.', fieldName, " LIKE '%", search, "%' ");
				}
			}

			if(filterFields.hasOwnProperty(fieldName)) {
				if(f.forSearch) {
					const fltVal = filterFields[fieldName];
					if(f.fieldType === FIELD_1_TEXT) {
						wheres.push(" AND(LOWER(`", tableName, "`.`", fieldName, "`)=LOWER('", fltVal, '\'))');
					} else {
						wheres.push(" AND(`", tableName, "`.`", fieldName, "`=", fltVal, ')');
					}
				} else {
					throwError("Attempt to filter records by unindexed field " + fieldName);
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
			wheres.push('AND(', tableName, '.id NOT IN (', filterFields.excludeIDs.join(), '))');
		}
		if(filterFields.onlyIDs) {
			wheres.push('AND(', tableName, '.id IN (', filterFields.onlyIDs, '))');
		}

		const filterId = filterFields.filterId;
		let filter;


		/// #if DEBUG
		const availableFilters = Object.keys(node.filters).join();
		assert(!filterId || node.filters[filterId],
			"Unknown filterId " + filterId + ' for node ' + node.tableName +
			(availableFilters ? ('. Available values is: ' + availableFilters) : ' node has no filters.'));
		/// #endif

		if(filterId && node.filters[filterId]) { //user selected filter
			filter = node.filters[filterId];
		} else if(node.defaultFilterId) {
			filter = node.filters[node.defaultFilterId];
		}


		if(filter) {
			let fw = filter['filter'];
			if(fw) {
				if(fw.indexOf('@') >= 0) {
					fw = fw.replaceAll('@userid', userSession.id);
					fw = fw.replaceAll('@orgid', userSession.orgId);
					if(fw.indexOf('@') >= 0) {
						for(let k in filterFields) {
							fw.replaceAll('@' + k, filterFields[k]);
						}
					}
				}
				if(filter.hiPriority) {
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

		ordering = [' ORDER BY ', tableName, '.`', sortFieldName || node.sortFieldName, '`'];
		if(Boolean(filterFields.r) !== Boolean(node.reverse)) {
			ordering.push(' DESC');
		}
		let recPerPage;
		if(filterFields.n) {
			recPerPage = filterFields.n;
		} else {
			recPerPage = node.recPerPage;
		}

		if(filterFields.p) {
			if(filterFields.p !== '*') {
				assert(typeof (filterFields.p) === 'number', 'filterFields.p expected as a number');
				ordering.push(" LIMIT ", filterFields.p * recPerPage, ",", recPerPage);
			}
		} else {
			ordering.push(" LIMIT 0 ,", recPerPage);
		}
	}

	const wheresBegin = [' FROM ', tables, ' WHERE '];
	if(hiPriorityFilter) {
		wheresBegin.push(hiPriorityFilter);
	}


	let privileges = node.privileges;
	if(userSession) {

		if((privileges & (PRIVILEGES_EDIT_OWN | PRIVILEGES_EDIT_ORG | PRIVILEGES_EDIT_ALL | PRIVILEGES_PUBLISH)) !== 0) {
			wheresBegin.push("(", tableName, ".status > 0)");
		} else {
			wheresBegin.push("(", tableName, ".status = 1)");
		}

		if(privileges & PRIVILEGES_VIEW_ALL) {

		} else if((privileges & PRIVILEGES_VIEW_ORG) && (userSession.orgId !== 0)) {
			wheresBegin.push(" AND (", tableName, "._organID=", userSession.orgId as unknown as string, ')');
		} else if(privileges & PRIVILEGES_VIEW_OWN) {
			if(tableName !== '_messages') {
				wheresBegin.push(" AND (", tableName, "._usersID=", userSession.id as unknown as string, ')');
			} else {
				wheresBegin.push(" AND ((", tableName, "._usersID=", userSession.id as unknown as string, ")OR(", tableName, "._receiverID=", userSession.id as unknown as string, '))');
			}
		} else {
			throwError('Access denied 3.');
		}
	} else {
		wheresBegin.push('1');
	}

	selQ.push.apply(selQ, wheresBegin);
	selQ.push.apply(selQ, wheres);
	selQ.push.apply(selQ, ordering);

	let items: RecordData[] = await mysqlExec(selQ.join('')) as mysqlRowsResult & RecordData[];

	for(let pag of items) {

		if(viewMask) {
			if(privileges & PRIVILEGES_EDIT_ALL) {
				pag.isE = 1;
			} else if((privileges & PRIVILEGES_EDIT_ORG) && (userSession.orgId !== 0) && (pag.creatorORG === userSession.orgId)) {
				pag.isE = 1;
			} else if((privileges & PRIVILEGES_EDIT_OWN) && (pag.creatorUSER === userSession.id)) {
				pag.isE = 1;
			}

			if(pag.isE) {
				if(privileges & PRIVILEGES_DELETE) {
					pag.isD = 1;
				}
				if(node.draftable && (privileges & PRIVILEGES_PUBLISH)) {
					pag.isP = 1;
				}
			} else {
				if(viewMask & 1) {
					throwError('Access to view editable fields denied.');
				}
			}

			for(let f of node.fields) {
				if(!f.noStore && (f.show & viewMask)) {
					const fieldType = f.fieldType;
					const fieldName = f.fieldName;
					if(fieldType === FIELD_14_NtoM || fieldType === FIELD_15_1toN) { //n2m,12n
						if(pag[fieldName]) {
							let a = pag[fieldName].split('␞');
							let val = [];
							let i = 1;
							let l = a.length;
							while(i < l) {
								if(f.icon) {
									val.push({ id: parseInt(a[i - 1]), name: a[i], icon: a[i + 1] });
									i += 3;
								} else {
									val.push({ id: parseInt(a[i - 1]), name: a[i] });
									i += 2;
								}
							}
							pag[fieldName] = val;
						}
					} else if(fieldType === FIELD_7_Nto1) { //n21
						if(pag[fieldName]) {
							let a = pag[fieldName].split('␞');
							if(f.icon) {
								pag[fieldName] = { id: parseInt(a[0]), name: a[1], icon: a[2] };
							} else {
								pag[fieldName] = { id: parseInt(a[0]), name: a[1] };
							}
						} else {
							pag[fieldName] = { id: 0, name: 'deleted record.' };
						}
					} else if(fieldType === FIELD_16_RATING) {
						let r1 = pag.rates_1;
						let r2 = pag.rates_2;
						let r3 = pag.rates_3;
						let r4 = pag.rates_4;
						let r5 = pag.rates_5;

						let all = (r1 + r2 + r3 + r4 + r5);
						if(all) {
							pag[fieldName] = {
								all,
								rate: ((r1 + (r2 * 2) + (r3 * 3) + (r4 * 4) + (r5 * 5)) / all),
								your: pag.rates_y
							};
						} else {
							pag[fieldName] = EMPTY_RATING;
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
		return { items, total: total[0]['COUNT(*)'] };
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

	await getNodeEventHandler(nodeId, ServerSideEventHadlersNames.beforeDelete, recordData, userSession);

	await mysqlExec("UPDATE " + node.tableName + " SET status=0 WHERE id=" + recId + " LIMIT 1");
	return 1;
}

export { getRecords, deleteRecord };