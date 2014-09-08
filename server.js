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
var topics = require("./topics");
var refs = require("./refs");
var login = require("./login");

app.post("/login", function (request, response, next) {
    console.log("Hit login POST endpoint");
    login.addUser(request, response, next, conString);
});

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
/****************** REFS ******************************/

app.listen(port);

console.log("Node-express app running on port 8080");
