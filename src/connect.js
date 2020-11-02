var express = require("express");
var authMid = require("./authMid");
var config = require("./config.json");
const logger = require("./logger");

const SteamAPI = require("steamapi");
const steam = new SteamAPI(config.steamApiKey);

const {Profile} = require("./api/profile.js");

var app = express();

class Token{
	constructor(sID, ip, steamAuthed = false) {
		var authToken = authMid.CreateAuthToken(sID, ip, steamAuthed);
		
		this.access_token = authToken != "unassociated" ? authToken : "error";
		this.expires_in = 43200;
		this.token_type = "Bearer";
		this.scope = "api1";
		this.profile = new Profile(sID);
	}
}
class ServerToken{
	constructor(userPass) {
		var authToken = authMid.CreateServerAuthToken(userPass);
		
		this.access_token = authToken != "unassociated" ? authToken : "error";
		this.expires_in = 43200;
		this.token_type = "Bearer";
		this.scope = "service";
	}
}

app.post("/connect/token", (req, res) => {
	logger.reqInfo(req);

	ip = req.connection.remoteAddress;
	
	if(req.body.grant_type == "serviceuserpass"){
		if(req.body.token != null){
			userPass = Buffer.from(req.body.token, "base64").toString("ascii");
			logger.info(ip + "tried to atuh prob for server with " + userPass);
			return res.send("\n"+JSON.stringify(new ServerToken(userPass)));
		}
		res.status(401);
		return res.send("");
	}
	
	sID = req.body.tm_uid;
	
	if(sID != null)
	{	
		logger.info("	directly supplied its steamID: " + sID);
		return res.send("\n"+JSON.stringify(new Token(sID, ip)));
	}
	else{
		steamAuthToken = req.body.token;

		steam.get("/ISteamUserAuth/AuthenticateUserTicket/v1/?appid="+ config.steamAppIDToCheck +"&ticket=" + steamAuthToken).then(summary => {
			if(summary.response && summary.response.params && summary.response.params.result && summary.response.params.result == "OK"){
				sID = summary.response.params.steamid;
				logger.success("	authed with steam and got steamID: " + sID);
				return res.send("\n"+JSON.stringify(new Token(sID, ip, true)));
			}
			else{
				logger.error("	did not provide valid auth token or direct steamID");
				res.status(401);
				return res.send("");
			}
		}).catch((error) => {
			logger.error(error);
		  });		
	}
});/*
app.get("/connect/token", (req, res) => {
	sID = req.query.tm_uid;
	ip = req.connection.remoteAddress;
	if(sID == null)
	{
		console.log("steamId not supplied when loggin in, abort");
		return res.send("error");
	}
	
	console.log(ip + " wanted post token with" + sID);
    return res.send("\n"+JSON.stringify(new Token(sID, ip)));
});
*/
module.exports = {
	app,
	Token,
	ServerToken
}