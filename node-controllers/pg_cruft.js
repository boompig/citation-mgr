var pg = require("pg");

/**
 * Add a thing to the given table. Only works if primary key is SERIAL id.
 * Return error and insert ID
 *
 * @param table The name of the pSQL table
 * @param columns In-order array of columns
 * @param data In-order array of values
 * @param conString The postgres connection string
 * @param callback Function, first parameter is error, second is insert_id
 */
exports.addEntry = function(table, columns, data, conString, callback) {
    var dataSub = [];
    for (var i = 0; i < data.length; i++) {
        dataSub.push("$" + (i + 1));
    }

    // the RETURNING id is key here, since that gives us last insert ID
    var insert_query = "INSERT INTO " + table + " (" + columns.join(", ") + ") VALUES (" + dataSub.join(", ") + ") RETURNING id";
    console.log(insert_query);

    pg.connect(conString, function (err, client, done) {
        if (err) {
            console.error("failed connecting to PG server.");
            return callback(err, null);
        }

        client.query(insert_query, data, function(err, result) {
            done();
            if (err) {
                return callback(err, null);
            } else {
                return callback(null, result.rows[0].id);
            }
        });
    });
};

/**
 * Return all the entries for the given table, with the given username
 */
exports.getEntries = function (table, conString, username, callback) {
    var select_query = "SELECT * FROM " + table + " WHERE username=$1";
    pg.connect(conString, function (err, client, done) {
        if (err) {
            console.error("failed connecting to PG server.");
            return callback(err, null);
        }

        client.query(select_query, [username], function(err, result) {
            done();
            if (err) {
                return callback(err, null);
            } else {
                // return the rows
                return callback(null, result.rows);
            }
        });
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

exports.query = function (query, data, conString, callback) {
    // fetch all the refs from the DB
    pg.connect(conString, function (err, client, done) {
        if (err) {
            console.error("failed connecting to PG server.");
            return callback(err, null);
        }
        client.query(query, data, function(err, result) {
            done();
            callback(err, result);
        });
    });
};
