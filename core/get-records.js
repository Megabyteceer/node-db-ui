"use strict";
const {getNodeDesc, getEventHandler, ADMIN_USER_SESSION} = require('./desc-node.js');
const {mysqlExec} = require("./mysql-connection");

const EMPTY_RATING = {all: 0};
/*
* @param nodeId
* @param viewMask		bitMask for fields. 1-fields for EDIT/CREATE view; 2-fields for LIST view; 4-fields for VIEW view; 8-fields for REFERENCE/LOOKUP view; 16-custom list fields
* @param recId
* @param ignorePrevs	select data ignore current user's privileges
* @param filterFields	array with fieldname=>value filters. Only numeric fields is support
*									special fields:
										['p'] = 5; - page of records to retrevie;
										['n'] = 5; - number of records per page;
										['exludeIDs'] = [3,5,64,5,45]; - exclude records with these IDs;
										['onlyIDs'] = '3,5,64,5,45'; - filter by IDs;
										['o'] = fieldName for order;
										['r'] = reverse order;
										['flt_id'] = filter's id to be applied on result;
* @param search			string to full text search
*
*/

async function getRecords(nodeId, viewMask, recId, userSession = ADMIN_USER_SESSION, filterFields = undefined, search = undefined) {

	let node = getNodeDesc(nodeId, userSession);

	if(!node.isDoc) {
		throw new Error("nodeId " + nodeId + " is not a document.");
	}

	if(node.staticLink) {
		throw new Error("nodeId " + nodeId + " is a static link.");
	}

	let singleSelectionById = recId && (typeof (recId) === 'number');

	let selQ = ['SELECT '];

	let tableName = node.tableName;
	let tables = tableName;


	//=========================================================
	//===== fields list =======================================
	//=========================================================
	for(let f of node.fields) {
		if(!f.nostore && (f.show & viewMask)) {

			const fieldType = f.fieldType;
			const fieldName = f.fieldName;
			const selectFieldName = f.selectFieldName;


			if(fieldType === FIELD_16_RATING) {
				selQ.push(tableName, '.rates_1,', tableName, '.rates_2,', tableName, '.rates_3,', tableName, '.rates_4,', tableName, '.rates_5,(SELECT rate FROM ', tableName, '_rates WHERE _recID=', tableName, '.id AND _usersID=', userSession.id, ' LIMIT 1) AS rates_y');
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
				selQ.push('(', selectFieldName.replaceAll('@userid', userSession.id), ')AS `', fieldName, '`');
			} else if((viewMask === 2 || viewMask === 16) && (fieldType === FIELD_1_TEXT || fieldType === FIELD_19_RICHEDITOR) && f.maxLen > 500) {
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

		if(recId) {
			wheres = [" AND ", tableName, ".id IN (", recId.join(), ")"];
		} else {
			wheres = [''];
		}

		//search ----------------------------

		let searchWHERE;
		let sortFieldName;
		let fieldName;

		if(filterFields && filterFields.o) {
			sortFieldName = filterFields.o;

		}

		for(let f of node.fields) {
			fieldName = f.fieldName;

			if(fieldName === sortFieldName) {
				if(!f.forSearch) {
					sortFieldName = undefined;
					/// #if DEBUG
					throw new Error("Tried to sort by unindexed field: " + fieldName);
					/// #endif
				}
			}


			if(search && f.forSearch) {
				if(f.fieldType === FIELD_1_TEXT) {
					if(!searchWHERE) {
						searchWHERE = [];
					} else {
						searchWHERE.push(' OR ');
					}
					searchWHERE.push(tableName, '.', fieldName, " LIKE '%", search, "%' ");
				}
			}

			if(filterFields && filterFields[fieldName]) {
				if(f.forSearch) {
					const fltVal = filterFields[fieldName];
					if(f.fieldType === FIELD_1_TEXT) {
						wheres.push(" AND(LOWER(`", tableName, "`.`", fieldName, "`)=LOWER('", fltVal, '\'))');
					} else {
						wheres.push(" AND(`", tableName, "`.`", fieldName, "`=", fltVal, ')');
					}
				} else {
					throw new Error("Attempt to filter records by unindexed field " + fieldName);
				}
			}
		}


		if(searchWHERE) {
			wheres.push(" AND (");
			wheres.push.apply(wheres, searchWHERE);
			wheres.push(") ");
		}



		if(filterFields.exludeIDs) {
			assert(filterFields.exludeIDs.length > 0, "Empty array for 'exludeIDs' received.");
			wheres.push('AND(', tableName, '.id NOT IN (', filterFields.exludeIDs.join(), '))');
		}
		if(filterFields.onlyIDs) {
			wheres.push('AND(', tableName, '.id IN (', filterFields.onlyIDs, '))');
		}

		const filterId = filterFields.flt_id;
		let filter;

		if(filterId && node.filters[filterId]) { //user selected filter
			filter = node.filters[filterId];
		} else {
			filter = node.defaultFilterId;
		}


		if(filter) {
			let fw = filter['filter'];
			if(fw) {


				if(fw.indexOf('@') >= 0) {
					fw = fs.replaceAll('@userid', userSession.id);
					fw = fs.replaceAll('@orgid', userSession.orgId);
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
		if(Boolean(filterFields.r) != node.reverse) {
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


	let prevs = node.prevs;
	if(userSession) {

		if((prevs & (PREVS_EDIT_OWN | PREVS_EDIT_ORG | PREVS_EDIT_ALL | PREVS_PUBLISH)) != 0) {
			wheresBegin.push("(", tableName, ".status > 0)");
		} else {
			wheresBegin.push("(", tableName, ".status = 1)");
		}

		if(prevs & PREVS_VIEW_ALL) {

		} else if((prevs & PREVS_VIEW_ORG) && (userSession.orgId !== 0)) {
			wheresBegin.push(" AND (", tableName, "._organID=", userSession.orgId, ')');
		} else if(prevs & PREVS_VIEW_OWN) {
			if(tableName !== '_messages') {
				wheresBegin.push(" AND (", tableName, "._usersID=", userSession.id, ')');
			} else {
				wheresBegin.push(" AND ((", tableName, "._usersID=", userSession.id, ")OR(", tableName, "._receiverID=", userSession.id, '))');
			}
		} else {
			throw new Error('Access denied 3.');
		}
	} else {
		wheresBegin.push('1');
	}

	selQ.push.apply(selQ, wheresBegin);
	selQ.push.apply(selQ, wheres);
	selQ.push.apply(selQ, ordering);

	let items = await mysqlExec(selQ.join(''));

	for(let pag of items) {

		if(viewMask) {
			if(prevs & PREVS_EDIT_ALL) {
				pag.isEd = 1;
			} else if((prevs & PREVS_EDIT_ORG) && (userSession.orgId !== 0) && (pag.creatorORG === userSession.orgId)) {
				pag.isEd = 1;
			} else if((prevs & PREVS_EDIT_OWN) && (pag.creatorUSER === userSession.id)) {
				pag.isEd = 1;
			}

			if(pag.isEd) {
				if(prevs & PREVS_DELETE) {
					pag.isDel = 1;
				}
				if(node.draftable && (prevs & PREVS_PUBLISH)) {
					pag.isPub = 1;
				}
			} else {
				if(viewMask & 1) {
					throw new Error('Access to view editabl fields denied.');
				}
			}

			for(let f of node.fields) {
				if(!f.nostore && (f.show & viewMask)) {
					const fieldType = f.fieldType;
					if(fieldType === FIELD_14_NtoM || fieldType === FIELD_15_1toN) { //n2m,12n
						const fieldName = f.fieldName;
						if(pag[fieldName]) {
							let a = pag[fieldName].split('␞');
							let val = [];
							let i = 1;
							let l = a.length;
							while(i < l) {
								if(f.icon) {
									val.push({id: a[i - 1], name: a[i], icon: a[i + 1]});
									i += 3;
								} else {
									val.push({id: a[i - 1], name: a[i]});
									i += 2;
								}
							}
							pag[fieldName] = val;
						}
					} else if(fieldType === FIELD_7_Nto1) { //n21
						const fieldName = f.fieldName;
						if(pag[fieldName]) {
							let a = pag[fieldName].split('␞');
							if(f.icon) {
								pag[fieldName] = {id: parseInt(a[0]), name: a[1], icon: a[2]};
							} else {
								pag[fieldName] = {id: parseInt(a[0]), name: a[1]};
							}
						} else {
							pag[fieldName] = {id: 0, name: 'deleted record.'};
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
							pag[f.fieldName] = EMPTY_RATING;
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
		return {items, total: total[0]['COUNT(*)']};
	} else {
		if(items.length) {
			return items[0];
		} else {
			/// #if DEBUG
			throw new Error("Record not found. nodeId:" + nodeId + ", viewMask: " + viewMask + ", recId: " + recId);
			/// #endif
			throw new Error('Record not found.');
		}
	}
}

async function deleteRecord(nodeId, recId, userSession = ADMIN_USER_SESSION) {
	const node = getNodeDesc(nodeId, userSession);

	const recordData = await getRecords(nodeId, 4, recId, userSession);
	if(!recordData.isDel) {
		throw new Error('Deletion access is denied');
	}

	let h = getEventHandler(nodeId, 'delete');
	let r = h && h(recordData, userSession);
	if(r && r.then) {
		await r;
	}


	await mysqlExec("UPDATE " + node.tableName + " SET status=0 WHERE id=" + recId + " LIMIT 1");
	return 1;
}

module.exports = {getRecords, deleteRecord};