const { Router } = require("express");
const myPassport = require("./my-passport");
const locations = require("./locations");
const { conString } = require("./db-common");

const router = new Router();

router.get("/", myPassport.authOrFail, async(request, response, next) => {
    console.log("hit locations GET endpoint");
    return locations.getLocations(request, response, next, conString);
});

router.post("/", async (request, response, next) => {
    console.log("hit locations POST endpoint");
    return locations.addLocation(request, response, next, conString);
});

router.delete("/:id", async (request, response, next) => {
    console.log("hit locations DELETE endpoint");
    return locations.deleteLocation(request, response, next, conString);
});

module.exports = router;
