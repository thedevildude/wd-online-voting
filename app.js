const express = require("express");
const app = express();

app.get("/", (request, response) => {
  response.send("Server is working");
});

module.exports = app;
