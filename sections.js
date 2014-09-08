var pg = require("pg");

/*
 * conString is the postgres connection string
 */
exports.getSections = function (request, response, next, conString) {
    if (request.query.username) {
        console.log("Fetching all sections for user %s", request.query.username);
        // fetch all the sections from the DB
        pg.connect(conString, function (err, client, done) {
            if (err) {
                return console.error("failed connecting to PG server.");
            }
            client.query("SELECT * FROM sections WHERE username=$1", [request.query.username], function(err, result) {
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
        // fetch all the sections from the DB
        pg.connect(conString, function (err, client, done) {
            if (err) {
                return console.error("failed connecting to PG server.");
            }
            client.query("SELECT * FROM sections", function(err, result) {
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

exports.deleteSection = function (request, response, next, conString) {
    // make sure the name is provided
    if (! request.params.id) {
        response.send({status: "error", msg: "No section id provided"});
        console.error("Section ID not provided in request");
        return;
    }

    pg.connect(conString, function (err, client, done) {
        if (err) {
            return console.error("failed connecting to PG server.");
        }
        client.query(
            "DELETE FROM sections WHERE id=$1",
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

exports.addSection = function(request, response, next, conString) {
    if (!request.body.name) {
        response.send({status: "error", msg: "Empty section name provided"});
        return console.error("Empty section name");
    } else if (!request.body.username) {
        response.send({status: "error", msg: "username for section not provided"});
        return console.error("username for section not provided");
    }

    pg.connect(conString, function (err, client, done) {
        if (err) {
            response.send({status: "error", msg: "failed to connect to PG server"});
            return console.error("failed connecting to PG server.");
        }
        client.query("INSERT INTO sections (name, section_number, username) VALUES ($1, $2, $3)", [request.body.name, request.body.number, request.body.username], function (err, result) {
            done();
            if (err) {
                console.error("Failed running query", err);
            }
            console.log("Inserted 1 row");
            response.send({status: "success"});
        });
    });
};
