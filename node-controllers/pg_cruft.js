var pg = require("pg");

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
