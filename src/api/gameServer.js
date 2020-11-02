var express = require("express");
var db = require("./../db");
var utils = require("./../utils");
var logger = require("./../logger");

var app = express();

var servers = {};
var serversUserPass = {};
class GameServer{
    
	constructor(theReqBody, sID){		
        Object.assign(this, db.GetTemplateData("gameServerRes"));
        
        var serverId = null;
		while(serverId == null || serverId in servers)
		{
			serverId = utils.randomStringAsBase64Url(64);	
		}

        this.self.href = this.self.href.replace("%id%",serverId);
        this.join.href = this.join.href.replace("%id%",serverId);
        this.updateXboxSession.href = this.updateXboxSession.href.replace("%id%",serverId);
        this.id = serverId;
        this.requesterId = sID;
        this.settings = theReqBody;
        servers[serverId] = this;

        var username = null;
        var password = null;
        while(username == null || password == null || username+":"+password in serversUserPass)
		{
            username = utils.randomStringAsBase64Url(5);
            password = utils.randomStringAsBase64Url(5);
        }
        serversUserPass[username+":"+password] = this;

        this.serverLoginUsername = username
        this.serverLoginPassword = password;
        
    }
    static showInfoAbout(serverId, sID = null){
        var ser = Object.assign({}, servers[serverId]);
        if(sID == null || sID != ser.requesterId){            
            delete(ser.settings.serverPassword);
            delete(ser.serverLoginPassword);
            delete(ser.serverLoginUsername);
            delete(ser.hidden);
        }
        return ser;
    }
    static getServerByUserPass(userpass, sID = null){
        var ser = Object.assign({}, serversUserPass[userpass]);
        if(sID == null || sID != ser.requesterId){            
            delete(ser.settings.serverPassword);
            delete(ser.serverLoginPassword);
            delete(ser.serverLoginUsername);
            delete(ser.hidden);
        }
        return ser;
    }
    static listAll(sID){
        var response = []

        Object.keys(servers).forEach(function(key) {
            response.push(GameServer.showInfoAbout(key, sID));
          });

        return response;
    }
}
app.get("/servermanagers", (req, res) => {
    logger.reqInfo(req);
    
    var response = {
        "regions" : []
    }
    return res.send(JSON.stringify(response));
});

app.get("/servers", (req, res) => {
    logger.reqInfo(req);
    
    var resp = {
        items : GameServer.listAll(req.steamID)
    }
    return res.send(JSON.stringify(resp));
});
app.post("/servers", (req, res) => {
	logger.reqInfo(req);
    
    newSer = new GameServer(req.body, req.steamID)
    
    return res.send(JSON.stringify(GameServer.showInfoAbout(newSer.id, req.steamID)));
});

app.get("/servers/:serverID", (req, res) => {   
	logger.reqInfo(req);  
    
    return res.send(JSON.stringify(GameServer.showInfoAbout(req.params.serverID, req.steamID)));
});
app.patch("/servers/:serverID", (req, res) => {
    var theServer = servers[req.params.serverID]
    if(req.steamID != theServer.serverLoginUsername + ":" + theServer.serverLoginPassword)
    {   
        logger.error(req.method + " " + req.path + "    unauthorized patch", req);         
        res.status(401);
        return res.send("");
    }

    Object.keys(req.body).forEach((key) => (req.body[key] == null) && delete req.body[key]);

    theServer.status = {...theServer.status, ...req.body.status};
    logger.info(req.method + " " + req.path + " succesfully patched", req); 
    
    return res.send(JSON.stringify(GameServer.showInfoAbout(req.params.serverID)));
});

class PlayerInfo{
    constructor(serverID, ticketID){
        var data = {
            "self": {
              "href": "https://production.api.playtrailmakers.com/api/servers/"+serverID+"/join/"+req.steamID
            },
            "server": {
              "href": "https://production.api.playtrailmakers.com/api/servers/"+serverID+"?ticketId="+req.steamID
            },
            "status": "Requested",
            "secretId": Buffer.from(serverID+"--5ef8f9593436900009c81594", "ascii").toString("base64"),
            "secret": "rqkv0mRtIQfFpV/u233PsBfHhrosPvCdNjmsh6ouu2c="
          }
        Object.assign(this, data);

    }
}

app.post("/servers/:serverID/join", (req, res) => {
	logger.reqInfo(req);

    var theServer = servers[req.params.serverID]

    theServer.hidden = theServer.hidden || {};
    theServer.hidden.playerinfos = theServer.hidden.playerinfos || {};

    theServer.hidden.playerinfos[req.steamID] = theServer.hidden.playerinfos[req.steamID] || PlayerInfo(req.params.serverID, req.steamID); 
  
    return res.send(JSON.stringify(theServer.hidden.playerinfos[req.steamID]));
});
app.get("/servers/:serverID/join/:ticketID", (req, res) => {
	logger.reqInfo(req);

    var theServer = servers[req.params.serverID]

    theServer.hidden = theServer.hidden || {};
    theServer.hidden.playerinfos = theServer.hidden.playerinfos || {};

    theServer.hidden.playerinfos[req.params.ticketID] = theServer.hidden.playerinfos[req.params.ticketID] || PlayerInfo(req.params.serverID, req.params.ticketID); 
    
    
    return res.send(JSON.stringify(theServer.hidden.playerinfos[req.params.ticketID]));
});
app.patch("/servers/:serverID/join/:ticketID", (req, res) => {
    logger.reqInfo(req);
    
    var theServer = servers[req.params.serverID]

    if(req.steamID != theServer.serverLoginUsername + ":" + theServer.serverLoginPassword)
    {   
        logger.error(req.method + " " + req.path + "    unauthorized patch", req);         
        res.status(401);
        return res.send("");
    }

    theServer.hidden = theServer.hidden || {};
    theServer.hidden.playerinfos = theServer.hidden.playerinfos || {};

    theServer.hidden.playerinfos[req.params.ticketID] = theServer.hidden.playerinfos[req.params.ticketID] || PlayerInfo(req.params.serverID, req.params.ticketID);

    theServer.hidden.playerinfos[req.params.ticketID] = {...theServer.hidden.playerinfos[req.params.ticketID], ...req.body.status};
    
    return res.send(JSON.stringify(theServer.hidden.playerinfos[req.params.ticketID]));
});

module.exports.app = app;
module.exports.GameServer= GameServer;