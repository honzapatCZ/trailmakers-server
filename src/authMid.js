const logger = require("./logger");
const { ServerToken } = require("./connect");
var utils = require("./utils");

var tokenToSteamId = {};
var { steamIdToIP } = require("./config.json");

var serverTokenToUserPass = {};

function Authorized(token){
	if(token in tokenToSteamId){
		steamID = tokenToSteamId[token];
		if(steamIdToIP[steamID] == ip)
		{
			return steamID;
		}
	}
	if(token in serverTokenToUserPass){
		return serverTokenToUserPass[token];
	}
	return false;
}
function CreateServerAuthToken(userpass){
	newToken = null;
	while(newToken == null || newToken in tokenToSteamId)
	{
		newToken = utils.randomStringAsBase64Url(16);	
	}
	serverTokenToUserPass[newToken] = userpass;
	logger.success("Created new token for " + userpass + " being" +  newToken);
	return newToken;
}
function IsServerToken(token){
	if(token in serverTokenToUserPass){
		return true;
	}
	return false;
}
function CreateAuthToken(sID, ip, steamAuthed){	
	//console.log(ip);
	//console.log(sID);
	if(sID in steamIdToIP == false && steamAuthed){
		steamIdToIP[sID] = ip;
	}

	if(steamIdToIP[sID] == ip)
	{
		newToken = null;
		while(newToken == null || newToken in tokenToSteamId)
		{
			newToken = utils.randomStringAsBase64Url(64);	
		}
		oldToken = Object.keys(tokenToSteamId).find(key => tokenToSteamId[key] === sID);
		if(oldToken != undefined){
			delete tokenToSteamId[oldToken];
		}
		
		tokenToSteamId[newToken] = sID;
		logger.success("Created new token for " + ip + " with steam " + sID + " being" +  newToken);
		//console.log("current array");
		//console.log(tokenToSteamId);
		return(newToken);
	}
	logger.error("Auth for " + ip + " with sID " + sID + "failed");
	return("unassociated");
}


module.exports = {
	Authorized,
	CreateAuthToken,
	CreateServerAuthToken,
	IsServerToken
};