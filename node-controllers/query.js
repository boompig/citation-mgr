const cruft = require("./pg_cruft.js");

exports.deleteQuery = function (request, response, next, conString) {
    // make sure the id is provided
    if (! request.params.id) {
        response.send({status: "error", msg: "No topic id provided"});
        return console.error("Query ID not provided in request");
    }
    var query = "DELETE FROM queries WHERE id=$1";
    var data = [request.params.id];
    cruft.query(query, data, conString, function (err, result) {
        if (err) {
            return response.send({ status: "error", msg: err.toString() });
        } else {
            console.log("Deleted %d rows", result.rowCount);
            response.send({ status: "success" });
        }
    });
};

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
        var data;
        var query = "INSERT INTO queries (name, sql, username) VALUES ($1, $2, $3)";
        if (request.body.public) {
            console.log("inserting public query");
            data = [request.body.name, request.body.sql, "public"];
        } else {
            data = [request.body.name, request.body.sql, request.body.username];
        }
        // save the query asynchronously in the DB
        cruft.query(query, data, conString, function (err) {
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
        query = "SELECT * FROM queries WHERE username IN ($1, 'public')";
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
