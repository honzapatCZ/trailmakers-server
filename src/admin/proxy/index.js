const express = require("express");
const nunjucks = require("nunjucks");

const app = express();

const proxy = require("./proxify");

nunjucks.configure(__dirname +"/views",{
    autoescape:true,
    express:app,
    noCache: true,
    watch: true
});

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    return res.render("index");
});
app.get("/:index", (req, res) => {
    return res.json(proxy.getRequestRepsonseCombo(req.params.index));
});

module.exports.app = app;