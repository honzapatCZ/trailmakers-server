process.title = "Trailmakers - Community Server";

var express = require("express");
var bodyParser = require("body-parser")
var http = require("http");
var https = require("https");
var app = express();
var fs = require("fs");
var path = require("path");
var db = require("./db");
var logger = require("./logger");

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(bodyParser.text());

app.use(require("./admin/proxy/proxify").app)

app.use("/admin",require("./admin").app)
app.use(require("./playfabapi").app);
app.use(require("./connect").app);
app.use("/api",require("./api"));

app.get("/.well-known/openid-configuration", (req, res) => {
	logger.reqInfo(req);
    return res.send(db.GetTemplateData("openid"));
});
app.all("/*", function (req, res, next) {
	logger.error(req.method + " " + req.originalUrl, req);
	res.status(400);
	return res.send("not implemented yet sorry");
})

var privateKey  = fs.readFileSync(path.join(__dirname, "crt", "sha1.key"));
var certificate = fs.readFileSync(path.join(__dirname, "crt", "sha1.crt"));
var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
 console.log("Server running on http port 80");
});
httpsServer.listen(443, () => {
 console.log("Server running on https port 443");
});
