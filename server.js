const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// set up logging
const morgan = require("morgan");
app.use(morgan("dev"));

const dbCommon = require("./node-controllers/db-common");
const conString = dbCommon.conString;

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

app.delete("/bow/:id", bow.deleteById);
app.delete("/bow", bow.deleteByName);

app.post("/bow", function (request, response, next) {
    console.log("hit bow POST endpoint");
    return bow.addWork(request, response, next, conString);
});
/****************** BOW ******************************/

/****************** TOPICS ******************************/
app.get("/topics", topics.getTopics);
app.delete("/topics/:id", topics.deleteTopic);
app.delete("/topics", topics.deleteTopicByName);
app.post("/topics", topics.addTopic);
/****************** TOPICS ******************************/

/****************** REFS ******************************/
app.post("/refs", refs.addRef);
app.get("/refs", refs.getRefs);
app.delete("/refs/:id", refs.deleteById);
app.delete("/refs", refs.deleteByName);
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

// if(process.env.NODE_ENV !== "unit-test") {
// do not run database setup when unit testing
// console.log(`[${process.env.NODE_ENV}] Running database setup...`);
// await dbCommon.createTables();
// }

if(process.env.NODE_ENV !== "unit-test") {
    app.listen(port, () => {
        console.log(`running on http://localhost:${port}`);
    });
}

module.exports = app;