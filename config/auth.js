var { AccessToken } = require("../models/AccessToken");

var auth = async function authenticateToken(req, res, next) {
    var user_id = req.headers.token;
    AccessToken.findOne({ user_id: user_id }, function (err, userDetails) {
        if (userDetails && userDetails._id) {
            req.user = userDetails;
            next();
        } else {
            res.status(500).json({
                error: 1,
                message: err,
                data: null
            });
        }
    });
}

exports.auth = auth;