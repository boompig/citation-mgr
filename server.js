const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const expressSession = require("express-session");
const crypto = require("crypto");

const app = express();

// set up logging
app.use(morgan("dev"));

const dbCommon = require("./node-controllers/db-common");
const conString = dbCommon.conString;

/* read port from environment variable if set
 * this is for Heroku */
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
const ss = crypto.randomBytes(20).toString();
// TODO: use an express-session middleware that is production-grade
app.use(expressSession({
    secure: process.env.NODE_ENV === "production",
    secret: ss,
    saveUninitialized: false,
    resave: false,
}));

/**
 * One controller for each endpoint
 */
const topicRouter = require("./node-controllers/topics");
const sections = require("./node-controllers/sections");
const refsRouter = require("./node-controllers/refs");
const locations = require("./node-controllers/locations");
const authRouter = require("./node-controllers/auth-router");
const sqlRouter = require("./node-controllers/sql-router");
const bowRouter = require("./node-controllers/bow");
const profileRouter = require("./node-controllers/profile");

/****************** ROUTERS ************************************/
app.use("/sql", sqlRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/bow", bowRouter);
app.use("/topics", topicRouter);
app.use("/refs", refsRouter);
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

/****************** VIEWS *********************************/
app.get("/login", (req, res) => {
    if(req.session.email) {
        res.redirect("/");
    } else {
        res.sendFile(__dirname + "/views/login.html");
    }
});
/****************** VIEWS *********************************/

console.log("Running database setup...");
dbCommon.createTables().then(() => {
    console.log("Database setup complete");
});
app.listen(port, () => {
    console.log(`running on http://localhost:${port}`);
});

module.exports = app;