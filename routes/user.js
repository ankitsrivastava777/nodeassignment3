var express = require("express");
var passwordHash = require("password-hash");
var app = express();
const bcrypt = require("bcrypt");
var { auth } = require("../config/auth");
var { user } = require("../models/User");
var { AccessToken } = require("../models/AccessToken");

app.post("/register", async function (req, res) {
  const salt = await bcrypt.genSalt();
  const userPassword = await bcrypt.hash(req.body.password, salt);

  if (req.body.password !== req.body.confirmpassword) {
    res.status(500).json({
      error: 1,
      message: "password not matched",
      data: null,
    });
  } else {
    const user_post = new user({
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: userPassword,
      email: req.body.email,
    });
    user_post.save(function (err, row) {
      if (err) {
        res.status(500).json({
          error: 1,
          message: err.message,
          data: null,
        });
      } 
      else {
        res.status(200).json({
          error: 0,
          message: "saved successfully",
          data: null,
        });
      }
    });
  }
});

app.post("/login", async function (req, res) {
  user.findOne({ username: req.body.username }, async function (err, results) {
    var pass = results.password.toString();
    var userId = results._id;
    var input_password = pass.toString();
    var user_password = req.body.password;
    var token = userId.toString();
    if (await bcrypt.compare(user_password, input_password)) {
      const pwd = passwordHash.generate(req.body.password);
      AccessToken.findOne({ user_id: userId }, function (err, userToken) {
        if (userToken && userToken._id) {
          res.status(500).json({
            error: 1,
            message: "already login",
            data: token,
          });
        } else {
          var token_save = new AccessToken({
            user_id: userId,
            access_token: pwd,
          });
          token_save.save(function (err) {
            if (err) {
              res.status(500).json({
                error: 1,
                message: "token not saved",
                data: null,
              });
            }
            res.status(200).json({
              error: 0,
              message: "token saved",
              data: token,
            });
          });
        }
      });
    } else {
      res.status(500).json({
        error: 1,
        message: "no user found",
        data: null,
      });
    }
  });
});

app.get("/get", auth, async function (req, res) {
  res.status(200).json({
    error: 0,
    message: "user list",
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

app.put("/delete/", auth, async function (req, res) {
  var user_id = req.user.user_id;
  await user.deleteOne({ _id: user_id });
  res.status(200).json({
    error: 0,
    message: "user deleted",
    data: null,
  });
});

app.get("/list/:limit/:page", function (req, res) {
  pages_number = Number(req.params.page);
  limit = req.params.limit;
  var skip_user_list = limit * pages_number - pages_number;
  user
    .find()
    .skip(skip_user_list)
    .limit(pages_number)
    .exec(function (err, userData) {
      if (err) {
        res.status(500).json({
          message: "no data found",
        });
      }
      res.status(200).json({
        error: 0,
        message: "user list",
        data: userData,
      });
    });
});

app.post("/address", auth, async function (req, res) {
  var userId = req.user.user_id;
  var address = req.body.address;
  var city = req.body.city;
  var state = req.body.state;
  var pin_code = req.body.pin_code;
  var phone_no = req.body.phone_no;
  var user_address = new user_address({
    user_id: userId,
    city: city,
    address:address,
    state: state,
    pin_code: pin_code,
    phone_no: phone_no,
  });
  user_address.save(function (err) {
    if (err) {
      res.status(500).json({
        error: 1,
        message: err.message,
        data: null,
      });
    }
    res.status(200).json({
      error: 0,
      message: "address saved",
      data: null,
    });
  });
});

module.exports = app;
