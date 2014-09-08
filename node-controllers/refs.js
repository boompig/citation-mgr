var pg = require("pg");

exports.addRef = function(request, response, next, conString) {
    var insert_query = "INSERT INTO refs (name, first_author, year, ref, username) VALUES ($1, $2, $3, $4, $5)";

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
                request.body.ref,
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

exports.getRefs = function (request, response, next, conString) {
    if (request.query.username) {
        console.log("Fetching all refs for user %s", request.query.username);
        // fetch all the refs from the DB
        pg.connect(conString, function (err, client, done) {
            if (err) {
                return console.error("failed connecting to PG server.");
            }
            client.query("SELECT * FROM refs WHERE username=$1", [request.query.username], function(err, result) {
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
        // fetch all the refs from the DB
        pg.connect(conString, function (err, client, done) {
            if (err) {
                return console.error("failed connecting to PG server.");
            }
            client.query("SELECT * FROM refs", function(err, result) {
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
