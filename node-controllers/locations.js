var pg = require("pg");
var cruft = require("./pg_cruft.js");

exports.addLocation = function(request, response, next, conString) {
    var insert_query = "INSERT INTO locations (name, first_author, year, location, username) VALUES ($1, $2, $3, $4, $5)";

    if (!request.body.name) {
        response.send({status: "error", msg: "Empty location name provided"});
        console.error("Empty location name");
    }

    pg.connect(conString, function (err, client, done) {
        if (err) {
            response.send({status: "error", msg: "failed to connect to PG server"});
            return console.error("failed connecting to PG server.");
        }
        client.query(
            insert_query,
            [
                request.body.ref,
                request.body.first_author,
                request.body.year,
                request.body.location,
                request.body.username
            ], function (err, result) {
                done();
                if (err) {
                    console.error("Failed running query", err);
                }
                console.log(result);
                response.send({status: "success"});
            }
        );
    });
};

exports.getLocations = function (request, response, next, conString) {
    "use strict";
    var query, data;
    if (request.query.username) {
        console.log("Fetching all locations for user %s", request.query.username);
        query = "SELECT * FROM locations WHERE username=$1";
        data = [request.query.username];
    } else {
        query = "SELECT * FROM locations";
        data = [];
    }
    cruft.query(query, data, conString, function (err, result) {
        if (err) {
            return response.send({ status: "error", msg: err.toString() });
        } else {
            console.log("Wrote %d rows out", result.rows.length);
            response.send(result.rows);
        }
    });
};
