var pg = require("pg");

exports.getLocations = function (request, response, next, conString) {
    if (request.query.username) {
        console.log("Fetching all locations for user %s", request.query.username);
        // fetch all the locations from the DB
        pg.connect(conString, function (err, client, done) {
            if (err) {
                return console.error("failed connecting to PG server.");
            }
            client.query("SELECT * FROM locations WHERE username=$1", [request.query.username], function(err, result) {
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
        // fetch all the locations from the DB
        pg.connect(conString, function (err, client, done) {
            if (err) {
                return console.error("failed connecting to PG server.");
            }
            client.query("SELECT * FROM locations", function(err, result) {
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
