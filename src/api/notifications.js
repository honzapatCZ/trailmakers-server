var express = require("express");
var db = require("./../db");
var gameServer = require("./gameServer");
var logger = require("./../logger");
var utils = require("./../utils");
var app = express();

var connectionIdToServerId = {}
var connectionUnclaimedNotifs = {}
var connectionAlreadyGreeted = {}

app.post("/notifications/gameservers", (req, res) => {       
	logger.reqInfo(req);
    
    if(!(req.query.id in connectionUnclaimedNotifs)){
        connectionUnclaimedNotifs[req.query.id] = [];
    }
    req.body = JSON.parse(req.body.slice(0, -1));

    if(req.body.type == 6 && connectionAlreadyGreeted[req.query.id] != true){
        connectionUnclaimedNotifs[req.query.id].push({});
        var data = {"hello":"Welcome"};
        var arguments = {"name":"Hello","version":1,"data":JSON.stringify(data).replace(/"/g, String.fromCharCode(92) + ("u") + ("0022"))};
        connectionUnclaimedNotifs[req.query.id].push({"type":1,"target":"notify","arguments":[JSON.stringify(arguments).replace(/"/g, String.fromCharCode(92) + ("u") + ("0022"))]});
        connectionAlreadyGreeted[req.query.id] = true;
    }
    if(req.body.type == 1){   
        logger.success("PlayerJoinNotif");    
        var ownerID = gameServer.GameServer.showInfoAbout(connectionIdToServerId[req.query.id]).requesterId;
        var data = {
            "secretId":"OTg0OWRmMzItODUxNS00OGJiLWIzY2MtYzdjOGIxNGJjZDFiLS01ZWY4Zjk1OTM0MzY5MDAwMDljODE1OTQ=",
            "secret":"rqkv0mRtIQfFpV/u233PsBfHhrosPvCdNjmsh6ouu2c=",
            "profileId":ownerID,
            "updateTicketHref":"https://production.api.playtrailmakers.com/api/servers/"+ connectionIdToServerId[req.query.id]+"/join/"+ ownerID //jeste by tu mnelo bejt /a nejaky id ktery je random generovany, ale ma asi ukazovat na cloveka, netusim
        }
        var arguments = {"name":"PlayerJoinNotification","version":1,"data":JSON.stringify(data).replace(/"/g, String.fromCharCode(92) + ("u") + ("0022"))}; 
        var toAdd = {
            "type":1,
            "target":"notify",
            "arguments":[
               JSON.stringify(arguments).replace(/"/g, String.fromCharCode(92) + ("u") + ("0022"))
            ]
        }         
        connectionUnclaimedNotifs[req.query.id].push(toAdd);
        
    }
    //console.log(connectionUnclaimedNotifs[req.query.id]);

    return res.send("");
});
app.get("/notifications/gameservers", (req, res) => {
	logger.reqInfo(req);

    if(connectionUnclaimedNotifs[req.query.id] != null && connectionUnclaimedNotifs[req.query.id].length > 0){
        
        var messages = connectionUnclaimedNotifs[req.query.id];
        var messageCopy = Object.assign({}, messages[0]);
        messages.shift();
        var response = JSON.stringify(messageCopy).replace(/\\\\u/g, String.fromCharCode(92)+"u")+"";
        console.log(response);
        return res.send(response);
    }
    
    return res.send("");
});


app.post("/notifications/gameservers/negotiate", (req, res) => {
	logger.reqInfo(req);
    
    var connectionId = null;
    while(connectionId == null || connectionId in connectionIdToServerId)
	{
		connectionId = utils.randomStringAsBase64Url(64);	
    }
    connectionIdToServerId[connectionId] = gameServer.GameServer.getServerByUserPass(req.steamID).id;

    var response =  {"negotiateVersion":0,"connectionId":connectionId,"availableTransports":[{"transport":"LongPolling","transferFormats":["Text","Binary"]}]}

    return res.send(JSON.stringify(response));
});

module.exports.app = app;