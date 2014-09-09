var pg = require("pg");
var cruft = require("./pg_cruft.js");

/*
 * conString is the postgres connection string
 */
exports.getSections = function (request, response, next, conString) {
    "use strict";
    var query, data;
    if (request.query.username) {
        query = "SELECT * FROM sections WHERE username=$1";
        data = [request.query.username];
        console.log("Fetching all sections for user %s", request.query.username);
    } else {
        query = "SELECT * FROM sections";
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

exports.deleteSection = function (request, response, next, conString) {
    "use strict";
    // make sure the id is provided
    if (! request.params.id) {
        response.send({status: "error", msg: "No section id provided"});
        return console.error("Section ID not provided in request");
    }

    var query = "DELETE FROM sections WHERE id=$1";
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

exports.addSection = function(request, response, next, conString) {
    "use strict";
    // name must be specified for section
    if (!request.body.name) {
        response.send({status: "error", msg: "Empty section name provided"});
        return console.error("Empty section name");
    } else if (!request.body.username) {
        response.send({status: "error", msg: "username for section not provided"});
        return console.error("username for section not provided");
    }

    var query = "INSERT INTO sections (name, section_number, username) VALUES ($1, $2, $3) RETURNING id";
    var data = [request.body.name, request.body.section_number, request.body.username];
    cruft.query(query, data, conString, function (err, result) {
        if (err) {
            return response.send({ status: "error", msg: err.toString() });
        } else {
            console.log("Inserted with ID", result.rows[0].id);
            response.send({ status: "success", "insert_id": result.rows[0].id });
        }
    });
};
