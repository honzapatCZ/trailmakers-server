var express = require("express");

var app = express();

var emitter = require('events').EventEmitter;

var em = new emitter();

var requests = [];
var responses = [];
var previews = [];

app.all("/*", function (req, res, next) {
    requests.push({
        "method" : req.method,
        "path" : req.originalUrl,
        "query" : req.query,
        "body": req.body,
        "auth": req.auth,
        "headers" : req.headers,
        "cookies": req.cookies,
        "ip": req.ip
    });
    responses.push({
        "body" : res.body,
        "headers": res.headers,
        "cookies" : res.cookies,
        "statusCode" : res.statusCode,
        "statusMessage" : res.statusMessage
    });
    previews.push({
        "method" : req.method,
        "path" : req.originalUrl,
        "statusCode" : res.statusCode
    });
    em.emit("entriesAdded",{"method" : req.method,"path" : req.originalUrl,"statusCode" : res.statusCode});
    return next();
})

function getRequests(){
    return previews;
}
function getRequestRepsonseCombo(index){
    return {
        req: requests[index],
        res: responses[index]
    }
}

module.exports = {
    app,
    getRequests,
    getRequestRepsonseCombo,
    em
}