const express = require("express");
const app = express();
var routes = require("./routes");

app.use(express.static("public"));

app.set("view engine", "ejs");

/* -----Routes----- */
app.use(routes);

module.exports = app;
