const { Router } = require("express");
const myPassport = require("./my-passport");
const sections = require("./sections");
const { conString } = require("./db-common");

const router = new Router();

router.post("/sections/", myPassport.authOrFail, async (request, response, next) => {
    return sections.addSection(request, response, next, conString);
});

router.get("/sections/", myPassport.authOrFail, async (request, response, next) => {
    return sections.getSections(request, response, next, conString);
});

router.delete("/sections/:id", myPassport.authOrFail, async (request, response, next) => {
    return sections.deleteSection(request, response, next, conString);
});

module.exports = router;
