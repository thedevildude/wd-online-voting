const express = require("express");
const app = express();
const path = require("path");
const router = require("./routes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

/* Import all routes from ./routes/index.js */
app.use(router);

module.exports = app;
