var pg = require("pg");
var cruft = require("./pg_cruft.js");

exports.runQuery = function (request, response, next, conString) {
    "use strict";

    if (!request.body.sql) {
        console.error("query not provided");
        return response.send({status: "error", msg: "Query not provided" });
    } else if (!request.body.username) {
        console.error("username not provided");
        return response.send({status: "error", msg: "Username not provided" });
    }
    if (request.body.name) {
        var query = "INSERT INTO queries (name, sql, username) VALUES ($1, $2, $3)";
        var data = [request.body.name, request.body.sql, request.body.username];
        // save the query asynchronously in the DB
        cruft.query(query, data, conString, function (err, result) {
            if (err) {
                return console.error("error running insert query: ", err.toString());
            } else {
                return console.log("Added query to database");
            }
        });
    }

    cruft.query(request.body.sql, [], conString, function (err, result) {
        if (err) {
            console.error(err.toString());
            return response.send({ status: "error", msg: err.toString() });
        } else {
            response.send(result.rows);
        }
    });
};

exports.getQueries = function (request, response, next, conString) {
    "use strict";
    var query, data;
    if (request.query.username) {
        console.log("Getting queries as " + request.query.username);
        query = "SELECT * FROM queries WHERE username=$1";
        data = [request.query.username];
    } else {
        query = "SELECT * FROM queries";
        data = [];
    }
    cruft.query(query, data, conString, function(err, result) {
        "use strict";
        if (err) {
            console.error(err.toString());
            return response.send({status: "error", msg: err.toString()});
        } else {
            console.log("Wrote %d rows out", result.rows.length);
            return response.send(result.rows);
        }
    });
};
