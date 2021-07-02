const {setCurrentOrg, setMultiLang, login, resetPassword} = require('./auth.js');
const {getNodeDesc, getNodesTree} = require('./desc-node.js');
const {getRecords, deleteRecord} = require('./get-records.js');
const {submitRecord} = require('./sumbit.js');
const {uploadImage} = require('./upload-image.js');

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
	"api/getMe.php":(reqData, userSession, res) => {
		res(userSession);
	},
	"api/getNodes.php":(reqData, userSession, res) => {
		res(getNodesTree(userSession));
	},
	"api/delete.php":(reqData, userSession, res) => {
		deleteRecord(reqData.nodeId, reqData.recId, userSession).then(res);
	},
	"api/setCurrentOrg.php":(reqData, userSession, res) => {
		setCurrentOrg(reqData.orgId, userSession, true).then(res);
	},
	"api/toggleMultilang.php":(reqData, userSession, res) => {
		setMultiLang(!userSession.langs, userSession).then(res);
	},
	"api/descNode.php":(reqData, userSession, res) => {
		res({data: getNodeDesc(reqData.nodeId, userSession)});
	},
	"api/submit.php":(reqData, userSession, res) => {
		submitRecord(reqData.nodeId, reqData, reqData.recId, userSession).then(res);
	},
	"api/uploadImage.php":(reqData, userSession, res) => {
		uploadImage(reqData, userSession).then(res);
	},
	"login.php":(reqData, userSession, res) => {
		login(reqData.login_username, reqData.login_password).then(res);
	},
	"reset.php":(reqData, userSession, res) => {
		resetPassword(reqData.key).then(res);
	}
};

api['login.php'].allowAnonymousRequest = true;
api['reset.php'].allowAnonymousRequest = true;

module.exports = api;