var express = require("express");
var db = require("./../db");
var logger = require("./../logger");

var app = express();

class Profile{
	constructor(sID){		
		Object.assign(this, db.GetPlayerDataTemplated(sID, "profile"));
				
		this.id = sID;
		if(this.name == null)
			this.name = sID;
		this.self.href = "https://production.api.playtrailmakers.com/api/profiles/" + sID;
		this.rewards.href = "https://production.api.playtrailmakers.com/api/profiles/" + sID + "/rewards";
		this.invite.href = "https://production.api.playtrailmakers.com/api/profiles/" + sID + "/invite";
		this.bucketList.href = "https://production.api.playtrailmakers.com/api/profiles/" + sID + "/bucketlist";
		this.gallery.href = "https://production.api.playtrailmakers.com/api/profiles/" + sID + "/gallery";
		this.notifications.href = "https://production.api.playtrailmakers.com/api/notifications/profiles";
	}
}
app.get("/profiles/:steamID", (req, res) => {
	logger.reqInfo(req);

	sID = req.params.steamID;

    return res.send(JSON.stringify(new Profile(sID)));
});
app.patch("/profiles/:steamID", (req, res) => {
	logger.reqInfo(req);

	sID = req.params.steamID;
	if(sID != req.steamID){
		logger.error(req.method + " " + req.path + " ...not authorized", req);
		res.status(401);
		return res.send("");
	}
	
	db.WritePlayerData(sID, "profile", (req.body));
	
    return res.send(JSON.stringify(new Profile(sID)));
});

module.exports.app = app;
module.exports.Profile = Profile;