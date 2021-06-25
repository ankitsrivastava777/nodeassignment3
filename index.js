var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(express.json());
app.use(urlencodedParser);

app.use('/user', require('./routes/user'));

var server = app.listen(6200, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});

