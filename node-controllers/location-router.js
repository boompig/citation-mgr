const { Router } = require("express");
const myPassport = require("./my-passport");
const locations = require("./locations");
const { conString } = require("./db-common");

const router = new Router();

router.get("/", myPassport.authOrFail, async(request, response, next) => {
    return locations.getLocations(request, response, next, conString);
});

router.post("/", async (request, response) => {
    return locations.addLocation(request, response);
});

router.delete("/:id", async (request, response, next) => {
    console.log("hit locations DELETE endpoint");
    return locations.deleteLocation(request, response, next, conString);
});

module.exports = router;
