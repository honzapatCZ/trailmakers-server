var express = require("express");
var db = require("./../db");
var authMid = require("./../authMid");
var logger = require("./../logger");

var app = express.Router();

app.all("/*", function (req, res, next) {
	if(req.headers && req.headers.authorization){
		parts = req.headers.authorization.split(" ");
		if(parts.length === 2 && parts[0] == "Bearer"){
			token = parts[1];
			var authorized = authMid.Authorized(token);
			if(authorized != false){
				req.steamID = authorized;
				return next();
			}
		}
	}
	
	logger.error(req.method + " " + req.path + " ...not authorized", req);
	res.status(401);
    return res.send("");
})


app.get("/", (req, res) => {
	logger.reqInfo(req);
	res.send(JSON.stringify(db.GetTemplateData("apiRes")));
});

app.get("/settings", (req, res) => {	
	logger.reqInfo(req);
    var settRes = {
		"leaderboardCacheTime": 300.0
	  }
	res.send(JSON.stringify(settRes));
});

app.use(require("./profile").app);
app.use(require("./bucketList").app);
app.use(require("./rewards").app);
app.use(require("./gameServer").app);
app.use(require("./notifications").app);

module.exports = app;