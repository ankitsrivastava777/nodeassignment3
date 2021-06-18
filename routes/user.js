var express = require("express");
var mongoose = require("mongoose");
var passwordHash = require("password-hash");
var app = express();
var bodyParser = require("body-parser");
var async = require("async");
const bcrypt = require("bcrypt");
var cookieParser = require("cookie-parser");
var { auth } = require("../config/auth");
var { conn } = require("../config/db");
var { user, AccessToken, user_address } = require('../models/User');

app.use(cookieParser());
const saltRounds = 10;
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.json());

app.post("/user/register", async function (req, res) {
    console.log(req.body.username);
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
          console.log("success");
          res.status(200).send("saved succesfully");
        }
      });
    }
  });

app.post("/user/login", async function (req, res) {
    user.find({ username: req.body.username }, async function (err, results) {
        var name = [];
        var pass = [];
        var userId = [];
        async.each(results, function (row, callback) {
            name.push(row.username);
            pass.push(row.password);
            userId.push(row._id);
            callback();
        });
        var name = req.body.username;
        var input_password = pass.toString();
        var user_password = req.body.password;
        var tokenId = userId.toString();
        if (await bcrypt.compare(user_password, input_password)) {
            console.log("login");

            // const salt = await bcrypt.genSalt();
            const pwd = passwordHash.generate(req.body.password);
            console.log(pwd);

            AccessToken.findOne(
                { user_id: userId },
                function (err, userDetails) {
                    if (userDetails && userDetails._id) {
                        console.log("already login");
                        res.send("already login");
                    } else {
                        var token_post = new AccessToken({
                            user_id: userId,
                            access_token: pwd,
                        });

                        token_post.save(function (err) {
                            if (err) {
                                console.log(err);
                                process.exit();
                            }
                            console.log("Token Saved");
                            res.header("token", tokenId);
                            res.status(200).json({ token: tokenId });
                        });
                    }
                }
            );
        } else {
            res.status(500).send("no user found");
        }
    });
});

app.get("/user/get", auth, async function (req, res) {
    user_address
    .findOne({user_id: req.user.user_id })
    .populate("userdata")
    .then(user => {
       res.json(user); 
    });
});

app.put("/user/delete/", auth, async function (req, res) {
    var user_id = req.user.user_id;
    await user.deleteOne({ _id: user_id }, function (err, results) {
        if (err) {
            res.status(501).send("no user mathch");
        } else {
            console.log(results);
            res.status(200).send("user deleted");
        }
    });
});

app.get("/user/list/:id", async function (req, res) {
    if (req.params.id == 1) {
        skip = 0;
    } else {
        var skip = req.params.id * 10;
    }
    console.log(skip);
    user.find()
        .skip(skip)
        .limit(5)
        .exec(function (err, result) {
            if (err) {
                res.send(err);
            }
            console.log(result);
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
console.log(req.body.address);
    var address_post = new user_address({
        user_id: userId,
        city: city,
        state: state,
        pin_code: pin_code,
        phone_no: phone_no
    });
    address_post.save(function (err) {
        if (err) {
            console.log(err);
            process.exit();
        }
        console.log("address Saved");
        res.status(200).json({
            message: "Address Saved",
        });
    });
});

module.exports = app;
