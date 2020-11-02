var express = require("express");
var db = require("./db");
var logger = require("./logger");

var app = express();

app.post("/Client/LoginWithCustomID", (req, res) => {
	logger.reqInfo(req);
	//console.log((req.body));
	var loginResp = db.GetTemplateData("pfLoginResp");
	loginResp.data.PlayFabId = req.body.CustomId;
	loginResp.data.SessionTicket = loginResp.data.SessionTicket.replace("%fill_steamId%",req.body.CustomId);
    return res.send(loginResp);
});
app.post("/Client/ReportDeviceInfo", (req, res) => {
	logger.reqInfo(req);
    return res.send(db.GetTemplateData("pfDeviceInfoResp"));
});

module.exports.app = app;