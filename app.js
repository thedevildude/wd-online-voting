const express = require("express");
const app = express();
const path = require("path");
const csurf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const router = require("./routes");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser("any secret string"));
app.use(csurf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

/* Import all routes from ./routes/index.js */
app.use(router);

module.exports = app;
