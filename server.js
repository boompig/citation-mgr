var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var pg = require("pg");
/* read postgres connection string from env variables if set
 * this is for Heroku */
var conString = process.env.DATABASE_URL || "postgres://gru@localhost/citations";
/* read port from environment variable if set
 * this is for Heroku */
var port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

/**
 * One controller for each endpoint
 */
var topics = require("./node-controllers/topics");
var sections = require("./node-controllers/sections");
var refs = require("./node-controllers/refs");
var locations = require("./node-controllers/locations");
var login = require("./node-controllers/login");

// experimental
var cruft = require("./node-controllers/pg_cruft.js");

app.get("/cruft", function (request, response, next) {
    cruft.addEntry ("test", ["name, description"], ["dbk", "my name"], conString, function (err, insert_id) {
        console.log(err);
        console.log(insert_id);
    });
    cruft.getEntries ("test", "daniel", ["dbk", "my name"], conString, function (err, result) {
        console.log(err);
        console.log(result);
    });
});

/********************* SQL **********************/
app.post("/sql", function (request, response, next) {
    console.log("Hit SQL POST endpoint");
    if (!request.body.sql) {
        console.error("query not provided");
        return response.send({status: "error", msg: "Query not provided" });
    }
    cruft.query(request.body.sql, [], conString, function (err, result) {
        if (err) {
            console.log(err.toString());
            return response.send({ status: "error", msg: err.toString() });
        } else {
            response.send(result.rows);
        }
    });
});
/********************* SQL **********************/

/****************** LOGIN ******************************/
app.post("/login", function (request, response, next) {
    console.log("Hit login POST endpoint");
    login.addUser(request, response, next, conString);
});
/****************** LOGIN ******************************/

/****************** LOCATIONS ******************************/
app.get("/locations", function (request, response, next) {
    console.log("hit locations GET endpoint");
    return locations.getLocations(request, response, next, conString);
});
/****************** LOCATIONS ******************************/

/****************** TOPICS ******************************/
app.get("/topics", function (request, response, next) {
    console.log("hit topics GET endpoint");
    return topics.getTopics(request, response, next, conString);
});

app.delete("/topics/:id", function (request, response, next) {
    console.log("hit topics DELETE endpoint");
    return topics.deleteTopic(request, response, next, conString);
});

app.post("/topics", function (request, response, next) {
    console.log("hit topics POST endpoint");
    return topics.addTopic(request, response, next, conString);
});
/****************** TOPICS ******************************/

/****************** REFS ******************************/
app.post("/refs", function (request, response, next) {
    console.log("hit refs POST endpoint");
    refs.addRef(request, response, next, conString);
});

app.get("/refs", function (request, response, next) {
    console.log("hit refs GET endpoint");
    refs.getRefs(request, response, next, conString);
});
/****************** REFS ******************************/

/****************** SECTIONS ******************************/
app.post("/sections/", function(request, response, next) {
    console.log("hit sections POST endpoint");
    sections.addSection(request, response, next, conString);
});

app.get("/sections/", function(request, response, next) {
    console.log("hit sections GET endpoint");
    sections.getSections(request, response, next, conString);
});

app.delete("/sections/:id", function(request, response, next) {
    console.log("hit sections DELETE endpoint");
    sections.deleteSection(request, response, next, conString);
});
/****************** SECTIONS ******************************/

app.listen(port);

console.log("Node-express app running on port 8080");
