var mongoose = require("mongoose");
var { conn } = require("../config/db");

var usersprofile_schema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
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
    collection: "newuserdata",
  }
);
var access_token = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      unique: true,
    },
    access_token: {
      type: String,
    },
    expiry: {
      type: Date,
      expires: "60s",
      default: Date.now,
    },
  },
  {
    strict: true,
    collection: "access_token",
  }
);
var user_address = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    pin_code: {
      type: String,
    },
    phone_no: {
      type: String,
    },
    userdata: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "newuserdata",
      },
    ],
  },
  {
    strict: true,
    collection: "user_address",
  }
);
var user = conn.model("newuserdata", usersprofile_schema);
var AccessToken = conn.model("access_roken", access_token);
var user_address = conn.model("User_address", user_address);

exports.user = user;
exports.AccessToken = AccessToken;
exports.user_address = user_address;