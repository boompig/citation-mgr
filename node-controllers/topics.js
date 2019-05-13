var cruft = require("./pg_cruft.js");

/*
 * conString is the postgres connection string
 */
exports.getTopics = function (request, response, next, conString) {
    "use strict";
    var query, data;
    if (request.query.username) {
        query = "SELECT * FROM topics WHERE username=$1";
        data = [request.query.username];
        console.log("Fetching all topics for user %s", request.query.username);
    } else {
        query = "SELECT * FROM topics";
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

exports.deleteTopic = function (request, response, next, conString) {
    "use strict";
    // make sure the id is provided
    if (! request.params.id) {
        response.send({status: "error", msg: "No topic id provided"});
        return console.error("Topic ID not provided in request");
    }

    var query = "DELETE FROM topics WHERE id=$1";
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

exports.addTopic = function(request, response, next, conString) {
    "use strict";
    // name must be specified for topic
    if (!request.body.name) {
        response.send({status: "error", msg: "Empty topic name provided"});
        return console.error("Empty topic name");
    } else if (!request.body.username) {
        response.send({status: "error", msg: "username for topic not provided"});
        return console.error("username for topic not provided");
    }

    var query = "INSERT INTO topics (name, description, username) VALUES ($1, $2, $3) RETURNING id";
    var data = [request.body.name, request.body.description, request.body.username];
    cruft.query(query, data, conString, function (err, result) {
        if (err) {
            return response.send({ status: "error", msg: err.toString() });
        } else {
            console.log("Inserted with ID", result.rows[0].id);
            response.send({ status: "success", "insert_id": result.rows[0].id });
        }
    });
};
