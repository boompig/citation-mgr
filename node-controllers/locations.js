var pg = require("pg");
var cruft = require("./pg_cruft.js");

exports.addLocation = function(request, response, next, conString) {
    if (!request.body.username) {
        response.send({status: "error", msg: "username for section not provided"});
        return console.error("username for section not provided");
    }

    var query = "INSERT INTO locations (ref, section, quote, ref_quote, body_of_work, topic, username) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id";
    var data = [request.body.ref, request.body.section, request.body.quote, request.body.ref_quote, request.body.body_of_work, request.body.topic, request.body.username];

    cruft.query(query, data, conString, function(err, result) {
        if (err) {
            console.error("Query error: %s", err);
            return response.send({ status: "error", msg: err.toString() });
        } else {
            console.log("Inserted with ID", result.rows[0].id);
            return response.send({ status: "success", "insert_id": result.rows[0].id });
        }
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

exports.deleteLocation = function (request, response, next, conString) {
    "use strict";
    // make sure the id is provided
    if (! request.params.id) {
        response.send({status: "error", msg: "No location id provided"});
        return console.error("Location ID not provided in request");
    }

    var query = "DELETE FROM locations WHERE id=$1";
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
