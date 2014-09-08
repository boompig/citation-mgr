var pg = require("pg");

/**
 * This endpoint is for logging in as a specific user
 * There is no real security (no password)
 * Create the user and walk right in
 */
exports.addUser = function (request, response, next, conString) {
    if (! request.body.name) {
        return console.error("Login name not specified");
    }
    pg.connect(conString, function (err, client, done) {
        if (err) {
            return console.error("failed connecting to PG server.");
        }
        client.query("SELECT * FROM users where name=$1", [request.body.name], function(err, result) {
            if (result.rows.length === 1) {
                console.log("Login %s exists", request.body.name);
                done();
                response.send({
                    status: "success"
                });
            } else {
                console.log("Login %s does not exist, creating...", request.body.name);
                client.query("INSERT INTO users (name) VALUES ($1)", [request.body.name], function(err, result) {
                    done();
                    console.log("Created.");
                    response.send({
                        status: "success"
                    });
                });
            }
        });
    });
};
