var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var pg = require("pg");
var conString = "postgres://gru@localhost/citations";

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

/**
 * This endpoint is for getting and setting topics
 * GET - get list of all topics with descriptions
 * POST - add another topic & description pair
 * UPDATE - <unimplemented>
 * PUT - <unimplemeted>
 * DELETE - <unimplemented>
 */
app.get("/topics", function (request, response, next) {
    console.log("hit topics GET endpoint");

    // fetch all the topics from the DB
    pg.connect(conString, function (err, client, done) {
        if (err) {
            return console.error("failed connecting to PG server.");
        }
        client.query("SELECT * FROM topics", function(err, result) {
            done();
            if (err) {
                console.error("Error running query", err);
            }
            console.log("Wrote %d rows out", result.rows.length);
            response.send(result.rows);
            response.end();
        });
    });
});

app.delete("/topics/:id", function (request, response, next) {
    console.log("hit topics DELETE endpoint");
    // make sure the name is provided
    if (! request.params.id) {
        response.send({status: "error", msg: "No topic id provided"});
        console.error("Topic ID not provided in request");
        return;
    }

    pg.connect(conString, function (err, client, done) {
        if (err) {
            return console.error("failed connecting to PG server.");
        }
        client.query(
            "DELETE FROM topics WHERE id=$1",
            [request.params.id],
            function(err, result) {
                done();
                if (err) {
                    console.error("Error running query", err);
                }
                console.log("Deleted %d rows", result.rowCount);
                response.send({status: "success"});
                response.end();
            }
        );
    });
});

app.post("/topics", function (request, response, next) {
    console.log("hit topics POST endpoint");

    if (!request.body.name) {
        response.send({status: "error", msg: "Empty topic name provided"});
        console.error("Empty topic name");
        return;
    }

    pg.connect(conString, function (err, client, done) {
        if (err) {
            response.send({status: "error", msg: "failed to connect to PG server"});
            return console.error("failed connecting to PG server.");
        }
        client.query("INSERT INTO topics (name, description) VALUES ($1, $2)", [request.body.name, request.body.description], function (err, result) {
            done();
            if (err) {
                console.error("Failed running query", err);
            }
            console.log(result);
            response.send({status: "success"});
        });
    });
});

app.post("/refs", function (request, response, next) {
    var insert_query = "INSERT INTO refs (name, first_author, year, topic) VALUES ($1, $2, $3, $4)";
    console.log("hit refs POST endpoint");

    if (!request.body.name) {
        response.send({status: "error", msg: "Empty ref name provided"});
        console.error("Empty ref name");
    }

    pg.connect(conString, function (err, client, done) {
        if (err) {
            response.send({status: "error", msg: "failed to connect to PG server"});
            return console.error("failed connecting to PG server.");
        }
        client.query(
            insert_query,
            [
                request.body.name,
                request.body.first_author,
                request.body.year,
                request.body.topic
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
});

app.listen(8080);

console.log("Node-express app running on port 8080");
