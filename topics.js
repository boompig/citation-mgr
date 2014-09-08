var pg = require("pg");

/*
 * conString is the postgres connection string
 */
exports.getTopics = function (request, response, next, conString) {
    if (request.query.username) {
        console.log("Fetching all topics for user %s", request.query.username);
        // fetch all the topics from the DB
        pg.connect(conString, function (err, client, done) {
            if (err) {
                return console.error("failed connecting to PG server.");
            }
            client.query("SELECT * FROM topics WHERE username=$1", [request.query.username], function(err, result) {
                done();
                if (err) {
                    console.error("Error running query", err);
                }
                console.log("Wrote %d rows out", result.rows.length);
                response.send(result.rows);
                response.end();
            });
        });
    } else {
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
    }
};

exports.deleteTopic = function (request, response, next, conString) {
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
};

exports.addTopic = function(request, response, next, conString) {
    if (!request.body.name) {
        response.send({status: "error", msg: "Empty topic name provided"});
        return console.error("Empty topic name");
    } else if (!request.body.username) {
        response.send({status: "error", msg: "username for topic not provided"});
        return console.error("username for topic not provided");
    }

    pg.connect(conString, function (err, client, done) {
        if (err) {
            response.send({status: "error", msg: "failed to connect to PG server"});
            return console.error("failed connecting to PG server.");
        }
        client.query("INSERT INTO topics (name, description, username) VALUES ($1, $2, $3)", [request.body.name, request.body.description, request.body.username], function (err, result) {
            done();
            if (err) {
                console.error("Failed running query", err);
            }
            console.log("Inserted 1 row");
            response.send({status: "success"});
        });
    });
};
