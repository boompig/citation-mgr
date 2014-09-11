var pg = require("pg");
var cruft = require("./pg_cruft.js");

exports.addRef = function(request, response, next, conString) {
    "use strict";
    // name must be specified for ref
    if (!request.body.name) {
        response.send({status: "error", msg: "Empty ref name provided"});
        return console.error("Empty ref name");
    } else if (!request.body.username) {
        response.send({status: "error", msg: "username for ref not provided"});
        return console.error("username for ref not provided");
    }

    var query = "INSERT INTO refs (name, first_author, author_group, year, body_of_work, citation_num, username) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id";
    var data;

    if (request.body.body_of_work) {
        var bow_data = [request.body.body_of_work];
        cruft.query("INSERT INTO bodies_of_work (name) VALUES ($1)", bow_data, conString, function (err, result) {
            if (err) {
                // that's fine, just it's not unique
            }
            cruft.query("SELECT id FROM bodies_of_work WHERE name = $1", [request.body.body_of_work], conString, function(err, result) {
                var body_of_work = result.rows[0].id;

                data = [request.body.name, request.body.first_author, request.body.author_group, request.body.year, body_of_work, request.body.citation_num, request.body.username];
                cruft.query(query, data, conString, function (err, result) {
                    if (err) {
                        console.error("Error when trying to insert into refs: %s", err.toString());
                        return response.send({ status: "error", msg: err.toString() });
                    } else {
                        console.log("Inserted with ID", result.rows[0].id);
                        response.send({ status: "success", "insert_id": result.rows[0].id });
                    }
                });
            });
        });
    } else {
        data = [request.body.name, request.body.first_author, request.body.author_group, request.body.year, request.body.body_of_work, request.body.citation_num, request.body.username];
        cruft.query(query, data, conString, function (err, result) {
            if (err) {
                return response.send({ status: "error", msg: err.toString() });
            } else {
                console.log("Inserted with ID", result.rows[0].id);
                response.send({ status: "success", "insert_id": result.rows[0].id });
            }
        });
    }
};

exports.getRefs = function (request, response, next, conString) {
    "use strict";
    var query, data;
    if (request.query.username) {
        query = "SELECT * FROM refs WHERE username=$1";
        data = [request.query.username];
        console.log("Fetching all refs for user %s", request.query.username);
    } else {
        query = "SELECT * FROM refs";
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

exports.deleteRef = function (request, response, next, conString) {
    "use strict";
    // make sure the id is provided
    if (! request.params.id) {
        response.send({status: "error", msg: "No ref id provided"});
        return console.error("Ref ID not provided in request");
    }

    var query = "DELETE FROM refs WHERE id=$1";
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
