const express = require("express");
const nunjucks = require("nunjucks");
const logger = require("./../logger");

const app = express();

nunjucks.configure(__dirname +"/views",{
    autoescape:true,
    express:app,
    noCache: true,
    watch: true
});

app.set("views",__dirname +"/views");
app.set('view engine', 'html');

app.use(express.static(__dirname +"/public"))

app.get("/", (req, res) => {
    return res.render("index.html");
});

app.use("/proxy",require("./proxy").app);


module.exports.app = app;