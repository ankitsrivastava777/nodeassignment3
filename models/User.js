var mongoose = require("mongoose");
var { conn } = require("../config/db");

var usersprofile_schema = mongoose.Schema(
  {
    username: {
        type: String,
        required: true,
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
},
  {
    strict: true,
    collection: "user_details",
  }
);

var user = conn.model("user_details", usersprofile_schema);

exports.user = user;
