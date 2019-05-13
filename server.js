const express = require("express");
const bodyParser = require("body-parser");
const app = express();

/* read postgres connection string from env variables if set
 * this is for Heroku */
const conString = process.env.DATABASE_URL || "postgres://gru@localhost/citations";
/* read port from environment variable if set
 * this is for Heroku */
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

/**
 * One controller for each endpoint
 */
const topics = require("./node-controllers/topics");
const sections = require("./node-controllers/sections");
const refs = require("./node-controllers/refs");
const locations = require("./node-controllers/locations");
const login = require("./node-controllers/login");
const query = require("./node-controllers/query");
const bow = require("./node-controllers/bow");

// experimental
//const cruft = require("./node-controllers/pg_cruft.js");

/********************* SQL **********************/
app.post("/sql", function (request, response, next) {
    console.log("Hit SQL POST endpoint");
    query.runQuery(request, response, next, conString);
});

app.get("/sql", function (request, response, next) {
    console.log("Hit SQL GET endpoint");
    query.getQueries(request, response, next, conString);
});

app.delete("/sql/:id", function (request, response, next) {
    console.log("Hit SQL DELETE endpoint");
    query.deleteQuery(request, response, next, conString);
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

app.post("/locations", function (request, response, next) {
    console.log("hit locations POST endpoint");
    return locations.addLocation(request, response, next, conString);
});

app.delete("/locations/:id", function (request, response, next) {
    console.log("hit locations DELETE endpoint");
    return locations.deleteLocation(request, response, next, conString);
});
/****************** LOCATIONS ******************************/

/****************** BOW ******************************/
app.get("/bow", function (request, response, next) {
    console.log("hit bow GET endpoint");
    return bow.getWorks(request, response, next, conString);
});

app.delete("/bow/:id", function (request, response, next) {
    console.log("hit bow DELETE endpoint");
    return bow.deleteWork(request, response, next, conString);
});

app.post("/bow", function (request, response, next) {
    console.log("hit bow POST endpoint");
    return bow.addWork(request, response, next, conString);
});
/****************** BOW ******************************/

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

app.delete("/refs/:id", function (request, response, next) {
    console.log("hit refs GET endpoint");
    refs.deleteRef(request, response, next, conString);
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

app.listen(port, () => {
    console.log(`running on http://localhost:${port}`);
});

