var pg = require("pg");
var cruft = require("./pg_cruft.js");

/*
 * conString is the postgres connection string
 */
exports.getWorks = function (request, response, next, conString) {
    "use strict";
    var query = "SELECT * FROM bodies_of_work";
    var data = [];
    cruft.query(query, data, conString, function (err, result) {
        if (err) {
            return response.send({ status: "error", msg: err.toString() });
        } else {
            console.log("Wrote %d rows out", result.rows.length);
            response.send(result.rows);
        }
    });
};

exports.deleteWork = function (request, response, next, conString) {
    //TODO not done
};

exports.addWork = function(request, response, next, conString) {
    //TODO not done
};
