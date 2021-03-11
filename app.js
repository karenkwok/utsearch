/* jshint esversion: 6 */

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

/* code here */

app.use(express.static("build"));

const PORT = process.env.PORT || 5000;

http.createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
