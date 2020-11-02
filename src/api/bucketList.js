var express = require("express");
var db = require("./../db");
var logger = require("./../logger");

var app = express();

class PlBucketList{
	constructor(sID){		
		Object.assign(this, db.GetPlayerDataTemplated(sID, "plBList"));
	}
}

app.get("/bucketList", (req, res) => {

	logger.info(req.method + " " + req.path, req);
    return res.send(JSON.stringify(db.GetTemplateData("bList")));
});

app.get("/profiles/:steamID/bucketList", (req, res) => {
	sID = req.params.steamID;
	if(sID != req.steamID){
		logger.error(req.method + " " + req.path + " ...not authorized", req);
		res.status(401);
		return res.send("");
	}

	logger.info(req.method + " " + req.path, req);
    return res.send(JSON.stringify(new PlBucketList(sID)));
});

module.exports.app = app;
module.exports.PlBucketList = PlBucketList;