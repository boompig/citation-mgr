const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// set up logging
const morgan = require("morgan");
app.use(morgan("dev"));

const conString = require("./node-controllers/db-common").conString;

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

/********************* SQL **********************/
// NOTE: this is super unsafe but that's fine for now
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
app.post("/login", login.addUser);
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
app.get("/bow", bow.getWorks);

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
app.get("/topics", topics.getTopics);

app.delete("/topics/:id", topics.deleteTopic);

app.post("/topics", topics.addTopic);
/****************** TOPICS ******************************/

/****************** REFS ******************************/
app.post("/refs", function (request, response, next) {
    console.log("hit refs POST endpoint");
    refs.addRef(request, response, next, conString);
});

app.get("/refs", refs.getRefs);

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

