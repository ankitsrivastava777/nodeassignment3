var express = require("express");
var mongoose = require("mongoose");
var passwordHash = require("password-hash");
var app = express();
var bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
var cookieParser = require("cookie-parser");
var { auth } = require("../config/auth");
var { conn } = require("../config/db");
var { user, AccessToken, user_address } = require("../models/User");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.json());

app.post("/user/register", async function (req, res) {
  const salt = await bcrypt.genSalt();
  const userPassword = await bcrypt.hash(req.body.password, salt);

  if (req.body.password !== req.body.confirmpassword) {
    res.send("password not match");
  } else {
    const user_post = new user({
      username: req.body.username,
      password: userPassword,
      email: req.body.email,
    });
    user_post.save(function (err, row) {
      if (err) {
        console.log(err);
      } else {
        res.status(200).json({
          message: "saved  successfully",
        });
      }
    });
  }
});

app.post("/user/login", async function (req, res) {
  user.find({ username: req.body.username }, async function (err, results) {
    var pass = results.password;
    var userId = results._id;
    var input_password = pass.toString();
    var user_password = req.body.password;
    var tokenId = userId.toString();
    if (await bcrypt.compare(user_password, input_password)) {
      const pwd = passwordHash.generate(req.body.password);
      AccessToken.findOne({ user_id: userId }, function (err, userDetails) {
        if (userDetails && userDetails._id) {
          res.status(200).json({
            message: "Already login",
          });
        } else {
          var token_save = new AccessToken({
            user_id: userId,
            access_token: pwd,
          });
          token_save.save(function (err) {
            if (err) {
              console.log(err);
              process.exit();
            }
            res.header("token", tokenId);
            res.status(200).json({ token: tokenId });
          });
        }
      });
    } else {
      res.status(500).json({
        message: "No user found",
      });
    }
  });
});

app.get("/user/get", auth, async function (req, res) {
  user_address
    .findOne({ user_id: req.user.user_id })
    .populate("userdata")
    .then((user) => {
      res.json(user);
    });
});

app.put("/user/delete/", auth, async function (req, res) {
  var user_id = req.user.user_id;
  await user.deleteOne({ _id: user_id }, function (err, results) {
    if (err) {
      res.status(501).json({
        message: "no user matched",
      });
    } else {
      res.status(200).json({
        message: "User deleted",
      });
    }
  });
});

app.get("/user/list/:id/:page", function (req, res) {
  page = Number(req.params.page);
  if (req.params.id == 1) {
    skip = 0;
  } else {
    var skip = req.params.id * 10 - 10;
  }
  user
    .find()
    .skip(skip)
    .limit(page)
    .exec(function (err, result) {
      if (err) {
        res.send(err);
      }
      res.send(result);
    });
});

app.post("/user/address", auth, async function (req, res) {
  var userId = req.user.user_id;
  var address = req.body.address;
  var city = req.body.city;
  var state = req.body.state;
  var pin_code = req.body.pin_code;
  var phone_no = req.body.phone_no;
  var address_post = new user_address({
    user_id: userId,
    city: city,
    state: state,
    pin_code: pin_code,
    phone_no: phone_no,
  });
  address_post.save(function (err) {
    if (err) {
      console.log(err);
      process.exit();
    }
    res.status(200).json({
      message: "Address Saved",
    });
  });
});

module.exports = app;
