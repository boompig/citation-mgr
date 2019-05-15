const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const expressSession = require("express-session");
const crypto = require("crypto");
const process = require("process");

const app = express();

// set up logging
app.use(morgan("dev"));

const dbCommon = require("./node-controllers/db-common");

/* read port from environment variable if set
 * this is for Heroku */
const port = process.env.PORT || 8080;

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
// set the secret string to something predictable in development
const ss = process.env.NODE_ENV === "production" ? crypto.randomBytes(20).toString() : "secret string";
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
const refsRouter = require("./node-controllers/refs");
const sectionRouter = require("./node-controllers/section-router");
const authRouter = require("./node-controllers/auth-router");
const sqlRouter = require("./node-controllers/sql-router");
const bowRouter = require("./node-controllers/bow");
const profileRouter = require("./node-controllers/profile");
const locationRouter = require("./node-controllers/location-router");

/****************** ROUTERS ************************************/
app.use("/sql", sqlRouter);
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/bow", bowRouter);
app.use("/topics", topicRouter);
app.use("/refs", refsRouter);
app.use("/locations", locationRouter);
app.use("/sections", sectionRouter);
/****************** ROUTERS ******************************/

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