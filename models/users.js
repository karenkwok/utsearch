/* jshint esversion: 6 */

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;

const User = new Schema({
  username: String,
  password: String,
  email: String,
  tags: [String],
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
