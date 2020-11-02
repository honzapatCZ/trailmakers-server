var express = require("express");
var logger = require("./../logger");
var app = express();

class Rewards{
	constructor(sID){		
		var blist = {
            "items" : []
        }
	}
}
app.get("/profiles/:steamID/rewards", (req, res) => {
	logger.reqInfo(req);

	sID = req.params.steamID;
	if(sID != req.steamID){
		logger.error(req.method + " " + req.path + " ...not authorized", req);
		res.status(401);
		return res.send("");
	}
    return res.send(JSON.stringify(new Rewards(sID)));
});

module.exports.app = app;
module.exports.Rewards = Rewards;