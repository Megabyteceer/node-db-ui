const {setCurrentOrg, setMultiLang} = require('./auth.js');
const {getNodeDesc, getNodesTree} = require('./desc-node.js');
const {getRecords, deleteRecord} = require('./get-records.js');
const {submitRecord} = require('./sumbit.js');


const api = {
	"api/":(reqData, userSession, res) => {
		getRecords(reqData.nodeId, reqData.viewFields, reqData.recId, userSession, reqData, reqData.s).then((data) => {
			let ret = {data};
			if(reqData.descNode) {
				ret.node = getNodeDesc(reqData.nodeId, userSession);
			}
			res(ret);
		});
	},
	"api/getMe.php":(reqData, useruserSession, res) => {
		res(userSession);
	},
	"api/getNodes.php":(reqData, userSession, res) => {
		res(getNodesTree(userSession));
	},
	"api/delete.php":(reqData, userSession, res) => {
		deleteRecord(reqData.nodeId, reqData.recId, userSession).then(res);
	},
	"api/setCurrentOrg.php":(reqData, userSession, res) => {
		setCurrentOrg(reqData.nodeId, reqData.recId, userSession).then(res);
	},
	"api/toggleMultilang.php":(reqData, userSession, res) => {
		setMultiLang(!userSession.langs, userSession).then(res);
	},
	"api/descNode.php":(reqData, userSession, res) => {
		getNodeDesc(reqData.nodeId, userSession).then((data) => {
			res({data});
		});
	},
	"api/submit.php":(reqData, userSession, res) => {
		submitRecord(reqData.nodeId, reqData, reqData.recId, userSession).then(res);
	},
	"api/uploadImage.php":(reqData, userSession, res) => {
		res(newId);
	}
};


module.exports = api;