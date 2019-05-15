const { Router } = require("express");
const myPassport = require("./my-passport");
const sections = require("./sections");
const { conString } = require("./db-common");

const router = new Router();

router.post("/", myPassport.authOrFail, async (request, response, next) => {
    return sections.addSection(request, response, next, conString);
});

router.get("/", myPassport.authOrFail, async (request, response) => {
    return sections.getSections(request, response);
});

router.delete("/:id", myPassport.authOrFail, async (request, response, next) => {
    return sections.deleteSection(request, response, next, conString);
});

module.exports = router;
